"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import GroupBadge from "@/components/GroupBadge";
import CoachStudentsList from "@/components/CoachStudentsList";
import { User, AdminRole, Group, Course, Organization } from "@prisma/client";

// API 응답 타입 (간결한 버전)
type CoachWithDetails = User & {
  groupMemberships: Array<{
    group: Group & {
      courses: Array<{
        course: Pick<Course, "id" | "name" | "startDate" | "endDate">;
      }>;
    };
    role: string;
  }>;
  _count: {
    groupMemberships: number;
  };
};

export default function CoachDetailPage() {
  const router = useRouter();
  const params = useParams();
  const coachId = params.coachId as string;

  const [coach, setCoach] = useState<CoachWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [groups, setGroups] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    fetchCoachData();
  }, [coachId]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      } else {
        console.error("그룹 목록 가져오기 실패:", response.status);
      }
    } catch (error) {
      console.error("그룹 목록 가져오기 오류:", error);
    }
  };

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

  const handleRemoveCoach = async () => {
    if (!coach) return;

    if (!confirm("정말로 이 사용자를 코치에서 제거하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coaches/${coachId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "USER" }),
      });

      if (response.ok) {
        alert("코치에서 제거되었습니다.");
        router.push("/dashboard/admin/coaches");
      } else {
        const error = await response.json();
        alert(error.error || "코치 제거 실패");
      }
    } catch (error) {
      console.error("코치 제거 오류:", error);
      alert("코치 제거 중 오류가 발생했습니다.");
    }
  };

  const handleRemoveFromGroup = async (groupId: number, groupName: string) => {
    if (!coach) return;

    if (!confirm(`정말로 "${groupName}" 그룹에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/groups/${groupId}/members/${coach.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        fetchCoachData(); // 데이터 새로고침
        alert("그룹에서 제거되었습니다.");
      } else {
        const error = await response.json();
        alert(error.error || "그룹에서 제거 실패");
      }
    } catch (error) {
      console.error("그룹에서 제거 오류:", error);
      alert("그룹에서 제거 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case "COACH":
        return "코치";
      case "SUPER_ADMIN":
        return "슈퍼 관리자";
      case "USER":
        return "사용자";
      default:
        return role;
    }
  };

  const getRoleColor = (role: AdminRole) => {
    switch (role) {
      case "COACH":
        return "bg-blue-100 text-blue-800";
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800";
      case "USER":
        return "bg-gray-100 text-gray-800";
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
            className={`px-4 py-2 rounded-md text-sm font-medium ${coach.disabled
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
              }`}
          >
            {coach.disabled ? "활성화" : "비활성화"}
          </button>
          <button
            onClick={handleRemoveCoach}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            코치 제거
          </button>
        </div>
      </div>

      {/* 코치 정보 카드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">기본 정보</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="col-span-2 xl:col-span-1">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 h-16 w-16">
                  {coach.profileImage ? (
                    <img
                      src={coach.profileImage}
                      alt={coach.name || "코치 프로필"}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xl font-medium text-gray-700">
                        {coach.name?.charAt(0) ||
                          coach.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
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
                  <p className="text-gray-600">
                    {coach.phone || "전화번호 없음"}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-sm font-medium text-gray-500 mb-2">가입일</h4>
              <p className="text-gray-900">{formatDate(coach.createdAt)}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
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
              <button
                onClick={() => {
                  fetchGroups();
                  setShowAddGroupModal(true);
                }}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            {coach.groupMemberships.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {coach.groupMemberships.map((membership) => (
                  <GroupBadge
                    key={`group-${membership.group.id}`}
                    groupId={membership.group.id}
                    groupName={membership.group.name}
                    onRemove={handleRemoveFromGroup}
                    showRemoveButton={true}
                  />
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
                        key={`course-${course.id}`}
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

      {/* 소속 학생 목록 */}
      <div className="mt-6">
        <CoachStudentsList coachId={coachId} />
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
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get("name") as string;
                  const email = formData.get("email") as string;
                  const phone = formData.get("phone") as string;

                  try {
                    const response = await fetch(
                      `/api/admin/coaches/${coach?.id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          name,
                          email,
                          phone,
                        }),
                      },
                    );

                    if (response.ok) {
                      setShowEditModal(false);
                      fetchCoachData(); // 데이터 새로고침
                    } else {
                      const error = await response.json();
                      alert(error.error || "코치 정보 수정 실패");
                    }
                  } catch (error) {
                    console.error("코치 정보 수정 오류:", error);
                    alert("코치 정보 수정 중 오류가 발생했습니다.");
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      이름
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={coach?.name || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      이메일
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={coach?.email || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={coach?.phone || ""}
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

      {/* 담당 그룹 추가 모달 */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                담당 그룹 추가
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const groupId = formData.get("groupId") as string;
                  const role = formData.get("role") as string;

                  try {
                    const response = await fetch(`/api/users/add-group`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        userId: coach?.id,
                        groupId: parseInt(groupId),
                        role: role || "ADMIN",
                      }),
                    });

                    if (response.ok) {
                      setShowAddGroupModal(false);
                      fetchCoachData(); // 데이터 새로고침
                      alert("그룹에 추가되었습니다.");
                    } else {
                      const error = await response.json();
                      console.error("그룹 추가 실패:", error);
                      alert(error.message || "그룹 추가 실패");
                    }
                  } catch (error) {
                    console.error("그룹 추가 오류:", error);
                    alert("그룹 추가 중 오류가 발생했습니다.");
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      그룹 선택
                    </label>
                    <select
                      name="groupId"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">그룹을 선택하세요</option>
                      {groups.map((group) => (
                        <option key={`newgroup-${group.id}`} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      역할
                    </label>
                    <select
                      name="role"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="ADMIN">관리자</option>
                      <option value="MEMBER">멤버</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddGroupModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    추가
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
