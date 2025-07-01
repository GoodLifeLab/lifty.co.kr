# Lifty.co.kr

Next.js 15 + TypeScript + Tailwind CSS + Supabase + Prisma 기반의 웹 애플리케이션

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: JWT + Cookies
- **Email**: Nodemailer (Gmail SMTP)
- **Deployment**: Vercel (예정)

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
└── middleware.ts         # Next.js 미들웨어
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

## 배포

### Vercel 배포 (권장)

1. GitHub 저장소 연결
2. 환경변수 설정
3. 자동 배포

### 환경변수 (프로덕션)

- `DATABASE_URL`: Supabase PostgreSQL 연결 문자열
- `JWT_SECRET`: 안전한 JWT 시크릿 키
- `EMAIL_USER`: 이메일 계정
- `EMAIL_PASS`: 이메일 앱 비밀번호

## 라이센스

MIT License
