import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/utils/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일 주소를 입력해주세요." },
        { status: 400 },
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 },
      );
    }

    // 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "해당 이메일로 등록된 사용자가 없습니다." },
        { status: 404 },
      );
    }

    // 기존 토큰 삭제
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // 새로운 토큰 생성
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1시간 유효

    // 토큰 저장
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // 비밀번호 재설정 이메일 전송
    const emailSent = await sendPasswordResetEmail(email, token);

    if (!emailSent) {
      return NextResponse.json(
        { error: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "비밀번호 재설정 이메일이 전송되었습니다." },
      { status: 200 },
    );
  } catch (error) {
    console.error("비밀번호 찾기 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
