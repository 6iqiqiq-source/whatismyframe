/**
 * Supabase 설정 검증 스크립트
 *
 * 이 스크립트는 다음을 확인합니다:
 * 1. 환경변수가 올바르게 설정되었는지
 * 2. Supabase 연결이 정상적으로 작동하는지
 * 3. photos 테이블이 생성되었는지
 * 4. Storage 버킷이 생성되었는지
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// .env.local 파일 로드
config({ path: '.env.local' })

async function verifySupabase() {
  // 환경변수 로드
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Supabase 설정 검증 시작...\n')

  // 1. 환경변수 확인
  console.log('1️⃣ 환경변수 확인')
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.')
    process.exit(1)
  }
  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.')
    process.exit(1)
  }

  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 20) + '...')
  console.log()

  // 2. Supabase 클라이언트 생성
  console.log('2️⃣ Supabase 클라이언트 생성')
  let supabase
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase 클라이언트 생성 성공')
  } catch (error) {
    console.error('❌ Supabase 클라이언트 생성 실패:', error)
    process.exit(1)
  }
  console.log()

  // 3. photos 테이블 확인
  console.log('3️⃣ photos 테이블 확인')
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ photos 테이블 조회 실패:', error.message)
      console.log('   힌트: Supabase Dashboard에서 schema.sql을 실행했는지 확인하세요.')
      process.exit(1)
    }

    console.log('✅ photos 테이블 정상 작동')
    console.log(`   현재 사진 개수: ${data?.length || 0}개`)
  } catch (error) {
    console.error('❌ photos 테이블 확인 중 오류:', error)
    process.exit(1)
  }
  console.log()

  // 4. Storage 버킷 확인
  console.log('4️⃣ Storage 버킷 확인')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('❌ Storage 버킷 조회 실패:', error.message)
      process.exit(1)
    }

    const photosBucket = buckets?.find(b => b.name === 'photos-bucket')

    if (!photosBucket) {
      console.error('❌ photos-bucket이 존재하지 않습니다.')
      console.log('   힌트: Supabase Dashboard → Storage에서 photos-bucket을 생성하세요.')
      process.exit(1)
    }

    console.log('✅ photos-bucket 존재 확인')
    console.log(`   Public: ${photosBucket.public ? '예' : '아니오'}`)
  } catch (error) {
    console.error('❌ Storage 버킷 확인 중 오류:', error)
    process.exit(1)
  }
  console.log()

  // 5. Storage 폴더 확인
  console.log('5️⃣ Storage 폴더 확인')
  try {
    const { data: files, error } = await supabase.storage
      .from('photos-bucket')
      .list('', { limit: 100 })

    if (error) {
      console.error('❌ Storage 폴더 조회 실패:', error.message)
    } else {
      const hasOriginals = files?.some(f => f.name === 'originals')
      const hasThumbnails = files?.some(f => f.name === 'thumbnails')

      if (hasOriginals) {
        console.log('✅ originals/ 폴더 존재')
      } else {
        console.log('⚠️  originals/ 폴더가 없습니다. (권장: 생성)')
      }

      if (hasThumbnails) {
        console.log('✅ thumbnails/ 폴더 존재')
      } else {
        console.log('⚠️  thumbnails/ 폴더가 없습니다. (권장: 생성)')
      }
    }
  } catch (error) {
    console.log('⚠️  폴더 확인 실패 (치명적이지 않음):', error)
  }
  console.log()

  // 최종 결과
  console.log('='.repeat(50))
  console.log('🎉 모든 검증 완료! Supabase가 정상적으로 설정되었습니다.')
  console.log('='.repeat(50))
  console.log()
  console.log('다음 단계:')
  console.log('  Phase 3: 기본 구조 및 타입 정의로 진행하세요.')
}

// 스크립트 실행
verifySupabase().catch((error) => {
  console.error('검증 중 예상치 못한 오류 발생:', error)
  process.exit(1)
})
