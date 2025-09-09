"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import CreateGroupModal from "@/app/components/CreateGroupModal";
import StatsCard from "@/components/StatsCard";
import GroupTable from "@/components/GroupTable";
import Pagination from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { GroupService } from "@/services/groupService";
import { GroupWithMembers } from "@/types/Group";

export default function GroupsPage() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // 페이지네이션 훅 사용
  const {
    data: groups,
    loading,
    currentPage,
    totalPages,
    totalItems: totalGroups,
    hasMore,
    searchTerm: paginationSearchTerm,
    setSearchTerm: setPaginationSearchTerm,
    executeSearch,
    goToPage,
    refresh,
  } = usePagination<GroupWithMembers>("/api/groups", {
    limit: 10,
  });

  // 새 그룹 생성
  const handleCreateGroup = async (groupData: {
    name: string;
    description: string;
    isPublic: boolean;
    image?: string;
    memberIds: string[];
  }) => {
    try {
      setCreating(true);
      await GroupService.createGroup(groupData);
      alert("그룹이 성공적으로 생성되었습니다.");

      // 그룹 목록 새로고침
      refresh();

      // 모달 닫기
      setShowCreateGroup(false);
    } catch (error) {
      console.error("그룹 생성 오류:", error);
      alert(
        error instanceof Error ? error.message : "그룹 생성에 실패했습니다.",
      );
      throw error; // 모달에서 에러 처리할 수 있도록 다시 던짐
    } finally {
      setCreating(false);
    }
  };

  // 그룹 클릭 처리
  const handleGroupClick = (groupId: number) => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  // 검색 처리
  const handleSearch = () => {
    setPaginationSearchTerm(searchTerm);
    executeSearch();
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">그룹 관리</h1>
          <p className="text-gray-600">
            팀과 그룹을 관리하고 구성원을 초대하세요
          </p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />새 그룹 만들기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="총 그룹"
          value={loading ? "..." : groups.length}
          icon={<UserGroupIcon className="h-8 w-8 text-indigo-600" />}
          loading={loading}
        />
        <StatsCard
          title="공개 그룹"
          value={loading ? "..." : groups.filter((g) => g.isPublic).length}
          icon={<GlobeAltIcon className="h-8 w-8 text-green-600" />}
          loading={loading}
        />
        <StatsCard
          title="비공개 그룹"
          value={loading ? "..." : groups.filter((g) => !g.isPublic).length}
          icon={<LockClosedIcon className="h-8 w-8 text-gray-600" />}
          loading={loading}
        />
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              그룹 검색
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="그룹명 또는 설명으로 검색..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                검색
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 그룹 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">그룹 목록</h3>
          <p className="text-sm text-gray-500">
            전체 관리자는 모든 그룹이 나오지만 코치는 본인의 그룹만 나옴 - 삭제
            예정 텍스트
          </p>
        </div>
        <GroupTable
          groups={groups}
          loading={loading}
          onGroupClick={handleGroupClick}
          onCreateNew={() => setShowCreateGroup(true)}
          showCreateButton={true}
        />

        {/* 페이지네이션 */}
        {groups.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalGroups}
            hasMore={hasMore}
            onPageChange={goToPage}
          />
        )}
      </div>

      {/* 그룹 생성 모달 */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSubmit={handleCreateGroup}
        loading={creating}
      />
    </div>
  );
}
