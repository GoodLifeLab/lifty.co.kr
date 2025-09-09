import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/utils/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, phone, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "이메일과 비밀번호는 필수입니다." },
        { status: 400 },
      );
    }
    const user = await createUser(email, phone || "", password, name || "");
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "회원가입 실패" },
      { status: 500 },
    );
  }
}
