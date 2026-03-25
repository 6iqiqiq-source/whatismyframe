/**
 * 메인 이미지 컴포넌트
 *
 * 교차 페이드 애니메이션 + 좌우 화살표 + 인접 이미지 프리로드 + 로딩 스켈레톤 및 에러 처리
 */

"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle } from 'lucide-react'
import type { Photo } from '@/lib/types/photo'
import { cn } from '@/lib/utils'

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
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const total = photos.length

  // currentIndex 변경 시 교차 페이드 트리거
  useEffect(() => {
    if (currentIndex === displayIndex) return

    setPrevDisplayIndex(displayIndex)
    setDisplayIndex(currentIndex)
    setIsFading(true)
    setIsLoading(true)
    setHasError(false)

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
    <div ref={containerRef} className="relative flex-1 w-full select-none flex items-center justify-center bg-background group overflow-hidden">
      {/* 로딩 스켈레톤 UI */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-0 flex items-center justify-center flex-col gap-4 text-muted-foreground animate-pulse">
          <ImageIcon className="size-16 opacity-20" />
        </div>
      )}

      {/* 에러 상태 UI */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="size-12 mb-2 opacity-50 text-destructive" />
          <p className="text-sm">이미지를 불러올 수 없습니다.</p>
        </div>
      )}

      {/* 현재 이미지 레이어 (페이드 인) */}
      <div 
        className={cn(
          "absolute inset-0 z-10 transition-opacity duration-300 ease-in-out",
          isFading ? "opacity-0" : "opacity-100",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      >
        {!hasError && (
          <Image
            src={currentPhoto.image_url}
            alt={`사진 ${currentIndex + 1} / ${total}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 70vw"
            style={{ objectFit: 'contain' }}
            loading="eager"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
          />
        )}
      </div>

      {/* 이전 이미지 레이어 (페이드 아웃) */}
      {prevPhoto && (
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            opacity: isFading ? 1 : 0,
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

      {/* 좌우 화살표 (사진 2개 이상일 때만) */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="이전 사진"
            className="absolute left-4 sm:left-8 top-1/2 z-30 -translate-y-1/2 rounded-full bg-background/20 p-3 text-foreground/50 opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-background/50 hover:text-foreground group-hover:opacity-100 focus:opacity-100 outline-none"
          >
            <ChevronLeft className="size-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="다음 사진"
            className="absolute right-4 sm:right-8 top-1/2 z-30 -translate-y-1/2 rounded-full bg-background/20 p-3 text-foreground/50 opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-background/50 hover:text-foreground group-hover:opacity-100 focus:opacity-100 outline-none"
          >
            <ChevronRight className="size-8" />
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
