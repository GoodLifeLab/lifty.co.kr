# Lifty.co.kr 프로젝트 요약

## 프로젝트 개요

**Lifty.co.kr**은 Next.js 15와 최신 기술 스택을 활용한 현대적인 웹 애플리케이션입니다. 사용자 인증, 이메일 인증, 그리고 자동화된 CI/CD 파이프라인을 포함한 완전한 웹 서비스를 제공합니다.

## 🚀 주요 특징

### 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: JWT + Cookies
- **Email**: Nodemailer (Gmail SMTP)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

### 핵심 기능

- ✅ 완전한 사용자 인증 시스템
- ✅ 이메일 인증 (6자리 코드)
- ✅ JWT 기반 보안
- ✅ 자동화된 CI/CD 파이프라인
- ✅ 데이터베이스 마이그레이션 자동화
- ✅ 코드 품질 검사 자동화

## 📁 프로젝트 구조

```
lifty.co.kr/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── auth/          # 인증 관련 API
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
├── README.md             # 프로젝트 설명서
├── CI.md                 # CI/CD 가이드
├── DEPLOYMENT.md         # 배포 가이드
└── PROJECT_SUMMARY.md    # 프로젝트 요약 (이 파일)
```

## 🔐 인증 시스템

### 사용자 관리

- **회원가입**: 이메일, 전화번호, 비밀번호
- **로그인**: 이메일/비밀번호 인증
- **이메일 인증**: 6자리 코드 전송 및 검증
- **회원탈퇴**: 계정 비활성화 (소프트 삭제)

### 보안 기능

- **비밀번호 해시화**: bcrypt 사용
- **JWT 토큰**: 안전한 세션 관리
- **Edge Runtime 호환**: jose 라이브러리
- **Row Level Security**: 데이터베이스 레벨 보안

## 📧 이메일 시스템

### 인증 코드 전송

- **발송**: 6자리 랜덤 코드 생성
- **저장**: 하이브리드 저장 (메모리 + 데이터베이스)
- **만료**: 10분 후 자동 만료
- **재전송**: 제한된 횟수로 재전송 가능

### 이메일 템플릿

- **HTML 포맷**: 반응형 디자인
- **브랜딩**: 프로젝트 로고 및 색상
- **다국어 지원**: 한국어 기본

## 🗄️ 데이터베이스 설계

### Users 테이블

