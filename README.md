# Lifty.co.kr

JWT 토큰 기반 인증 시스템과 Supabase를 사용한 Next.js 애플리케이션입니다.

## 주요 기능

- 🔐 JWT 토큰 기반 인증
- 📧 이메일 인증 시스템
- 📱 SMS 인증 (네이버 클라우드)
- 🗄️ Supabase 데이터베이스 연동
- 🔒 비밀번호 해시화 (bcrypt)

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT, bcryptjs
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer (Gmail)
- **SMS**: 네이버 클라우드 SMS API

## 설정 방법

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 이메일 설정 (Gmail 예시)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 네이버 클라우드 SMS API 설정
NAVER_ACCESS_KEY=your-naver-access-key
NAVER_SECRET_KEY=your-naver-secret-key
NAVER_SERVICE_ID=your-naver-service-id
NAVER_SENDER_PHONE=your-sender-phone
```

### 2. Gmail 설정

Gmail을 사용하려면:

1. Gmail 계정에서 2단계 인증 활성화
2. 앱 비밀번호 생성
3. `EMAIL_USER`와 `EMAIL_PASS` 환경 변수 설정

### 3. Supabase 데이터베이스 설정

1. Supabase 프로젝트 생성
2. SQL 편집기에서 `supabase-schema.sql` 파일의 내용을 실행
3. 환경 변수에 Supabase URL과 키 설정

### 4. 네이버 클라우드 SMS 설정 (선택사항)

1. 네이버 클라우드 플랫폼 가입
2. SMS 서비스 활성화
3. Access Key, Secret Key, Service ID 생성
4. 환경 변수 설정

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 사용자 플로우

1. **회원가입**: 사용자가 이메일, 전화번호, 비밀번호 입력
2. **이메일 인증**: 자동으로 인증 메일 전송
3. **인증 완료**: 이메일 링크 클릭으로 인증 완료
4. **로그인**: 이메일 인증 완료 후 로그인 가능
5. **JWT 토큰**: 로그인 성공 시 JWT 토큰 발급

## 데이터베이스 스키마

### users 테이블

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 보안 기능

- 비밀번호 bcrypt 해시화
- JWT 토큰 기반 인증
- 이메일 인증 필수
- Row Level Security (RLS)
- HTTP-only 쿠키 사용

## 라이센스

MIT License
