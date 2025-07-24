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

    // 2. where 조건 구성
    const whereCondition: any = {
      group: {
        courses: {
          some: {
            courseId: mission.courseId,
          },
        },
      },
    };

    // 검색 조건 추가
    if (search && search.trim() !== "") {
      whereCondition.OR = [
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
      ];
    }

    // 3. 그룹 멤버 조회 (쿼리 레벨 필터링)
    const groupUsers = await prisma.groupMember.findMany({
      where: whereCondition,
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

    // 4. 각 사용자의 미션 진행 상황 조회 (중복 제거)
    const userMap = new Map();

    groupUsers.forEach((groupUser) => {
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

      const participant = {
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

      // 같은 사용자가 여러 그룹에 속해있을 경우, 첫 번째 그룹 정보만 유지
      if (!userMap.has(userId)) {
        userMap.set(userId, participant);
      }
    });

    let allParticipants = Array.from(userMap.values());

    const stats = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
    };

    const totalUserMap = new Map();
    groupUsers.forEach((groupUser) => {
      const userId = groupUser.userId;
      const userProgress = groupUser.user.missionProgress[0];

      let participantStatus = "pending";
      if (userProgress) {
        const now = new Date();
        const dueDate = new Date(mission.dueDate);
        if (participantStatus !== "completed" && now > dueDate) {
          participantStatus = "overdue";
        }
      }

      if (!totalUserMap.has(userId)) {
        totalUserMap.set(userId, { status: participantStatus });
      }
    });

    totalUserMap.forEach((user) => {
      stats[user.status as keyof typeof stats]++;
    });

    // 5. 상태 필터링 (쿼리에서 처리할 수 없는 부분만 JavaScript에서)
    if (status && status !== "") {
      allParticipants = allParticipants.filter(
        (participant) => participant.progress.status === status,
      );
    }

    // 페이지네이션 적용
    const total = allParticipants.length;
    const paginatedParticipants = allParticipants.slice(skip, skip + limit);

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
