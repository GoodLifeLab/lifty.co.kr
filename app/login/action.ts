"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";

// 네이버 클라우드 SMS API 설정
const NAVER_ACCESS_KEY = process.env.NAVER_ACCESS_KEY || "";
const NAVER_SECRET_KEY = process.env.NAVER_SECRET_KEY || "";
const NAVER_SERVICE_ID = process.env.NAVER_SERVICE_ID || "";
const NAVER_SENDER_PHONE = process.env.NAVER_SENDER_PHONE || "";

// 인증번호 저장을 위한 임시 저장소 (실제로는 Redis나 DB를 사용하는 것이 좋습니다)
const verificationCodes = new Map<
  string,
  { code: string; timestamp: number }
>();

// 인증번호 생성 함수
function generateVerificationCode(): string {
  return "123456";
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 네이버 클라우드 SMS API 호출 함수
async function sendSMS(phone: string, content: string) {
  const timestamp = Date.now().toString();
  const space = " ";
  const newLine = "\n";
  const method = "POST";
  const url = `/sms/v2/services/${NAVER_SERVICE_ID}/messages`;
  const url2 = `/sms/v2/services/${NAVER_SERVICE_ID}/messages`;

  const message = [
    method,
    space,
    url,
    newLine,
    timestamp,
    newLine,
    NAVER_ACCESS_KEY,
  ].join("");

  const signature = crypto
    .createHmac("sha256", NAVER_SECRET_KEY)
    .update(message)
    .digest("base64");

  const response = await fetch(`https://sens.apigw.ntruss.com${url2}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ncp-apigw-timestamp": timestamp,
      "x-ncp-iam-access-key": NAVER_ACCESS_KEY,
      "x-ncp-apigw-signature-v2": signature,
    },
    body: JSON.stringify({
      type: "SMS",
      from: NAVER_SENDER_PHONE,
      content: content,
      messages: [
        {
          to: phone,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("SMS 전송 실패");
  }

  return response.json();
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  // 전화번호 형식 변환 (01012345678 -> +821012345678)
  const formattedPhone = `+82${phone}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    phone: formattedPhone,
    options: {
      data: {
        phone: formattedPhone,
      },
    },
  });

  if (error) {
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function sendVerificationCode(phone: string) {
  try {
    // 인증번호 생성
    const code = generateVerificationCode();

    // 인증번호 저장 (5분 유효)
    verificationCodes.set(phone, {
      code,
      timestamp: Date.now(),
    });

    // SMS 전송
    const formattedPhone = `+82${phone}`;
    // await sendSMS(
    //   formattedPhone,
    //   `[Lifty] 인증번호는 [${code}] 입니다.`
    // );

    console.log(phone, code);
    return { success: true };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      error: "인증번호 전송에 실패했습니다. 다시 시도해주세요.",
    };
  }
}

export async function verifyCode(phone: string, code: string) {
  try {
    const storedData = verificationCodes.get(phone);

    if (!storedData) {
      return { success: false, error: "인증번호를 먼저 요청해주세요." };
    }

    // 5분 제한 확인
    if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
      verificationCodes.delete(phone);
      return { success: false, error: "인증번호가 만료되었습니다." };
    }

    // 인증번호 확인
    if (storedData.code !== code) {
      return { success: false, error: "인증번호가 일치하지 않습니다." };
    }

    // 인증 성공 시 저장된 인증번호 삭제
    verificationCodes.delete(phone);

    return { success: true };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, error: "인증 처리 중 오류가 발생했습니다." };
  }
}
