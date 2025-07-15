"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: string;
  organization: {
    id: string;
    name: string;
    department: string;
    code: string;
    emailDomain?: string;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [userOrganizations, setUserOrganizations] = useState<
    UserOrganization[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMethod, setJoinMethod] = useState<"code" | "email">("code");
  const [joinData, setJoinData] = useState({
    code: "",
    email: "",
  });
  const [emailVerificationStep, setEmailVerificationStep] = useState<
    "input" | "verify"
  >("input");
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState<{
    name: string;
    department: string;
  } | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const [profile, setProfile] = useState({
    name: "김철수",
    email: "kim@example.com",
    role: "프로젝트 매니저",
    department: "개발팀",
    bio: "프로젝트 관리와 팀 협업에 열정을 가진 개발자입니다.",
    phone: "010-1234-5678",
    location: "서울시 강남구",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    projectUpdates: true,
    teamMessages: true,
    deadlineReminders: true,
    weeklyReports: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "8",
    passwordExpiry: "90",
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserOrganizations();
    }
  }, [user]);

  const fetchUserOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/organizations/join?userId=${user?.id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setUserOrganizations(data);
      }
    } catch (error) {
      console.error("기관 목록 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (joinMethod === "code") {
        // 기관 코드로 연동
        const requestData = {
          userId: user.id,
          code: joinData.code,
        };

        const response = await fetch("/api/organizations/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message);
          setShowJoinModal(false);
          setJoinData({ code: "", email: "" });
          fetchUserOrganizations();
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } else {
        // 이메일 인증 코드 전송
        setIsSendingCode(true);
        const response = await fetch("/api/organizations/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: joinData.email,
            userId: user.id,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setSelectedOrganization(result.organization);
          setEmailVerificationStep("verify");
          alert(result.message);
        } else {
          const error = await response.json();
          alert(error.message);
        }
        setIsSendingCode(false);
      }
    } catch (error) {
      console.error("기관 연동 오류:", error);
      alert("기관 연동에 실패했습니다.");
      setIsSendingCode(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !verificationCode) {
      alert("인증 코드를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/organizations/verify-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: joinData.email,
          code: verificationCode,
          userId: user.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setShowJoinModal(false);
        setJoinData({ code: "", email: "" });
        setVerificationCode("");
        setEmailVerificationStep("input");
        setSelectedOrganization(null);
        fetchUserOrganizations();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error("이메일 인증 오류:", error);
      alert("이메일 인증에 실패했습니다.");
    }
  };

  const handleResendCode = async () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setIsSendingCode(true);
      const response = await fetch("/api/organizations/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: joinData.email,
          userId: user.id,
        }),
      });

      if (response.ok) {
        alert("인증 코드가 다시 전송되었습니다.");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error("인증 코드 재전송 오류:", error);
      alert("인증 코드 재전송에 실패했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const closeModal = () => {
    setShowJoinModal(false);
    setJoinData({ code: "", email: "" });
    setVerificationCode("");
    setEmailVerificationStep("input");
    setSelectedOrganization(null);
  };

  const handleLeaveOrganization = async (organizationId: string) => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!confirm("정말로 이 기관에서 연동을 해제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/organizations/leave?userId=${user.id}&organizationId=${organizationId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        alert("기관 연동이 해제되었습니다.");
        fetchUserOrganizations();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error("기관 연동 해제 오류:", error);
      alert("기관 연동 해제에 실패했습니다.");
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: string, value: string) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: "profile", name: "프로필", icon: "👤" },
    { id: "organizations", name: "기관 연동", icon: "🏢" },
    { id: "notifications", name: "알림", icon: "🔔" },
    { id: "security", name: "보안", icon: "🔒" },
    { id: "preferences", name: "환경설정", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600">계정 설정과 환경설정을 관리하세요</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 프로필 설정 */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  프로필 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      역할
                    </label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) =>
                        handleProfileChange("role", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      부서
                    </label>
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) =>
                        handleProfileChange("department", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      위치
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) =>
                        handleProfileChange("location", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자기소개
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  프로필 저장
                </button>
              </div>
            </div>
          )}

          {/* 기관 연동 */}
          {activeTab === "organizations" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  기관 연동
                </h3>
                <p className="text-gray-600">
                  현재 연동된 기관 목록입니다. 추가하거나 기관에서 연동을 해제할
                  수 있습니다.
                </p>
                {loading ? (
                  <p>기관 목록을 불러오는 중입니다...</p>
                ) : userOrganizations.length === 0 ? (
                  <p>현재 연동된 기관이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {userOrganizations.map((org) => (
                      <div
                        key={org.id}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {org.organization.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {org.organization.department}
                          </p>
                          <p className="text-sm text-gray-500">
                            코드: {org.organization.code}
                          </p>
                          {org.organization.emailDomain && (
                            <p className="text-sm text-gray-500">
                              이메일 도메인: {org.organization.emailDomain}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleLeaveOrganization(org.organizationId)
                            }
                            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                          >
                            연동 해제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  기관 추가
                </button>
              </div>
            </div>
          )}

          {/* 알림 설정 */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  알림 설정
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        이메일 알림
                      </p>
                      <p className="text-sm text-gray-500">
                        중요한 업데이트를 이메일로 받습니다
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) =>
                          handleNotificationChange("email", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        푸시 알림
                      </p>
                      <p className="text-sm text-gray-500">
                        브라우저 푸시 알림을 받습니다
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) =>
                          handleNotificationChange("push", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        SMS 알림
                      </p>
                      <p className="text-sm text-gray-500">
                        긴급한 알림을 SMS로 받습니다
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) =>
                          handleNotificationChange("sms", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      세부 알림 설정
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          프로젝트 업데이트
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.projectUpdates}
                            onChange={(e) =>
                              handleNotificationChange(
                                "projectUpdates",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">팀 메시지</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.teamMessages}
                            onChange={(e) =>
                              handleNotificationChange(
                                "teamMessages",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          마감일 알림
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.deadlineReminders}
                            onChange={(e) =>
                              handleNotificationChange(
                                "deadlineReminders",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          주간 보고서
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.weeklyReports}
                            onChange={(e) =>
                              handleNotificationChange(
                                "weeklyReports",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  알림 설정 저장
                </button>
              </div>
            </div>
          )}

          {/* 보안 설정 */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  보안 설정
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        2단계 인증
                      </p>
                      <p className="text-sm text-gray-500">
                        계정 보안을 위해 2단계 인증을 활성화하세요
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.twoFactorAuth}
                        onChange={(e) =>
                          handleSecurityChange(
                            "twoFactorAuth",
                            e.target.checked.toString(),
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      세션 타임아웃 (시간)
                    </label>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) =>
                        handleSecurityChange("sessionTimeout", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="1">1시간</option>
                      <option value="4">4시간</option>
                      <option value="8">8시간</option>
                      <option value="24">24시간</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 만료 기간 (일)
                    </label>
                    <select
                      value={security.passwordExpiry}
                      onChange={(e) =>
                        handleSecurityChange("passwordExpiry", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="30">30일</option>
                      <option value="60">60일</option>
                      <option value="90">90일</option>
                      <option value="180">180일</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      비밀번호 변경
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          현재 비밀번호
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호 확인
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  보안 설정 저장
                </button>
              </div>
            </div>
          )}

          {/* 환경설정 */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  환경설정
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      언어
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시간대
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                      <option value="America/New_York">
                        America/New_York (UTC-5)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      테마
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="light">라이트 모드</option>
                      <option value="dark">다크 모드</option>
                      <option value="auto">시스템 설정</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  환경설정 저장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 기관 추가 모달 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex justify-between items-start p-4 rounded-t border-b">
                <h3 className="text-xl font-semibold text-gray-900">
                  기관 연동
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* 이메일 인증 단계 */}
              {emailVerificationStep === "verify" && (
                <form onSubmit={handleVerifyEmail} className="p-6 space-y-6">
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>{selectedOrganization?.name}</strong> (
                        {selectedOrganization?.department})
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {joinData.email}로 인증 코드를 전송했습니다.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        인증 코드 *
                      </label>
                      <input
                        type="text"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="6자리 코드 입력"
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        10분 이내에 인증 코드를 입력해주세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setEmailVerificationStep("input")}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      뒤로가기
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isSendingCode}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSendingCode ? "전송 중..." : "재전송"}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      인증하기
                    </button>
                  </div>
                </form>
              )}

              {/* 초기 입력 단계 */}
              {emailVerificationStep === "input" && (
                <form
                  onSubmit={handleJoinOrganization}
                  className="p-6 space-y-6"
                >
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      기관 코드 또는 이메일 도메인을 통해 기관에 연동할 수
                      있습니다.
                    </p>

                    {/* 연동 방법 선택 */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="join-method"
                            checked={joinMethod === "code"}
                            onChange={() => setJoinMethod("code")}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            기관 코드로 연동
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="join-method"
                            checked={joinMethod === "email"}
                            onChange={() => setJoinMethod("email")}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            이메일 도메인으로 연동
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* 입력 필드 */}
                    <div className="space-y-4">
                      {joinMethod === "code" ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            기관 코드 *
                          </label>
                          <input
                            type="text"
                            required
                            value={joinData.code}
                            onChange={(e) =>
                              setJoinData({
                                ...joinData,
                                code: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="예: A1B2C3D4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            기관에서 제공받은 8자리 코드를 입력하세요.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            이메일 주소 *
                          </label>
                          <input
                            type="email"
                            required
                            value={joinData.email}
                            onChange={(e) =>
                              setJoinData({
                                ...joinData,
                                email: e.target.value,
                              })
                            }
                            placeholder="예: user@company.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            기관에서 등록한 이메일 도메인을 사용하는 이메일을
                            입력하세요.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingCode}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSendingCode
                        ? "전송 중..."
                        : joinMethod === "email"
                          ? "인증 코드 전송"
                          : "연동하기"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
