import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Presigned URL 생성
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const {
      fileName,
      fileType,
      fileSize,
      folder = "uploads",
    } = await request.json();

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "파일명, 타입, 크기가 필요합니다." },
        { status: 400 },
      );
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 10MB 이하여야 합니다." },
        { status: 400 },
      );
    }

    // 파일 타입 검증
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다." },
        { status: 400 },
      );
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split(".").pop();
    const s3Key = `${folder}/${timestamp}_${randomString}.${fileExtension}`;

    // AWS S3 클라이언트 생성
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "ap-northeast-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // PutObject 명령 생성
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      ContentType: fileType,
    });

    // Presigned URL 생성
    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600, // 1시간
    });

    // S3 공개 URL 생성
    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "ap-northeast-2"}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      presignedUrl,
      s3Url,
      s3Key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Presigned URL 생성 오류:", error);
    return NextResponse.json(
      { error: "Presigned URL 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
