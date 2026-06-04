import type { BulletRecommendation, TitleRecommendation } from "@/components/home/types"
import type { RecommendationLabels } from "@/components/home/content-recommendation-card"

export function bulletAsTitleRecommendation(
  bullet: BulletRecommendation,
): TitleRecommendation {
  return {
    agentName: bullet.label,
    recommendedText: bullet.recommendedText,
    diff: [],
    reasoning: bullet.reasoning,
  }
}

export function bulletRecommendationLabels(
  bullet: BulletRecommendation,
): RecommendationLabels {
  const pendingLabel =
    bullet.kind === "add" ? "AI Recommended Bullet" : `AI Recommended ${bullet.label}`
  return {
    pending: pendingLabel,
    accepted: `Accepted ${bullet.label}`,
    rejected: "Rejected",
    queued: "Changes queued",
  }
}
