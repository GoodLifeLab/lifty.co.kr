import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> },
) {
  try {
    // 현재 사용자 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    // 관리자 권한 확인
    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const { coachId } = await params;

    // 검색 파라미터 추출
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 코치가 속한 모든 그룹에서 중복 없이 사용자 목록 가져오기
    const coach = await prisma.user.findUnique({
      where: {
        id: coachId,
        role: "COACH",
      },
      select: {
        groupMemberships: {
          select: {
            group: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!coach) {
      return NextResponse.json(
        { error: "코치를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const groupIds = coach.groupMemberships.map(
      (membership) => membership.group.id,
    );

    if (groupIds.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      });
    }

    // 검색 조건 구성
    const searchConditions = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            {
              organizations: {
                some: {
                  organization: {
                    name: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
            },
            {
              groupMemberships: {
                some: {
                  group: {
                    name: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
            },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where: {
        groupMemberships: {
          some: {
            groupId: {
              in: groupIds,
            },
          },
        },
        id: {
          not: coachId, // 코치 본인 제외
        },
        ...searchConditions,
      },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
        groupMemberships: {
          where: {
            groupId: {
              in: groupIds,
            },
          },
          include: {
            group: {
              include: {
                courses: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // 전체 개수 조회 (페이지네이션용)
    const totalUsers = await prisma.user.count({
      where: {
        groupMemberships: {
          some: {
            groupId: {
              in: groupIds,
            },
          },
        },
        id: {
          not: coachId,
        },
        ...searchConditions,
      },
    });

    return NextResponse.json({
      data: users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("코치 학생 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "코치 학생 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
