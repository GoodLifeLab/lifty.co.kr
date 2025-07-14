# Lifty.co.kr 기능 구현 문서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [구현된 기능](#구현된-기능)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [API 엔드포인트](#api-엔드포인트)
6. [보안 기능](#보안-기능)
7. [CI/CD 파이프라인](#cicd-파이프라인)
8. [배포 시스템](#배포-시스템)

---

## 🎯 프로젝트 개요

**Lifty.co.kr**은 Next.js 15와 최신 기술 스택을 활용한 현대적인 웹 애플리케이션입니다. 사용자 인증, 그룹 관리, 파일 업로드, 그리고 자동화된 CI/CD 파이프라인을 포함한 완전한 웹 서비스를 제공합니다.

### 주요 특징

- ✅ 완전한 사용자 인증 시스템 (회원가입, 로그인, 로그아웃)
- ✅ 이메일 인증 시스템 (6자리 코드)
- ✅ 비밀번호 재설정 기능
- ✅ 그룹 생성 및 관리 시스템
- ✅ 파일 업로드 시스템 (AWS S3)
- ✅ JWT 기반 보안 인증
- ✅ 자동화된 CI/CD 파이프라인
- ✅ 데이터베이스 마이그레이션 자동화
- ✅ 코드 품질 검사 자동화

---

## 🛠️ 기술 스택

### Frontend

- **Next.js 15**: React 기반 풀스택 프레임워크
- **React 19**: 최신 React 버전
- **TypeScript**: 정적 타입 검사
- **Tailwind CSS 4**: 유틸리티 기반 CSS 프레임워크
- **Heroicons**: 아이콘 라이브러리

### Backend

- **Next.js API Routes**: 서버리스 API
- **Prisma**: TypeScript ORM
- **Supabase**: PostgreSQL 데이터베이스
- **JWT**: JSON Web Token 인증

### 인증 및 보안

- **bcryptjs**: 비밀번호 해시화
- **jose**: JWT 토큰 처리 (Edge Runtime 호환)
- **jsonwebtoken**: JWT 토큰 생성/검증

### 파일 업로드

- **AWS S3**: 클라우드 스토리지
- **@aws-sdk/client-s3**: AWS S3 클라이언트
- **@aws-sdk/s3-request-presigner**: Presigned URL 생성

### 이메일

- **Nodemailer**: 이메일 전송
- **Gmail SMTP**: 이메일 서비스

### 개발 도구

- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅
- **Stylelint**: CSS 스타일 검사
- **Jest**: 테스트 프레임워크
- **Testing Library**: React 컴포넌트 테스트

### 배포 및 CI/CD

- **Vercel**: 클라우드 배포 플랫폼
- **GitHub Actions**: 자동화된 CI/CD
- **pnpm**: 빠른 패키지 관리자

---

## 🚀 구현된 기능

### 1. 사용자 인증 시스템

#### 회원가입 (`/signup`)

- **기능**: 이메일, 전화번호, 비밀번호로 회원가입
- **검증**: 이메일 중복 확인, 비밀번호 강도 검증
- **보안**: 비밀번호 bcrypt 해시화
- **이메일 인증**: 회원가입 후 이메일 인증 코드 전송

#### 로그인 (`/login`)

- **기능**: 이메일/비밀번호 로그인
- **보안**: JWT 토큰 기반 인증
- **세션 관리**: HTTP-only 쿠키로 토큰 저장
- **마지막 로그인 시간**: 자동 기록

#### 로그아웃 (`/logout`)

- **기능**: 세션 종료
- **보안**: 쿠키 삭제 및 토큰 무효화

#### 회원탈퇴 (`/api/auth/delete-account`)

- **기능**: 계정 비활성화 (소프트 삭제)
- **데이터 보존**: 사용자 데이터 보존
- **복구 가능**: 관리자 권한으로 계정 복구 가능

### 2. 이메일 인증 시스템

#### 인증 코드 전송 (`/api/auth/send-verification`)

- **기능**: 6자리 랜덤 코드 생성 및 전송
- **저장 방식**: 하이브리드 저장 (메모리 + 데이터베이스)
- **만료 시간**: 10분 후 자동 만료
- **재전송 제한**: 스팸 방지를 위한 제한

#### 인증 코드 확인 (`/api/auth/verify-code`)

- **기능**: 입력된 코드 검증
- **보안**: 만료 시간 확인
- **상태 업데이트**: 이메일 인증 완료 표시

### 3. 비밀번호 재설정 시스템

#### 비밀번호 재설정 요청 (`/forgot-password`)

- **기능**: 이메일로 재설정 링크 전송
- **보안**: 고유한 토큰 생성
- **만료 시간**: 1시간 후 만료

#### 비밀번호 재설정 (`/reset-password`)

- **기능**: 새 비밀번호 설정
- **토큰 검증**: 유효한 토큰 확인
- **보안**: 새 비밀번호 해시화

### 4. 그룹 관리 시스템

#### 그룹 생성 및 관리

- **기능**: 그룹 생성, 수정, 삭제
- **멤버 관리**: 그룹 멤버 추가/제거
- **권한 관리**: 관리자/일반 멤버 역할 구분
- **공개/비공개**: 그룹 공개 설정

#### 그룹 멤버십

- **시작일/종료일**: 멤버십 기간 관리
- **역할 관리**: MEMBER, ADMIN 역할
- **복합 유니크**: 사용자-그룹 중복 방지

### 5. 파일 업로드 시스템

#### AWS S3 기반 업로드

- **Presigned URL**: 안전한 직접 업로드
- **다중 파일**: 여러 파일 동시 업로드
- **드래그 앤 드롭**: 사용자 친화적 인터페이스
- **미리보기**: 이미지 파일 미리보기

#### 파일 검증

- **크기 제한**: 파일 크기 검증
- **타입 제한**: 허용된 파일 타입만 업로드
- **보안**: 악성 파일 방지

---

## 🗄️ 데이터베이스 스키마

### Users 테이블

```sql
- id: String (CUID) - 고유 식별자
- email: String (고유) - 이메일 주소
- phone: String? - 전화번호 (선택사항)
- password: String - 해시화된 비밀번호
- emailVerified: Boolean - 이메일 인증 여부
- disabled: Boolean - 계정 비활성화 여부
- disabledAt: DateTime? - 비활성화 시간
- createdAt: DateTime - 생성 시간
- updatedAt: DateTime - 수정 시간
- lastLoginAt: DateTime? - 마지막 로그인 시간
- name: String? - 사용자 이름
- position: String? - 직책
- profileImage: String? - 프로필 이미지 URL
```

### EmailVerificationCodes 테이블

```sql
- id: String (CUID) - 고유 식별자
- email: String (고유) - 이메일 주소
- code: String - 6자리 인증 코드
- expiresAt: DateTime - 만료 시간
- createdAt: DateTime - 생성 시간
```

### PasswordResetTokens 테이블

```sql
- id: String (CUID) - 고유 식별자
- email: String (고유) - 이메일 주소
- token: String (고유) - 재설정 토큰
- expiresAt: DateTime - 만료 시간
- createdAt: DateTime - 생성 시간
```

### Groups 테이블

```sql
- id: Int (Auto) - 고유 식별자
- name: String - 그룹 이름
- description: String? - 그룹 설명
- image: String? - 그룹 이미지 URL
- createdAt: DateTime - 생성 시간
- isPublic: Boolean - 공개 여부
```

### GroupMembers 테이블

```sql
- id: Int (Auto) - 고유 식별자
- userId: String - 사용자 ID
- groupId: Int - 그룹 ID
- startDate: DateTime - 멤버십 시작일
- endDate: DateTime? - 멤버십 종료일
- role: GroupMemberRole - 멤버 역할 (MEMBER/ADMIN)
- createdAt: DateTime - 생성 시간
- updatedAt: DateTime - 수정 시간
```

---

## 🔌 API 엔드포인트

### 인증 관련 API

#### 회원가입

- **POST** `/api/auth/signup`
- **기능**: 새 사용자 등록
- **요청**: `{ email, phone, password }`
- **응답**: `{ success: boolean, message: string }`

#### 로그인

- **POST** `/api/auth/login`
- **기능**: 사용자 인증
- **요청**: `{ email, password }`
- **응답**: `{ success: boolean, user: User, token: string }`

#### 로그아웃

- **POST** `/api/auth/logout`
- **기능**: 세션 종료
- **응답**: `{ success: boolean, message: string }`

#### 현재 사용자 정보

- **GET** `/api/auth/me`
- **기능**: 인증된 사용자 정보 조회
- **응답**: `{ user: User }`

#### 회원탈퇴

- **DELETE** `/api/auth/delete-account`
- **기능**: 계정 비활성화
- **응답**: `{ success: boolean, message: string }`

### 이메일 인증 API

#### 인증 코드 전송

- **POST** `/api/auth/send-verification`
- **기능**: 이메일 인증 코드 전송
- **요청**: `{ email }`
- **응답**: `{ success: boolean, message: string }`

#### 인증 코드 확인

- **POST** `/api/auth/verify-code`
- **기능**: 인증 코드 검증
- **요청**: `{ email, code }`
- **응답**: `{ success: boolean, message: string }`

### 비밀번호 재설정 API

#### 비밀번호 재설정 요청

- **POST** `/api/auth/forgot-password`
- **기능**: 재설정 이메일 전송
- **요청**: `{ email }`
- **응답**: `{ success: boolean, message: string }`

#### 재설정 토큰 검증

- **POST** `/api/auth/validate-reset-token`
- **기능**: 토큰 유효성 확인
- **요청**: `{ token }`
- **응답**: `{ valid: boolean }`

#### 비밀번호 재설정

- **POST** `/api/auth/reset-password`
- **기능**: 새 비밀번호 설정
- **요청**: `{ token, password }`
- **응답**: `{ success: boolean, message: string }`

### 관리자 API

#### 계정 복구

- **POST** `/api/auth/restore-account`
- **기능**: 비활성화된 계정 복구
- **요청**: `{ email }`
- **응답**: `{ success: boolean, message: string }`

### 파일 업로드 API

#### Presigned URL 생성

- **POST** `/api/upload/presigned-url`
- **기능**: AWS S3 업로드 URL 생성
- **요청**: `{ fileName, fileType }`
- **응답**: `{ url: string, fields: object }`

### 사용자 관리 API

#### 사용자 목록

- **GET** `/api/users`
- **기능**: 사용자 목록 조회
- **응답**: `{ users: User[] }`

#### 사용자 상세

- **GET** `/api/users/[id]`
- **기능**: 특정 사용자 정보 조회
- **응답**: `{ user: User }`

### 그룹 관리 API

#### 그룹 목록

- **GET** `/api/groups`
- **기능**: 그룹 목록 조회
- **응답**: `{ groups: Group[] }`

#### 그룹 생성

- **POST** `/api/groups`
- **기능**: 새 그룹 생성
- **요청**: `{ name, description, isPublic }`
- **응답**: `{ group: Group }`

---

## 🛡️ 보안 기능

### JWT 토큰 기반 인증

#### 토큰 구조

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_id",
    "email": "user@example.com",
    "iat": 1516239022,
    "exp": 1516242622
  }
}
```

#### 보안 특징

- **Edge Runtime 호환**: jose 라이브러리 사용
- **HTTP-only 쿠키**: XSS 공격 방지
- **토큰 만료**: 적절한 만료 시간 설정
- **서명 검증**: HMAC SHA256 서명

### 비밀번호 보안

#### 해시화

- **알고리즘**: bcrypt
- **Salt Rounds**: 12
- **비용**: 적절한 해시 비용

#### 정책

- **최소 길이**: 8자 이상
- **복잡성**: 영문, 숫자, 특수문자 조합
- **검증**: 클라이언트/서버 양쪽 검증

### 세션 관리

#### 쿠키 설정

```javascript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24시간
}
```

#### 미들웨어

- **인증 확인**: 보호된 라우트 접근 제어
- **토큰 검증**: JWT 토큰 유효성 검사
- **리다이렉트**: 인증되지 않은 사용자 처리

---

## 🔄 CI/CD 파이프라인

### GitHub Actions 워크플로우

#### CI Job (Continuous Integration)

**트리거 조건**

- `main` 브랜치에 푸시
- 모든 브랜치에서 Pull Request 생성

**실행 단계**

1. **코드 체크아웃**: GitHub 저장소 클론
2. **Node.js 설정**: Node.js 18 + pnpm 설정
3. **의존성 설치**: `pnpm install --frozen-lockfile`
4. **코드 품질 검사**:
   - ESLint: JavaScript/TypeScript 린팅
   - Stylelint: CSS/SCSS 스타일 검사
   - Prettier: 코드 포맷팅 검사
5. **타입 검사**: TypeScript 컴파일 검사
6. **테스트 실행**: Jest 단위 테스트
7. **빌드 테스트**: Next.js 프로덕션 빌드
8. **Prisma 스키마 검사**: 데이터베이스 스키마 검증

#### Database Migration Job

**의존성**: CI Job 완료 후 실행
**실행 단계**

1. **PostgreSQL 실행**: PostgreSQL 15 컨테이너 실행
2. **Prisma 클라이언트 생성**: `prisma generate`
3. **마이그레이션 배포**: `prisma migrate deploy`
4. **스키마 검증**: 데이터베이스 스키마 확인
5. **연결 테스트**: 데이터베이스 연결 상태 확인

### 캐싱 전략

#### npm 캐시

- **자동 활성화**: Node.js 설정에서 자동 캐싱
- **캐시 키**: lockfile 기반 캐시 키
- **캐시 복원**: 이전 빌드에서 캐시 복원

#### pnpm 스토어 캐시

- **스토어 캐싱**: pnpm 스토어 캐시 활용
- **lockfile 기반**: pnpm-lock.yaml 기반 캐시 키
- **의존성 재사용**: 이전 빌드의 의존성 재사용

---

## 🚀 배포 시스템

### Vercel 자동 배포

#### GitHub 연동

- **저장소 연결**: Vercel에서 GitHub 저장소 연결
- **자동 배포**: 코드 푸시 시 자동 배포
- **환경 분리**: 프로덕션/프리뷰 환경 분리

#### 배포 트리거

- **Production**: `main` 브랜치 푸시 시 자동 배포
- **Preview**: Pull Request 생성 시 프리뷰 배포
- **수동 배포**: Vercel 대시보드에서 수동 배포

### 환경 설정

#### 프로덕션 환경

- **도메인**: lifty.co.kr (예정)
- **환경 변수**: 프로덕션 전용 설정
- **성능 최적화**: 프로덕션 빌드 최적화

#### 프리뷰 환경

- **임시 도메인**: Vercel에서 자동 생성
- **환경 변수**: 프리뷰 전용 설정
- **테스트 환경**: 개발자 테스트용

#### 개발 환경

- **로컬 서버**: `pnpm dev` 명령어
- **포트**: 3001번 포트
- **핫 리로드**: 코드 변경 시 자동 새로고침

### 배포 프로세스

#### 자동화된 배포

1. **코드 푸시**: GitHub에 코드 푸시
2. **CI 실행**: GitHub Actions CI 파이프라인 실행
3. **검증 통과**: 코드 품질, 테스트, 빌드 검증
4. **자동 배포**: Vercel에서 자동 배포 실행
5. **배포 완료**: 새로운 버전 서비스 시작

#### 롤백 기능

- **이전 버전**: Vercel 대시보드에서 이전 버전으로 롤백
- **즉시 롤백**: 문제 발생 시 즉시 이전 버전으로 복구
- **배포 히스토리**: 모든 배포 기록 관리

---

## 📚 참고 자료

### 프로젝트 문서

- **[README.md](./README.md)**: 프로젝트 개요 및 설정 가이드
- **[CI.md](./CI.md)**: CI/CD 파이프라인 상세 설명
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Vercel 배포 가이드
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)**: 프로젝트 요약

### 기술 문서

- **[Next.js 15 문서](https://nextjs.org/docs)**: Next.js 공식 문서
- **[Prisma 문서](https://www.prisma.io/docs)**: Prisma ORM 문서
- **[Supabase 문서](https://supabase.com/docs)**: Supabase 문서
- **[Tailwind CSS 문서](https://tailwindcss.com/docs)**: Tailwind CSS 문서

---

## 🎯 향후 계획

### 단기 목표 (1-3개월)

- [ ] **소셜 로그인**: Google, GitHub OAuth 연동
- [ ] **사용자 프로필**: 프로필 이미지, 개인정보 관리
- [ ] **관리자 대시보드**: 사용자 관리, 통계 대시보드
- [ ] **알림 시스템**: 실시간 알림 및 이메일 알림

### 중기 목표 (3-6개월)

- [ ] **실시간 채팅**: WebSocket 기반 채팅 시스템
- [ ] **파일 공유**: 그룹 내 파일 공유 기능
- [ ] **다국어 지원**: i18n 국제화
- [ ] **PWA**: Progressive Web App 기능

### 장기 목표 (6개월 이상)

- [ ] **마이크로서비스**: 서비스 분리 및 확장
- [ ] **결제 시스템**: 구독 및 결제 기능
- [ ] **모바일 앱**: React Native 앱 개발
- [ ] **API 문서**: Swagger/OpenAPI 문서화

---

**Lifty.co.kr**은 현대적인 웹 개발 기술을 활용하여 안전하고 확장 가능한 웹 서비스를 제공합니다. 지속적인 개선과 사용자 피드백을 통해 더 나은 서비스로 발전해 나갈 것입니다.

---

_마지막 업데이트: 2024년 12월_
