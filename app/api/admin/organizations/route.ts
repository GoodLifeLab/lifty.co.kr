import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

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
export async function GET(request: NextRequest) {
  try {
    // 현재 사용자 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    // 관리자 권한 확인
    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    // 기관 목록 조회
    const [organizations, totalCount] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: organizations,
      pagination: {
        page,
        totalPages,
        total: totalCount,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("기관 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "기관 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 기관 생성
export async function POST(request: NextRequest) {
  try {
    // 현재 사용자 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    // 관리자 권한 확인
    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, contactEmail, contactName, contactPhone, emailDomain } = body;

    // 필수 필드 검증
    if (!name) {
      return NextResponse.json(
        { error: "기관명은 필수입니다." },
        { status: 400 },
      );
    }

    // 고유한 기관 코드 생성
    const code = await generateUniqueCode();

    // 기관 생성
    const organization = await prisma.organization.create({
      data: {
        name,
        contactEmail: contactEmail || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        code,
        emailDomain: emailDomain || null,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "기관이 성공적으로 생성되었습니다.",
        data: organization,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("기관 생성 오류:", error);
    return NextResponse.json(
      { error: "기관 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
