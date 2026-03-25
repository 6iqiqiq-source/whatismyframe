/**
 * Supabase Storage 버킷 목록 조회
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// .env.local 파일 로드
config({ path: '.env.local' })

async function listBuckets() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('환경변수가 설정되지 않았습니다.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  console.log('📦 현재 생성된 Storage 버킷 목록:\n')

  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ 버킷 조회 실패:', error.message)
    process.exit(1)
  }

  if (!buckets || buckets.length === 0) {
    console.log('⚠️  생성된 버킷이 없습니다.')
    console.log('\nSupabase Dashboard → Storage에서 다음 버킷을 생성하세요:')
    console.log('  - 이름: photos-bucket')
    console.log('  - Public: ✅')
  } else {
    buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. ${bucket.name}`)
      console.log(`   - ID: ${bucket.id}`)
      console.log(`   - Public: ${bucket.public ? '예' : '아니오'}`)
      console.log(`   - Created: ${bucket.created_at}`)
      console.log()
    })
  }
}

listBuckets().catch((error) => {
  console.error('오류:', error)
  process.exit(1)
})
