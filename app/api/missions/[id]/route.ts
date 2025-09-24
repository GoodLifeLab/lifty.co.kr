import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: 특정 미션 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const mission = await prisma.mission.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            id: true,
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!mission) {
      return NextResponse.json(
        { error: "미션을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(mission);
  } catch (error) {
    console.error("미션 조회 오류:", error);
    return NextResponse.json(
      { error: "미션을 조회하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// PUT: 미션 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      openDate,
      dueDate,
      image,
      shortDesc,
      detailDesc,
      placeholder,
      courseId,
      isPublic,
      subDescriptions = [],
      tags = [],
    } = body;

    // 미션 존재 여부 확인
    const existingMission = await prisma.mission.findUnique({
      where: { id },
    });

    if (!existingMission) {
      return NextResponse.json(
        { error: "미션을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 과정 존재 여부 확인
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return NextResponse.json(
          { error: "존재하지 않는 과정입니다." },
          { status: 400 },
        );
      }
    }

    // 기존 태그 연결 삭제
    await prisma.missionTag.deleteMany({
      where: { missionId: id },
    });

    // 미션 업데이트
    const updatedMission = await prisma.mission.update({
      where: { id },
      data: {
        title,
        openDate: openDate ? new Date(openDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        image,
        shortDesc,
        detailDesc,
        placeholder,
        courseId,
        isPublic,
        subDescriptions,
        tags: {
          create: tags.map((tag: string) => ({
            tagId: tag,
          })),
        },
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            id: true,
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedMission);
  } catch (error) {
    console.error("미션 수정 오류:", error);
    return NextResponse.json(
      { error: "미션을 수정하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// DELETE: 미션 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 미션 존재 여부 확인
    const existingMission = await prisma.mission.findUnique({
      where: { id },
    });

    if (!existingMission) {
      return NextResponse.json(
        { error: "미션을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 미션 삭제 (사용자 진행 상황은 CASCADE로 자동 삭제됨)
    await prisma.mission.delete({
      where: { id },
    });

    return NextResponse.json({ message: "미션이 삭제되었습니다." });
  } catch (error) {
    console.error("미션 삭제 오류:", error);
    return NextResponse.json(
      { error: "미션을 삭제하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
