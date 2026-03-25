/**
 * 메인 페이지 (임시)
 *
 * Phase 6에서 슬라이드쇼로 대체될 예정입니다.
 */

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold">사진 포트폴리오</h1>
        <p className="text-muted-foreground">
          슬라이드쇼는 Phase 6에서 구현될 예정입니다.
        </p>
        <div className="pt-4">
          <a
            href="/admin/login"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            관리자 로그인
          </a>
        </div>
      </div>
    </div>
  )
}
