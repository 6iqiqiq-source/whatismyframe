/**
 * 이미지 처리 유틸리티 함수
 */

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 이미지 파일 타입 검증
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * 이미지 파일 크기 검증 (기본: 10MB)
 */
export function isValidImageSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxBytes
}

/**
 * 파일에서 이미지 dimensions 가져오기
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * UUID로 파일명 생성
 */
export function generatePhotoFileName(originalName: string): string {
  const extension = originalName.split('.').pop()
  const uuid = crypto.randomUUID()
  return `${uuid}.${extension}`
}

/**
 * 썸네일 파일명 생성 (항상 WebP)
 */
export function getThumbnailFileName(originalFileName: string): string {
  const nameWithoutExtension = originalFileName.split('.').slice(0, -1).join('.')
  return `${nameWithoutExtension}_thumb.webp`
}

/**
 * 서버용 MIME 타입 검증
 */
export function isValidMimeType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(mimeType)
}

/**
 * 서버용 파일 크기 검증 (기본: 10MB)
 */
export function isValidFileSize(bytes: number, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024
  return bytes <= maxBytes
}
