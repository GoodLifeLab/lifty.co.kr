# 파일 업로드 훅 및 컴포넌트 사용법 (Presigned URL 방식)

## 개요

이 프로젝트에서는 AWS S3 Presigned URL을 사용한 안전하고 효율적인 파일 업로드 시스템을 제공합니다.

## 아키텍처

1. **Presigned URL 요청**: 클라이언트가 서버에 Presigned URL을 요청
2. **S3 직접 업로드**: 클라이언트가 Presigned URL을 사용하여 S3에 직접 업로드
3. **보안**: 서버를 거치지 않고 직접 S3에 업로드하여 서버 부하 감소

## 컴포넌트

### 1. FileUploadInput

일반적인 파일 업로드를 위한 컴포넌트입니다.

```tsx
import FileUploadInput from "@/components/FileUploadInput";

function MyComponent() {
  const handleUploadComplete = (url: string) => {
    console.log("업로드된 파일 URL:", url);
  };

  const handleUploadError = (error: string) => {
    console.error("업로드 오류:", error);
  };

  return (
    <FileUploadInput
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      maxSize={10} // 10MB
      allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
      multiple={true}
      maxFiles={5}
      placeholder="파일을 선택하거나 여기에 드래그하세요"
      showPreview={true}
    />
  );
}
```

### 2. ImageUploadInput

이미지 전용 업로드 컴포넌트입니다.

```tsx
import ImageUploadInput from "@/components/ImageUploadInput";

function MyComponent() {
  const handleImageUpload = (url: string) => {
    console.log("업로드된 이미지 URL:", url);
  };

  return (
    <ImageUploadInput
      onUploadComplete={handleImageUpload}
      onUploadError={(error) => alert(error)}
      maxSize={5} // 5MB
      multiple={false}
      aspectRatio={16 / 9} // 16:9 비율 권장
      previewSize="md"
      placeholder="이미지를 업로드하세요"
    />
  );
}
```

## 훅

### useFileUpload

파일 업로드 로직을 직접 사용할 수 있는 훅입니다.

```tsx
import { useFileUpload } from "@/hooks/useFileUpload";

function MyComponent() {
  const {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    progress,
    error,
    reset,
  } = useFileUpload({
    maxSize: 10,
    allowedTypes: ["image/jpeg", "image/png"],
    onSuccess: (url) => {
      console.log("업로드 성공:", url);
    },
    onError: (error) => {
      console.error("업로드 실패:", error);
    },
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const url = await uploadFile(files[0]);
        console.log("단일 파일 업로드 완료:", url);
      } catch (error) {
        console.error("업로드 오류:", error);
      }
    }
  };

  const handleMultipleFiles = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const urls = await uploadMultipleFiles(Array.from(files));
        console.log("다중 파일 업로드 완료:", urls);
      } catch (error) {
        console.error("업로드 오류:", error);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      <input type="file" multiple onChange={handleMultipleFiles} />

      {isUploading && (
        <div>
          업로드 중... {progress && `${Math.round(progress.percentage)}%`}
        </div>
      )}

      {error && <div style={{ color: "red" }}>{error}</div>}

      <button onClick={reset}>초기화</button>
    </div>
  );
}
```

## Props

### FileUploadInput Props

| Prop               | Type                      | Default                                                  | Description                  |
| ------------------ | ------------------------- | -------------------------------------------------------- | ---------------------------- |
| `onUploadComplete` | `(url: string) => void`   | -                                                        | 업로드 완료 시 호출되는 콜백 |
| `onUploadError`    | `(error: string) => void` | -                                                        | 업로드 오류 시 호출되는 콜백 |
| `maxSize`          | `number`                  | `10`                                                     | 최대 파일 크기 (MB)          |
| `allowedTypes`     | `string[]`                | `['image/jpeg', 'image/png', 'image/gif', 'image/webp']` | 허용된 파일 타입             |
| `multiple`         | `boolean`                 | `false`                                                  | 다중 파일 선택 허용          |
| `accept`           | `string`                  | -                                                        | HTML input accept 속성       |
| `className`        | `string`                  | `''`                                                     | 추가 CSS 클래스              |
| `disabled`         | `boolean`                 | `false`                                                  | 비활성화 상태                |
| `placeholder`      | `string`                  | `'파일을 선택하거나 여기에 드래그하세요'`                | 플레이스홀더 텍스트          |
| `showPreview`      | `boolean`                 | `true`                                                   | 파일 미리보기 표시 여부      |
| `maxFiles`         | `number`                  | `5`                                                      | 최대 파일 수                 |

