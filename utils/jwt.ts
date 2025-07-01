import { SignJWT, jwtVerify, decodeJwt } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  phone?: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  const encoder = new TextEncoder();
  const secret = encoder.encode(JWT_SECRET);

  const jwt = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);

  return jwt;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const encoder = new TextEncoder();
    const secret = encoder.encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = decodeJwt(token);
    return decoded as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
