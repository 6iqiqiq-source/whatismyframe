/**
 * 사진 목록 상태 관리 훅
 */

"use client"

import { useCallback, useEffect, useState } from 'react'
import type { Photo } from '@/lib/types/photo'

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/photos')
      if (!res.ok) {
        throw new Error('사진 목록을 불러올 수 없습니다.')
      }
      const data = await res.json()
      setPhotos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  return { photos, loading, error, refetch: fetchPhotos }
}
