/**
 * 슬라이드쇼 통합 네비게이션 훅
 *
 * 키보드, 마우스 휠, 모바일 스와이프를 통합 관리합니다.
 */

"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Photo } from '@/lib/types/photo'

const TRANSITION_DURATION = 300
const SWIPE_THRESHOLD = 50

interface UseSlideshowReturn {
  currentIndex: number
  isTransitioning: boolean
  goTo: (index: number) => void
  goNext: () => void
  goPrev: () => void
  thumbnailContainerRef: React.RefObject<HTMLDivElement | null>
  mainImageRef: React.RefObject<HTMLDivElement | null>
}

export function useSlideshow(photos: Photo[]): UseSlideshowReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const lastNavigationTime = useRef(0)
  const touchStartX = useRef(0)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const mainImageRef = useRef<HTMLDivElement>(null)
  const total = photos.length

  // 인덱스 이동
  const goTo = useCallback((index: number) => {
    if (isTransitioning || total <= 1) return
    const now = Date.now()
    if (now - lastNavigationTime.current < TRANSITION_DURATION) return
    lastNavigationTime.current = now

    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION)
  }, [isTransitioning, total])

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % total)
  }, [currentIndex, total, goTo])

  const goPrev = useCallback(() => {
    goTo((currentIndex - 1 + total) % total)
  }, [currentIndex, total, goTo])

  // 키보드 네비게이션
  useEffect(() => {
    if (total <= 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [total, goNext, goPrev])

  // 마우스 휠
  useEffect(() => {
    if (total <= 1) return
    const element = mainImageRef.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0) goNext()
      else if (e.deltaY < 0) goPrev()
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [total, goNext, goPrev])

  // 모바일 스와이프
  useEffect(() => {
    if (total <= 1) return
    const element = mainImageRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

      if (deltaX < 0) goNext()  // 왼쪽 스와이프 → 다음
      else goPrev()              // 오른쪽 스와이프 → 이전
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [total, goNext, goPrev])

  // 썸네일 자동 스크롤
  useEffect(() => {
    const container = thumbnailContainerRef.current
    if (!container) return

    const thumbnail = container.querySelector(
      `[data-thumbnail-index="${currentIndex}"]`
    )
    if (thumbnail) {
      thumbnail.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [currentIndex])

  return {
    currentIndex,
    isTransitioning,
    goTo,
    goNext,
    goPrev,
    thumbnailContainerRef,
    mainImageRef,
  }
}
