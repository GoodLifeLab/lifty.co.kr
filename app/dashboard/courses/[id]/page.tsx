"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserGroupIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import MissionTable from "@/components/course/MissionTable";
import CourseModal from "@/components/course/CourseModal";

interface Course {
  id: string;
  name: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  missionCount: number;
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
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
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);

  // 태그 관리 상태 (통합)
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("");
  const [isProcessingTag, setIsProcessingTag] = useState(false);
  const [isDeletingTag, setIsDeletingTag] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    color: string | null;
  } | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
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

  const handleCourseSubmit = async (data: {
    name: string;
    startDate: string;
    endDate: string;
    missionCount: number;
    groupIds: number[];
  }) => {
    try {
      setIsUpdatingCourse(true);
      const response = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
        }),
      });

      if (response.ok) {
        setShowCourseModal(false);
        fetchCourse();
      }
    } catch (error) {
      console.error("프로젝트 수정 실패:", error);
    } finally {
      setIsUpdatingCourse(false);
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

  // 태그 관리 함수들 (통합)
  const openTagModal = (tag?: {
    id: string;
    name: string;
    color: string | null;
  }) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
      setTagColor(tag.color || "");
    } else {
      setEditingTag(null);
      setTagName("");
      setTagColor("");
    }
    setShowTagModal(true);
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setIsProcessingTag(true);
    try {
      const isEditing = !!editingTag;
      const url = isEditing
        ? `/api/courses/${id}/tags/${editingTag.id}`
        : `/api/courses/${id}/tags`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tagName.trim(),
          color: tagColor || null,
        }),
      });

      if (response.ok) {
        setTagName("");
        setTagColor("");
        setEditingTag(null);
        setShowTagModal(false);
        fetchCourse(); // 코스 정보 다시 로드
      } else {
        const error = await response.json();
        alert(
          error.error || `태그 ${isEditing ? "수정" : "생성"}에 실패했습니다.`,
        );
      }
    } catch (error) {
      console.error(`태그 ${editingTag ? "수정" : "생성"} 실패:`, error);
      alert(`태그 ${editingTag ? "수정" : "생성"}에 실패했습니다.`);
    } finally {
      setIsProcessingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("정말로 이 태그를 삭제하시겠습니까?")) return;

    setIsDeletingTag(tagId);
    try {
      const response = await fetch(`/api/courses/${id}/tags/${tagId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCourse(); // 코스 정보 다시 로드
      } else {
        const error = await response.json();
        alert(error.error || "태그 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("태그 삭제 실패:", error);
      alert("태그 삭제에 실패했습니다.");
    } finally {
      setIsDeletingTag(null);
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
            onClick={() => setShowCourseModal(true)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예상 미션 개수
            </label>
            <div className="flex items-center text-sm text-gray-900">
              <FlagIcon className="h-4 w-4 mr-1" />
              {course.missionCount || 0}개 미션
            </div>
          </div>
        </div>

        {/* 태그 섹션 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">태그</h3>
            <button
              onClick={() => openTagModal()}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + 태그 추가
            </button>
          </div>

          {course.tags && course.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <div
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium group gap-1 cursor-pointer"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : "#f3f4f6",
                    color: tag.color || "#374151",
                    border: `1px solid ${tag.color || "#d1d5db"}`,
                  }}
                  onClick={() => openTagModal(tag)}
                  title="태그 수정"
                >
                  <span>{tag.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTag(tag.id);
                    }}
                    disabled={isDeletingTag === tag.id}
                    className="hover:text-red-600 disabled:opacity-50 transition-opacity"
                    title="태그 삭제"
                  >
                    {isDeletingTag === tag.id ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "×"
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">등록된 태그가 없습니다.</p>
          )}
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
      <MissionTable
        id={id}
        course={course ? { id: course.id, name: course.name } : undefined}
      />

      {/* 코스 관리 모달 */}
      <CourseModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        onSubmit={handleCourseSubmit}
        initialData={
          course
            ? {
                id: course.id,
                name: course.name,
                startDate: course.startDate,
                endDate: course.endDate,
                missionCount: course.missionCount,
                groups: course.groups.map((g) => ({ id: g.id, name: g.name })),
              }
            : null
        }
        loading={isUpdatingCourse}
      />

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

      {/* 태그 관리 모달 (통합) */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTag ? "태그 수정" : "새 태그 추가"}
            </h3>

            <form onSubmit={handleTagSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  태그 이름 *
                </label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="태그 이름을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  태그 색상
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTagModal(false);
                    setEditingTag(null);
                    setTagName("");
                    setTagColor("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isProcessingTag || !tagName.trim()}
                  className="flex-1 bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessingTag
                    ? editingTag
                      ? "수정 중..."
                      : "생성 중..."
                    : editingTag
                      ? "수정"
                      : "생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
