import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 코스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // 검색 조건
    const where = search
      ? {
          name: { contains: search, mode: "insensitive" as any },
        }
      : {};

    // 전체 개수 조회
    const total = await prisma.course.count({ where });

    // 페이지네이션된 데이터 조회
    const [courses, allCourses] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          groups: {
            include: {
              group: {
                include: {
                  _count: {
                    select: {
                      memberships: true,
                    },
                  },
                },
              },
            },
          },
          missions: {
            include: {
              userProgress: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.course.findMany({
        select: {
          id: true,
          name: true,
          missions: {
            select: {
              id: true,
              openDate: true,
              dueDate: true,
            },
          },
          tags: true,
        },
      }),
    ]);

    // 그룹 정보를 평면화
    const formattedCourses = courses.map((course) => ({
      ...course,
      groups: course.groups.map((gc) => {
        return {
          ...gc.group,
          totalMembers: gc.group._count.memberships,
        };
      }),
    }));

    const formattedAllCourses = allCourses.map((course) => {
      const now = new Date();
      const totalMissions = course.missions.length;
      const missionsInProgress = course.missions.filter((mission) => {
        return mission.openDate <= now && mission.dueDate >= now;
      }).length;

      return {
        id: course.id,
        name: course.name,
        _count: {
          missions: totalMissions,
          missionsInProgress: missionsInProgress,
        },
        tags: course.tags,
      };
    });

    // 페이지네이션 정보
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };

    return NextResponse.json({
      data: formattedCourses,
      allCourses: formattedAllCourses,
      pagination,
    });
  } catch (error) {
    console.error("코스 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "코스 목록을 조회할 수 없습니다." },
      { status: 500 },
    );
  }
}

// 코스 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, groupIds, missionCount } = body;

    // 필수 필드 검증
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 날짜 유효성 검증
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: "종료일은 시작일보다 늦어야 합니다." },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        missionCount: missionCount || 0,
        groups:
          groupIds && groupIds.length > 0
            ? {
                create: groupIds.map((groupId: number) => ({
                  groupId: groupId,
                })),
              }
            : undefined,
      },
      include: {
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 그룹 정보를 평면화
    const formattedCourse = {
      ...course,
      groups: course.groups.map((gc) => gc.group),
    };

    return NextResponse.json(formattedCourse, { status: 201 });
  } catch (error) {
    console.error("코스 생성 오류:", error);
    return NextResponse.json(
      { error: "코스를 생성할 수 없습니다." },
      { status: 500 },
    );
  }
}
