"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";

interface Course {
  id: string;
  name: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  groups: Array<{
    id: number;
    name: string;
  }>;
}

interface Group {
  id: number;
  name: string;
}

export default function CoursesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [groupPage, setGroupPage] = useState(1);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const [groupSearchLoading, setGroupSearchLoading] = useState(false);

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
    goToNextPage,
    goToPrevPage,
    refresh,
  } = usePagination<Course>("/api/courses", { limit: 10 });

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
      const response = await fetch("/api/courses?page=1&limit=1000"); // 전체 데이터 조회
      if (response.ok) {
        const data = await response.json();
        const allCourses = data.courses || [];

        const now = new Date();
        const stats = {
          total: allCourses.length,
          notStarted: allCourses.filter((course: Course) => {
            const start = new Date(course.startDate);
            return now < start;
          }).length,
          inProgress: allCourses.filter((course: Course) => {
            const start = new Date(course.startDate);
            const end = new Date(course.endDate);
            return now >= start && now <= end;
          }).length,
          completed: allCourses.filter((course: Course) => {
            const end = new Date(course.endDate);
            return now > end;
          }).length,
        };

        setTotalStats(stats);
      }
    } catch (error) {
      console.error("통계 조회 실패:", error);
    }
  };

  // 시작일이 변경될 때 종료일 자동 조정
  const handleStartDateChange = (startDate: string) => {
    setFormData((prev) => {
      const newData = { ...prev, startDate };

      // 종료일이 시작일보다 이전이면 종료일을 시작일 다음날로 설정
      if (newData.endDate && newData.endDate <= startDate) {
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        newData.endDate = nextDay.toISOString().split("T")[0];
      }

      return newData;
    });
  };

  // 날짜 기반으로 코스 상태 계산
  const getCourseStatus = (
    startDate: string,
    endDate: string,
  ): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return "NOT_STARTED";
    } else if (now >= start && now <= end) {
      return "IN_PROGRESS";
    } else {
      return "COMPLETED";
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchTotalStats();
  }, []);

  const fetchGroups = async (page = 1, search = "", append = false) => {
    try {
      if (page === 1) {
        setGroupsLoading(true);
      } else {
        setGroupSearchLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/groups?${params}`);
      if (response.ok) {
        const data = await response.json();

        if (append) {
          setGroups((prev) => [...prev, ...data.groups]);
        } else {
          setGroups(data.groups || []);
        }

        setHasMoreGroups(data.pagination?.hasMore || false);
        setGroupPage(page);
      }
    } catch (error) {
      console.error("그룹 목록 조회 실패:", error);
    } finally {
      setGroupsLoading(false);
      setGroupSearchLoading(false);
    }
  };

  const handleGroupSearch = async (searchTerm: string) => {
    setGroupSearchTerm(searchTerm);
    setGroupPage(1);
    await fetchGroups(1, searchTerm, false);
  };

  const loadMoreGroups = async () => {
    if (!hasMoreGroups || groupSearchLoading) return;
    await fetchGroups(groupPage + 1, groupSearchTerm, true);
  };

  const toggleGroupSelection = (group: Group) => {
    const isSelected = selectedGroups.some((g) => g.id === group.id);
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const removeSelectedGroup = (groupId: number) => {
    setSelectedGroups(selectedGroups.filter((g) => g.id !== groupId));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          groupIds: selectedGroups.map((g) => g.id),
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ name: "", startDate: "", endDate: "" });
        setSelectedGroups([]);
        refresh();
      }
    } catch (error) {
      console.error("프로젝트 생성 실패:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      NOT_STARTED: { text: "시작전", color: "bg-gray-100 text-gray-800" },
      IN_PROGRESS: { text: "진행 중", color: "bg-blue-100 text-blue-800" },
      COMPLETED: { text: "완료됨", color: "bg-green-100 text-green-800" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
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
          onClick={() => {
            setShowCreateModal(true);
            setSelectedGroups([]);
            setGroupSearchTerm("");
            setGroupPage(1);
            fetchGroups(1, "", false);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />새 프로젝트 만들기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.total}
              </p>
            </div>
            <div className="text-2xl">
              <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">시작전</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.notStarted}
              </p>
            </div>
            <div className="text-2xl">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">진행 중</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.inProgress}
              </p>
            </div>
            <div className="text-2xl">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">완료됨</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.completed}
              </p>
            </div>
            <div className="text-2xl">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 코스 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="과정명으로 검색..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && executeSearch()}
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button
                  onClick={executeSearch}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      검색 중...
                    </div>
                  ) : (
                    "검색"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">코스 목록을 불러오는 중...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "검색 결과가 없습니다" : "아직 코스가 없습니다"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "다른 검색어를 시도해보세요"
                  : "첫 번째 코스를 만들어보세요!"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center mx-auto"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />새 코스 만들기
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    과정명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시작일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마감일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    참여그룹
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">상세보기</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/dashboard/courses/${course.id}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                          <AcademicCapIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {course.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(course.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(course.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {course.groups.length > 0 ? (
                          course.groups.map((group) => (
                            <span
                              key={group.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {group.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            참여 그룹 없음
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(
                        getCourseStatus(course.startDate, course.endDate),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

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
      </div>

      {/* 코스 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              새 프로젝트 만들기
            </h3>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="프로젝트명을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일 *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  min={formData.startDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  참여 그룹 (선택사항)
                </label>
                {selectedGroups.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">선택된 그룹:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGroups.map((group) => (
                        <span
                          key={group.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800"
                        >
                          {group.name}
                          <button
                            type="button"
                            onClick={() => removeSelectedGroup(group.id)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 검색 입력 */}
                <div className="mb-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={groupSearchTerm}
                      onChange={(e) => handleGroupSearch(e.target.value)}
                      placeholder="그룹명으로 검색..."
                      className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* 그룹 목록 */}
                <div className="h-48 overflow-y-auto border border-gray-300 rounded-md">
                  {groupsLoading ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      그룹 목록을 불러오는 중...
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      {groupSearchTerm
                        ? "검색 결과가 없습니다"
                        : "사용 가능한 그룹이 없습니다"}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 ${
                            selectedGroups.some((g) => g.id === group.id)
                              ? "bg-indigo-50"
                              : ""
                          }`}
                          onClick={() => toggleGroupSelection(group)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {group.name}
                              </p>
                            </div>
                            {selectedGroups.some((g) => g.id === group.id) && (
                              <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* 무한 스크롤 로딩 */}
                      {groupSearchLoading && (
                        <div className="p-3 text-center text-sm text-gray-500">
                          더 불러오는 중...
                        </div>
                      )}

                      {/* 더 보기 버튼 */}
                      {hasMoreGroups && !groupSearchLoading && (
                        <div className="p-3 text-center">
                          <button
                            type="button"
                            onClick={loadMoreGroups}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            더 보기
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
