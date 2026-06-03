import type { BulletRecommendation } from "@/components/home/types"

export function applyBulletRecommendation(
  bullets: string[],
  reco: BulletRecommendation,
): string[] {
  if (reco.kind === "add") return [...bullets, reco.recommendedText]
  if (reco.pimIndex === undefined) return bullets
  const next = bullets.slice()
  if (reco.pimIndex >= next.length) return bullets
  next[reco.pimIndex] = reco.recommendedText
  return next
}
