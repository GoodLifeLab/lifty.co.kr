import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";

// 기관 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    // 기관 조회
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "기관을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: organization });
  } catch (error) {
    console.error("기관 조회 오류:", error);
    return NextResponse.json(
      { error: "기관 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 기관 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const body = await request.json();
    const { name, contactName, contactPhone, contactEmail, emailDomain } = body;

    // 업데이트할 데이터 구성
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (emailDomain !== undefined) updateData.emailDomain = emailDomain;

    // 기관 업데이트
    const organization = await prisma.organization.update({
      where: { id },
      data: updateData,
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "기관 정보가 성공적으로 업데이트되었습니다.",
      data: organization,
    });
  } catch (error) {
    console.error("기관 업데이트 오류:", error);
    return NextResponse.json(
      { error: "기관 정보 업데이트 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 기관 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    // 기관 존재 여부 확인
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "기관을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 기관 삭제 (관련된 user_organizations는 cascade로 자동 삭제됨)
    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "기관이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("기관 삭제 오류:", error);
    return NextResponse.json(
      { error: "기관 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
