import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

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
    const role = searchParams.get("role") || "";

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {
      role: "COACH", // 코치만 조회
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "all") {
      // 상태 필터링 (활성/비활성)
      if (role === "active") {
        where.disabled = false;
      } else if (role === "disabled") {
        where.disabled = true;
      }
    }

    // 코치 목록 조회
    const [coaches, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          position: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          disabled: true,
          disabledAt: true,
          organizations: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  department: true,
                },
              },
            },
          },
          groupMemberships: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          _count: {
            select: {
              groupMemberships: true,
              organizations: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: coaches,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("코치 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "코치 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

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

    // 슈퍼 관리자 권한 확인
    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "슈퍼 관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { email, name, position } = body;

    // 필수 필드 검증
    if (!email || !name) {
      return NextResponse.json(
        { error: "이메일과 이름은 필수입니다." },
        { status: 400 },
      );
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 존재하는 이메일입니다." },
        { status: 400 },
      );
    }

    // 임시 비밀번호 생성 (실제로는 이메일로 전송)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await import("@/utils/jwt").then((m) =>
      m.hashPassword(tempPassword),
    );

    // 코치 생성
    const coach = await prisma.user.create({
      data: {
        email,
        name,
        position,
        role: "COACH", // 항상 COACH로 설정
        password: hashedPassword,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "코치가 성공적으로 생성되었습니다.",
      data: coach,
      tempPassword, // 실제로는 이메일로 전송해야 함
    });
  } catch (error) {
    console.error("코치 생성 오류:", error);
    return NextResponse.json(
      { error: "코치 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
