import { NextRequest, NextResponse } from "next/server";
import { verifyEmailCode } from "@/utils/email";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      console.log("이메일 또는 코드가 없음");
      return NextResponse.json(
        { success: false, error: "이메일과 인증 코드는 필수입니다." },
        { status: 400 },
      );
    }

    const isValid = await verifyEmailCode(email, code);

    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      console.log("인증 코드 확인 실패:", email);
      return NextResponse.json(
        {
          success: false,
          error: "인증 코드가 올바르지 않거나 만료되었습니다.",
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("verify-code API 오류:", error);
    return NextResponse.json(
      { success: false, error: error.message || "인증 코드 확인 실패" },
      { status: 500 },
    );
  }
}
