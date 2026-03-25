/**
 * 사진 카드 컴포넌트
 *
 * 썸네일 + 호버 삭제 버튼 + 메타 정보
 */

"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Photo } from '@/lib/types/photo'
import { formatFileSize } from '@/lib/utils/image'

interface PhotoCardProps {
  photo: Photo
  onDelete: () => void
}

export function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('이 사진을 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '삭제 실패')
      }

      toast.success('사진이 삭제되었습니다.')
      onDelete()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      {/* 썸네일 */}
      <div className="relative aspect-square">
        <Image
          src={photo.thumbnail_url}
          alt={photo.title || '사진'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* 호버 오버레이 + 삭제 버튼 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-full bg-destructive p-2 text-destructive-foreground shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Trash2 className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="px-3 py-2">
        <p className="truncate text-xs text-muted-foreground">
          {photo.width && photo.height
            ? `${photo.width} × ${photo.height}`
            : '크기 정보 없음'}
          {photo.file_size ? ` · ${formatFileSize(photo.file_size)}` : ''}
        </p>
      </div>
    </div>
  )
}
