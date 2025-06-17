"use client";

import { useState } from "react";
import { signup, sendVerificationCode, verifyCode } from "../login/action";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하도록 처리
    let value = e.target.value.replace(/[^\d]/g, "");

    // 010으로 시작하는 경우 10으로 변환
    if (value.startsWith("010")) {
      value = "10" + value.slice(3);
    }

    // 최대 10자리로 제한 (10 + 8자리)
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    setPhoneNumber(value);
  };

  const handleSendVerification = async () => {
    try {
      setError("");
      const result = await sendVerificationCode(phoneNumber);
      if (!result.success && result.error) {
        setError(result.error);
        return;
      }
      setIsVerificationSent(true);
    } catch (err) {
      setError("인증번호 전송에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setError("");
      const result = await verifyCode(phoneNumber, verificationCode);
      if (!result.success && result.error) {
        setError(result.error);
        return;
      }
      setIsVerified(true);
    } catch (err) {
      setError("인증번호 확인 중 오류가 발생했습니다.");
      console.error(err);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
        </div>
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            formData.append("phone", phoneNumber);
            signup(formData);
          }}
        >
          {/* 이메일 섹션 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="example@email.com"
            />
          </div>

          {/* 전화번호 인증 섹션 */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                전화번호
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  +82
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="1012345678"
                  disabled={isVerified}
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={!phoneNumber || isVerified}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                  인증번호 전송
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                예시: 1012345678 (010으로 시작해도 자동 변환됩니다)
              </p>
            </div>

            {isVerificationSent && !isVerified && (
              <div>
                <label
                  htmlFor="verification"
                  className="block text-sm font-medium text-gray-700"
                >
                  인증번호
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="verification"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="인증번호 6자리"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    확인
                  </button>
                </div>
              </div>
            )}

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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

          <div>
            <button
              type="submit"
              disabled={
                !isVerified || !termsAgreed || passwordError !== "" || !email
              }
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              가입하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
