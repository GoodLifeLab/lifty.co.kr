import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 코스 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, startDate, endDate } = body;

    // 필수 필드 검증
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 날짜 유효성 검증
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: "종료일은 시작일보다 늦어야 합니다." },
        { status: 400 },
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        startDate: start,
        endDate: end,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("코스 수정 오류:", error);
    return NextResponse.json(
      { error: "코스를 수정할 수 없습니다." },
      { status: 500 },
    );
  }
}

// 코스 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // 먼저 그룹-코스 관계 삭제
    await prisma.groupCourse.deleteMany({
      where: { courseId: id },
    });

    // 코스 삭제
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ message: "코스가 삭제되었습니다." });
  } catch (error) {
    console.error("코스 삭제 오류:", error);
    return NextResponse.json(
      { error: "코스를 삭제할 수 없습니다." },
      { status: 500 },
    );
  }
}
