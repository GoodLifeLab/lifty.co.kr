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
          phone: true,
          profileImage: true,
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
        page,
        totalPages,
        total: totalCount,
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
    const { userId } = body;

    // 필수 필드 검증
    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID는 필수입니다." },
        { status: 400 },
      );
    }

    // 기존 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "존재하지 않는 사용자입니다." },
        { status: 404 },
      );
    }

    if (existingUser.role !== "USER") {
      return NextResponse.json(
        { error: "일반 사용자만 코치로 변경할 수 있습니다." },
        { status: 400 },
      );
    }

    // 사용자를 코치로 변경
    const coach = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "COACH",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        position: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "사용자가 성공적으로 코치로 변경되었습니다.",
      data: coach,
    });
  } catch (error) {
    console.error("코치 생성 오류:", error);
    return NextResponse.json(
      { error: "코치 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
