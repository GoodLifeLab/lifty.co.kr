import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 특정 사용자 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { userId } = params;

    // 사용자 정보 조회 (비활성화된 사용자 제외)
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        disabled: false, // 비활성화된 사용자 제외
      },
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
        _count: {
          select: {
            groupMemberships: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    return NextResponse.json(
      { message: "사용자 정보를 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}
