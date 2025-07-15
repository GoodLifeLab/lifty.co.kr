import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";
import { GroupMemberRole } from "@prisma/client";

// 사용자에게 그룹 추가
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { userId, groupId, role } = body;

    if (!userId || !groupId) {
      return NextResponse.json(
        { message: "사용자 ID와 그룹 ID가 필요합니다." },
        { status: 400 },
      );
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 그룹 존재 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { message: "그룹을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 이미 소속된 그룹인지 확인
    const existingMembership = await prisma.groupMember.findFirst({
      where: {
        userId: userId,
        groupId: groupId,
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: "이미 소속된 그룹입니다." },
        { status: 400 },
      );
    }

    // 그룹 멤버십 생성
    await prisma.groupMember.create({
      data: {
        userId: userId,
        groupId: groupId,
        role: role || GroupMemberRole.MEMBER,
      },
    });

    return NextResponse.json({
      message: "그룹이 성공적으로 추가되었습니다.",
    });
  } catch (error) {
    console.error("그룹 추가 오류:", error);
    return NextResponse.json(
      { message: "그룹 추가에 실패했습니다." },
      { status: 500 },
    );
  }
}
