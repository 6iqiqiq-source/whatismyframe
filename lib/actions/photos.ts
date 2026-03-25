/**
 * 사진 관련 서버 액션
 *
 * 서버 컴포넌트에서 직접 Supabase 조회
 */

import { createClient } from '@/lib/supabase/server'
import type { Photo } from '@/lib/types/photo'

/**
 * 공개 사진 목록 조회 (display_order 오름차순)
 */
export async function getPhotos(): Promise<Photo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('photos')
    .select('id, image_url, thumbnail_url, width, height, display_order')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('사진 목록 조회 실패:', error.message)
    return []
  }

  return (data as Photo[]) ?? []
}
