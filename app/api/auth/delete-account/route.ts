import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, clearAuthCookie } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    // 현재 로그인된 사용자 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    console.log("=== 회원탈퇴 시작 ===");
    console.log("사용자 ID:", user.id);
    console.log("사용자 이메일:", user.email);

    // 1. 사용자 관련 데이터 삭제
    console.log("1. 이메일 인증 코드 삭제 시작");
    try {
      await prisma.emailVerificationCode.deleteMany({
        where: { email: user.email },
      });
      console.log("이메일 인증 코드 삭제 완료");
    } catch (error) {
      console.error("이메일 인증 코드 삭제 실패:", error);
    }

    // 2. 사용자 계정 비활성화 (삭제 대신)
    console.log("2. 사용자 계정 비활성화 시작");
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        disabled: true,
        disabledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!updatedUser) {
      console.error("사용자 비활성화 실패");
      return NextResponse.json(
        { success: false, error: "회원탈퇴 처리 중 오류가 발생했습니다." },
        { status: 500 },
      );
    }

    console.log("사용자 계정 비활성화 완료");

    // 3. 인증 쿠키 삭제
    console.log("3. 인증 쿠키 삭제 시작");
    await clearAuthCookie();
    console.log("인증 쿠키 삭제 완료");

    console.log("=== 회원탈퇴 완료 ===");
    return NextResponse.json({
      success: true,
      message: "회원탈퇴가 완료되었습니다.",
    });
  } catch (error: any) {
    console.error("회원탈퇴 API 오류:", error);
    return NextResponse.json(
      { success: false, error: error.message || "회원탈퇴 실패" },
      { status: 500 },
    );
  }
}
