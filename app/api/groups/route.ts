import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 그룹 목록 가져오기
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    // 그룹 데이터를 클라이언트에 맞게 변환
    const groups = await prisma.group.findMany({
      include: {
        memberships: true,
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("그룹 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "그룹 목록을 가져오는 중 오류가 발생했습니다." },
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
    const { name, description, isPublic } = body;

    // 필수 필드 검증
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "그룹 이름은 필수입니다." },
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
        isPublic: isPublic ?? true,
        memberships: {
          create: {
            userId: user.id,
            role: "ADMIN",
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
