import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  JWTPayload,
} from "./jwt";
import { cookies } from "next/headers";
import { createClient } from "./supabase/server";

export interface User {
  id: string;
  email: string;
  phone?: string;
  password: string;
  emailVerified: boolean;
  createdAt: Date;
}

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
  const supabase = await createClient();

  // 비밀번호 해시화
  const hashedPassword = await hashPassword(password);

  // Supabase에 사용자 저장
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        phone,
        password: hashedPassword,
        email_verified: true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`사용자 생성 실패: ${error.message}`);
  }

  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    password: data.password,
    emailVerified: data.email_verified,
    createdAt: new Date(data.created_at),
  };
}

export async function findUserByEmail(
  email: string,
): Promise<User | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return undefined;
  }

  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    password: data.password,
    emailVerified: data.email_verified,
    createdAt: new Date(data.created_at),
  };
}

export async function findUserById(id: string): Promise<User | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return undefined;
  }

  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    password: data.password,
    emailVerified: data.email_verified,
    createdAt: new Date(data.created_at),
  };
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
