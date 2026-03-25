/**
 * 대시보드 콘텐츠 (클라이언트 컴포넌트)
 *
 * PhotoUploader + PhotoGrid 통합
 */

"use client"

import { usePhotos } from '@/hooks/usePhotos'
import { PhotoUploader } from './PhotoUploader'
import { PhotoGrid } from './PhotoGrid'

export function DashboardContent() {
  const { photos, loading, error, refetch } = usePhotos()

  return (
    <div className="space-y-8">
      {/* 업로더 */}
      <PhotoUploader onUploadComplete={refetch} />

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* 사진 그리드 */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          업로드된 사진 {!loading && `(${photos.length})`}
        </h2>
        <PhotoGrid photos={photos} loading={loading} onDelete={refetch} />
      </div>
    </div>
  )
}
