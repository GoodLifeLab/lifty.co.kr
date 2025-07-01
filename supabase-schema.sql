-- Users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 인증 코드 테이블 생성
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires ON email_verification_codes(expires_at);

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- JWT 토큰 기반 인증을 위한 정책들
-- 모든 사용자가 회원가입할 수 있도록 INSERT 정책
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- 이메일로 사용자 조회 (로그인용)
CREATE POLICY "Allow email lookup for authentication" ON users
    FOR SELECT USING (true);

-- 사용자 자신의 데이터 업데이트 (이메일 인증 등)
CREATE POLICY "Allow users to update own data" ON users
    FOR UPDATE USING (true);

-- 이메일 인증 코드 관련 정책
CREATE POLICY "Allow email verification code creation" ON email_verification_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow email verification code lookup" ON email_verification_codes
    FOR SELECT USING (true);

CREATE POLICY "Allow email verification code deletion" ON email_verification_codes
    FOR DELETE USING (true);

-- 관리자 정책 (필요시 추가)
-- CREATE POLICY "Admin can view all users" ON users
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin'); 