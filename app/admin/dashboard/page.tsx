/**
 * 관리자 대시보드 페이지
 *
 * 사진 업로드 및 관리 기능 (Phase 5에서 구현 예정)
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: '관리자 대시보드',
  description: '사진 포트폴리오 관리',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">관리자 대시보드</h1>
            <p className="text-muted-foreground mt-2">
              로그인됨: {user.email}
            </p>
          </div>

          <form action={handleSignOut}>
            <Button type="submit" variant="outline">
              로그아웃
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>사진 관리</CardTitle>
            <CardDescription>
              Phase 5에서 사진 업로드 및 관리 기능이 추가될 예정입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              현재는 인증 시스템만 구현되었습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
