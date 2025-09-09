"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, CogIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Group } from "@prisma/client";
import ImageUploadInput from "@/components/ImageUploadInput";
import Image from "next/image";
import { useFileUpload } from "@/hooks/useFileUpload";
interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    isPublic: boolean;
    image?: string;
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
  deleting?: boolean;
  group: Group | null;
}

export default function GroupSettingsModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  loading = false,
  deleting = false,
  group,
}: GroupSettingsModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const { deleteFile } = useFileUpload();

  // 그룹 정보로 폼 초기화
  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
      // setImage(group.image || "");
      setUploadedImages(group.image ? [group.image] : []);
      setIsPublic(group.isPublic || false);
      setStartDate(
        (group as any).startDate
          ? new Date((group as any).startDate).toISOString().split("T")[0]
          : "",
      );
      setEndDate(
        (group as any).endDate
          ? new Date((group as any).endDate).toISOString().split("T")[0]
          : "",
      );
      setErrors({});
      setDeleteConfirmText("");
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
        // image: image || undefined,
        isPublic,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error("그룹 설정 업데이트 오류:", error);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    // "delete group" 확인
    if (deleteConfirmText.trim() !== "delete group") {
      alert('정확히 "delete group"을 입력해주세요.');
      return;
    }

    try {
      await onDelete();
    } catch (error) {
      console.error("그룹 삭제 오류:", error);
    }
  };

  const handleClose = () => {
    if (!loading && !deleting) {
      // 폼을 원래 값으로 초기화
      if (group) {
        setName(group.name || "");
        setDescription(group.description || "");
        // setImage(group.image || "");
        setUploadedImages(group.image ? [group.image] : []);
        setIsPublic(group.isPublic || false);
        setStartDate(
          (group as any).startDate
            ? new Date((group as any).startDate).toISOString().split("T")[0]
            : "",
        );
        setEndDate(
          (group as any).endDate
            ? new Date((group as any).endDate).toISOString().split("T")[0]
            : "",
        );
      }
      setErrors({});
      setDeleteConfirmText("");
      onClose();
    }
  };

  const handleImageUpload = (url: string) => {
    setImage(url);
    setUploadedImages([url]); // maxFiles가 1이므로 항상 하나만 저장
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      await deleteFile(imageUrl);
      setUploadedImages([]);
      setImage("");
    } catch (error) {
      console.error("이미지 삭제 실패:", error);
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  const handleImageError = (error: string) => {
    alert(`이미지 업로드 오류: ${error}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" />
            그룹 설정
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading || deleting}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 그룹 이름 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              그룹 이름 *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="그룹 이름을 입력하세요"
              disabled={loading || deleting}
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{name.length}/100자</p>
          </div>

          {/* 그룹 설명 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              그룹 설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="그룹에 대한 설명을 입력하세요 (선택사항)"
              disabled={loading || deleting}
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/500자
            </p>
          </div>

          {/* 시작일/종료일 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                시작일 *
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading || deleting}
                required
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                종료일 *
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading || deleting}
                required
              />
            </div>
          </div>

          {/* 그룹 이미지 업로드 */}
          {/* <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              그룹 이미지 (선택사항)
            </label>
            <ImageUploadInput
              onUploadComplete={handleImageUpload}
              onImageDelete={handleImageDelete}
              onUploadError={handleImageError}
              uploadedImages={uploadedImages}
              maxSize={1}
              multiple={false}
              aspectRatio={1}
              placeholder="그룹 이미지를 업로드하세요"
              disabled={loading || deleting}
              folder="groups"
              maxFiles={1}
            />
            <p className="mt-1 text-xs text-gray-500">
              현재 이미지가 설정되어 있으면 새 이미지로 교체됩니다.
            </p>
          </div> */}

          {/* 공개/비공개 설정 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={loading || deleting}
              />
              <span className="ml-2 text-sm text-gray-700">공개 그룹</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              공개 그룹은 다른 사용자들이 검색하고 참여할 수 있습니다.
            </p>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              위험 영역
            </div>

            {/* 그룹 삭제 */}
            {onDelete && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <TrashIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      그룹 삭제
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        그룹을 영구적으로 삭제합니다. 모든 멤버와 데이터가
                        제거됩니다.
                      </p>
                      <div className="mt-3">
                        <label
                          htmlFor="deleteConfirm"
                          className="block text-sm font-medium text-red-800 mb-1"
                        >
                          확인을 위해{" "}
                          <code className="bg-red-100 px-1 rounded">
                            delete group
                          </code>
                          을 입력하세요:
                        </label>
                        <input
                          type="text"
                          id="deleteConfirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="delete group"
                          disabled={deleting}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={
                          loading ||
                          deleting ||
                          deleteConfirmText.trim() !== "delete group"
                        }
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            삭제 중...
                          </>
                        ) : (
                          "그룹 삭제"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 저장/취소 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading || deleting}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || deleting}
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
