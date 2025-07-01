import { NextRequest, NextResponse } from "next/server";
import {
  generateEmailVerificationCode,
  saveEmailVerificationCode,
  sendVerificationEmail,
} from "@/utils/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, error: "이메일은 필수입니다." },
        { status: 400 },
      );
    }

    console.log("이메일 인증 코드 전송 요청:", email);

    // 인증 코드 생성 및 저장
    const code = generateEmailVerificationCode();
    await saveEmailVerificationCode(email, code);

    // 인증 코드 이메일 전송
    const success = await sendVerificationEmail(email, code);

    if (success) {
      console.log("이메일 인증 코드 전송 성공:", email);
      return NextResponse.json({ success: true });
    } else {
      console.error("이메일 인증 코드 전송 실패:", email);
      return NextResponse.json(
        { success: false, error: "이메일 전송에 실패했습니다." },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("send-verification API 오류:", error);
    return NextResponse.json(
      { success: false, error: error.message || "이메일 전송 실패" },
      { status: 500 },
    );
  }
}
