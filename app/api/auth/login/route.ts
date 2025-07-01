import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, setAuthCookie } from "@/utils/auth";
import { generateToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "이메일과 비밀번호는 필수입니다." },
        { status: 400 },
      );
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      console.log("인증 실패:", email);
      return NextResponse.json(
        { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    if (!user.emailVerified) {
      console.log("이메일 미인증:", email);
      return NextResponse.json(
        { success: false, error: "이메일 인증이 필요합니다." },
        { status: 403 },
      );
    }

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } catch (error: any) {
    console.error("로그인 API 오류:", error);
    return NextResponse.json(
      { success: false, error: error.message || "로그인 실패" },
      { status: 500 },
    );
  }
}
