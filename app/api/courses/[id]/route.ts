import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

// 코스 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                image: true,
                memberships: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                      },
                    },
                  },
                  where: {
                    user: {
                      role: "COACH",
                    },
                  },
                },
              },
            },
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "프로젝트를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 그룹 정보를 평면화
    const formattedCourse = {
      ...course,
      groups: course.groups.map((gc) => gc.group),
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error("프로젝트 조회 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 코스 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, startDate, endDate, groupIds, missionCount } = body;

    // 필수 필드 검증
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { message: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 날짜 검증
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { message: "종료일은 시작일보다 이후여야 합니다." },
        { status: 400 },
      );
    }

    // 기존 그룹 관계 삭제
    await prisma.groupCourse.deleteMany({
      where: { courseId: id },
    });

    // 코스 업데이트
    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        startDate: start,
        endDate: end,
        missionCount: missionCount || 0,
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
                image: true,
                memberships: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                      },
                    },
                  },
                  where: {
                    user: {
                      role: "COACH",
                    },
                  },
                },
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

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error("프로젝트 수정 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 코스 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { id } = await params;

    // 코스 삭제 (관련 그룹 관계는 cascade로 자동 삭제됨)
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ message: "프로젝트가 삭제되었습니다." });
  } catch (error) {
    console.error("프로젝트 삭제 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
