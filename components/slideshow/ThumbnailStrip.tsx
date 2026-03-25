/**
 * 썸네일 스트립 컴포넌트
 *
 * 가로 스크롤 + 활성 하이라이트 + 자동 센터링
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
        className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            data-thumbnail-index={index}
            onClick={() => onSelect(index)}
            aria-label={`사진 ${index + 1}로 이동`}
            aria-current={index === currentIndex ? 'true' : undefined}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-sm transition-all duration-300',
              'w-16 h-16 md:w-20 md:h-20',
              index === currentIndex
                ? 'ring-2 ring-foreground opacity-100 scale-105'
                : 'opacity-50 hover:opacity-80'
            )}
          >
            <Image
              src={photo.thumbnail_url}
              alt=""
              fill
              sizes="80px"
              style={{ objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
