/**
 * 슬라이드쇼 통합 컨테이너
 *
 * MainImage + ThumbnailStrip + useSlideshow 훅 통합
 */

"use client"

import { ImageIcon } from 'lucide-react'
import type { Photo } from '@/lib/types/photo'
import { useSlideshow } from '@/hooks/useSlideshow'
import { MainImage } from './MainImage'
import { ThumbnailStrip } from './ThumbnailStrip'

interface SlideshowProps {
  photos: Photo[]
}

export function Slideshow({ photos }: SlideshowProps) {
  const {
    currentIndex,
    goTo,
    goNext,
    goPrev,
    thumbnailContainerRef,
    mainImageRef,
  } = useSlideshow(photos)

  // 빈 상태
  if (photos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <ImageIcon className="mx-auto size-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg text-muted-foreground">
            아직 등록된 사진이 없습니다
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-full group"
      role="region"
      aria-roledescription="slideshow"
      aria-label="사진 슬라이드쇼"
      tabIndex={0}
    >
      <MainImage
        photos={photos}
        currentIndex={currentIndex}
        onPrev={goPrev}
        onNext={goNext}
        containerRef={mainImageRef}
      />

      {photos.length > 1 && (
        <ThumbnailStrip
          photos={photos}
          currentIndex={currentIndex}
          onSelect={goTo}
          containerRef={thumbnailContainerRef}
        />
      )}
    </div>
  )
}
