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

    // 2. 해당 과정과 연결된 그룹의 모든 사용자 조회
    const groupUsers = await prisma.groupMember.findMany({
      where: {
        group: {
          courses: {
            some: {
              courseId: mission.courseId,
            },
          },
        },
      },
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
    });

    // 3. 각 사용자의 미션 진행 상황 조회 (중복 제거)
    const userMap = new Map();

    groupUsers.forEach((groupUser) => {
      const userId = groupUser.userId;
      const userProgress = groupUser.user.missionProgress[0];

      let status = "pending";
      if (userProgress) {
        // 기한 초과 체크
        const now = new Date();
        const dueDate = new Date(mission.dueDate);
        if (status !== "completed" && now > dueDate) {
          status = "overdue";
        }
      }

      const participant = {
        id: userId,
        missionId: id,
        progressId: userProgress?.id || null,
        status,
        startedAt: userProgress?.createdAt || null,
        completedAt:
          status === "completed" ? userProgress?.updatedAt || null : null,
        user: {
          ...groupUser.user,
          organizations: groupUser.user.organizations,
        },
        group: groupUser.group,
        createdAt: userProgress?.createdAt || groupUser.createdAt,
        updatedAt: userProgress?.updatedAt || groupUser.updatedAt,
        hasStarted: !!userProgress,
      };

      // 같은 사용자가 여러 그룹에 속해있을 경우, 첫 번째 그룹 정보만 유지
      if (!userMap.has(userId)) {
        userMap.set(userId, participant);
      }
    });

    const allParticipants = Array.from(userMap.values());

    // 페이지네이션 적용
    const total = allParticipants.length;
    const paginatedParticipants = allParticipants.slice(skip, skip + limit);

    // 상태별 통계 계산
    const stats = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
    };

    allParticipants.forEach((participant) => {
      stats[participant.status as keyof typeof stats]++;
    });

    return NextResponse.json({
      participants: paginatedParticipants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
