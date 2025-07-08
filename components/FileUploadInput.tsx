"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadInputProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // MB 단위
  allowedTypes?: string[];
  multiple?: boolean;
  accept?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  maxFiles?: number;
}

interface FilePreview {
  file: File;
  url: string;
  uploading: boolean;
  error?: string;
}

export default function FileUploadInput({
  onUploadComplete,
  onUploadError,
  maxSize = 10,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  multiple = false,
  accept,
  className = "",
  disabled = false,
  placeholder = "파일을 선택하거나 여기에 드래그하세요",
  showPreview = true,
  maxFiles = 5,
}: FileUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);

  const { uploadFile, isUploading, error, reset } = useFileUpload({
    maxSize,
    allowedTypes,
    onSuccess: (url) => {
      onUploadComplete(url);
    },
    onError: (error) => {
      onUploadError?.(error);
    },
  });

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // 최대 파일 수 제한
      if (multiple && fileArray.length + previews.length > maxFiles) {
        onUploadError?.(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        return;
      }

      // 단일 파일인 경우 기존 파일 제거
      if (!multiple) {
        setPreviews([]);
      }

      // 파일 미리보기 생성
      const newPreviews: FilePreview[] = fileArray.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        uploading: false,
      }));

      setPreviews((prev) =>
        multiple ? [...prev, ...newPreviews] : newPreviews,
      );

      // 파일 업로드
      try {
        for (const preview of newPreviews) {
          preview.uploading = true;
          setPreviews((prev) => [...prev]); // 상태 업데이트를 위한 강제 리렌더

          try {
            await uploadFile(preview.file);
            preview.uploading = false;
            setPreviews((prev) => [...prev]); // 상태 업데이트
          } catch (error) {
            preview.uploading = false;
            preview.error =
              error instanceof Error ? error.message : "업로드 실패";
            setPreviews((prev) => [...prev]); // 상태 업데이트
          }
        }
      } catch (error) {
        console.error("파일 업로드 오류:", error);
      }
    },
    [multiple, maxFiles, previews.length, uploadFile, onUploadError],
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
      handleFileSelect(files);
    },
    [disabled, handleFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
      if (e.target) {
        e.target.value = "";
      }
    },
    [handleFileSelect],
  );

  const removeFile = useCallback((index: number) => {
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      return newPreviews;
    });
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
          accept={accept || allowedTypes.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
        />

        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">{placeholder}</p>
        <p className="mt-1 text-xs text-gray-500">
          최대 {maxSize}MB, 지원 형식: {allowedTypes.join(", ")}
        </p>

        {error && (
          <div className="mt-2 flex items-center justify-center text-red-600 text-sm">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>

      {/* 파일 미리보기 */}
      {showPreview && previews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">업로드된 파일</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {preview.file.type.startsWith("image/") ? (
                    <img
                      src={preview.url}
                      alt={preview.file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(preview.file)
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {preview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(preview.file.size)}
                    </p>
                    {preview.uploading && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-indigo-600 h-1 rounded-full animate-pulse"
                            style={{ width: "50%" }}
                          ></div>
                        </div>
                        <p className="text-xs text-indigo-600 mt-1">
                          업로드 중...
                        </p>
                      </div>
                    )}
                    {preview.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {preview.error}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={preview.uploading}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 상태 표시 */}
      {isUploading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center text-sm text-indigo-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            파일 업로드 중...
          </div>
        </div>
      )}
    </div>
  );
}
