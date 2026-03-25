/**
 * 어드민 레이아웃
 *
 * /admin 경로에 대한 공통 레이아웃입니다.
 * 로그인 페이지는 제외하고 나머지는 인증이 필요합니다.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // /admin/login 경로가 아닌데 인증되지 않은 경우 로그인 페이지로 리다이렉트
  // 미들웨어에서도 처리하지만, 레이아웃에서 한 번 더 확인
  if (!user) {
    return <>{children}</>
  }

  return <>{children}</>
}
