/**
 * 사진 목록 조회 API
 *
 * GET: display_order 오름차순으로 사진 목록 반환
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: `조회 실패: ${error.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json(photos)
}
