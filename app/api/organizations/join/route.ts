import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 기관 연동 (기관 코드 또는 이메일 도메인으로)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "사용자 정보가 필요합니다." },
        { status: 400 },
      );
    }

    // 기관 코드로 기관 찾기
    let organization = null;
    if (code) {
      organization = await prisma.organization.findUnique({
        where: { code },
      });
    }

    // 이메일 도메인으로 기관 찾기
    if (!organization && email) {
      const emailDomain = email.split("@")[1];
      if (emailDomain) {
        organization = await prisma.organization.findFirst({
          where: { emailDomain },
        });
      }
    }

    if (!organization) {
      return NextResponse.json(
        { message: "유효한 기관 코드 또는 이메일 도메인을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 이미 해당 기관에 연동되어 있는지 확인
    const existingMembership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: organization.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: "이미 해당 기관에 연동되어 있습니다." },
        { status: 400 },
      );
    }

    // 기관 연동 생성
    const userOrganization = await prisma.userOrganization.create({
      data: {
        userId,
        organizationId: organization.id,
        role: "MEMBER", // 기본 역할
      },
      include: {
        organization: true,
      },
    });

    return NextResponse.json(
      {
        message: "기관 연동이 완료되었습니다.",
        organization: userOrganization.organization,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("기관 연동 오류:", error);
    return NextResponse.json(
      { message: "기관 연동에 실패했습니다." },
      { status: 500 },
    );
  }
}

// 사용자의 기관 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "사용자 정보가 필요합니다." },
        { status: 400 },
      );
    }

    const userOrganizations = await prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return NextResponse.json(userOrganizations);
  } catch (error) {
    console.error("사용자 기관 목록 조회 오류:", error);
    return NextResponse.json(
      { message: "기관 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}
