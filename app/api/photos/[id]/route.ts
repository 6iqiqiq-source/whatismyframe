/**
 * 개별 사진 삭제 API
 *
 * DELETE: Storage 파일 삭제 + DB 레코드 삭제
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Photo } from '@/lib/types/photo'

const BUCKET_NAME = 'photos-bucket'

/**
 * Storage URL에서 파일 경로 추출
 * 예: https://xxx.supabase.co/storage/v1/object/public/photos-bucket/originals/uuid.jpg
 * → originals/uuid.jpg
 */
function extractStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  // 레코드 조회
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('id, image_url, thumbnail_url')
    .eq('id', id)
    .single<Pick<Photo, 'id' | 'image_url' | 'thumbnail_url'>>()

  if (fetchError || !photo) {
    return NextResponse.json(
      { error: '사진을 찾을 수 없습니다.' },
      { status: 404 }
    )
  }

  // Storage 파일 삭제
  const pathsToDelete: string[] = []
  const originalPath = extractStoragePath(photo.image_url)
  const thumbnailPath = extractStoragePath(photo.thumbnail_url)

  if (originalPath) pathsToDelete.push(originalPath)
  if (thumbnailPath) pathsToDelete.push(thumbnailPath)

  if (pathsToDelete.length > 0) {
    await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete)
  }

  // DB 레코드 삭제
  const { error: deleteError } = await supabase
    .from('photos')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json(
      { error: `삭제 실패: ${deleteError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
