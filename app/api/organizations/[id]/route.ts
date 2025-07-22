import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 개별 기관 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "기관을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("기관 조회 오류:", error);
    return NextResponse.json(
      { message: "기관 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}

// 기관 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, department, contactName, contactPhone, emailDomain } = body;

    // 필수 필드 검증
    if (!name || !department) {
      return NextResponse.json(
        { message: "기관명과 기관부서는 필수입니다." },
        { status: 400 },
      );
    }

    // 기존 기관 확인
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { message: "기관을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 기관 수정 (기관 코드는 변경하지 않음)
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        department,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        emailDomain: emailDomain || null,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("기관 수정 오류:", error);
    return NextResponse.json(
      { message: "기관 수정에 실패했습니다." },
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
    const { id } = await params;

    // 기존 기관 확인
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { message: "기관을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 기관 삭제 (Cascade로 연결된 UserOrganization도 자동 삭제)
    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({ message: "기관이 삭제되었습니다." });
  } catch (error) {
    console.error("기관 삭제 오류:", error);
    return NextResponse.json(
      { message: "기관 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
