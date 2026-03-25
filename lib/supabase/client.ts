/**
 * Supabase 클라이언트 (브라우저용)
 *
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트입니다.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
