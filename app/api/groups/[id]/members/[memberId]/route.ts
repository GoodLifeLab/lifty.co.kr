import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";
import { GroupMemberRole } from "@prisma/client";

// 그룹에서 멤버 방출
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { id, memberId } = await params;
    const groupId = parseInt(id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: "유효하지 않은 그룹 ID입니다." },
        { status: 400 },
      );
    }

    // 그룹 존재 확인 및 권한 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          where: { userId: currentUser.id },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "그룹을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 그룹 멤버인지 확인
    if (group.memberships[0].role !== GroupMemberRole.ADMIN) {
      return NextResponse.json(
        { error: "그룹 관리자만 멤버를 방출할 수 있습니다." },
        { status: 403 },
      );
    }

    // 자신을 방출하려는 경우 방지
    if (memberId === currentUser.id) {
      return NextResponse.json(
        { error: "자신을 방출할 수 없습니다." },
        { status: 400 },
      );
    }

    // 멤버 방출
    await prisma.groupMember.delete({
      where: {
        userId_groupId: { userId: memberId, groupId },
      },
    });

    return NextResponse.json(
      { message: "멤버가 성공적으로 방출되었습니다." },
      { status: 200 },
    );
  } catch (error) {
    console.error("멤버 방출 오류:", error);
    return NextResponse.json(
      { error: "멤버 방출 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