```sql
- id: CUID (고유 식별자)
- email: VARCHAR (고유, 인덱스)
- phone: VARCHAR (선택사항)
- password: VARCHAR (해시화)
- emailVerified: BOOLEAN
- disabled: BOOLEAN
- disabledAt: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### EmailVerificationCodes 테이블

```sql
- id: CUID (고유 식별자)
- email: VARCHAR (고유)
- code: VARCHAR (6자리)
- expiresAt: TIMESTAMP
- createdAt: TIMESTAMP
```

## 🔄 CI/CD 파이프라인

### GitHub Actions 워크플로우

#### 1. CI Job (Continuous Integration)

**트리거**: `main` 브랜치 푸시, Pull Request
**단계**:

1. 코드 체크아웃
2. Node.js 18 + pnpm 설정
3. 의존성 설치 (`--frozen-lockfile`)
4. 코드 품질 검사 (ESLint, Stylelint, Prettier)
5. 타입 검사 (TypeScript)
6. 테스트 실행 (Jest)
7. 빌드 테스트 (Next.js)
8. Prisma 스키마 검사

#### 2. Database Migration Job

**의존성**: CI Job 완료 후
**단계**:

1. PostgreSQL 15 컨테이너 실행
2. Prisma 클라이언트 생성
3. 마이그레이션 배포
4. 스키마 검증
5. 데이터베이스 연결 테스트

### 캐싱 전략

- **npm 캐시**: Node.js 설정에서 자동 활성화
- **pnpm 스토어 캐시**: lockfile 기반 캐시 키

## 🚀 배포 시스템

### Vercel 자동 배포

- **GitHub 연동**: 자동 저장소 연결
- **환경 변수**: 프로덕션/프리뷰 분리
- **배포 트리거**:
  - `main` 브랜치 → Production 배포
  - Pull Request → Preview 배포

### 환경 설정

- **Production**: 실제 서비스 환경
- **Preview**: 테스트 및 검증 환경
- **Development**: 로컬 개발 환경

## 📊 성능 최적화

### 빌드 최적화

- **pnpm**: 빠른 패키지 관리
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Code Splitting**: 동적 import 활용

### 런타임 최적화

- **Next.js Image**: 자동 이미지 최적화
- **Edge Runtime**: 빠른 API 응답
- **캐싱**: 적절한 Cache-Control 헤더

## 🛡️ 보안 고려사항

### 데이터 보호

- **환경 변수**: 민감한 정보 분리
- **HTTPS**: 모든 통신 암호화
- **CORS**: 적절한 도메인 제한

### 인증 보안

- **JWT 만료**: 적절한 토큰 만료 시간
- **비밀번호 정책**: 강력한 비밀번호 요구사항
- **Rate Limiting**: API 요청 제한

## 📈 모니터링 및 로깅

### Vercel 대시보드

- **배포 상태**: 실시간 배포 모니터링
- **함수 로그**: API 에러 추적
- **성능 메트릭**: 응답 시간 분석

### 외부 도구 (추천)

- **Sentry**: 에러 추적 및 알림
- **Vercel Analytics**: 웹사이트 분석
- **Uptime Robot**: 가동률 모니터링

## 🔧 개발 도구

### 코드 품질

- **ESLint**: JavaScript/TypeScript 린팅
- **Stylelint**: CSS/SCSS 스타일 검사
- **Prettier**: 코드 포맷팅
- **TypeScript**: 정적 타입 검사

### 데이터베이스 도구

- **Prisma Studio**: GUI 데이터베이스 관리
- **Prisma CLI**: 마이그레이션 및 스키마 관리

### 테스트 도구

- **Jest**: 단위 테스트
- **Testing Library**: React 컴포넌트 테스트

## 📚 문서화

### 프로젝트 문서

- **[README.md](./README.md)**: 프로젝트 개요 및 설정 가이드
- **[CI.md](./CI.md)**: CI/CD 파이프라인 상세 설명
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Vercel 배포 가이드
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)**: 프로젝트 요약 (이 파일)

### API 문서

- **인증 API**: 회원가입, 로그인, 로그아웃
- **이메일 API**: 인증 코드 전송 및 검증
- **사용자 API**: 프로필 관리, 계정 삭제

## 🎯 향후 계획

### 단기 목표

- [ ] 비밀번호 재설정 기능
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 사용자 프로필 관리
- [ ] 관리자 대시보드

### 중기 목표

- [ ] 실시간 알림 시스템
- [ ] 파일 업로드 기능
- [ ] 다국어 지원
- [ ] PWA (Progressive Web App)

### 장기 목표

- [ ] 마이크로서비스 아키텍처
- [ ] 실시간 채팅 기능
- [ ] 결제 시스템 통합
- [ ] 모바일 앱 개발

## 🤝 기여 가이드

### 개발 환경 설정

1. 저장소 클론
2. 의존성 설치 (`pnpm install`)
3. 환경 변수 설정 (`.env.local`)
4. 데이터베이스 설정
5. 개발 서버 실행 (`pnpm dev`)

### 코드 컨벤션

- **TypeScript**: 엄격한 타입 체크
- **ESLint**: 코드 스타일 준수
- **Prettier**: 일관된 포맷팅
- **커밋 메시지**: Conventional Commits

### Pull Request 프로세스

1. 기능 브랜치 생성
2. 코드 작성 및 테스트
3. Pull Request 생성
4. CI/CD 파이프라인 통과
5. 코드 리뷰 및 승인
6. 자동 배포

## 📞 지원 및 문의

### 문제 해결

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **문서**: 각종 가이드 문서 참조
- **커뮤니티**: 프로젝트 토론 탭

### 연락처

- **이메일**: [프로젝트 관리자 이메일]
- **GitHub**: [프로젝트 저장소](https://github.com/your-username/lifty.co.kr)

---

**Lifty.co.kr**은 현대적인 웹 개발 기술을 활용하여 안전하고 확장 가능한 웹 서비스를 제공합니다. 지속적인 개선과 사용자 피드백을 통해 더 나은 서비스로 발전해 나갈 것입니다.
