import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";
import { hashPassword } from "@/utils/jwt";
import { sendTempPasswordEmail } from "@/utils/email";

// 사용자 비밀번호 초기화
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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "사용자 ID가 필요합니다." },
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

    // 임시 비밀번호 생성 (8자리 영문+숫자)
    const generateTempPassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // 이메일로 임시 비밀번호 전송
    const emailSent = await sendTempPasswordEmail(user.email, tempPassword);

    if (!emailSent) {
      return NextResponse.json(
        {
          message:
            "비밀번호는 초기화되었지만 이메일 전송에 실패했습니다. 관리자에게 문의하세요.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message:
        "비밀번호가 초기화되었습니다. 임시 비밀번호가 이메일로 전송되었습니다.",
    });
  } catch (error) {
    console.error("비밀번호 초기화 오류:", error);
    return NextResponse.json(
      { message: "비밀번호 초기화에 실패했습니다." },
      { status: 500 },
    );
  }
}
