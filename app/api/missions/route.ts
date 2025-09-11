import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: 미션 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const isPublic = searchParams.get("isPublic");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: Prisma.MissionWhereInput = {};

    console.log(courseId, isPublic, search);

    if (courseId) {
      where.courseId = courseId;
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { course: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const missions = await prisma.mission.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        openDate: "desc",
      },
      skip,
      take: limit,
    });

    const totalCount = await prisma.mission.count({ where });
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page * limit < totalCount;

    return NextResponse.json({
      data: missions,
      pagination: {
        page,
        totalPages,
        total: totalCount,
        hasMore,
      },
    });
  } catch (error) {
    console.error("미션 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "미션 목록을 조회하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// POST: 미션 생성
export async function POST(request: NextRequest) {
  try {
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
      subMissions = [],
    } = body;

    // 필수 필드 검증
    if (
      !title ||
      !openDate ||
      !dueDate ||
      !shortDesc ||
      !detailDesc ||
      !courseId
    ) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 과정 존재 여부 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "존재하지 않는 과정입니다." },
        { status: 400 },
      );
    }

    // 미션 생성
    const mission = await prisma.mission.create({
      data: {
        title,
        openDate: new Date(openDate),
        dueDate: new Date(dueDate),
        image,
        shortDesc,
        detailDesc,
        placeholder,
        courseId,
        isPublic: isPublic || false,
        subMissions: subMissions,
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

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error("미션 생성 오류:", error);
    return NextResponse.json(
      { error: "미션을 생성하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
