"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const { signup } = useAuth();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하도록 처리
    let value = e.target.value.replace(/[^\d]/g, "");

    // 최대 10자리로 제한 (10 + 8자리)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    setPhoneNumber(value);
  };

  const handleSendEmailVerification = async () => {
    if (!email) {
      setError("이메일을 먼저 입력해주세요.");
      return;
    }

    try {
      setError("");
      setIsSendingEmail(true);
      setIsEmailVerified(false);
      // 이메일 인증 코드 전송 API 호출
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEmailSent(true);
        setError("");
      } else {
        setError(
          data.error ||
            "이메일 인증 코드 전송에 실패했습니다. 다시 시도해주세요.",
        );
      }
    } catch (err) {
      setError("이메일 인증 코드 전송에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email || !verificationCode) {
      setError("이메일과 인증 코드를 입력해주세요.");
      return;
    }

    try {
      setError("");
      setIsCheckingCode(true);

      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEmailVerified(true);
        setError("");
      } else {
        setError(data.error || "인증 코드가 올바르지 않습니다.");
      }
    } catch (err) {
      setError("인증 코드 확인에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (confirmPassword && e.target.value !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signup(email, phoneNumber, password);

    if (result.success) {
      router.push("/login?signup=success");
    } else {
      setError(result.error || "회원가입에 실패했습니다.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* 이메일 섹션 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="example@email.com"
              />
              <button
                type="button"
                onClick={handleSendEmailVerification}
                disabled={!email || isEmailSent || isSendingEmail}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {isSendingEmail
                  ? "처리중..."
                  : isEmailSent
                    ? "전송됨"
                    : "인증메일"}
              </button>
            </div>
            {isEmailSent && (
              <div className="mt-1 space-y-2">
                <p className="text-sm text-green-600">
                  인증 코드가 전송되었습니다. 이메일을 확인해주세요.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증 코드 6자리"
                    maxLength={6}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={
                      !verificationCode ||
                      verificationCode.length !== 6 ||
                      isEmailVerified ||
                      isCheckingCode ||
                      isLoading
                    }
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    {isCheckingCode ? "확인중..." : "확인"}
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSendEmailVerification}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    인증 코드 다시 보내기
                  </button>
                  {isEmailVerified && (
                    <span className="text-sm text-green-600">✓ 인증 완료</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 전화번호 섹션 (인증 없이) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              전화번호
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="1012345678"
            />
          </div>

          {/* 비밀번호 섹션 */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="8자 이상 입력해주세요"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="비밀번호를 한번 더 입력해주세요"
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
          </div>

          {/* 이용약관 동의 */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              <span>이용약관에 동의합니다</span>
              <a
                href="/terms"
                className="ml-1 text-indigo-600 hover:text-indigo-500"
              >
                (자세히 보기)
              </a>
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={
                !termsAgreed ||
                passwordError !== "" ||
                !email ||
                !password ||
                !confirmPassword ||
                isLoading ||
                !isEmailVerified
              }
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isLoading
                ? "가입 중..."
                : !isEmailVerified
                  ? "이메일 인증 필요"
                  : "가입하기"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              이미 계정이 있으신가요? 로그인하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
