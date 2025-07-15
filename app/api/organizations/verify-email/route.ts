import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrganizationVerificationEmail } from "@/utils/email";

// 이메일 인증 코드 생성 및 전송
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId } = body;

    if (!email || !userId) {
      return NextResponse.json(
        { message: "이메일과 사용자 정보가 필요합니다." },
        { status: 400 },
      );
    }

    // 이메일 도메인 추출
    const emailDomain = email.split("@")[1];
    if (!emailDomain) {
      return NextResponse.json(
        { message: "유효한 이메일 주소를 입력해주세요." },
        { status: 400 },
      );
    }

    // 해당 도메인을 가진 기관 찾기
    const organization = await prisma.organization.findFirst({
      where: { emailDomain },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "해당 이메일 도메인으로 등록된 기관을 찾을 수 없습니다." },
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

    // 6자리 인증 코드 생성
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // 기존 인증 코드가 있다면 삭제
    await prisma.emailVerificationCode.deleteMany({
      where: { email },
    });

    // 새 인증 코드 저장 (10분 유효)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code: verificationCode,
        expiresAt,
      },
    });

    // 실제 이메일 전송
    const emailSent = await sendOrganizationVerificationEmail(
      email,
      verificationCode,
      organization.name,
    );

    if (!emailSent) {
      return NextResponse.json(
        { message: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "인증 코드가 이메일로 전송되었습니다.",
      organization: {
        name: organization.name,
        department: organization.department,
      },
    });
  } catch (error) {
    console.error("이메일 인증 코드 생성 오류:", error);
    return NextResponse.json(
      { message: "인증 코드 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}

// 이메일 인증 코드 확인
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, userId } = body;

    if (!email || !code || !userId) {
      return NextResponse.json(
        { message: "이메일, 인증 코드, 사용자 정보가 필요합니다." },
        { status: 400 },
      );
    }

    // 인증 코드 확인
    const verificationCode = await prisma.emailVerificationCode.findUnique({
      where: { email },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { message: "인증 코드를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (verificationCode.code !== code) {
      return NextResponse.json(
        { message: "인증 코드가 일치하지 않습니다." },
        { status: 400 },
      );
    }

    if (new Date() > verificationCode.expiresAt) {
      return NextResponse.json(
        { message: "인증 코드가 만료되었습니다." },
        { status: 400 },
      );
    }

    // 이메일 도메인으로 기관 찾기
    const emailDomain = email.split("@")[1];
    const organization = await prisma.organization.findFirst({
      where: { emailDomain },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "기관 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 기관 연동 생성
    const userOrganization = await prisma.userOrganization.create({
      data: {
        userId,
        organizationId: organization.id,
        role: "MEMBER",
      },
      include: {
        organization: true,
      },
    });

    // 인증 코드 삭제
    await prisma.emailVerificationCode.delete({
      where: { email },
    });

    return NextResponse.json({
      message: "이메일 인증이 완료되었습니다. 기관 연동이 성공했습니다.",
      organization: userOrganization.organization,
    });
  } catch (error) {
    console.error("이메일 인증 확인 오류:", error);
    return NextResponse.json(
      { message: "이메일 인증에 실패했습니다." },
      { status: 500 },
    );
  }
}
