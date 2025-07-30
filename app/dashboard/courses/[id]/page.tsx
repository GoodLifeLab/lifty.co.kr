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
    image?: string | null;
    memberships: Array<{
      user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
      };
    }>;
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

  // 미션 관련 상태
  const [missions, setMissions] = useState<any[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [missionsPage, setMissionsPage] = useState(1);
  const [missionsTotalPages, setMissionsTotalPages] = useState(1);
  const [missionsTotal, setMissionsTotal] = useState(0);
  const [missionsSearch, setMissionsSearch] = useState("");

  useEffect(() => {
    fetchCourse();
    fetchGroups();
    fetchMissions();
  }, [id]);

  // 미션 목록 로드
  const fetchMissions = async (page: number = 1, search: string = "") => {
    try {
      setMissionsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(`/api/courses/${id}/missions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMissions(data.missions);
        setMissionsPage(data.pagination.page);
        setMissionsTotalPages(data.pagination.totalPages);
        setMissionsTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("미션 목록 로드 오류:", error);
    } finally {
      setMissionsLoading(false);
    }
  };

  // 미션 검색
  const handleMissionSearch = () => {
    fetchMissions(1, missionsSearch);
  };

  // 미션 페이지 변경
  const handleMissionPageChange = (page: number) => {
    fetchMissions(page, missionsSearch);
  };

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
      console.error("프로젝트 조회 실패:", error);
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
      console.error("프로젝트 수정 실패:", error);
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
      console.error("프로젝트 삭제 실패:", error);
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
        <p className="text-gray-600">프로젝트를 찾을 수 없습니다.</p>
        <Link
          href="/dashboard/courses"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
        >
          프로젝트 목록으로 돌아가기
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
            <p className="text-gray-600">프로젝트 상세 정보</p>
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

      {/* 프로젝트 정보 카드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          프로젝트 정보
        </h2>
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
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
              >
                <div className="flex items-center mb-3">
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

                {/* 코치 정보 */}
                {group.memberships.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      지정된 코치
                    </p>
                    <div className="space-y-1">
                      {group.memberships.map((membership) => (
                        <div
                          key={membership.user.id}
                          className="flex items-center"
                        >
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-xs text-green-600 font-medium">
                              {membership.user.name
                                ? membership.user.name.charAt(0).toUpperCase()
                                : membership.user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-900 truncate">
                              {membership.user.name || membership.user.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 미션 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">미션 목록</h3>
            <p className="text-sm text-gray-600">
              프로젝트의 모든 미션을 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={missionsSearch}
                  onChange={(e) => setMissionsSearch(e.target.value)}
                  placeholder="미션제목으로 검색..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleMissionSearch();
                    }
                  }}
                />
                <button
                  onClick={handleMissionSearch}
                  disabled={missionsLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  검색
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 미션 테이블 */}
        {missionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">미션 목록을 불러오는 중...</p>
          </div>
        ) : missions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    미션제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수행 일자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    공개 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    응답자 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수행률
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {missions.map((mission) => (
                  <tr key={mission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {mission.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(mission.dueDate).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mission.isPublic ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          공개
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          비공개
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mission.totalParticipants}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${mission.totalParticipants > 0 ? (mission.completedCount / mission.totalParticipants) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {mission.totalParticipants > 0
                            ? Math.round(
                                (mission.completedCount /
                                  mission.totalParticipants) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">등록된 미션이 없습니다.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {missionsTotalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={missionsPage}
              totalPages={missionsTotalPages}
              totalItems={missionsTotal}
              hasMore={false}
              onPageChange={handleMissionPageChange}
            />
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              프로젝트 수정
            </h3>

            <form onSubmit={handleEditCourse} className="space-y-4">
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
              프로젝트 삭제
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
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
