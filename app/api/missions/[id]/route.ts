import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 특정 미션 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const mission = await prisma.mission.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        subMissions: {
          orderBy: {
            order: "asc",
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
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const {
      title,
      dueDate,
      image,
      shortDesc,
      detailDesc,
      placeholder,
      courseId,
      isPublic,
      subMissions = [],
    } = body;

    // 미션 존재 여부 확인
    const existingMission = await prisma.mission.findUnique({
      where: { id: params.id },
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

    // 미션 업데이트
    const updatedMission = await prisma.mission.update({
      where: { id: params.id },
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        image,
        shortDesc,
        detailDesc,
        placeholder,
        courseId,
        isPublic,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 기존 하위 미션 삭제
    await prisma.subMission.deleteMany({
      where: { missionId: params.id },
    });

    // 새로운 하위 미션 생성
    if (subMissions.length > 0) {
      await prisma.subMission.createMany({
        data: subMissions.map((sub: any, index: number) => ({
          text: sub.text,
          missionId: params.id,
          order: index + 1,
        })),
      });
    }

    // 업데이트된 미션을 하위 미션과 함께 반환
    const finalMission = await prisma.mission.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        subMissions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(finalMission);
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
  { params }: { params: { id: string } },
) {
  try {
    // 미션 존재 여부 확인
    const existingMission = await prisma.mission.findUnique({
      where: { id: params.id },
    });

    if (!existingMission) {
      return NextResponse.json(
        { error: "미션을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 미션 삭제 (하위 미션과 사용자 진행 상황은 CASCADE로 자동 삭제됨)
    await prisma.mission.delete({
      where: { id: params.id },
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
