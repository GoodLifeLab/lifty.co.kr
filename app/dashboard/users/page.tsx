"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import UserTable from "@/components/UserTable";
import { UserService } from "@/services/userService";

interface User {
  id: string;
  email: string;
  name?: string;
  position?: string;
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
  _count: {
    groupMemberships: number;
  };
}

export default function UsersPage() {
  const router = useRouter();

  // 페이지네이션 훅 사용
  const {
    data: users,
    loading,
    currentPage,
    totalPages,
    totalItems: totalUsers,
    hasMore,
    searchTerm,
    setSearchTerm,
    executeSearch,
    goToPage,
    refresh,
  } = usePagination<User>("/api/users", { limit: 10 });

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
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={executeSearch}
          placeholder="이름 또는 이메일로 검색..."
          loading={loading}
        />
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
