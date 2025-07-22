import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 코스 목록 조회
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 그룹 정보를 평면화
    const formattedCourses = courses.map((course) => ({
      ...course,
      groups: course.groups.map((gc) => gc.group),
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("코스 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "코스 목록을 조회할 수 없습니다." },
      { status: 500 },
    );
  }
}

// 코스 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, groupIds } = body;

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

    const course = await prisma.course.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        groups:
          groupIds && groupIds.length > 0
            ? {
                create: groupIds.map((groupId: number) => ({
                  groupId: groupId,
                })),
              }
            : undefined,
      },
      include: {
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 그룹 정보를 평면화
    const formattedCourse = {
      ...course,
      groups: course.groups.map((gc) => gc.group),
    };

    return NextResponse.json(formattedCourse, { status: 201 });
  } catch (error) {
    console.error("코스 생성 오류:", error);
    return NextResponse.json(
      { error: "코스를 생성할 수 없습니다." },
      { status: 500 },
    );
  }
}
