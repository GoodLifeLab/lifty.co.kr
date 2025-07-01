import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "이메일은 필수입니다." },
        { status: 400 },
      );
    }

    console.log("=== 계정 복구 시작 ===");
    console.log("복구할 이메일:", email);

    // 사용자 계정 복구 (비활성화 해제)
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        disabled: false,
        disabledAt: null,
        updatedAt: new Date(),
      },
    });

    if (!updatedUser) {
      console.error("계정을 찾을 수 없음:", email);
      return NextResponse.json(
        { success: false, error: "해당 이메일의 계정을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    console.log("=== 계정 복구 완료 ===");
    return NextResponse.json({
      success: true,
      message: "계정이 복구되었습니다.",
    });
  } catch (error: any) {
    console.error("계정 복구 API 오류:", error);
    return NextResponse.json(
      { success: false, error: error.message || "계정 복구 실패" },
      { status: 500 },
    );
  }
}
