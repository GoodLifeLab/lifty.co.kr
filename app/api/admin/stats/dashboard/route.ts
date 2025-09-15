import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

export async function GET(request: NextRequest) {
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
    if (currentUser.role === "USER") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const today = new Date();

    // 총 프로젝트 수 - super admin이면 전체, 아니면 자신이 속한 그룹의 프로젝트만
    let totalProjects;
    let activeMissions;
    let totalUsers;
    if (currentUser.role === "SUPER_ADMIN") {
      totalProjects = await prisma.course.count();

      activeMissions = await prisma.mission.count({
        where: {
          openDate: {
            lte: today,
          },
          dueDate: {
            gte: today,
          },
        },
      });

      totalUsers = await prisma.user.count({
        where: {
          disabled: false,
        },
      });
    } else {
      // 현재 사용자가 속한 그룹들의 프로젝트 수
      const userGroups = await prisma.groupMember.findMany({
        where: {
          userId: currentUser.id,
        },
        select: {
          groupId: true,
        },
      });

      const groupIds = userGroups.map((ug) => ug.groupId);

      totalProjects = await prisma.course.count({
        where: {
          groups: {
            some: {
              groupId: {
                in: groupIds,
              },
            },
          },
        },
      });

      // 그룹에 속한 과정들의 미션 중 진행 중인 것들
      activeMissions = await prisma.mission.count({
        where: {
          openDate: {
            lte: today,
          },
          dueDate: {
            gte: today,
          },
          course: {
            groups: {
              some: {
                groupId: {
                  in: groupIds,
                },
              },
            },
          },
        },
      });

      totalUsers = await prisma.user.count({
        where: {
          disabled: false,
          groupMemberships: {
            some: {
              groupId: {
                in: groupIds,
              },
            },
          },
        },
      });
    }

    // 최근 7일간의 일별 데이터
    const dailyData = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        const endOfDate = new Date(
          startOfDate.getTime() + 24 * 60 * 60 * 1000 - 1,
        );

        // 일별 활성 사용자 수 (DAU) - 로그인 또는 미션 참여 기준
        const activeUsers = await prisma.user.count({
          where: {
            disabled: false,
            OR: [
              {
                lastLoginAt: {
                  gte: startOfDate,
                  lte: endOfDate,
                },
              },
              {
                missionProgress: {
                  some: {
                    createdAt: {
                      gte: startOfDate,
                      lte: endOfDate,
                    },
                  },
                },
              },
            ],
          },
        });

        // 일별 미션 기록 업로드 수
        const missionSubmissions = await prisma.userMissionProgress.count({
          where: {
            createdAt: {
              gte: startOfDate,
              lte: endOfDate,
            },
          },
        });

        return {
          date: startOfDate.toISOString().split("T")[0],
          activeUsers,
          missionSubmissions,
        };
      }),
    );

    // 날짜 순서대로 정렬 (최신이 마지막에 오도록)
    const sortedDailyData = dailyData.reverse();

    // const monthlyData = await Promise.all(
    //   Array.from({ length: 12 }, async (_, i) => {
    //     const date = new Date(today.getTime() - i * 30 * 24 * 60 * 60 * 1000);
    //     const startOfDate = new Date(date.getFullYear(), date.getMonth(), 1);
    //     const endOfDate = new Date(startOfDate.getTime() + 30 * 24 * 60 * 60 * 1000 - 1);
    //   }),
    // );

    return NextResponse.json({
      data: {
        totalUsers,
        totalProjects,
        activeMissions,
        dailyData: sortedDailyData,
      },
    });
  } catch (error) {
    console.error("대시보드 통계 조회 오류:", error);
    return NextResponse.json(
      { error: "대시보드 통계를 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
