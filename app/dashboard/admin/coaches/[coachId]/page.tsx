"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";

interface Coach {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  position?: string;
  role: "COACH" | "SUPER_ADMIN";
  createdAt: string;
  lastLoginAt?: string;
  disabled: boolean;
  disabledAt?: string;
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
      courses: Array<{
        course: {
          id: string;
          name: string;
          startDate: string;
          endDate: string;
        };
      }>;
    };
    role: string;
  }>;
  _count: {
    groupMemberships: number;
    organizations: number;
  };
}

export default function CoachDetailPage() {
  const router = useRouter();
  const params = useParams();
  const coachId = params.coachId as string;

  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCoachData();
  }, [coachId]);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/coaches/${coachId}`);

      if (response.ok) {
        const data = await response.json();
        setCoach(data.data);
      } else {
        setError("코치 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      setError("코치 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!coach) return;

    try {
      const response = await fetch(`/api/admin/coaches/${coachId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disabled: !coach.disabled }),
      });

      if (response.ok) {
        fetchCoachData();
      } else {
        console.error("상태 변경 실패");
      }
    } catch (error) {
      console.error("상태 변경 오류:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "COACH":
        return "코치";
      case "SUPER_ADMIN":
        return "슈퍼 관리자";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "COACH":
        return "bg-blue-100 text-blue-800";
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            뒤로 가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">코치 상세 정보</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            편집
          </button>
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              coach.disabled
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {coach.disabled ? "활성화" : "비활성화"}
          </button>
        </div>
      </div>

      {/* 코치 정보 카드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">기본 정보</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 h-16 w-16">
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xl font-medium text-gray-700">
                  {coach.name?.charAt(0) || coach.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {coach.name || "이름 없음"}
                </h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(coach.role)}`}
                >
                  {getRoleLabel(coach.role)}
                </span>
              </div>
              <p className="text-gray-600">{coach.email}</p>
              <p className="text-gray-600">{coach.phone || "전화번호 없음"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">가입일</h4>
              <p className="text-gray-900">{formatDate(coach.createdAt)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                최근 로그인
              </h4>
              <p className="text-gray-900">
                {coach.lastLoginAt
                  ? formatDate(coach.lastLoginAt)
                  : "로그인 기록 없음"}
              </p>
            </div>
          </div>

          {/* 담당 그룹 */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium text-gray-700">담당 그룹</h4>
              <button className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded">
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            {coach.groupMemberships.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {coach.groupMemberships.map((membership) => (
                  <span
                    key={membership.group.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {membership.group.name}
                    <span className="ml-1 text-green-600">
                      ({membership.role})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">담당 그룹이 없습니다.</p>
            )}
          </div>

          {/* 담당 과정 */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium text-gray-700">담당 과정</h4>
              <button className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded">
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            {(() => {
              // 모든 그룹의 과정을 수집하고 중복 제거
              const allCourses = coach.groupMemberships.flatMap((membership) =>
                membership.group.courses.map(
                  (groupCourse) => groupCourse.course,
                ),
              );

              // 중복 제거 (id 기준)
              const uniqueCourses = allCourses.filter(
                (course, index, self) =>
                  index === self.findIndex((c) => c.id === course.id),
              );

              if (uniqueCourses.length > 0) {
                return (
                  <div className="flex flex-wrap gap-2">
                    {uniqueCourses.map((course) => (
                      <span
                        key={course.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {course.name}
                      </span>
                    ))}
                  </div>
                );
              } else {
                return (
                  <p className="text-xs text-gray-500">담당 과정이 없습니다.</p>
                );
              }
            })()}
          </div>
        </div>
      </div>

      {/* 편집 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                코치 정보 편집
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // 폼 제출 로직 구현
                  setShowEditModal(false);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      이름
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={coach.name || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={coach.phone || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      직책
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={coach.position || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      역할
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      value="코치"
                      disabled
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    수정
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
