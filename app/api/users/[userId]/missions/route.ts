import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 사용자의 참여한 미션 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // "completed" | "incomplete"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    const coursed = await prisma.course.findMany({
      where: {
        groups: {
          some: {
            group: {
              memberships: {
                some: {
                  userId: userId,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    // 사용자가 속한 그룹의 코스 ID 목록 생성 (중복 제거)
    const userCourseIds = coursed.map((course) => course.id);

    // Mission 테이블에서 직접 조회 (검색 및 필터 적용)
    const whereConditions: any = {
      courseId: {
        in: Array.from(userCourseIds),
      },
    };

    // 검색 필터
    if (search) {
      whereConditions.OR = [
        {
          course: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // 날짜 필터
    if (startDate || endDate) {
      if (startDate) {
        whereConditions.createdAt = {
          ...whereConditions.createdAt,
          gte: new Date(startDate),
        };
      }
      if (endDate) {
        whereConditions.dueDate = {
          ...whereConditions.dueDate,
          lte: new Date(endDate + "T23:59:59.999Z"),
        };
      }
    }

    const missions = await prisma.mission.findMany({
      where: whereConditions,
      include: {
        course: true,
        userProgress: {
          where: {
            userId: userId,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        dueDate: "desc",
      },
    });

    // 전체 개수 조회
    const totalCount = await prisma.mission.count({
      where: whereConditions,
    });

    // 미션 데이터 변환
    const missionData = missions.map((mission) => {
      const progress = mission.userProgress[0]; // 사용자는 하나의 진행 상황만 가질 수 있음

      return {
        id: mission.id,
        courseId: mission.courseId,
        courseName: mission.course.name,
        missionTitle: mission.title,
        missionDescription: mission.shortDesc,
        startDate: mission.dueDate,
        endDate: mission.dueDate,
        isCompleted: progress?.isChecked || false,
        completedAt: progress?.checkedAt || undefined,
        createdAt: progress?.createdAt,
        progressId: progress?.id,
      };
    });

    // 상태 필터 (클라이언트 측에서 처리)
    let filteredMissions = missionData;
    if (status) {
      if (status === "completed") {
        filteredMissions = filteredMissions.filter(
          (mission) => mission.isCompleted,
        );
      } else if (status === "incomplete") {
        filteredMissions = filteredMissions.filter(
          (mission) => !mission.isCompleted,
        );
      }
    }

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page * limit < totalCount;

    return NextResponse.json({
      missions: filteredMissions,
      pagination: {
        page,
        limit,
        totalPages,
        total: totalCount,
        hasMore,
      },
    });
  } catch (error) {
    console.error("미션 목록 조회 오류:", error);
    return NextResponse.json(
      { message: "미션 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}
