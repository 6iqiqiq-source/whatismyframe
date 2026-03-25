/**
 * 메인 이미지 컴포넌트
 *
 * 교차 페이드 애니메이션 + 좌우 화살표 + 인접 이미지 프리로드
 */

"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Photo } from '@/lib/types/photo'

const TRANSITION_DURATION = 300

interface MainImageProps {
  photos: Photo[]
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function MainImage({
  photos,
  currentIndex,
  onPrev,
  onNext,
  containerRef,
}: MainImageProps) {
  const [displayIndex, setDisplayIndex] = useState(currentIndex)
  const [prevDisplayIndex, setPrevDisplayIndex] = useState<number | null>(null)
  const [isFading, setIsFading] = useState(false)
  const total = photos.length

  // currentIndex 변경 시 교차 페이드 트리거
  useEffect(() => {
    if (currentIndex === displayIndex) return

    setPrevDisplayIndex(displayIndex)
    setDisplayIndex(currentIndex)
    setIsFading(true)

    const timer = setTimeout(() => {
      setIsFading(false)
      setPrevDisplayIndex(null)
    }, TRANSITION_DURATION)

    return () => clearTimeout(timer)
  }, [currentIndex, displayIndex])

  const currentPhoto = photos[displayIndex]
  const prevPhoto = prevDisplayIndex !== null ? photos[prevDisplayIndex] : null

  // 인접 이미지 (프리로드용)
  const nextPreload = total > 1 ? photos[(currentIndex + 1) % total] : null
  const prevPreload = total > 1 ? photos[(currentIndex - 1 + total) % total] : null

  return (
    <div ref={containerRef} className="relative flex-1 w-full select-none">
      {/* 이전 이미지 레이어 (페이드 아웃) */}
      {prevPhoto && (
        <div
          className="absolute inset-0 z-10"
          style={{
            opacity: isFading ? 0 : 1,
            transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
          }}
        >
          <Image
            src={prevPhoto.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 70vw"
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}

      {/* 현재 이미지 레이어 */}
      <div className="absolute inset-0">
        <Image
          src={currentPhoto.image_url}
          alt={`사진 ${currentIndex + 1} / ${total}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 70vw"
          style={{ objectFit: 'contain' }}
          loading="eager"
        />
      </div>

      {/* 좌우 화살표 (사진 2개 이상일 때만) */}
      {total > 1 && (
        <>
          <button
            onClick={onPrev}
            aria-label="이전 사진"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/50 p-2 text-foreground/70 opacity-0 backdrop-blur-sm transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={onNext}
            aria-label="다음 사진"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/50 p-2 text-foreground/70 opacity-0 backdrop-blur-sm transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      {/* 인접 이미지 프리로드 (숨김) */}
      <div className="hidden">
        {nextPreload && (
          <Image
            src={nextPreload.image_url}
            alt=""
            width={1}
            height={1}
          />
        )}
        {prevPreload && (
          <Image
            src={prevPreload.image_url}
            alt=""
            width={1}
            height={1}
          />
        )}
      </div>
    </div>
  )
}
