/**
 * 관리자 로그인 페이지
 */

import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: '관리자 로그인',
  description: '사진 포트폴리오 관리자 로그인',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  )
}
