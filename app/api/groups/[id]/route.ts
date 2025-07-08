import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 그룹 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const groupId = parseInt(params.id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: "유효하지 않은 그룹 ID입니다." },
        { status: 400 }
      );
    }

    // 그룹 정보 조회 (현재 사용자가 멤버인지 확인)
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            id: currentUser.id,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "그룹을 찾을 수 없거나 접근 권한이 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("그룹 상세 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "그룹 정보를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 그룹 정보 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const groupId = parseInt(params.id);
    const { name, description, isPublic } = await request.json();

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: "유효하지 않은 그룹 ID입니다." },
        { status: 400 }
      );
    }

    // 입력값 검증
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "그룹 이름은 필수입니다." },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: "그룹 이름은 100자 이하여야 합니다." },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "그룹 설명은 500자 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 그룹 존재 확인 및 권한 확인
    const existingGroup = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            id: currentUser.id,
          },
        },
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: "그룹을 찾을 수 없거나 접근 권한이 없습니다." },
        { status: 404 }
      );
    }

    // 그룹 정보 업데이트
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: Boolean(isPublic),
      },
      include: {
        members: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "그룹 정보가 성공적으로 업데이트되었습니다.",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("그룹 정보 업데이트 오류:", error);
    return NextResponse.json(
      { error: "그룹 정보 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}
