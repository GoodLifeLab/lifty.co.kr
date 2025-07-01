import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "로그인 필요" },
        { status: 401 },
      );
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("getCurrentUser 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
