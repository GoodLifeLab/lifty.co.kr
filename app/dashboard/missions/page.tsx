"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import MissionModal from "@/components/MissionModal";
import MissionTable from "@/components/MissionTable";
import { Mission, CreateMissionData } from "@/types/Mission";
import { missionService } from "@/services/missionService";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";

export default function MissionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [allCourses, setAllCourses] = useState<
    Array<{
      id: string;
      name: string;
      _count: { missions: number; missionsInProgress: number };
    }>
  >([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        const data = await response.json();
        setAllCourses(data.allCourses || []);
      } catch (error) {
        console.error("과정 목록을 불러오는 중 오류:", error);
        setAllCourses([]);
      }
    };

    fetchCourses();
  }, []);

  // 페이지네이션 훅 사용
  const {
    data: missions,
    loading,
    currentPage,
    totalPages,
    totalItems: totalMissions,
    hasMore,
    searchTerm,
    activeFilter,
    setActiveFilter,
    setSearchTerm,
    executeSearch,
    goToPage,
    refresh,
  } = usePagination<Mission>("/api/missions", {
    limit: 10,
    initialFilter: { courseId: "" },
  });

  // 상태 변경 시 자동 검색
  useEffect(() => {
    console.log(activeFilter);
    refresh();
  }, [activeFilter]);

  const handleCreateMission = () => {
    setSelectedMission(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMission(null);
  };

  const handleMissionSave = async (missionData: CreateMissionData) => {
    try {
      if (selectedMission) {
        await missionService.updateMission(selectedMission.id, missionData);
        alert("미션이 수정되었습니다.");
      } else {
        await missionService.createMission(missionData);
        alert("미션이 생성되었습니다.");
      }

      await refresh();
      handleModalClose();
    } catch (error) {
      console.error("미션 저장 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "미션 저장 중 오류가 발생했습니다.",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">미션 관리</h1>
          <p className="text-gray-600">
            과정별 미션을 생성하고 관리할 수 있습니다
          </p>
        </div>
        <button
          onClick={handleCreateMission}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          미션 생성
        </button>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="미션 제목 또는 과정명으로 검색..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    executeSearch();
                  }
                }}
              />
              <button
                onClick={executeSearch}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                검색
              </button>
            </div>
          </div>
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트
            </label>
            <select
              value={activeFilter.courseId}
              onChange={(e) => setActiveFilter({ courseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">전체</option>
              {allCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} (진행중: {course._count.missionsInProgress} /{" "}
                  {course._count.missions})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 미션 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">미션 목록을 불러오는 중...</p>
          </div>
        ) : (
          <MissionTable
            missions={missions}
            onCreateNew={handleCreateMission}
            showCreateButton={true}
          />
        )}

        {/* 페이지네이션 */}
        {missions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalMissions}
            hasMore={hasMore}
            onPageChange={goToPage}
            itemsPerPage={10}
          />
        )}
      </div>

      <MissionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleMissionSave}
        mission={selectedMission}
      />
    </div>
  );
}
