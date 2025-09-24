import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/utils/auth';

// 코스에 새 태그 생성
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const { name, color } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: '태그 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    // 인증 확인
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 코스 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: '코스를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 같은 코스 내에서 태그 이름 중복 확인
    const existingTag = await prisma.tag.findFirst({
      where: {
        courseId: courseId,
        name: name.trim(),
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: '이미 존재하는 태그 이름입니다.' },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        courseId: courseId,
        color: color || null,
      },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error('태그 생성 오류:', error);
    return NextResponse.json(
      { error: '태그를 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}


