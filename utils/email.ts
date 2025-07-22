import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail 사용 (다른 서비스도 가능)
  auth: {
    user: process.env.EMAIL_USER, // Gmail 계정
    pass: process.env.EMAIL_PASS, // Gmail 앱 비밀번호
  },
});

export interface EmailVerificationData {
  email: string;
  code: string;
  expiresAt: Date;
}

// 이메일 인증 코드 저장소 (메모리 캐시)
const emailVerificationCodes = new Map<string, EmailVerificationData>();

export function generateEmailVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveEmailVerificationCode(
  email: string,
  code: string,
): Promise<void> {
  console.log("=== saveEmailVerificationCode 함수 시작 ===");
  console.log("저장할 이메일:", email);
  console.log("저장할 코드:", code);

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10분 유효

  // 1. 메모리에 저장 (빠른 접근용)
  emailVerificationCodes.set(email, {
    email,
    code,
    expiresAt,
  });

  // 2. 데이터베이스에 저장 (영구 저장용)
  try {
    // 기존 코드 삭제
    await prisma.emailVerificationCode.deleteMany({
      where: { email },
    });

    // 새 코드 저장
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    console.log(
      "인증 코드를 메모리와 데이터베이스에 저장했습니다:",
      email,
      code,
    );
  } catch (error) {
    console.error("데이터베이스 저장 실패 (메모리는 유지):", error);
    // 데이터베이스 저장 실패해도 메모리는 유지
  }

  console.log(
    "현재 저장된 모든 코드:",
    Array.from(emailVerificationCodes.entries()),
  );
  console.log("=== saveEmailVerificationCode 함수 끝 ===");
}

export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<boolean> {
  console.log("=== verifyEmailCode 함수 시작 ===");
  console.log("입력된 이메일:", email);
  console.log("입력된 코드:", code);
  console.log("코드 길이:", code?.length);
  console.log(
    "현재 저장된 모든 코드:",
    Array.from(emailVerificationCodes.entries()),
  );

  // 1. 먼저 메모리에서 확인 (빠름)
  const memoryData = emailVerificationCodes.get(email);
  console.log("메모리에서 찾은 데이터:", memoryData);

  if (memoryData) {
    // 만료 시간 확인
    const now = new Date();
    const expiresAt = memoryData.expiresAt;
    console.log("현재 시간:", now);
    console.log("만료 시간:", expiresAt);
    console.log("만료 여부:", now > expiresAt);

    if (now > expiresAt) {
      console.log("메모리 인증 코드가 만료됨");
      emailVerificationCodes.delete(email);
      // 데이터베이스에서도 삭제
      await deleteFromDatabase(email);
    } else if (memoryData.code === code) {
      console.log("메모리에서 인증 코드 확인 성공");
      // 성공 시 메모리와 데이터베이스에서 모두 삭제
      emailVerificationCodes.delete(email);
      await deleteFromDatabase(email);
      return true;
    }
  }

  // 2. 메모리에 없거나 만료된 경우 데이터베이스에서 확인
  try {
    const dbData = await prisma.emailVerificationCode.findUnique({
      where: {
        email,
      },
    });

    if (!dbData) {
      console.log("데이터베이스에서 인증 코드를 찾을 수 없음");
      return false;
    }

    console.log("데이터베이스에서 찾은 데이터:", dbData);

    // 만료 시간 확인
    const now = new Date();
    const expiresAt = dbData.expiresAt;
    console.log("현재 시간:", now);
    console.log("만료 시간:", expiresAt);
    console.log("만료 여부:", now > expiresAt);

    if (now > expiresAt) {
      console.log("데이터베이스 인증 코드가 만료됨");
      // 만료된 코드 삭제
      await deleteFromDatabase(email);
      return false;
    }

    // 인증번호 확인
    if (dbData.code !== code) {
      console.log("데이터베이스 인증 코드가 일치하지 않음");
      return false;
    }

    console.log("데이터베이스에서 인증 코드 확인 성공");
    // 인증 성공 시 메모리와 데이터베이스에서 모두 삭제
    emailVerificationCodes.delete(email);
    await deleteFromDatabase(email);
    return true;
  } catch (error) {
    console.error("데이터베이스 인증 코드 확인 오류:", error);
    return false;
  }
}

// 데이터베이스에서 인증 코드 삭제 헬퍼 함수
async function deleteFromDatabase(email: string): Promise<void> {
  try {
    await prisma.emailVerificationCode.deleteMany({
      where: { email },
    });
    console.log("데이터베이스에서 인증 코드 삭제 완료:", email);
  } catch (error) {
    console.error("데이터베이스에서 인증 코드 삭제 실패:", error);
  }
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "[Lifty] 이메일 인증 코드",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Lifty 이메일 인증</h2>
          <p>안녕하세요! Lifty 회원가입을 완료하기 위해 이메일 인증을 진행해주세요.</p>
          <p>아래 인증 코드를 입력해주세요:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px;">${code}</span>
            </div>
          </div>
          <p>이 인증 코드는 10분 동안 유효합니다.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("이메일 전송 실패:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "[Lifty] 비밀번호 재설정",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">비밀번호 재설정</h2>
          <p>비밀번호 재설정을 요청하셨습니다.</p>
          <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              비밀번호 재설정하기
            </a>
          </div>
          <p>또는 아래 링크를 브라우저에 복사하여 붙여넣으세요:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>이 링크는 1시간 동안 유효합니다.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("이메일 전송 실패:", error);
    return false;
  }
}

export async function sendOrganizationVerificationEmail(
  email: string,
  code: string,
  organizationName: string,
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `[Lifty] ${organizationName} 기관 연동 인증 코드`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Lifty 기관 연동 인증</h2>
          <p>안녕하세요! <strong>${organizationName}</strong> 기관에 연동하기 위해 이메일 인증을 진행해주세요.</p>
          <p>아래 인증 코드를 입력해주세요:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px;">${code}</span>
            </div>
          </div>
          <p>이 인증 코드는 10분 동안 유효합니다.</p>
          <p style="color: #666; font-size: 14px;">
            기관 연동이 완료되면 해당 기관의 프로젝트와 그룹에 참여할 수 있습니다.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("기관 연동 이메일 전송 실패:", error);
    return false;
  }
}

export async function sendTempPasswordEmail(
  email: string,
  tempPassword: string,
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "[Lifty] 임시 비밀번호 발급",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Lifty 임시 비밀번호 발급</h2>
          <p>안녕하세요! 관리자가 귀하의 비밀번호를 초기화했습니다.</p>
          <p>아래 임시 비밀번호로 로그인하신 후, 반드시 새 비밀번호로 변경해주세요.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 4px;">${tempPassword}</span>
            </div>
          </div>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-weight: bold;">⚠️ 보안 주의사항</p>
            <ul style="color: #92400e; margin: 10px 0 0 0; padding-left: 20px;">
              <li>임시 비밀번호는 한 번만 사용 가능합니다</li>
              <li>로그인 후 즉시 새 비밀번호로 변경해주세요</li>
              <li>비밀번호는 다른 사람과 공유하지 마세요</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 14px;">
            로그인 후 설정 페이지에서 비밀번호를 변경할 수 있습니다.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            이 이메일을 요청하지 않으셨다면 관리자에게 문의하세요.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("임시 비밀번호 이메일 전송 실패:", error);
    return false;
  }
}
