/**
 * 사진 업로드 컴포넌트
 *
 * 드래그 앤 드롭 + 파일 선택, 미리보기, 순차 업로드
 */

"use client"

import { useCallback, useRef, useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { isValidImageType, isValidImageSize } from '@/lib/utils/image'

interface UploadItem {
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  errorMessage?: string
}

interface PhotoUploaderProps {
  onUploadComplete: () => void
}

export function PhotoUploader({ onUploadComplete }: PhotoUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 파일 검증 후 큐에 추가
  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = []

    for (const file of Array.from(files)) {
      if (!isValidImageType(file)) {
        toast.error(`${file.name}: 지원하지 않는 형식입니다. (JPG, PNG, WEBP만 가능)`)
        continue
      }
      if (!isValidImageSize(file)) {
        toast.error(`${file.name}: 10MB를 초과합니다.`)
        continue
      }
      newItems.push({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
      })
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems])
    }
  }, [])

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles]
  )

  // 파일 선택 핸들러
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
      }
      // input 초기화 (같은 파일 재선택 가능)
      e.target.value = ''
    },
    [addFiles]
  )

  // 대기 중인 항목 제거
  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      const item = prev[index]
      if (item && item.status === 'pending') {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  // 순차 업로드
  const startUpload = useCallback(async () => {
    const pendingIndices = items
      .map((item, i) => (item.status === 'pending' ? i : -1))
      .filter((i) => i !== -1)

    if (pendingIndices.length === 0) return

    setIsUploading(true)
    let successCount = 0

    for (const idx of pendingIndices) {
      setItems((prev) =>
        prev.map((item, i) =>
          i === idx ? { ...item, status: 'uploading' as const } : item
        )
      )

      try {
        const formData = new FormData()
        formData.append('file', items[idx].file)

        const res = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || '업로드 실패')
        }

        setItems((prev) =>
          prev.map((item, i) =>
            i === idx ? { ...item, status: 'success' as const } : item
          )
        )
        successCount++
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '알 수 없는 오류'
        setItems((prev) =>
          prev.map((item, i) =>
            i === idx
              ? { ...item, status: 'error' as const, errorMessage }
              : item
          )
        )
        toast.error(`${items[idx].file.name}: ${errorMessage}`)
      }
    }

    setIsUploading(false)

    if (successCount > 0) {
      toast.success(`${successCount}개 사진이 업로드되었습니다.`)
      onUploadComplete()
      // 성공 항목 정리
      setItems((prev) => {
        prev.forEach((item) => {
          if (item.status === 'success') {
            URL.revokeObjectURL(item.preview)
          }
        })
        return prev.filter((item) => item.status !== 'success')
      })
    }
  }, [items, onUploadComplete])

  // 전체 초기화
  const clearAll = useCallback(() => {
    items.forEach((item) => URL.revokeObjectURL(item.preview))
    setItems([])
  }, [items])

  const hasPending = items.some((item) => item.status === 'pending')

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-8
          transition-colors duration-200 text-center
          ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">
          이미지를 드래그하거나 클릭하여 선택
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP · 최대 10MB
        </p>
      </div>

      {/* 미리보기 목록 */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {items.length}개 파일
            </p>
            <div className="flex gap-2">
              {!isUploading && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  전체 삭제
                </Button>
              )}
              {hasPending && (
                <Button size="sm" onClick={startUpload} disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  업로드 시작
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="size-full object-cover"
                />

                {/* 상태 오버레이 */}
                {item.status === 'uploading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="size-6 animate-spin text-white" />
                  </div>
                )}
                {item.status === 'success' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <CheckCircle className="size-6 text-green-400" />
                  </div>
                )}
                {item.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <AlertCircle className="size-6 text-red-400" />
                  </div>
                )}

                {/* 삭제 버튼 (대기 중만) */}
                {item.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(index)
                    }}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
