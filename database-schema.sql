-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE,
  disabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 인증 코드 테이블
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email)
);

-- 만료된 인증 코드 자동 삭제를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at 
ON email_verification_codes(expires_at);

-- 비활성화된 사용자 인덱스
CREATE INDEX IF NOT EXISTS idx_users_disabled 
ON users(disabled);

-- 만료된 인증 코드 자동 삭제 함수 (선택사항)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 정책 (비활성화되지 않은 사용자만 접근 가능)
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text AND disabled = false);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text AND disabled = false);

-- 이메일 인증 코드 테이블 정책 (서버에서만 접근)
CREATE POLICY "Allow all operations on email_verification_codes" ON email_verification_codes
  FOR ALL USING (true); 