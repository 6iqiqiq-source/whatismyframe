/**
 * Storage 버킷 검증 (Service Role Key 사용)
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// .env.local 파일 로드
config({ path: '.env.local' })

async function verifyStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('환경변수가 설정되지 않았습니다.')
    process.exit(1)
  }

  console.log('🔍 Storage 검증 (Service Role Key 사용)...\n')

  // Service Role Key로 클라이언트 생성
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // 1. 버킷 목록 조회
  console.log('1️⃣ 버킷 목록 조회')
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('❌ 버킷 조회 실패:', bucketsError.message)
    process.exit(1)
  }

  console.log(`✅ 총 ${buckets?.length || 0}개의 버킷 발견:`)
  buckets?.forEach(b => {
    console.log(`   - ${b.name} (${b.public ? 'Public' : 'Private'})`)
  })
  console.log()

  // 2. photos-bucket 확인
  const photosBucket = buckets?.find(b => b.name === 'photos-bucket')

  if (!photosBucket) {
    console.error('❌ photos-bucket을 찾을 수 없습니다.')
    process.exit(1)
  }

  console.log('2️⃣ photos-bucket 상세 정보')
  console.log(`   Name: ${photosBucket.name}`)
  console.log(`   ID: ${photosBucket.id}`)
  console.log(`   Public: ${photosBucket.public ? '예' : '아니오'}`)
  console.log(`   Created: ${photosBucket.created_at}`)
  console.log()

  // 3. 폴더 확인
  console.log('3️⃣ 폴더 구조 확인')
  const { data: files, error: filesError } = await supabase.storage
    .from('photos-bucket')
    .list('', { limit: 100 })

  if (filesError) {
    console.error('❌ 폴더 조회 실패:', filesError.message)
  } else {
    const hasOriginals = files?.some(f => f.name === 'originals')
    const hasThumbnails = files?.some(f => f.name === 'thumbnails')

    if (hasOriginals) {
      console.log('✅ originals/ 폴더 존재')
    } else {
      console.warn('⚠️  originals/ 폴더가 없습니다.')
    }

    if (hasThumbnails) {
      console.log('✅ thumbnails/ 폴더 존재')
    } else {
      console.warn('⚠️  thumbnails/ 폴더가 없습니다.')
    }
  }
  console.log()

  console.log('='.repeat(50))
  console.log('🎉 Storage 검증 완료!')
  console.log('='.repeat(50))
}

verifyStorage().catch((error) => {
  console.error('오류:', error)
  process.exit(1)
})
