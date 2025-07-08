import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 그룹에 멤버 초대
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const groupId = parseInt(params.id);
    const { memberIds } = await request.json();

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: "유효하지 않은 그룹 ID입니다." },
        { status: 400 },
      );
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "초대할 멤버를 선택해주세요." },
        { status: 400 },
      );
    }

    // 그룹 존재 확인 및 권한 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { id: currentUser.id },
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
    if (group.members.length === 0) {
      return NextResponse.json(
        { error: "그룹 멤버가 아닙니다." },
        { status: 403 },
      );
    }

    // 초대할 사용자들이 유효한지 확인
    const usersToInvite = await prisma.user.findMany({
      where: {
        id: { in: memberIds },
        disabled: false,
      },
      select: { id: true, email: true },
    });

    if (usersToInvite.length === 0) {
      return NextResponse.json(
        { error: "초대할 수 있는 유효한 사용자가 없습니다." },
        { status: 400 },
      );
    }

    // 이미 그룹 멤버인지 확인
    const existingMembers = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: {
            id: { in: memberIds },
          },
          select: { id: true, email: true },
        },
      },
    });

    const alreadyMembers = existingMembers?.members || [];
    const newMembers = usersToInvite.filter(
      (user) => !alreadyMembers.some((member) => member.id === user.id),
    );

    if (newMembers.length === 0) {
      return NextResponse.json(
        { error: "선택한 사용자들이 이미 그룹 멤버입니다." },
        { status: 400 },
      );
    }

    // 새 멤버들을 그룹에 추가
    await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: newMembers.map((user) => ({ id: user.id })),
        },
      },
    });

    return NextResponse.json(
      {
        message: `${newMembers.length}명의 멤버가 성공적으로 초대되었습니다.`,
        invitedMembers: newMembers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("멤버 초대 오류:", error);
    return NextResponse.json(
      { error: "멤버 초대 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
