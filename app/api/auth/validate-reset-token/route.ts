import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "토큰이 필요합니다." },
        { status: 400 },
      );
    }

    // 토큰 조회
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 404 },
      );
    }

    // 만료 시간 확인
    const now = new Date();
    if (now > resetToken.expiresAt) {
      // 만료된 토큰 삭제
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "만료된 토큰입니다." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "유효한 토큰입니다." },
      { status: 200 },
    );
  } catch (error) {
    console.error("토큰 검증 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
