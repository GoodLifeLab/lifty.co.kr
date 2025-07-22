import { useState, useEffect } from "react";
import { useGroupSelection } from "@/hooks/useGroupSelection";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Course {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  groups: Array<{
    id: number;
    name: string;
  }>;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; startDate: string; endDate: string; groupIds: number[] }) => void;
  initialData?: Course | null;
  loading?: boolean;
}

export default function CourseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: CourseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const {
    groups,
    selectedGroups,
    groupsLoading,
    groupSearchLoading,
    groupSearchTerm,
    hasMoreGroups,
    setSelectedGroups,
    setGroupSearchTerm,
    toggleGroupSelection,
    removeSelectedGroup,
    handleGroupSearch,
    loadMoreGroups,
  } = useGroupSelection();

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        startDate: initialData.startDate.split("T")[0],
        endDate: initialData.endDate.split("T")[0],
      });
      setSelectedGroups(initialData.groups);
    } else {
      setFormData({ name: "", startDate: "", endDate: "" });
      setSelectedGroups([]);
    }
  }, [initialData, setSelectedGroups]);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedGroups([]);
      setGroupSearchTerm("");
    }
  }, [isOpen, setSelectedGroups, setGroupSearchTerm]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      groupIds: selectedGroups.map((g) => g.id),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {initialData ? "프로젝트 수정" : "새 프로젝트 만들기"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  {groupSearchTerm ? "검색 결과가 없습니다" : "사용 가능한 그룹이 없습니다"}
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
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "처리 중..." : initialData ? "수정" : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 