"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import CoachTable from "@/components/CoachTable";

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
    };
    role: string;
  }>;
  _count: {
    groupMemberships: number;
    organizations: number;
  };
}

export default function CoachesPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // 페이지네이션 훅 사용
  const {
    data: coaches,
    loading,
    currentPage,
    totalPages,
    totalItems: totalCoaches,
    hasMore,
    searchTerm,
    setSearchTerm,
    executeSearch,
    goToPage,
    refresh,
  } = usePagination<Coach>("/api/admin/coaches", {
    limit: 10,
  });

  // 역할 필터 변경 시 검색 실행
  useEffect(() => {
    executeSearch();
  }, [selectedRole]);

  // 코치 상세 페이지로 이동
  const handleCoachClick = (coachId: string) => {
    router.push(`/dashboard/admin/coaches/${coachId}`);
  };

  // 코치 편집
  const handleEditCoach = (coach: Coach) => {
    setEditingCoach(coach);
    setShowCreateModal(true);
  };

  // 사용자 검색
  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/users?search=${encodeURIComponent(term)}&limit=10&coachSearch=true`,
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error("사용자 검색 오류:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 사용자 선택
  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setUserSearchTerm(user.name || user.email);
    setSearchResults([]);
  };

  // 코치 추가
  const handleAddCoach = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch("/api/admin/coaches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setSelectedUser(null);
        setUserSearchTerm("");
        setEditingCoach(null);
        refresh();
      } else {
        const error = await response.json();
        alert(error.error || "코치 추가 실패");
      }
    } catch (error) {
      console.error("코치 추가 오류:", error);
      alert("코치 추가 중 오류가 발생했습니다.");
    }
  };

  // 코치 상태 토글
  const handleToggleStatus = async (coachId: string, disabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/coaches/${coachId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disabled }),
      });

      if (response.ok) {
        refresh();
      } else {
        console.error("상태 변경 실패");
      }
    } catch (error) {
      console.error("상태 변경 오류:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">코치 관리</h1>
          <p className="text-gray-600">새로운 코치를 생성하고 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          코치 추가
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={executeSearch}
              placeholder="이름, 이메일 또는 직책으로 검색..."
              loading={loading}
            />
          </div>
          <div className="sm:w-48">
            <label
              htmlFor="role-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              상태
            </label>
            <select
              id="role-filter"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="disabled">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 코치 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">코치 목록</h2>
        </div>

        <CoachTable
          coaches={coaches}
          loading={loading}
          onCoachClick={handleCoachClick}
          onEditCoach={handleEditCoach}
          onToggleStatus={handleToggleStatus}
        />

        {/* 페이지네이션 */}
        {coaches.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCoaches}
            hasMore={hasMore}
            onPageChange={goToPage}
          />
        )}
      </div>

      {/* 코치 생성/편집 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCoach ? "코치 편집" : "사용자를 코치로 추가"}
              </h3>

              {!editingCoach ? (
                // 사용자 검색 및 선택
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사용자 검색
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="이름 또는 이메일로 검색..."
                        value={userSearchTerm}
                        onChange={(e) => {
                          setUserSearchTerm(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {searchLoading && (
                        <div className="absolute right-3 top-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        </div>
                      )}
                    </div>

                    {/* 검색 결과 */}
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || "이름 없음"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedUser && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="text-sm font-medium text-green-800">
                        선택된 사용자
                      </div>
                      <div className="text-sm text-green-700">
                        {selectedUser.name || "이름 없음"} ({selectedUser.email}
                        )
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // 기존 코치 편집 (기존 폼 유지)
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // 폼 제출 로직 구현
                    setShowCreateModal(false);
                    setEditingCoach(null);
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        이메일
                      </label>
                      <input
                        type="email"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        defaultValue={editingCoach?.email || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        이름
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        defaultValue={editingCoach?.name || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        전화번호
                      </label>
                      <input
                        type="tel"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        defaultValue={editingCoach?.phone || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        직책
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        defaultValue={editingCoach?.position || ""}
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
                </form>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCoach(null);
                    setSelectedUser(null);
                    setUserSearchTerm("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                {!editingCoach ? (
                  <button
                    type="button"
                    onClick={handleAddCoach}
                    disabled={!selectedUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    코치로 추가
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    수정
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
