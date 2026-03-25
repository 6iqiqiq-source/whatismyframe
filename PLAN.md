# 사진 포트폴리오 사이트 구현 계획 (ver.0.1)

## 개요

직접 촬영한 사진을 전시하는 개인 포트폴리오 사이트.
미니멀하고 클린한 디자인으로 사진 자체에 집중하며, 몰입감 있는 감상 경험을 제공합니다.

- 본인만 사진을 업로드/관리할 수 있는 어드민 시스템
- 슬라이드쇼 형식의 갤러리 (중앙 메인 이미지 + 하단 썸네일 스트립)
- Vercel을 통한 배포 (도메인 구매 완료)
- ver.0.2에서 사진 판매(쇼핑몰) 기능 확장 예정

---

## 진행 상황

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | 환경 설정 및 패키지 설치 | ✅ 완료 |
| 2 | Supabase 설정 | ✅ 완료 |
| 3 | 기본 구조 및 타입 정의 | ✅ 완료 |
| 4 | 인증 시스템 구현 | ✅ 완료 |
| 5 | 어드민 대시보드 - 사진 업로드 | ⬜ 대기 |
| 6 | 슬라이드쇼 UI 구현 | ⬜ 대기 |
| 7 | 스타일링 및 애니메이션 | ⬜ 대기 |
| 8 | 최적화 및 배포 | ⬜ 대기 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16.2.1 (App Router), React 19, TypeScript |
| 스타일링 | Tailwind CSS v4, shadcn/ui (base-nova), Lucide React |
| 백엔드 | Supabase (PostgreSQL + Storage + Auth + RLS) |
| 이미지 처리 | Sharp (서버 사이드 썸네일 생성) |
| 배포 | Vercel |

---

## 요구사항

### 핵심 기능

**인증 시스템**
- 본인 전용 어드민 로그인 (단일 사용자, Email/Password)
- 메인 페이지는 로그인 없이 공개 접근 가능

**슬라이드쇼 갤러리**
- 화면 중앙에 큰 메인 이미지 + 하단 썸네일 가로 슬라이드
- 네비게이션: 좌우 화살표 클릭, 키보드 방향키, 마우스 휠, 모바일 스와이프
- 현재 사진 썸네일 하이라이트, 제목/설명 없이 사진만 표시

**어드민 관리 페이지**
- 사진 업로드 (드래그 앤 드롭, 다중 파일 지원)
- 업로드된 사진 그리드 뷰 및 삭제
- 업로드 진행률 표시

**디자인**
- 미니멀 & 클린 (흰색/검정 배경, 여백 활용)
- 다크모드 지원
- 카테고리/태그/좋아요/댓글/검색 없음

---

## 데이터베이스 스키마

