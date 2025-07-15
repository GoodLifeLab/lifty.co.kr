import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 기관 연동 해제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (!userId || !organizationId) {
      return NextResponse.json(
        { message: "사용자 정보와 기관 정보가 필요합니다." },
        { status: 400 },
      );
    }

    // 기존 연동 확인
    const existingMembership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!existingMembership) {
      return NextResponse.json(
        { message: "해당 기관에 연동되어 있지 않습니다." },
        { status: 404 },
      );
    }

    // 기관 연동 해제
    await prisma.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return NextResponse.json({ message: "기관 연동이 해제되었습니다." });
  } catch (error) {
    console.error("기관 연동 해제 오류:", error);
    return NextResponse.json(
      { message: "기관 연동 해제에 실패했습니다." },
      { status: 500 },
    );
  }
}
