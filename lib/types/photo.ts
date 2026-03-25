/**
 * Photo 타입 정의
 *
 * photos 테이블의 구조를 정의합니다.
 */

export interface Photo {
  id: string
  title?: string | null
  description?: string | null
  image_url: string
  thumbnail_url: string
  width?: number | null
  height?: number | null
  file_size?: number | null
  display_order: number
  created_at: string
  updated_at: string

  // ver.0.2 쇼핑몰 확장을 위한 필드
  price?: number | null
  is_for_sale?: boolean
  stock_quantity?: number | null
  category?: string | null
}

/**
 * 사진 업로드 시 사용하는 타입
 */
export interface PhotoInsert {
  title?: string | null
  description?: string | null
  image_url: string
  thumbnail_url: string
  width?: number | null
  height?: number | null
  file_size?: number | null
  display_order?: number
}

/**
 * 사진 업데이트 시 사용하는 타입
 */
export interface PhotoUpdate {
  title?: string | null
  description?: string | null
  display_order?: number
  price?: number | null
  is_for_sale?: boolean
  stock_quantity?: number | null
  category?: string | null
}
