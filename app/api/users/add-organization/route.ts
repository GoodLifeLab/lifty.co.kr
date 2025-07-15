import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 사용자에게 기관 추가
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
    const { userId, organizationId, role } = body;

    if (!userId || !organizationId) {
      return NextResponse.json(
        { message: "사용자 ID와 기관 ID가 필요합니다." },
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

    // 기관 존재 확인
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "기관을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 이미 소속된 기관인지 확인
    const existingMembership = await prisma.userOrganization.findFirst({
      where: {
        userId: userId,
        organizationId: organizationId,
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: "이미 소속된 기관입니다." },
        { status: 400 },
      );
    }

    // 기관 멤버십 생성
    await prisma.userOrganization.create({
      data: {
        userId: userId,
        organizationId: organizationId,
        role: role || null,
      },
    });

    return NextResponse.json({
      message: "기관이 성공적으로 추가되었습니다.",
    });
  } catch (error) {
    console.error("기관 추가 오류:", error);
    return NextResponse.json(
      { message: "기관 추가에 실패했습니다." },
      { status: 500 },
    );
  }
}
