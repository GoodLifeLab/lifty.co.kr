import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 특정 그룹 상세 정보 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const groupId = parseInt(params.id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: "유효하지 않은 그룹 ID입니다." },
        { status: 400 },
      );
    }

    // 그룹 상세 정보 가져오기
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "그룹을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 클라이언트에 맞게 데이터 변환
    const groupData = {
      id: group.id,
      name: group.name,
      description: group.description,
      image: group.image,
      isPublic: group.isPublic,
      memberCount: group.members.length,
      createdAt: group.createdAt.toISOString().split("T")[0],
      members: group.members,
    };

    return NextResponse.json({ group: groupData });
  } catch (error) {
    console.error("그룹 상세 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "그룹 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
