import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 사용자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const organizationId = searchParams.get("organizationId");

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {
      disabled: false, // 비활성화된 사용자 제외
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // 기관별 필터링
    if (organizationId) {
      where.organizations = {
        some: {
          organizationId: organizationId,
        },
      };
    }

    // 사용자 목록 조회
    const users = await prisma.user.findMany({
      where,
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
        groupMemberships: {
          include: {
            group: true,
          },
        },
        _count: {
          select: {
            groupMemberships: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // 전체 사용자 수 조회
    const totalUsers = await prisma.user.count({ where });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("사용자 목록 조회 오류:", error);
    return NextResponse.json(
      { message: "사용자 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}

// 사용자 정보 수정
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { userId, name, email, position, phone } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "사용자 ID가 필요합니다." },
        { status: 400 },
      );
    }

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 이메일 중복 확인 (다른 사용자와 중복되지 않는지)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: "이미 사용 중인 이메일입니다." },
          { status: 400 },
        );
      }
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(position && { position }),
        ...(phone !== undefined && { phone }),
      },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
        _count: {
          select: {
            groupMemberships: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "사용자 정보가 수정되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("사용자 정보 수정 오류:", error);
    return NextResponse.json(
      { message: "사용자 정보 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}

// 사용자 비활성화
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "사용자 ID가 필요합니다." },
        { status: 400 },
      );
    }

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 현재 로그인한 사용자와 같은 사용자인지 확인
    if (existingUser.email === currentUser.email) {
      return NextResponse.json(
        { message: "자신의 계정은 비활성화할 수 없습니다." },
        { status: 400 },
      );
    }

    // 이미 비활성화된 사용자인지 확인
    if (existingUser.disabled) {
      return NextResponse.json(
        { message: "이미 비활성화된 사용자입니다." },
        { status: 400 },
      );
    }

    // 사용자 비활성화
    await prisma.user.update({
      where: { id: userId },
      data: {
        disabled: true,
        disabledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "사용자가 비활성화되었습니다.",
    });
  } catch (error) {
    console.error("사용자 비활성화 오류:", error);
    return NextResponse.json(
      { message: "사용자 비활성화에 실패했습니다." },
      { status: 500 },
    );
  }
}

// 사용자 복구 (비활성화 해제)
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "사용자 ID가 필요합니다." },
        { status: 400 },
      );
    }

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 이미 활성화된 사용자인지 확인
    if (!existingUser.disabled) {
      return NextResponse.json(
        { message: "이미 활성화된 사용자입니다." },
        { status: 400 },
      );
    }

    // 사용자 복구 (비활성화 해제)
    await prisma.user.update({
      where: { id: userId },
      data: {
        disabled: false,
        disabledAt: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "사용자가 복구되었습니다.",
    });
  } catch (error) {
    console.error("사용자 복구 오류:", error);
    return NextResponse.json(
      { message: "사용자 복구에 실패했습니다." },
      { status: 500 },
    );
  }
}
