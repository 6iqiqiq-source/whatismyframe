/**
 * Supabase 서버 클라이언트
 *
 * 서버 컴포넌트와 API 라우트에서 사용하는 Supabase 클라이언트입니다.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // setAll 메서드는 서버 컴포넌트에서 호출될 때
            // 에러를 무시해도 됩니다 (미들웨어에서 처리됨)
          }
        },
      },
    }
  )
}
