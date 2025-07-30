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
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    // 오늘 활성 사용자 수 (DAU)
    const dailyActiveUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        disabled: false,
      },
    });

    // 오늘 신규 가입자 수
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 이번 주 신규 가입자 수
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    // 이번 달 신규 가입자 수
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // 총 사용자 수
    const totalUsers = await prisma.user.count({
      where: {
        disabled: false,
      },
    });

    // 총 그룹 수
    const totalGroups = await prisma.group.count();

    // 총 기관 수
    const totalOrganizations = await prisma.organization.count();

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

        // 일별 신규 사용자 수
        const newUsers = await prisma.user.count({
          where: {
            createdAt: {
              gte: startOfDate,
              lte: endOfDate,
            },
          },
        });

        // 일별 활성 사용자 수 (DAU)
        const activeUsers = await prisma.user.count({
          where: {
            lastLoginAt: {
              gte: startOfDate,
              lte: endOfDate,
            },
            disabled: false,
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
          newUsers,
          activeUsers,
          missionSubmissions,
        };
      }),
    );

    // 날짜 순서대로 정렬 (최신이 마지막에 오도록)
    const sortedDailyData = dailyData.reverse();

    return NextResponse.json({
      data: {
        dailyActiveUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        totalUsers,
        totalGroups,
        totalOrganizations,
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
