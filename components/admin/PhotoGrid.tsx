/**
 * 사진 그리드 컴포넌트
 *
 * 반응형 그리드 + 로딩/빈 상태
 */

"use client"

import { ImageIcon } from 'lucide-react'
import type { Photo } from '@/lib/types/photo'
import { PhotoCard } from './PhotoCard'

interface PhotoGridProps {
  photos: Photo[]
  loading: boolean
  onDelete: () => void
}

export function PhotoGrid({ photos, loading, onDelete }: PhotoGridProps) {
  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border">
            <div className="aspect-square animate-pulse bg-muted" />
            <div className="px-3 py-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 빈 상태
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <ImageIcon className="size-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          아직 업로드된 사진이 없습니다
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          위 영역에 사진을 드래그하여 업로드하세요
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} onDelete={onDelete} />
      ))}
    </div>
  )
}
