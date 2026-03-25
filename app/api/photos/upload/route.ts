/**
 * 사진 업로드 API
 *
 * POST: 인증 → 검증 → 원본 업로드 → Sharp 썸네일 생성 → Storage → DB INSERT
 */

import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import type { Photo } from '@/lib/types/photo'
import {
  generatePhotoFileName,
  getThumbnailFileName,
  isValidMimeType,
  isValidFileSize,
} from '@/lib/utils/image'

const BUCKET_NAME = 'photos-bucket'

export async function POST(request: Request) {
  const supabase = await createClient()

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 })
    }

    // 서버 측 검증
    if (!isValidMimeType(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)' },
        { status: 400 }
      )
    }

    if (!isValidFileSize(file.size)) {
      return NextResponse.json(
        { error: '파일 크기가 10MB를 초과합니다.' },
        { status: 400 }
      )
    }

    // 파일 버퍼 변환
    const buffer = Buffer.from(await file.arrayBuffer())

    // Sharp로 이미지 메타데이터 추출
    const metadata = await sharp(buffer).metadata()
    const width = metadata.width ?? null
    const height = metadata.height ?? null

    // 파일명 생성
    const fileName = generatePhotoFileName(file.name)
    const originalPath = `originals/${fileName}`
    const thumbnailPath = `thumbnails/${getThumbnailFileName(fileName)}`

    // 원본 업로드
    const { error: originalError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(originalPath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (originalError) {
      return NextResponse.json(
        { error: `원본 업로드 실패: ${originalError.message}` },
        { status: 500 }
      )
    }

    // 썸네일 생성 (400px 너비, WebP)
    let thumbnailBuffer: Buffer
    try {
      thumbnailBuffer = await sharp(buffer)
        .resize(400, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
    } catch {
      // 썸네일 생성 실패 시 원본 롤백
      await supabase.storage.from(BUCKET_NAME).remove([originalPath])
      return NextResponse.json(
        { error: '썸네일 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 썸네일 업로드
    const { error: thumbnailError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/webp',
        upsert: false,
      })

    if (thumbnailError) {
      // 썸네일 업로드 실패 시 원본 롤백
      await supabase.storage.from(BUCKET_NAME).remove([originalPath])
      return NextResponse.json(
        { error: `썸네일 업로드 실패: ${thumbnailError.message}` },
        { status: 500 }
      )
    }

    // Public URL 생성 (동기)
    const { data: originalUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(originalPath)

    const { data: thumbnailUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(thumbnailPath)

    // display_order: 기존 최대값 + 1
    const { data: maxOrderData } = await supabase
      .from('photos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single<{ display_order: number }>()

    const displayOrder = (maxOrderData?.display_order ?? 0) + 1

    // DB INSERT
    const { data: photo, error: insertError } = await supabase
      .from('photos')
      .insert({
        image_url: originalUrl.publicUrl,
        thumbnail_url: thumbnailUrl.publicUrl,
        width,
        height,
        file_size: file.size,
        display_order: displayOrder,
      })
      .select()
      .single<Photo>()

    if (insertError) {
      // DB 실패 시 Storage 롤백
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([originalPath, thumbnailPath])
      return NextResponse.json(
        { error: `DB 저장 실패: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('업로드 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
