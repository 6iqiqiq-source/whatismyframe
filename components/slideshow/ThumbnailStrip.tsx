/**
 * 썸네일 스트립 컴포넌트
 *
 * 가로 스크롤 + 활성 하이라이트 + 자동 센터링 + 호버 효과 강화
 */

"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Photo } from '@/lib/types/photo'

interface ThumbnailStripProps {
  photos: Photo[]
  currentIndex: number
  onSelect: (index: number) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function ThumbnailStrip({
  photos,
  currentIndex,
  onSelect,
  containerRef,
}: ThumbnailStripProps) {
  return (
    <div className="w-full shrink-0">
      <div
        ref={containerRef}
        className="flex gap-2 p-4 md:p-6 overflow-x-auto scrollbar-hide snap-x select-none"
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            data-thumbnail-index={index}
            onClick={() => onSelect(index)}
            aria-label={`사진 ${index + 1}로 이동`}
            aria-current={index === currentIndex ? 'true' : undefined}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-md transition-all duration-300 snap-center',
              'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-muted/50',
              index === currentIndex
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100 scale-110 z-10 shadow-md'
                : 'opacity-50 hover:opacity-100 hover:scale-105 hover:shadow-sm'
            )}
          >
            <Image
              src={photo.thumbnail_url}
              alt=""
              fill
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 hover:scale-110"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
