import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { coachId: string } },
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

    const { coachId } = params;

    // 코치 조회
    const coach = await prisma.user.findUnique({
      where: {
        id: coachId,
        role: {
          in: ["COACH", "SUPER_ADMIN"],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        disabled: true,
        disabledAt: true,
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
        groupMemberships: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
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

    return NextResponse.json({ data: coach });
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
  { params }: { params: { coachId: string } },
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

    const { coachId } = params;
    const body = await request.json();
    const { name, position, role, disabled } = body;

    // 업데이트할 데이터 구성
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (position !== undefined) updateData.position = position;
    if (role !== undefined) updateData.role = role;
    if (disabled !== undefined) {
      updateData.disabled = disabled;
      updateData.disabledAt = disabled ? new Date() : null;
    }

    // 코치 업데이트
    const coach = await prisma.user.update({
      where: {
        id: coachId,
        role: {
          in: ["COACH", "SUPER_ADMIN"],
        },
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        role: true,
        disabled: true,
        disabledAt: true,
        updatedAt: true,
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
  { params }: { params: { coachId: string } },
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

    const { coachId } = params;

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
        role: {
          in: ["COACH", "SUPER_ADMIN"],
        },
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
