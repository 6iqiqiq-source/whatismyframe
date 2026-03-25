/**
 * Supabase 데이터베이스 타입 정의
 *
 * Supabase에서 자동 생성된 타입을 기반으로 작성되었습니다.
 */

import { Photo } from './photo'

export type Database = {
  public: {
    Tables: {
      photos: {
        Row: Photo
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          image_url: string
          thumbnail_url: string
          width?: number | null
          height?: number | null
          file_size?: number | null
          display_order?: number
          created_at?: string
          updated_at?: string
          price?: number | null
          is_for_sale?: boolean
          stock_quantity?: number | null
          category?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          image_url?: string
          thumbnail_url?: string
          width?: number | null
          height?: number | null
          file_size?: number | null
          display_order?: number
          created_at?: string
          updated_at?: string
          price?: number | null
          is_for_sale?: boolean
          stock_quantity?: number | null
          category?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
