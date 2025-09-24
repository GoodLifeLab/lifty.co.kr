import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/utils/auth';

// 태그 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; tagId: string } }
) {
  try {
    const { id: courseId, tagId } = params;
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

    // 태그 존재 확인
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        courseId: courseId,
      },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: '태그를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 같은 코스 내에서 다른 태그와 이름 중복 확인
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        courseId: courseId,
        name: name.trim(),
        id: { not: tagId },
      },
    });

    if (duplicateTag) {
      return NextResponse.json(
        { error: '이미 존재하는 태그 이름입니다.' },
        { status: 409 }
      );
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: name.trim(),
        color: color || null,
      },
    });

    return NextResponse.json({ tag: updatedTag });
  } catch (error) {
    console.error('태그 수정 오류:', error);
    return NextResponse.json(
      { error: '태그를 수정할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 태그 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; tagId: string } }
) {
  try {
    const { id: courseId, tagId } = params;

    // 인증 확인
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 태그 존재 확인
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        courseId: courseId,
      },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: '태그를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 태그 삭제 (연관된 MissionTag도 자동으로 삭제됨)
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ message: '태그가 삭제되었습니다.' });
  } catch (error) {
    console.error('태그 삭제 오류:', error);
    return NextResponse.json(
      { error: '태그를 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}


