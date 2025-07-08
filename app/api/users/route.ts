import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 사용자 목록 가져오기
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    // 활성화된 사용자만 가져오기 (비활성화된 사용자 제외)
    const users = await prisma.user.findMany({
      where: {
        disabled: false,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("사용자 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "사용자 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
