# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 언어 규칙
- 응답, 코드 주석, 커밋 메시지, 문서: 한국어
- 변수명/함수명: 영어

## 명령어

```bash
npm run dev          # 개발 서버 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run verify       # Supabase 연결 검증
npm run verify-storage  # Storage 버킷 검증
```

## 기술 스택
- **Next.js 16.2.1** (App Router) + **React 19** + **TypeScript strict**
- **Tailwind CSS v4** (`@tailwindcss/postcss` 플러그인, `@theme inline` 구문)
- **shadcn/ui** (base-nova 스타일, `@base-ui/react` 기반, lucide 아이콘)
- **Supabase** (PostgreSQL + Storage + Auth, `@supabase/ssr`로 SSR 통합)
- **Sharp** (서버 사이드 이미지 처리)

## 아키텍처

### Supabase 클라이언트 분리
- `lib/supabase/client.ts` — 브라우저용 (`createBrowserClient`)
- `lib/supabase/server.ts` — Server Component / API Route용 (`createServerClient` + cookies)
- `lib/supabase/middleware.ts` — 미들웨어 세션 갱신 헬퍼

### 인증 흐름
`middleware.ts`가 모든 요청에서 Supabase 세션을 갱신하며, `/admin/*` 경로를 보호한다. 미인증 사용자는 `/admin/login`으로 리다이렉트되고, 인증된 사용자가 `/admin/login`에 접근하면 `/admin/dashboard`로 리다이렉트된다. 로그인은 `signInWithPassword`, 콜백은 `/api/auth/callback`에서 `exchangeCodeForSession`으로 처리한다.

### 데이터베이스
`supabase/schema.sql`에 `photos` 테이블 스키마 정의. RLS 정책으로 공개 SELECT, 인증 사용자만 INSERT/UPDATE/DELETE. Storage 버킷 `photos-bucket`에 `originals/`과 `thumbnails/` 폴더 구조.

### 타입 시스템
`lib/types/photo.ts`에 `Photo`, `PhotoInsert`, `PhotoUpdate` 인터페이스 정의. `lib/types/database.ts`에 Supabase Database 타입 정의. photos 테이블에 ver.0.2 쇼핑몰 확장용 필드(`price`, `is_for_sale`, `stock_quantity`, `category`)가 nullable로 포함되어 있다.

### shadcn/ui 설정
`components.json`: base-nova 스타일, RSC 지원, `@/components/ui`에 컴포넌트 위치. 새 컴포넌트 추가: `npx shadcn@latest add <component-name>`.

### 환경변수
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 필수. 검증 스크립트에서 `SUPABASE_SERVICE_ROLE_KEY`도 사용. `.env.local`에 설정.

## 프로젝트 컨텍스트
사진 포트폴리오 사이트. 단일 사용자(본인)만 어드민으로 사진 업로드/관리. 메인 페이지는 슬라이드쇼 갤러리(중앙 메인 이미지 + 하단 썸네일 스트립). 미니멀 & 클린 디자인. ver.0.2에서 사진 판매 기능 확장 예정. 구현 계획서: `.claude/plans/woolly-dazzling-fox.md`.
