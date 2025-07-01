import nodemailer from 'nodemailer';

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail 사용 (다른 서비스도 가능)
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

// 이메일 인증 코드 저장소 (메모리)
const emailVerificationCodes = new Map<string, EmailVerificationData>();

export function generateEmailVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveEmailVerificationCode(email: string, code: string): void {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10분 유효

  emailVerificationCodes.set(email, {
    email,
    code,
    expiresAt,
  });

  console.log('인증 코드를 메모리에 저장했습니다:', email, code);
}

export function verifyEmailCode(email: string, code: string): boolean {
  const data = emailVerificationCodes.get(email);

  if (!data) {
    console.log('인증 코드를 찾을 수 없음');
    return false;
  }

  // 만료 시간 확인
  const now = new Date();
  const expiresAt = data.expiresAt;

  if (now > expiresAt) {
    console.log('인증 코드가 만료됨');
    emailVerificationCodes.delete(email);
    return false;
  }

  // 인증번호 확인
  if (data.code !== code) {
    console.log('인증 코드가 일치하지 않음');
    return false;
  }

  // 인증 성공 시 저장된 인증번호 삭제
  console.log('인증 코드 확인 성공');
  emailVerificationCodes.delete(email);
  return true;
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '[Lifty] 이메일 인증 코드',
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
    console.error('이메일 전송 실패:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '[Lifty] 비밀번호 재설정',
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
    console.error('이메일 전송 실패:', error);
    return false;
  }
} 