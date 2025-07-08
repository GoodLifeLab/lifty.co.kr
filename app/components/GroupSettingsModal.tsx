"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, CogIcon } from "@heroicons/react/24/outline";
import { Group } from "@prisma/client";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; isPublic: boolean }) => Promise<void>;
  loading?: boolean;
  group: Group | null;
}

export default function GroupSettingsModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  group,
}: GroupSettingsModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 그룹 정보로 폼 초기화
  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
      setIsPublic(group.isPublic || false);
      setErrors({});
    }
  }, [group]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "그룹 이름은 필수입니다.";
    } else if (name.trim().length > 100) {
      newErrors.name = "그룹 이름은 100자 이하여야 합니다.";
    }

    if (description && description.length > 500) {
      newErrors.description = "그룹 설명은 500자 이하여야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        isPublic,
      });
    } catch (error) {
      console.error("그룹 설정 업데이트 오류:", error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // 폼을 원래 값으로 초기화
      if (group) {
        setName(group.name || "");
        setDescription(group.description || "");
        setIsPublic(group.isPublic || false);
      }
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" />
            그룹 설정
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 그룹 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              그룹 이름 *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? "border-red-300" : "border-gray-300"
                }`}
              placeholder="그룹 이름을 입력하세요"
              disabled={loading}
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {name.length}/100자
            </p>
          </div>

          {/* 그룹 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              그룹 설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.description ? "border-red-300" : "border-gray-300"
                }`}
              placeholder="그룹에 대한 설명을 입력하세요 (선택사항)"
              disabled={loading}
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/500자
            </p>
          </div>

          {/* 공개/비공개 설정 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-700">공개 그룹</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              공개 그룹은 다른 사용자들이 검색하고 참여할 수 있습니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 