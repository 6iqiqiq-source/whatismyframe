/**
 * Supabase 클라이언트 (브라우저용)
 *
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트입니다.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
