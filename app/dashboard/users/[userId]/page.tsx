"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  email: string;
  name?: string;
  position?: string;
  phone?: string;
  createdAt: string;
  organizations: Array<{
    organization: {
      id: string;
      name: string;
      department: string;
    };
    role?: string;
  }>;
  groupMemberships: Array<{
    group: {
      id: number;
      name: string;
      description?: string;
    };
    role: string;
  }>;
}

interface UserDetailPageProps {
  params: {
    userId: string;
  };
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const { userId } = params;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    phone: "",
  });

  // 사용자 정보 로드
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          position: data.user.position || "",
          phone: data.user.phone || "",
        });
      } else {
        alert("사용자 정보를 불러오는데 실패했습니다.");
        router.push("/dashboard/users");
      }
    } catch (error) {
      console.error("사용자 정보 로드 오류:", error);
      alert("사용자 정보를 불러오는데 실패했습니다.");
      router.push("/dashboard/users");
    } finally {
      setLoading(false);
    }
  };

  // 폼 데이터 변경 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 사용자 정보 저장
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          ...formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setEditMode(false);
        fetchUserData(); // 업데이트된 정보 다시 로드
      } else {
        const error = await response.json();
        alert(error.message || "사용자 정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("사용자 정보 저장 오류:", error);
      alert("사용자 정보 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async () => {
    if (!user) return;

    if (
      !confirm(
        `정말로 ${user.name || user.email} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/users?userId=${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        router.push("/dashboard/users");
      } else {
        const error = await response.json();
        alert(error.message || "사용자 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("사용자 삭제 오류:", error);
      alert("사용자 삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  // 비밀번호 초기화
  const handleResetPassword = async () => {
    if (!user) return;

    if (
      !confirm(
        `${user.name || user.email} 사용자의 비밀번호를 초기화하시겠습니까?`,
      )
    ) {
      return;
    }

    try {
      setResettingPassword(true);
      const response = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      } else {
        const error = await response.json();
        alert(error.message || "비밀번호 초기화에 실패했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 초기화 오류:", error);
      alert("비밀번호 초기화에 실패했습니다.");
    } finally {
      setResettingPassword(false);
    }
  };

  // 수정 모드 토글
  const toggleEditMode = () => {
    if (editMode) {
      // 수정 모드에서 나올 때 원래 데이터로 복원
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        position: user?.position || "",
        phone: user?.phone || "",
      });
    }
    setEditMode(!editMode);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">사용자 상세</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">사용자 상세</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">사용자를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 상세</h1>
            <p className="text-gray-600">
              사용자 정보를 확인하고 수정할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 사용자 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-6 mb-6">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-medium">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {user.name || "이름 없음"}
              </h2>
              <p className="text-sm text-gray-500 mb-1">{user.email}</p>
              {user.position && (
                <p className="text-sm text-gray-400 mb-3">{user.position}</p>
              )}

              {/* 소속 기관 뱃지 */}
              {user.organizations.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    소속 기관
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.organizations.map((org) => (
                      <span
                        key={org.organization.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {org.organization.name}
                        {org.role && (
                          <span className="ml-1 text-indigo-600">
                            ({org.role})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 소속 그룹 뱃지 */}
              {user.groupMemberships.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    소속 그룹
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.groupMemberships.map((group) => (
                      <span
                        key={group.group.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {group.group.name}
                        <span className="ml-1 text-green-600">
                          ({group.role})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 작업 버튼들 */}
            <div className="flex-shrink-0">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={toggleEditMode}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center justify-center"
                >
                  {editMode ? "편집 취소" : "정보 수정"}
                </button>

                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="px-4 py-2 text-sm font-medium text-yellow-600 bg-white border border-yellow-600 rounded-md hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                >
                  {resettingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                      초기화 중...
                    </>
                  ) : (
                    "비밀번호 초기화"
                  )}
                </button>

                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      삭제 중...
                    </>
                  ) : (
                    "사용자 삭제"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">
              상세 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직책
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                    placeholder="직책을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {user.position || "직책 없음"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="전화번호를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {user.phone || "전화번호 없음"}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가입일
              </label>
              <p className="text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
