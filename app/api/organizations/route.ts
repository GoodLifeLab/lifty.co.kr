import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 8자리 랜덤 코드 생성 함수
function generateOrganizationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 중복되지 않는 기관 코드 생성
async function generateUniqueCode(): Promise<string> {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = generateOrganizationCode();
    const existingOrg = await prisma.organization.findUnique({
      where: { code },
    });

    if (!existingOrg) {
      isUnique = true;
      return code;
    }
  }

  // TypeScript를 위한 기본값 (실제로는 while 루프에서 항상 반환됨)
  return generateOrganizationCode();
}

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

// 기관 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, department, contactName, contactPhone, emailDomain } = body;

    // 필수 필드 검증
    if (!name || !department) {
      return NextResponse.json(
        { message: "기관명과 기관부서는 필수입니다." },
        { status: 400 },
      );
    }

    // 고유한 기관 코드 생성
    const code = await generateUniqueCode();

    // 기관 생성
    const organization = await prisma.organization.create({
      data: {
        name,
        department,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        code,
        emailDomain: emailDomain || null,
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("기관 생성 오류:", error);
    return NextResponse.json(
      { message: "기관 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
