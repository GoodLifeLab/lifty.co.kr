# CI/CD 파이프라인 가이드

## 개요

이 프로젝트는 GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 구축했습니다.

## 워크플로우 구조

### 1. CI (Continuous Integration) Job

**트리거 조건:**

- `main` 브랜치에 푸시
- 모든 브랜치에서 Pull Request 생성

**실행 단계:**

1. **코드 체크아웃**

   - GitHub 저장소에서 코드 다운로드

2. **Node.js 설정**

   - Node.js 18 버전 설치
   - npm 캐싱 활성화

3. **pnpm 설정**

   - pnpm 8 버전 설치
   - pnpm 스토어 캐싱

4. **의존성 설치**

   - `pnpm install --frozen-lockfile`
   - lockfile 기반 정확한 버전 설치

5. **코드 품질 검사**

   - **Lint**: ESLint로 코드 스타일 검사
   - **Stylelint**: CSS/SCSS 스타일 검사
   - **Format Check**: Prettier 포맷 검사
   - **ESLint Fix**: 자동 수정 가능한 문제 해결

6. **타입 검사**

   - TypeScript 컴파일 오류 검사
   - `tsc --noEmit`

7. **테스트 실행**

   - Jest를 사용한 단위 테스트
   - 메모리 제한 설정 (4GB)

8. **빌드 테스트**

   - Next.js 프로덕션 빌드
   - 빌드 오류 검사

9. **Prisma 스키마 검사**
   - Prisma 스키마 포맷 검사

### 2. Database Migration Job

**의존성:** CI Job 완료 후 실행

**PostgreSQL 서비스:**

- PostgreSQL 15 컨테이너 실행
- 포트: 5432
- 데이터베이스: testdb
- 사용자: postgres/postgres

**실행 단계:**

1. **환경 설정**

   - Node.js 18, pnpm 설정
   - 캐싱 활성화

2. **Prisma 클라이언트 생성**

   - `pnpm prisma generate`

3. **마이그레이션 배포**

   - `pnpm prisma migrate deploy`
   - 테스트 데이터베이스에 스키마 적용

4. **마이그레이션 상태 확인**

   - `pnpm prisma migrate status`
   - 마이그레이션 상태 검증

5. **스키마 차이 검사**

   - `pnpm prisma migrate diff`
   - 현재 스키마와 마이그레이션 파일 비교

6. **데이터베이스 연결 테스트**

   - `pnpm prisma db push`
   - 스키마 푸시 테스트

7. **테이블 검증**
   - 데이터베이스 테이블 존재 확인
   - SQL 쿼리 실행 테스트

## 환경 변수

### CI Job

- `NODE_OPTIONS`: `--max_old_space_size=4096`

### Database Migration Job

- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/testdb`
- `DIRECT_URL`: `postgresql://postgres:postgres@localhost:5432/testdb`

## 캐싱 전략

### npm 캐시

- Node.js 설정에서 자동 활성화
- 의존성 설치 속도 향상

### pnpm 스토어 캐시

- pnpm 스토어 디렉토리 캐싱
- lockfile 기반 캐시 키
- 의존성 재설치 방지

## 실패 시나리오

### CI Job 실패

1. **Lint 오류**: 코드 스타일 문제
2. **Type 오류**: TypeScript 컴파일 오류
3. **테스트 실패**: 단위 테스트 실패
4. **빌드 실패**: Next.js 빌드 오류

### Database Migration Job 실패

1. **PostgreSQL 연결 실패**: 서비스 컨테이너 문제
2. **마이그레이션 실패**: 스키마 변경 오류
3. **스키마 차이**: 마이그레이션 파일과 실제 스키마 불일치

## 로컬에서 테스트

### CI 단계 로컬 테스트

```bash
# 의존성 설치
pnpm install

# Lint 검사
pnpm lint

# 스타일 검사
pnpm stylelint

# 포맷 검사
pnpm check-format

# 타입 검사
pnpm type-check

# 테스트 실행
pnpm test

# 빌드 테스트
pnpm build

# Prisma 스키마 검사
pnpm prisma format --check
```

### Database Migration 로컬 테스트

```bash
# PostgreSQL 실행 (Docker)
docker run --name test-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=testdb \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 \
  -d postgres:15

# 환경 변수 설정
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/testdb"
export DIRECT_URL="postgresql://postgres:postgres@localhost:5432/testdb"

# Prisma 클라이언트 생성
pnpm prisma generate

# 마이그레이션 실행
pnpm prisma migrate deploy

# 스키마 상태 확인
pnpm prisma migrate status

# 데이터베이스 연결 테스트
pnpm prisma db push --accept-data-loss
```

## 문제 해결

### 일반적인 문제들

1. **pnpm 캐시 문제**

   ```bash
   pnpm store prune
   rm -rf node_modules
   pnpm install
   ```

2. **PostgreSQL 연결 문제**

   ```bash
   # 컨테이너 상태 확인
   docker ps

   # 로그 확인
   docker logs test-postgres
   ```

3. **Prisma 마이그레이션 문제**

   ```bash
   # 마이그레이션 리셋
   pnpm prisma migrate reset

   # 스키마 동기화
   pnpm prisma db push
   ```

### GitHub Actions 디버깅

1. **워크플로우 로그 확인**

   - GitHub 저장소 → Actions 탭
   - 실패한 워크플로우 클릭
   - 단계별 로그 확인

2. **로컬에서 재현**

   - 동일한 환경에서 로컬 테스트
   - Docker 컨테이너 사용

3. **캐시 클리어**
   - GitHub Actions 캐시 삭제
   - 워크플로우 재실행
