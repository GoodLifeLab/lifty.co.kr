import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";
import { GroupMemberRole } from "@prisma/client";
import * as XLSX from "xlsx";

// 엑셀 파일 미리보기 (실제 저장하지 않음)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const groupId = parseInt(id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: "유효하지 않은 그룹 ID입니다." },
        { status: 400 },
      );
    }

    // 그룹 존재 확인 및 권한 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          where: {
            userId: currentUser.id,
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

    // 그룹 관리자인지 확인
    if (
      group.memberships.length === 0 ||
      group.memberships[0].role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "그룹 관리자만 멤버를 초대할 수 있습니다." },
        { status: 403 },
      );
    }

    // FormData에서 파일과 endDate 추출
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "엑셀 파일을 업로드해주세요." },
        { status: 400 },
      );
    }

    // 파일 확장자 확인
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        { error: "엑셀 파일(.xlsx, .xls)만 업로드 가능합니다." },
        { status: 400 },
      );
    }

    // 엑셀 파일 읽기
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: "엑셀 파일이 비어있습니다." },
        { status: 400 },
      );
    }

    // 첫 번째 행을 헤더로 사용하고, 이메일 컬럼 찾기
    const headers = jsonData[0] as string[];
    const emailColumnIndex = headers.findIndex(
      (header) =>
        header &&
        (header.toLowerCase().includes("email") ||
          header.toLowerCase().includes("이메일")),
    );

    if (emailColumnIndex === -1) {
      return NextResponse.json(
        { error: "엑셀 파일에서 'email' 컬럼을 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    // 이메일 데이터 추출
    const emails = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      const email = row[emailColumnIndex];
      if (email && typeof email === "string" && email.trim()) {
        emails.push(email.trim().toLowerCase());
      }
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "유효한 이메일 주소를 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    // 중복 제거
    const uniqueEmails = [...new Set(emails)];

    // 이메일로 사용자 찾기 (users.email 또는 userOrganization.organizationEmail)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: uniqueEmails } },
          {
            organizations: {
              some: {
                organizationEmail: { in: uniqueEmails },
              },
            },
          },
        ],
        disabled: false,
      },
      select: {
        id: true,
        email: true,
        organizations: {
          select: {
            organizationEmail: true,
          },
        },
      },
    });

    if (users.length === 0) {
      return NextResponse.json(
        {
          error: "해당 이메일 주소로 등록된 사용자를 찾을 수 없습니다.",
          notFoundEmails: uniqueEmails,
        },
        { status: 400 },
      );
    }

    // 이미 그룹 멤버인 사용자 확인
    const existingMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: users.map((user) => user.id) },
      },
      select: { userId: true },
    });

    const existingMemberIds = existingMembers.map((member) => member.userId);
    const newMembers = users.filter(
      (user) => !existingMemberIds.includes(user.id),
    );

    // 결과 요약 - 더 상세한 정보 제공
    const foundEmails = users.map((user) => user.email);
    const notFoundEmails = uniqueEmails.filter(
      (email) =>
        !foundEmails.includes(email) &&
        !users.some((user) =>
          user.organizations.some((org) => org.organizationEmail === email),
        ),
    );

    // 이미 멤버인 사용자들의 이메일 정보
    const alreadyMemberEmails =
      existingMembers
        .map((member) => {
          const user = users.find((u) => u.id === member.userId);
          return user ? user.email : null;
        })
        .filter(Boolean) || [];

    return NextResponse.json(
      {
        message: `미리보기: ${newMembers.length}명의 멤버를 초대할 수 있습니다.`,
        preview: true,
        summary: {
          totalEmails: uniqueEmails.length,
          foundUsers: users,
          newMembers: newMembers.length,
          notFoundEmails: notFoundEmails,
          alreadyMemberEmails: alreadyMemberEmails,
        },
        newMembers: newMembers.map((user) => ({
          id: user.id,
          email: user.email,
          organizations: user.organizations.map((org) => ({
            organizationEmail: org.organizationEmail,
          })),
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("엑셀 멤버 초대 오류:", error);
    return NextResponse.json(
      { error: "멤버 초대 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
