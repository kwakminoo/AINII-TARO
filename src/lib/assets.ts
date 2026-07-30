/** 프로덕션에서는 GitHub(jsDelivr)에서 정적 에셋 로드 — Vercel 배포 페이로드 축소 */
const CDN =
  'https://cdn.jsdelivr.net/gh/kwakminoo/AINII-TARO@main/public'

export function asset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (import.meta.env.PROD) return `${CDN}${normalized}`
  return normalized
}