### ImageUploadInput Props

| Prop               | Type                      | Default                                                  | Description                  |
| ------------------ | ------------------------- | -------------------------------------------------------- | ---------------------------- |
| `onUploadComplete` | `(url: string) => void`   | -                                                        | 업로드 완료 시 호출되는 콜백 |
| `onUploadError`    | `(error: string) => void` | -                                                        | 업로드 오류 시 호출되는 콜백 |
| `maxSize`          | `number`                  | `5`                                                      | 최대 파일 크기 (MB)          |
| `allowedTypes`     | `string[]`                | `['image/jpeg', 'image/png', 'image/gif', 'image/webp']` | 허용된 이미지 타입           |
| `multiple`         | `boolean`                 | `false`                                                  | 다중 이미지 선택 허용        |
| `aspectRatio`      | `number`                  | -                                                        | 권장 가로:세로 비율          |
| `className`        | `string`                  | `''`                                                     | 추가 CSS 클래스              |
| `disabled`         | `boolean`                 | `false`                                                  | 비활성화 상태                |
| `placeholder`      | `string`                  | `'이미지를 선택하거나 여기에 드래그하세요'`              | 플레이스홀더 텍스트          |
| `showPreview`      | `boolean`                 | `true`                                                   | 이미지 미리보기 표시 여부    |
| `maxFiles`         | `number`                  | `5`                                                      | 최대 이미지 수               |
| `previewSize`      | `'sm' \| 'md' \| 'lg'`    | `'md'`                                                   | 미리보기 크기                |

## API 엔드포인트

### POST /api/upload/presigned-url

Presigned URL을 생성하는 API 엔드포인트입니다.

**요청:**

```json
{
  "fileName": "example.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1024000
}
```

**응답:**

```json
{
  "presignedUrl": "https://your-s3-bucket.s3.amazonaws.com/uploads/1234567890_abc123.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "s3Url": "https://your-s3-bucket.s3.amazonaws.com/uploads/1234567890_abc123.jpg",
  "s3Key": "uploads/1234567890_abc123.jpg",
  "expiresIn": 3600
}
```

## AWS S3 설정

실제 AWS S3 Presigned URL을 사용하려면 다음 환경 변수를 설정해야 합니다:

```env
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=your_bucket_name
```

그리고 AWS SDK를 설치해야 합니다:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 업로드 프로세스

1. **파일 선택**: 사용자가 파일을 선택하거나 드래그 앤 드롭
2. **파일 검증**: 클라이언트에서 파일 크기와 타입 검증
3. **Presigned URL 요청**: 서버에 Presigned URL 생성 요청
4. **S3 업로드**: Presigned URL을 사용하여 S3에 직접 업로드
5. **완료**: 업로드된 파일의 공개 URL 반환

## 장점

1. **보안**: 서버를 거치지 않고 직접 S3에 업로드
2. **성능**: 서버 부하 감소, 업로드 속도 향상
3. **확장성**: 대용량 파일 업로드에 적합
4. **비용 효율성**: 서버 대역폭 사용량 감소

## 주의사항

1. **파일 크기 제한**: 기본적으로 10MB로 제한되어 있습니다.
2. **파일 타입 검증**: 서버와 클라이언트 모두에서 파일 타입을 검증합니다.
3. **Presigned URL 만료**: Presigned URL은 1시간 후 만료됩니다.
4. **에러 처리**: 업로드 실패 시 적절한 에러 메시지를 표시합니다.
5. **미리보기**: 이미지 파일의 경우 업로드 전 미리보기를 제공합니다.
6. **CORS 설정**: S3 버킷에 적절한 CORS 설정이 필요합니다.

## S3 CORS 설정

S3 버킷에 다음 CORS 설정을 추가해야 합니다:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```
