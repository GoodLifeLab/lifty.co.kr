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
        // {
        //   shortDesc: {
        //     contains: search,
        //     mode: "insensitive",
        //   },
        // },
      ];
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
        ...mission,
        completedCount,
        totalParticipants,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page * limit < totalCount;

    return NextResponse.json({
      data: missionData,
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
