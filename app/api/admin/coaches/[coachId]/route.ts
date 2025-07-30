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

    // 코치 조회
    const coach = await prisma.user.findUnique({
      where: {
        id: coachId,
        role: "COACH", // 코치만 조회
      },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
        groupMemberships: {
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
        _count: {
          select: {
            groupMemberships: true,
            organizations: true,
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

    // 코치가 속한 모든 그룹에서 중복 없이 사용자 목록 가져오기
    const groupIds = coach.groupMemberships.map(
      (membership) => membership.group.id,
    );

    const uniqueUsers = await prisma.user.findMany({
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
            group: true,
          },
        },
      },
    });

    // 코치 데이터에 uniqueUsers 추가
    const coachWithUsers = {
      ...coach,
      uniqueUsers,
    };

    return NextResponse.json({ data: coachWithUsers });
  } catch (error) {
    console.error("코치 조회 오류:", error);
    return NextResponse.json(
      { error: "코치 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function PATCH(
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
    const body = await request.json();
    const { name, email, phone, disabled, role } = body;

    // 업데이트할 데이터 구성
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (disabled !== undefined) {
      updateData.disabled = disabled;
      updateData.disabledAt = disabled ? new Date() : null;
    }

    // 코치 업데이트
    const coach = await prisma.user.update({
      where: {
        id: coachId,
        role: "COACH", // 코치만 업데이트
      },
      data: updateData,
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
        groupMemberships: {
          include: {
            group: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "코치 정보가 성공적으로 업데이트되었습니다.",
      data: coach,
    });
  } catch (error) {
    console.error("코치 업데이트 오류:", error);
    return NextResponse.json(
      { error: "코치 정보 업데이트 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    // 자기 자신을 삭제하려는 경우 방지
    if (coachId === currentUser.id) {
      return NextResponse.json(
        { error: "자기 자신을 삭제할 수 없습니다." },
        { status: 400 },
      );
    }

    // 코치 삭제 (실제로는 비활성화 처리)
    await prisma.user.update({
      where: {
        id: coachId,
        role: "COACH", // 코치만 삭제
      },
      data: {
        disabled: true,
        disabledAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "코치가 성공적으로 비활성화되었습니다.",
    });
  } catch (error) {
    console.error("코치 삭제 오류:", error);
    return NextResponse.json(
      { error: "코치 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
