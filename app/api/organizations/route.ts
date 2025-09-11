import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 기관 목록 조회
export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("기관 목록 조회 오류:", error);
    return NextResponse.json(
      { message: "기관 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}
