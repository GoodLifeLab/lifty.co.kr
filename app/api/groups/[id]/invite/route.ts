import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";
import { GroupMemberRole } from "@prisma/client";

// 그룹에 멤버 초대
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const groupId = parseInt(id);
    const { memberIds, endDate } = await request.json();

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
        memberships: {
          where: {
            userId: currentUser.id,
          },
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
    if (group.memberships[0].role !== "ADMIN") {
      return NextResponse.json(
        { error: "그룹 관리자만 초대할 수 있습니다." },
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
        memberships: {
          where: {
            userId: { in: memberIds },
          },
          select: { id: true, userId: true },
        },
      },
    });

    const alreadyMembers = existingMembers?.memberships || [];
    const newMembers = usersToInvite.filter(
      (user) => !alreadyMembers.some((member) => member.userId === user.id),
    );

    if (newMembers.length === 0) {
      return NextResponse.json(
        { error: "선택한 사용자들이 이미 그룹 멤버입니다." },
        { status: 400 },
      );
    }

    // 새 멤버들을 그룹에 추가
    const memberData = newMembers.map((user) => ({
      userId: user.id,
      groupId,
      startDate: new Date(),
      role: GroupMemberRole.MEMBER,
      endDate: endDate ? new Date(endDate) : null,
    }));

    await prisma.groupMember.createMany({
      data: memberData,
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
