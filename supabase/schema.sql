-- ==========================================
-- 사진 포트폴리오 데이터베이스 스키마
-- ==========================================

-- photos 테이블 생성
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,                          -- 선택사항 (현재는 미사용)
  description TEXT,                    -- 선택사항 (현재는 미사용)
  image_url TEXT NOT NULL,             -- 원본 이미지 URL
  thumbnail_url TEXT NOT NULL,         -- 썸네일 이미지 URL
  width INTEGER,                       -- 이미지 너비
  height INTEGER,                      -- 이미지 높이
  file_size INTEGER,                   -- 파일 크기 (bytes)
  display_order INTEGER DEFAULT 0,     -- 정렬 순서
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ver.0.2 쇼핑몰 확장을 위한 필드 (초기 NULL)
  price DECIMAL(10,2),
  is_for_sale BOOLEAN DEFAULT FALSE,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_photos_display_order ON photos(display_order);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- ==========================================
-- Row Level Security (RLS) 정책
-- ==========================================

-- RLS 활성화
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 조회 가능 (공개)
DROP POLICY IF EXISTS "Anyone can view photos" ON photos;
CREATE POLICY "Anyone can view photos"
  ON photos FOR SELECT
  USING (true);

-- 인증된 사용자만 삽입
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photos;
CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 인증된 사용자만 수정
DROP POLICY IF EXISTS "Authenticated users can update photos" ON photos;
CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE
  TO authenticated
  USING (true);

-- 인증된 사용자만 삭제
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON photos;
CREATE POLICY "Authenticated users can delete photos"
  ON photos FOR DELETE
  TO authenticated
  USING (true);
