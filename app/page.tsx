/**
 * 메인 페이지
 *
 * 공개 슬라이드쇼 갤러리
 */

import { getPhotos } from '@/lib/actions/photos'
import { Slideshow } from '@/components/slideshow/Slideshow'

export default async function Home() {
  const photos = await getPhotos()

  return (
    <main className="h-dvh bg-background overflow-hidden">
      <Slideshow photos={photos} />
    </main>
  )
}
