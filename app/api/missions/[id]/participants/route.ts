import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const { id } = await params;

    const skip = (page - 1) * limit;

    // 1. 미션 정보 조회 (과정 ID 포함)
    const mission = await prisma.mission.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!mission) {
      return NextResponse.json(
        { error: "미션을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 2. 기본 where 조건
    const baseWhere = {
      group: {
        courses: {
          some: {
            courseId: mission.courseId,
          },
        },
      },
    };

    // 3. 검색 조건 추가
    let whereCondition: any = { ...baseWhere };
    if (search && search.trim() !== "") {
      whereCondition = {
        ...baseWhere,
        OR: [
          {
            user: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                {
                  organizations: {
                    some: {
                      organization: {
                        name: { contains: search, mode: "insensitive" },
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            group: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        ],
      };
    }

    // 4. 전체 개수 조회
    const totalCount = await prisma.groupMember.findMany({
      where: whereCondition,
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    // 5. 상태 조건 추가
    if (status && status !== "") {
      if (status === "pending") {
        whereCondition = {
          ...whereCondition,
          user: {
            ...whereCondition.user,
            missionProgress: {
              none: {
                missionId: id,
              },
            },
          },
        };
      } else if (status === "completed") {
        whereCondition = {
          ...whereCondition,
          user: {
            ...whereCondition.user,
            missionProgress: {
              some: {
                missionId: id,
                contentsDate: {
                  lte: mission.dueDate, // 종료일 이전에 작성된 것
                },
              },
            },
          },
        };
      } else if (status === "overdue") {
        whereCondition = {
          ...whereCondition,
          user: {
            ...whereCondition.user,
            missionProgress: {
              some: {
                missionId: id,
                contentsDate: {
                  gt: mission.dueDate, // 종료일 이후에 작성된 것
                },
              },
            },
          },
        };
      }
    }

    // 6. 페이지네이션된 데이터 조회
    const groupUsers = await prisma.groupMember.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            position: true,
            organizations: {
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                    department: true,
                  },
                },
              },
            },
            missionProgress: {
              where: {
                missionId: id,
              },
            },
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ["userId"],
    });

    // 7. 각 사용자의 미션 진행 상황 조회
    const participants = groupUsers.map((groupUser) => {
      const userId = groupUser.userId;
      const userProgress = groupUser.user.missionProgress[0];

      let participantStatus = "pending";
      if (userProgress) {
        // 기한 초과 체크
        const now = new Date();
        const dueDate = new Date(mission.dueDate);
        if (participantStatus !== "completed" && now > dueDate) {
          participantStatus = "overdue";
        }
      }

      return {
        id: userId,
        missionId: id,
        user: {
          ...groupUser.user,
          organizations: groupUser.user.organizations,
        },
        group: groupUser.group,
        progress: {
          id: userProgress?.id || null,
          status: participantStatus,
          createdAt: userProgress?.createdAt || null,
          contentsDate: userProgress?.contentsDate || null,
          checkedAt: userProgress?.checkedAt || null,
        },
      };
    });

    // 8. 전체 통계 조회 (검색/필터링과 관계없이)
    const baseStatsWhere = {
      group: {
        courses: {
          some: {
            courseId: mission.courseId,
          },
        },
      },
    };

    // pending: 미션 진행 기록이 없는 사용자 (중복 제거)
    const pendingUsers = await prisma.groupMember.findMany({
      where: {
        ...baseStatsWhere,
        user: {
          missionProgress: {
            none: {
              missionId: id,
            },
          },
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    // completed: 종료일 이전에 완료한 사용자 (중복 제거)
    const completedUsers = await prisma.groupMember.findMany({
      where: {
        ...baseStatsWhere,
        user: {
          missionProgress: {
            some: {
              missionId: id,
              contentsDate: {
                lte: mission.dueDate,
              },
            },
          },
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    // overdue: 종료일 이후에 완료한 사용자 (중복 제거)
    const overdueUsers = await prisma.groupMember.findMany({
      where: {
        ...baseStatsWhere,
        user: {
          missionProgress: {
            some: {
              missionId: id,
              contentsDate: {
                gt: mission.dueDate,
              },
            },
          },
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    const stats = {
      pending: pendingUsers.length,
      completed: completedUsers.length,
      overdue: overdueUsers.length,
    };

    return NextResponse.json({
      participants,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("미션 참여자 조회 오류:", error);
    return NextResponse.json(
      { error: "미션 참여자 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}
