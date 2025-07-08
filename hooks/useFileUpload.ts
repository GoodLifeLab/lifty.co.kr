import { useState, useCallback } from "react";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseFileUploadOptions {
  maxSize?: number; // MB 단위
  allowedTypes?: string[];
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<string>;
  uploadMultipleFiles: (files: File[]) => Promise<string[]>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  reset: () => void;
}

export const useFileUpload = (
  options: UseFileUploadOptions = {},
): UseFileUploadReturn => {
  const {
    maxSize = 10, // 기본 10MB
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    onProgress,
    onSuccess,
    onError,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // 파일 크기 검증
      if (file.size > maxSize * 1024 * 1024) {
        return `파일 크기는 ${maxSize}MB 이하여야 합니다.`;
      }

      // 파일 타입 검증
      if (!allowedTypes.includes(file.type)) {
        return `지원하지 않는 파일 형식입니다. 지원 형식: ${allowedTypes.join(", ")}`;
      }

      return null;
    },
    [maxSize, allowedTypes],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      try {
        setIsUploading(true);
        setError(null);
        setProgress({ loaded: 0, total: file.size, percentage: 0 });

        // 파일 검증
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        // 파일 크기가 0인지 확인
        if (file.size === 0) {
          throw new Error("빈 파일은 업로드할 수 없습니다.");
        }

        // 1. Presigned URL 요청
        const presignedResponse = await fetch("/api/upload/presigned-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json();
          throw new Error(
            errorData.error || "Presigned URL 생성에 실패했습니다.",
          );
        }

        const presignedData = await presignedResponse.json();
        const { presignedUrl, s3Url } = presignedData;

        // Presigned URL 파라미터 분석
        try {
          const url = new URL(presignedUrl);
          console.log("Presigned URL 분석:", {
            hostname: url.hostname,
            pathname: url.pathname,
            searchParams: Object.fromEntries(url.searchParams.entries()),
          });
        } catch (e) {
          console.log("URL 파싱 실패:", e);
        }

        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(
            `S3 업로드에 실패했습니다. 상태: ${uploadResponse.status}, 응답: ${errorText}`,
          );
        }

        // 성공 콜백 호출
        onSuccess?.(s3Url);

        return s3Url;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "파일 업로드 중 오류가 발생했습니다.";
        console.error("파일 업로드 오류:", err);
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
        setProgress(null);
      }
    },
    [validateFile, onSuccess, onError],
  );

  const uploadMultipleFiles = useCallback(
    async (files: File[]): Promise<string[]> => {
      try {
        setIsUploading(true);
        setError(null);

        const uploadPromises = files.map((file) => uploadFile(file));
        const urls = await Promise.all(uploadPromises);

        return urls;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "파일 업로드 중 오류가 발생했습니다.";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile, onError],
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    progress,
    error,
    reset,
  };
};
