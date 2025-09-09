"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import UserTable from "@/components/UserTable";
import { UserWithOrganizations } from "@/types/User";

export default function UsersPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [users, setUsers] = useState<UserWithOrganizations[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 사용자 데이터 가져오기
  const fetchUsers = async (
    page: number = 1,
    search: string = "",
    role: string = "",
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(role && { organizationRole: role }),
      });

      const response = await fetch(`/api/users?${params}`);
      if (response.ok) {
        const result = await response.json();
        setUsers(result.users);
        setCurrentPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        setTotalUsers(result.pagination.total);
        setHasMore(result.pagination.hasMore);
      }
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const executeSearch = () => {
    fetchUsers(1, searchTerm, selectedRole);
  };

  // 페이지 변경
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page, searchTerm, selectedRole);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchUsers(1, "", "");
  }, []);

  useEffect(() => {
    executeSearch();
  }, [selectedRole]);

  // 사용자 상세 페이지로 이동
  const handleUserClick = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600">시스템의 모든 사용자를 관리합니다.</p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-end gap-4">
          {/* 검색 */}
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={executeSearch}
              placeholder="이름, 이메일 또는 소속 기관으로 검색..."
              loading={loading}
            />
          </div>

          {/* 직책 필터 */}
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직책
            </label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">전체 직책</option>
              <option value="MEMBER">일반</option>
              <option value="LEADER">리더</option>
              <option value="ADMIN">관리자</option>
            </select>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">사용자 목록</h2>
        </div>

        <UserTable
          users={users}
          loading={loading}
          onUserClick={handleUserClick}
        />

        {/* 페이지네이션 */}
        {users.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalUsers}
            hasMore={hasMore}
            onPageChange={goToPage}
            itemsPerPage={10}
          />
        )}
      </div>
    </div>
  );
}