### photos 테이블

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,                          -- 미사용 (미니멀)
  description TEXT,                    -- 미사용 (미니멀)
  image_url TEXT NOT NULL,             -- 원본 이미지 URL
  thumbnail_url TEXT NOT NULL,         -- 썸네일 이미지 URL
  width INTEGER,
  height INTEGER,
  file_size INTEGER,                   -- bytes
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ver.0.2 쇼핑몰 확장용 (초기 NULL)
  price DECIMAL(10,2),
  is_for_sale BOOLEAN DEFAULT FALSE,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT
);
```

### RLS 정책

- 모든 사용자: SELECT 가능 (공개)
- 인증된 사용자만: INSERT, UPDATE, DELETE 가능

### Storage

버킷: `photos-bucket` (public)

```
photos-bucket/
├── originals/       # 원본 이미지 ({uuid}.{ext})
└── thumbnails/      # 썸네일 400px ({uuid}_thumb.{ext})
```

- 파일 크기 제한: 10MB
- 허용 형식: JPG, PNG, WEBP

---

## Phase별 상세 계획

### Phase 1: 환경 설정 및 패키지 설치 ✅

- Supabase 클라이언트 설치 (`@supabase/supabase-js`, `@supabase/ssr`)
- shadcn/ui 초기화 및 컴포넌트 설치 (button, input, card, dialog, sonner)
- 유틸리티 설치 (lucide-react, clsx, tailwind-merge, sharp)

### Phase 2: Supabase 설정 ✅

- Supabase 프로젝트 생성 및 키 발급
- `.env.local` 환경변수 설정
- photos 테이블 생성 및 RLS 정책 적용
- `photos-bucket` Storage 버킷 생성 (originals/, thumbnails/)
- Email 인증 프로바이더 활성화

### Phase 3: 기본 구조 및 타입 정의 ✅

- Supabase 클라이언트 분리 (client.ts, server.ts, middleware.ts)
- 타입 정의 (Photo, PhotoInsert, PhotoUpdate, Database)
- 유틸리티 함수 (cn, 이미지 처리 헬퍼)
- Next.js 미들웨어 설정 (/admin 경로 보호)

### Phase 4: 인증 시스템 구현 ✅

- 로그인 폼 (`LoginForm.tsx`, signInWithPassword)
- 어드민 레이아웃 (서버 컴포넌트 인증 체크)
- 인증 훅 (`useAuth.ts`)
- 콜백 라우트 (`/api/auth/callback`)
- 대시보드 페이지 (플레이스홀더)

### Phase 5: 어드민 대시보드 - 사진 업로드

**사진 업로드 API** (`/api/photos/upload`)
1. 인증 체크
2. 이미지 파일 검증 (크기, 형식)
3. 원본 이미지 → Supabase Storage 업로드
4. Sharp로 썸네일 생성 (400px 너비, WebP 80%)
5. 썸네일 → Storage 업로드
6. photos 테이블에 메타데이터 저장

**사진 삭제 API** (`/api/photos/[id]`)
- Storage에서 원본 + 썸네일 삭제
- photos 테이블에서 레코드 삭제

**컴포넌트**
- `PhotoUploader.tsx`: 드래그 앤 드롭, 미리보기, 진행률, 다중 업로드
- `PhotoGrid.tsx`: 반응형 그리드 뷰
- `PhotoCard.tsx`: 썸네일 + 삭제 버튼

**훅**
- `usePhotos.ts`: 사진 목록 조회, 실시간 구독, 낙관적 업데이트

### Phase 6: 슬라이드쇼 UI 구현

**컴포넌트**
- `MainImage.tsx`: Next.js Image, 페이드 애니메이션, 좌우 화살표, 반응형
- `ThumbnailStrip.tsx`: 가로 스크롤, 활성 하이라이트, 자동 스크롤
- `Slideshow.tsx`: 상태 관리 + 통합

**네비게이션**
- `useKeyboard.ts`: 키보드 방향키 (← →)
- 마우스 휠 스크롤 감지
- 모바일 스와이프 제스처

**페이지**
- `/(public)/page.tsx`: 서버 컴포넌트에서 사진 데이터 페칭 → Slideshow에 전달
- `/(public)/layout.tsx`: 미니멀 전체 화면 레이아웃

### Phase 7: 스타일링 및 애니메이션

- 컬러 스키마: 라이트/다크 모드 (흰/검정 + 회색 계열)
- 슬라이드쇼: 페이드 인/아웃 (0.3초), 썸네일 하이라이트, 호버 효과
- 반응형: 데스크탑(중앙 크게) → 태블릿(조정) → 모바일(전체 화면)
- 로딩: 블러 플레이스홀더, 진행률 바, 스켈레톤 UI
- 에러: 이미지 실패 플레이스홀더, Toast 알림

### Phase 8: 최적화 및 배포

- 이미지 최적화 (WebP, lazy loading, blur placeholder)
- SEO 메타데이터 (OG 태그, Twitter 카드)
- Lighthouse 목표: 전 항목 90+
- Vercel 배포 + 환경변수 설정
- Supabase Production 설정 (Site URL, Redirect URLs)
- 도메인 연결 + SSL 확인

---

## 주요 흐름

### 인증 플로우

```
/admin/login 접속
  → LoginForm에서 signInWithPassword 호출
  → 성공 시 쿠키에 세션 저장
  → middleware.ts에서 보호된 경로 체크
  → /admin/dashboard 접근 허용
```

### 파일 업로드 플로우

```
PhotoUploader에서 파일 선택/드래그
  → 클라이언트 유효성 검사 (크기, 타입)
  → FormData로 /api/photos/upload POST
  → 서버 인증 체크
  → 원본 이미지 Storage 업로드
  → Sharp 썸네일 생성 (400px, WebP)
  → 썸네일 Storage 업로드
  → photos 테이블에 메타데이터 저장
  → URL 반환 → 클라이언트 목록 갱신
```

---

## 검증 체크리스트

### 기능

- [ ] 로그인/로그아웃 정상 작동
- [ ] 비인증 시 /admin 접근 차단
- [ ] 단일/다중 사진 업로드 및 썸네일 생성
- [ ] 10MB 초과 / 허용되지 않은 형식 거부
- [ ] 사진 삭제 (DB + Storage)
- [ ] 슬라이드쇼 네비게이션 (클릭, 키보드, 휠, 스와이프)
- [ ] 썸네일 클릭 → 해당 사진 이동 + 하이라이트

### 반응형

- [ ] 데스크탑 (1920x1080)
- [ ] 태블릿 (768x1024)
- [ ] 모바일 (375x667)

### 성능

- [ ] Lighthouse 전 항목 90+
- [ ] LCP < 2.5s, FID < 100ms, CLS < 0.1

### 배포

- [ ] Vercel 배포 + HTTPS
- [ ] 도메인 연결
- [ ] 크로스 브라우저 (Chrome, Safari, Firefox, Edge)

---

## 향후 확장 (ver.0.2)

- 사진 판매 시스템 (가격, 재고, 장바구니, 결제)
- 상태 관리 라이브러리 도입 (Zustand 또는 React Query)
