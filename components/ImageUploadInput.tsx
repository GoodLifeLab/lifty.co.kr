"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  PhotoIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useFileUpload } from "@/hooks/useFileUpload";

interface ImageUploadInputProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // MB 단위
  allowedTypes?: string[];
  multiple?: boolean;
  aspectRatio?: number; // 가로:세로 비율 (예: 16/9)
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  hideAfterUpload?: boolean; // 업로드 완료 후 입력 필드 숨김
  folder?: string; // S3 폴더 경로
  uploadedImages?: string[]; // 업로드된 이미지 URL 배열
  onImageDelete?: (url: string) => void; // 이미지 삭제 콜백
}

export default function ImageUploadInput({
  onUploadComplete,
  onUploadError,
  maxSize = 5, // 이미지는 기본 5MB
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  multiple = false,
  aspectRatio,
  className = "",
  disabled = false,
  placeholder = "이미지를 선택하거나 여기에 드래그하세요",
  maxFiles = 5,
  hideAfterUpload = false,
  folder = "uploads",
  uploadedImages = [],
  onImageDelete,
}: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false); // 업로드 완료 상태

  const { uploadFile, isUploading, error, reset } = useFileUpload({
    maxSize,
    allowedTypes,
    folder,
    onSuccess: (url) => {
      onUploadComplete(url);
      setIsUploaded(true);
    },
    onError: (error) => {
      onUploadError?.(error);
    },
  });

  const handleImageSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // 최대 파일 수 제한
      if (multiple && fileArray.length > maxFiles) {
        onUploadError?.(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`);
        return;
      }

      // 이미지 업로드
      try {
        for (const file of fileArray) {
          await uploadFile(file);
        }
      } catch (error) {
        console.error("이미지 업로드 오류:", error);
      }
    },
    [multiple, maxFiles, uploadFile, onUploadError],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleImageSelect(files);
    },
    [disabled, handleImageSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleImageSelect(e.target.files);
      // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
      if (e.target) {
        e.target.value = "";
      }
    },
    [handleImageSelect],
  );

  // 업로드된 이미지가 maxFiles보다 적을 때만 입력 필드 표시
  const shouldShowInput = uploadedImages.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 이미지 미리보기 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            업로드된 이미지 ({uploadedImages.length}/{maxFiles})
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {uploadedImages.map((imageUrl, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={`업로드된 이미지 ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 truncate">
                    이미지 {index + 1}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new URL(imageUrl).pathname.split("/").pop()}
                  </p>
                </div>
                {onImageDelete && (
                  <button
                    type="button"
                    onClick={() => onImageDelete(imageUrl)}
                    className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="이미지 삭제"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 드래그 앤 드롭 영역 - maxFiles보다 적을 때만 표시 */}
      {shouldShowInput && (!hideAfterUpload || !isUploaded) && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple={multiple}
            accept={allowedTypes.join(",")}
            onChange={handleInputChange}
            disabled={disabled}
          />

          <PhotoIcon className="mx-auto size-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">{placeholder}</p>
          <p className="mt-1 text-xs text-gray-500">
            최대 {maxSize}MB, 지원 형식: {allowedTypes.join(", ")}
          </p>
          {aspectRatio && (
            <p className="mt-1 text-xs text-gray-500">
              권장 비율: {aspectRatio}:1
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {uploadedImages.length}/{maxFiles}개 업로드됨
          </p>

          {error && (
            <div className="mt-2 flex items-center justify-center text-red-600 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* 업로드 중 상태 표시 */}
      {isUploading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center text-sm text-indigo-600">
            <ArrowUpTrayIcon className="h-4 w-4 mr-2 animate-bounce" />
            이미지 업로드 중...
          </div>
        </div>
      )}
    </div>
  );
}
