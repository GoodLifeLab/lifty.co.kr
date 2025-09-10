"use client";

import { useState, useEffect } from "react";
import { PlusIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";
import { calculateCourseStats } from "@/utils/courseUtils";
import SearchInput from "@/components/SearchInput";
import StatsCard from "@/components/StatsCard";
import CourseModal from "@/components/CourseModal";
import CourseTable from "@/components/CourseTable";
import { CourseService } from "@/services/courseService";
import { CourseWithGroups } from "@/types/Group";

export default function CoursesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 페이지네이션 훅 사용
  const {
    data: courses,
    loading,
    currentPage,
    totalPages,
    totalItems: totalCourses,
    hasMore,
    searchTerm,
    setSearchTerm,
    executeSearch,
    goToPage,
    refresh,
  } = usePagination<CourseWithGroups>("/api/courses", { limit: 10 });

  // 전체 통계를 위한 상태
  const [totalStats, setTotalStats] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
  });

  // 전체 통계 조회
  const fetchTotalStats = async () => {
    try {
      const allCourses = await CourseService.getAllCourses();
      const stats = calculateCourseStats(allCourses);
      setTotalStats(stats);
    } catch (error) {
      console.error("통계 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchTotalStats();
  }, []);

  const handleCreateCourse = async (data: {
    name: string;
    startDate: string;
    endDate: string;
    groupIds: number[];
  }) => {
    try {
      await CourseService.createCourse(data);
      setShowCreateModal(false);
      refresh();
      fetchTotalStats(); // 통계도 새로고침
    } catch (error) {
      console.error("프로젝트 생성 실패:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로젝트 관리</h1>
          <p className="text-gray-600">
            프로젝트를 생성하고 관리할 수 있습니다
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />새 프로젝트 만들기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="총 프로젝트"
          value={totalStats.total}
          icon={<AcademicCapIcon className="h-8 w-8 text-indigo-600" />}
        />
        <StatsCard
          title="시작전"
          value={totalStats.notStarted}
          icon={
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
          }
        />
        <StatsCard
          title="진행 중"
          value={totalStats.inProgress}
          icon={
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            </div>
          }
        />
        <StatsCard
          title="완료됨"
          value={totalStats.completed}
          icon={
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          }
        />
      </div>

      {/* 프로젝트 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={executeSearch}
                placeholder="과정명으로 검색..."
                loading={loading}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <CourseTable
            courses={courses}
            loading={loading}
            onCreateNew={() => setShowCreateModal(true)}
            showCreateButton={true}
          />
        </div>

        {/* 페이지네이션 */}
        {courses.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCourses}
            hasMore={hasMore}
            onPageChange={goToPage}
            itemsPerPage={10}
          />
        )}
      </div>

      {/* 프로젝트 생성 모달 */}
      <CourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCourse}
        loading={false}
      />
    </div>
  );
}
