# Lifty.co.kr

Next.js 15 + TypeScript + Tailwind CSS + Supabase + Prisma 기반의 웹 애플리케이션

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: JWT + Cookies
- **Email**: Nodemailer (Gmail SMTP)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## 환경 설정

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Prisma Database URL (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.your-project:your-password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.your-project:your-password@aws-0-ap-northeast-1.supabase.com:5432/postgres"

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key

# 이메일 설정 (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. 데이터베이스 설정

#### Prisma 클라이언트 생성

```bash
pnpm db:generate
```

#### 데이터베이스 스키마 적용

```bash
pnpm db:push
```

#### 마이그레이션 (선택사항)

```bash
pnpm db:migrate
```

#### Prisma Studio 실행 (데이터베이스 GUI)

```bash
pnpm db:studio
```

## 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3001](http://localhost:3001)을 열어 확인하세요.

## 주요 기능

### 인증 시스템

- ✅ 회원가입 (이메일 인증 포함)
- ✅ 로그인/로그아웃
- ✅ JWT 기반 인증
- ✅ 회원탈퇴 (계정 비활성화)

### 이메일 인증

- ✅ 이메일 인증 코드 전송
- ✅ 인증 코드 검증
- ✅ 하이브리드 저장 (메모리 + 데이터베이스)

### 보안

- ✅ 비밀번호 해시화 (bcrypt)
- ✅ JWT 토큰 검증
- ✅ Edge Runtime 호환 (jose 라이브러리)
- ✅ RLS (Row Level Security)

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── login/             # 로그인 페이지
│   ├── signup/            # 회원가입 페이지
│   └── page.tsx           # 홈페이지
├── components/            # React 컴포넌트
├── hooks/                 # Custom React Hooks
├── lib/                   # 라이브러리 설정
│   └── prisma.ts         # Prisma 클라이언트
├── prisma/               # Prisma 설정
│   ├── schema.prisma     # 데이터베이스 스키마
│   └── migrations/       # 마이그레이션 파일
├── types/                # TypeScript 타입 정의
├── utils/                # 유틸리티 함수
│   ├── auth.ts          # 인증 관련 함수
│   ├── email.ts         # 이메일 관련 함수
│   ├── jwt.ts           # JWT 관련 함수
│   └── supabase/        # Supabase 설정
├── .github/              # GitHub Actions
│   └── workflows/        # CI/CD 워크플로우
├── middleware.ts         # Next.js 미들웨어
├── CI.md                 # CI/CD 가이드
└── DEPLOYMENT.md         # 배포 가이드
```

## 데이터베이스 스키마

### Users 테이블

- `id`: 고유 식별자 (CUID)
- `email`: 이메일 주소 (고유)
- `phone`: 전화번호 (선택사항)
- `password`: 해시화된 비밀번호
- `emailVerified`: 이메일 인증 여부
- `disabled`: 계정 비활성화 여부
- `disabledAt`: 비활성화 시간
- `createdAt`: 생성 시간
- `updatedAt`: 수정 시간

### EmailVerificationCodes 테이블

- `id`: 고유 식별자 (CUID)
- `email`: 이메일 주소 (고유)
- `code`: 인증 코드 (6자리)
- `expiresAt`: 만료 시간
- `createdAt`: 생성 시간

## API 엔드포인트

### 인증 관련

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `DELETE /api/auth/delete-account` - 회원탈퇴
- `GET /api/auth/me` - 현재 사용자 정보

### 이메일 인증

- `POST /api/auth/send-verification` - 인증 코드 전송
- `POST /api/auth/verify-code` - 인증 코드 확인

### 관리자 (선택사항)

- `POST /api/auth/restore-account` - 계정 복구

## 개발 명령어

```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버
pnpm start

# 린트
pnpm lint

# 타입 체크
pnpm type-check

# 포맷팅
pnpm format

# 테스트
pnpm test

# Prisma 관련
pnpm db:generate    # Prisma 클라이언트 생성
pnpm db:push        # 스키마 적용
pnpm db:migrate     # 마이그레이션
pnpm db:studio      # Prisma Studio
pnpm db:reset       # 데이터베이스 리셋
```

## CI/CD 파이프라인

이 프로젝트는 GitHub Actions를 사용한 자동화된 CI/CD 파이프라인을 구축했습니다.

### CI (Continuous Integration)

**트리거 조건:**

- `main` 브랜치에 푸시
- 모든 브랜치에서 Pull Request 생성

**실행 단계:**

1. 코드 체크아웃 및 환경 설정
2. 의존성 설치 (`pnpm install --frozen-lockfile`)
3. 코드 품질 검사 (ESLint, Stylelint, Prettier)
4. 타입 검사 (TypeScript)
5. 테스트 실행 (Jest)
6. 빌드 테스트 (Next.js)
7. Prisma 스키마 검사

### Database Migration

**PostgreSQL 서비스:**

- PostgreSQL 15 컨테이너 실행
- 자동 마이그레이션 배포
- 스키마 검증 및 테스트

### 자세한 내용

- [CI/CD 가이드](./CI.md) - 파이프라인 상세 설명
- [배포 가이드](./DEPLOYMENT.md) - Vercel 배포 가이드

## 배포

### Vercel 자동 배포

1. **GitHub 연동**

   - Vercel에서 GitHub 저장소 연결
   - 자동 배포 활성화

2. **환경 변수 설정**

   - Vercel 대시보드에서 환경 변수 설정
   - 프로덕션/프리뷰 환경 분리

3. **배포 프로세스**
   - `main` 브랜치 푸시 → 자동 배포
   - Pull Request → 프리뷰 배포
   - CI 통과 후 배포 진행

### 배포 상태

- **Production**: [https://lifty.co.kr](https://lifty.co.kr) (예정)
- **Preview**: Pull Request 시 자동 생성

## 문제 해결

### 일반적인 문제들

1. **환경 변수 문제**

   ```bash
   # .env.local 파일 확인
   cat .env.local

   # 환경 변수 로드 확인
   pnpm dev
   ```

2. **데이터베이스 연결 문제**

   ```bash
   # Prisma 연결 테스트
   pnpm prisma db push

   # 마이그레이션 상태 확인
   pnpm prisma migrate status
   ```

3. **CI/CD 실패**
   - GitHub Actions 로그 확인
   - 로컬에서 동일한 명령어 실행
   - [CI.md](./CI.md) 참조

### 지원

- **문서**: [CI.md](./CI.md), [DEPLOYMENT.md](./DEPLOYMENT.md)
- **이슈**: GitHub Issues 사용
- **커뮤니티**: 프로젝트 토론 탭

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
