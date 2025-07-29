import { verifyToken, hashPassword, comparePassword } from "./jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

// 인증번호 저장소
const verificationCodes = new Map<
  string,
  { code: string; timestamp: number }
>();

export async function createUser(
  email: string,
  phone: string,
  password: string,
): Promise<User> {
  // 비밀번호 해시화
  const hashedPassword = await hashPassword(password);

  // Prisma를 사용하여 사용자 저장
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      password: hashedPassword,
      emailVerified: true,
    },
  });

  return user;
}

export async function findUserByEmail(
  email: string,
): Promise<User | undefined> {
  console.log(await prisma.user.findMany());
  const user = await prisma.user.findUnique({
    where: {
      email,
      disabled: false,
    },
  });

  return user || undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({
    where: {
      id,
      disabled: false,
    },
  });

  return user || undefined;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  return user;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveVerificationCode(phone: string, code: string): void {
  verificationCodes.set(phone, {
    code,
    timestamp: Date.now(),
  });
}

export function verifyCode(phone: string, code: string): boolean {
  const storedData = verificationCodes.get(phone);

  if (!storedData) {
    return false;
  }

  // 5분 제한 확인
  if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
    verificationCodes.delete(phone);
    return false;
  }

  // 인증번호 확인
  if (storedData.code !== code) {
    return false;
  }

  // 인증 성공 시 저장된 인증번호 삭제
  verificationCodes.delete(phone);
  return true;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return null;
    }

    const user = await findUserById(payload.userId);

    return user || null;
  } catch (error) {
    console.error("getCurrentUser 오류:", error);
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return user?.emailVerified || false;
}
