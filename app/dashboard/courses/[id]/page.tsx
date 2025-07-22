"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
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
    image?: string | null;
  }>;
}

interface Group {
  id: number;
  name: string;
  image?: string | null;
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  useEffect(() => {
    fetchCourse();
    fetchGroups();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        setFormData({
          name: data.name,
          startDate: data.startDate.split("T")[0],
          endDate: data.endDate.split("T")[0],
        });
        setSelectedGroups(data.groups || []);
      } else {
        router.push("/dashboard/courses");
      }
    } catch (error) {
      console.error("코스 조회 실패:", error);
      router.push("/dashboard/courses");
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

  const handleStartDateChange = (startDate: string) => {
    setFormData((prev) => {
      const newData = { ...prev, startDate };

      if (newData.endDate && newData.endDate <= startDate) {
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        newData.endDate = nextDay.toISOString().split("T")[0];
      }

      return newData;
    });
  };

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

  const handleGroupSearch = async (searchTerm: string) => {
    setGroupSearchTerm(searchTerm);
    setGroupPage(1);
    await fetchGroups(1, searchTerm, false);
  };

  const loadMoreGroups = async () => {
    if (!hasMoreGroups || groupSearchLoading) return;
    await fetchGroups(groupPage + 1, groupSearchTerm, true);
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          groupIds: selectedGroups.map((g) => g.id),
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchCourse();
      }
    } catch (error) {
      console.error("코스 수정 실패:", error);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/courses");
      }
    } catch (error) {
      console.error("코스 삭제 실패:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">코스를 찾을 수 없습니다.</p>
        <Link
          href="/dashboard/courses"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
        >
          코스 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/courses"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-gray-600">코스 상세 정보</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            수정
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            삭제
          </button>
        </div>
      </div>

      {/* 코스 정보 카드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">코스 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일
            </label>
            <div className="flex items-center text-sm text-gray-900">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {new Date(course.startDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일
            </label>
            <div className="flex items-center text-sm text-gray-900">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {new Date(course.endDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              참여 그룹
            </label>
            <div className="flex items-center text-sm text-gray-900">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              {course.groups.length}개 그룹
            </div>
          </div>
        </div>
      </div>

      {/* 참여 그룹 목록 */}
      {course.groups.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">참여 그룹</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.groups.map((group) => (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  {group.image ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                      <img
                        src={group.image}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <UserGroupIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {group.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              코스 수정
            </h3>

            <form onSubmit={handleEditCourse} className="space-y-4">
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
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-800 transition-colors"
                >
                  수정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              코스 삭제
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              정말로 이 코스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCourse}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
