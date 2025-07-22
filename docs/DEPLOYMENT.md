# Vercel 배포 가이드

## 개요

이 프로젝트는 Vercel을 사용하여 자동 배포를 구성했습니다. GitHub Actions CI/CD 파이프라인과 연동하여 코드 품질 검사를 통과한 후 자동으로 배포됩니다.

## 배포 아키텍처

```
GitHub Repository
    ↓ (Push to main)
GitHub Actions CI/CD
    ↓ (CI Pass)
Vercel Auto Deploy
    ↓
Production Environment
```

## Vercel 설정

### 1. 프로젝트 연결

1. **Vercel 대시보드 접속**

   - [vercel.com](https://vercel.com) 로그인
   - GitHub 계정 연동

2. **프로젝트 가져오기**

   - "New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정 확인

3. **프레임워크 설정**
   - Framework Preset: `Next.js`
   - Root Directory: `./` (기본값)
   - Build Command: `pnpm build`
   - Output Directory: `.next` (기본값)

### 2. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

#### 필수 환경 변수

```bash
# 데이터베이스 연결
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database

# NextAuth 설정
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# 이메일 서비스 (Resend)
RESEND_API_KEY=your-resend-api-key

# Supabase 설정 (선택사항)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### 환경별 설정

**Production 환경:**

- 모든 환경 변수 설정
- 실제 프로덕션 데이터베이스 URL

**Preview 환경:**

- 테스트용 데이터베이스 URL
- 개발용 API 키

### 3. 빌드 설정

#### Build Command

```bash
pnpm build
```

#### Install Command

```bash
pnpm install --frozen-lockfile
```

#### Output Directory

```
.next
```

## 자동 배포 설정

### 1. GitHub 연동

1. **Vercel GitHub 앱 설치**

   - Vercel 대시보드 → Settings → Git
   - GitHub 저장소 연결

2. **자동 배포 활성화**
   - Production Branch: `main`
   - Preview Branches: `develop`, `feature/*`

### 2. 배포 트리거

**Production 배포:**

- `main` 브랜치에 푸시
- GitHub Actions CI 통과 후

**Preview 배포:**

- 다른 브랜치에 푸시
- Pull Request 생성 시

## 데이터베이스 설정

### 1. Supabase 프로덕션 설정

1. **Supabase 프로젝트 생성**

   - [supabase.com](https://supabase.com) 접속
   - 새 프로젝트 생성

2. **데이터베이스 설정**

   ```sql
   -- 프로덕션 데이터베이스 생성
   CREATE DATABASE lifty_production;
   ```

3. **연결 정보 확인**
   - Settings → Database
   - Connection string 복사

### 2. Prisma 마이그레이션

**로컬에서 마이그레이션 생성:**

```bash
# 스키마 변경 후
pnpm prisma migrate dev --name migration_name
```

**프로덕션 마이그레이션:**

```bash
# Vercel 배포 시 자동 실행
pnpm prisma migrate deploy
```

## 배포 프로세스

### 1. 개발 워크플로우

```bash
# 1. 로컬 개발
git checkout -b feature/new-feature
# 코드 작성 및 테스트

# 2. 커밋 및 푸시
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 3. Pull Request 생성
# GitHub에서 PR 생성

# 4. CI/CD 실행
# GitHub Actions 자동 실행
# - 코드 품질 검사
# - 테스트 실행
# - 빌드 테스트

# 5. Preview 배포
# Vercel 자동 Preview 배포

# 6. 코드 리뷰 및 승인
# PR 승인 후 main 브랜치로 머지

# 7. Production 배포
# Vercel 자동 Production 배포
```

### 2. 배포 단계

1. **Pre-build 단계**

   ```bash
   pnpm prisma generate
   ```

2. **Build 단계**

   ```bash
   pnpm build
   ```

3. **Post-build 단계**
   ```bash
   pnpm prisma migrate deploy
   ```

## 모니터링 및 로그

### 1. Vercel 대시보드

**배포 상태 확인:**

- Deployments 탭에서 배포 이력
- 실시간 배포 로그
- 성능 메트릭

**함수 로그:**

- Functions 탭에서 API 로그
- 에러 추적
- 응답 시간 모니터링

### 2. 외부 모니터링

**추천 도구:**

- **Sentry**: 에러 추적
- **Vercel Analytics**: 웹사이트 분석
- **Uptime Robot**: 가동률 모니터링

## 성능 최적화

### 1. 이미지 최적화

```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ["your-image-domain.com"],
    formats: ["image/webp", "image/avif"],
  },
};
```

### 2. 번들 최적화

```typescript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};
```

### 3. 캐싱 전략

```typescript
// API 라우트에서 캐싱
export async function GET() {
  const data = await fetchData();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```

## 보안 설정

### 1. 환경 변수 보안

- **민감한 정보**: 환경 변수로 관리
- **API 키**: Vercel 환경 변수에 저장
- **데이터베이스 URL**: 암호화된 연결 문자열

### 2. CORS 설정

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://your-domain.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE",
          },
        ],
      },
    ];
  },
};
```

### 3. CSP (Content Security Policy)

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

## 문제 해결

### 1. 일반적인 배포 문제

**빌드 실패:**

```bash
# 로컬에서 빌드 테스트
pnpm build

# 의존성 문제 확인
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**환경 변수 문제:**

- Vercel 대시보드에서 환경 변수 확인
- 대소문자 구분 확인
- 필수 변수 누락 확인

**데이터베이스 연결 문제:**

```bash
# 연결 테스트
pnpm prisma db push

# 마이그레이션 상태 확인
pnpm prisma migrate status
```

### 2. 성능 문제

**빌드 시간 최적화:**

- 불필요한 의존성 제거
- 이미지 최적화
- 번들 분석 도구 사용

**런타임 성능:**

- 데이터베이스 쿼리 최적화
- 캐싱 전략 적용
- CDN 활용

### 3. 디버깅 도구

**Vercel CLI:**

```bash
# 설치
npm i -g vercel

# 로컬 개발
vercel dev

# 배포
vercel --prod
```

**로그 확인:**

```bash
# 실시간 로그
vercel logs

# 특정 배포 로그
vercel logs --url https://your-deployment.vercel.app
```

## 롤백 전략

### 1. 자동 롤백

Vercel은 자동으로 이전 배포로 롤백합니다:

- 빌드 실패 시
- 런타임 에러 발생 시

### 2. 수동 롤백

1. **Vercel 대시보드**

   - Deployments 탭
   - 이전 배포 선택
   - "Promote to Production" 클릭

2. **CLI를 통한 롤백**
   ```bash
   vercel rollback
   ```

## 비용 최적화

### 1. Vercel 요금제

**Hobby (무료):**

- 월 100GB 대역폭
- 월 100GB 스토리지
- 월 100GB 함수 실행 시간

**Pro ($20/월):**

- 월 1TB 대역폭
- 월 1TB 스토리지
- 월 1TB 함수 실행 시간

### 2. 최적화 팁

- **이미지 최적화**: WebP/AVIF 포맷 사용
- **번들 크기**: 불필요한 의존성 제거
- **캐싱**: 적절한 캐싱 전략 적용
- **CDN**: Vercel Edge Network 활용

## 백업 전략

### 1. 코드 백업

- **GitHub**: 모든 코드 버전 관리
- **브랜치 보호**: main 브랜치 보호 규칙

### 2. 데이터 백업

- **Supabase**: 자동 백업 기능
- **수동 백업**: 정기적인 데이터베이스 덤프

```bash
# 데이터베이스 백업
pg_dump $DATABASE_URL > backup.sql

# 복원
psql $DATABASE_URL < backup.sql
```

## 결론

이 가이드를 따라하면 안정적이고 확장 가능한 배포 환경을 구축할 수 있습니다. 정기적으로 모니터링하고 성능을 최적화하여 최고의 사용자 경험을 제공하세요.
