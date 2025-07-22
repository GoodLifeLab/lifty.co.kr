import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";
import { GroupMemberRole, Prisma } from "@prisma/client";

// 그룹 목록 조회
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
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Prisma.GroupWhereInput = search
      ? {
          name: { contains: search, mode: "insensitive" as Prisma.QueryMode },
        }
      : {};

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        orderBy: {
          name: "asc",
        },
        include: {
          memberships: true,
        },
        skip,
        take: limit,
      }),
      prisma.group.count({ where }),
    ]);

    return NextResponse.json({
      groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("그룹 목록 조회 오류:", error);
    return NextResponse.json(
      { message: "그룹 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}

// 새 그룹 생성
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, description, isPublic, image } = body;

    // 필수 필드 검증
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "그룹 이름은 필수입니다." },
        { status: 400 },
      );
    }

    // 이미지 URL 검증 (선택사항이지만 제공된 경우 유효성 검사)
    if (image && !image.trim()) {
      return NextResponse.json(
        { error: "이미지 URL이 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 새 그룹 생성
    const newGroup = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        isPublic: isPublic ?? true,
        memberships: {
          create: {
            userId: user.id,
            role: GroupMemberRole.ADMIN,
            startDate: new Date(),
          },
        },
      },
      include: {
        memberships: {
          select: {
            id: true,
            userId: true,
            role: true,
            startDate: true,
          },
        },
      },
    });

    // 응답 데이터 변환
    const groupData = {
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.description,
      image: newGroup.image,
      isPublic: newGroup.isPublic,
      memberCount: newGroup.memberships.length,
      createdAt: newGroup.createdAt.toISOString().split("T")[0],
    };

    return NextResponse.json(
      {
        message: "그룹이 성공적으로 생성되었습니다.",
        group: groupData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("그룹 생성 오류:", error);
    return NextResponse.json(
      { error: "그룹 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
