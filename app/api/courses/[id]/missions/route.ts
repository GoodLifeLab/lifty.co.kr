import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 프로젝트의 미션 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // "completed" | "incomplete"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // 프로젝트가 존재하는지 확인
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { message: "프로젝트를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // Mission 테이블에서 직접 조회 (검색 및 필터 적용)
    const whereConditions: any = {
      courseId: id,
    };

    // 검색 필터
    if (search) {
      whereConditions.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          shortDesc: {
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
        userProgress: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
      const completedCount = mission.userProgress.filter(
        (p) => p.isChecked,
      ).length;
      const totalParticipants = mission.userProgress.length;

      return {
        id: mission.id,
        title: mission.title,
        shortDesc: mission.shortDesc,
        detailDesc: mission.detailDesc,
        dueDate: mission.dueDate,
        isPublic: mission.isPublic,
        subMissions: mission.subMissions,
        completedCount,
        totalParticipants,
        participants: mission.userProgress.map((progress) => ({
          id: progress.user.id,
          name: progress.user.name,
          email: progress.user.email,
          isCompleted: progress.isChecked,
          completedAt: progress.checkedAt,
        })),
      };
    });

    // 상태 필터 (클라이언트 측에서 처리)
    let filteredMissions = missionData;
    if (status) {
      if (status === "completed") {
        filteredMissions = filteredMissions.filter(
          (mission) => mission.completedCount > 0,
        );
      } else if (status === "incomplete") {
        filteredMissions = filteredMissions.filter(
          (mission) => mission.completedCount === 0,
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
