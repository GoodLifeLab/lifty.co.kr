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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchCourses();
    fetchGroups();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("코스 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

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
        fetchCourses();
      }
    } catch (error) {
      console.error("코스 생성 실패:", error);
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
          <h1 className="text-2xl font-bold text-gray-900">코스 관리</h1>
          <p className="text-gray-600">
            교육 코스를 생성하고 관리할 수 있습니다
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
          <PlusIcon className="h-4 w-4 mr-2" />새 코스 만들기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 코스</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : courses.length}
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
                {loading
                  ? "..."
                  : courses.filter(
                    (c) =>
                      getCourseStatus(c.startDate, c.endDate) ===
                      "NOT_STARTED",
                  ).length}
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
                {loading
                  ? "..."
                  : courses.filter(
                    (c) =>
                      getCourseStatus(c.startDate, c.endDate) ===
                      "IN_PROGRESS",
                  ).length}
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
                {loading
                  ? "..."
                  : courses.filter(
                    (c) =>
                      getCourseStatus(c.startDate, c.endDate) === "COMPLETED",
                  ).length}
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
          <h3 className="text-lg font-medium text-gray-900">내 코스</h3>
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
                아직 코스가 없습니다
              </h3>
              <p className="text-gray-600 mb-4">첫 번째 코스를 만들어보세요!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center mx-auto"
              >
                <PlusIcon className="h-4 w-4 mr-2" />새 코스 만들기
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    코스명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시작일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    종료일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    할당된 그룹
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
                      {getStatusBadge(
                        getCourseStatus(course.startDate, course.endDate),
                      )}
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
                      <div className="flex items-center text-sm text-gray-900">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {course.groups.length}개 그룹
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 코스 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              새 코스 만들기
            </h3>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  코스명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="코스명을 입력하세요"
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
                          className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedGroups.some((g) => g.id === group.id)
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
