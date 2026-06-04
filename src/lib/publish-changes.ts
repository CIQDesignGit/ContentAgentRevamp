import type { SkuContent, TitleStatus } from "@/components/home/types"
import { resolveBulletSyncFootprint, resolveFieldSyncFootprint } from "@/lib/sync-footprint"

export type PublishableField = {
  key: string
  label: string
}

export type PublishSummary = {
  publishable: PublishableField[]
  pendingReviewCount: number
  hasActiveBatch: boolean
  queuedFollowUpCount: number
}

function isAcceptedStatus(status: TitleStatus): boolean {
  return status === "accepted"
}

function titleIsPublishable(content: SkuContent): boolean {
  if (!isAcceptedStatus(content.titleStatus)) return false
  const fp = resolveFieldSyncFootprint(content.titleSyncFootprint)
  if (content.titleHasUnpublishedEdits) return true
  return fp === "none" || fp === "queued"
}

function descriptionIsPublishable(content: SkuContent): boolean {
  if (!isAcceptedStatus(content.descriptionStatus)) return false
  const fp = resolveFieldSyncFootprint(content.descriptionSyncFootprint)
  if (content.descriptionHasUnpublishedEdits) return true
  return fp === "none" || fp === "queued"
}

function bulletIsPublishable(
  reco: SkuContent["bulletRecommendations"][number],
): boolean {
  if (reco.status !== "accepted") return false
  const fp = resolveBulletSyncFootprint(reco)
  if (reco.hasUnpublishedEdits) return true
  return fp === "none" || fp === "queued"
}

export function countPendingReviews(content: SkuContent): number {
  let n = 0
  if (content.titleRecommendation && content.titleStatus === "pending") n++
  if (content.descriptionRecommendation && content.descriptionStatus === "pending") n++
  n += content.bulletRecommendations.filter((r) => r.status === "pending").length
  return n
}

export function getPublishSummary(content: SkuContent): PublishSummary {
  const publishable: PublishableField[] = []

  if (titleIsPublishable(content)) {
    publishable.push({ key: "title", label: "Title" })
  }
  content.bulletRecommendations.forEach((r) => {
    if (bulletIsPublishable(r)) {
      publishable.push({ key: `bullet:${r.id}`, label: r.label || "Bullet" })
    }
  })
  if (descriptionIsPublishable(content)) {
    publishable.push({ key: "description", label: "Description" })
  }

  const activeBatch = content.publishBatches?.find(
    (b) => b.pim === "pending" || b.retailer === "pending" || b.pdp === "pending",
  )

  const deferredBatchCount = (content.publishBatches ?? []).filter(
    (b) => b.queuedFollowUp && b.pim === "idle",
  ).length

  const queuedFollowUpCount = deferredBatchCount

  return {
    publishable,
    pendingReviewCount: countPendingReviews(content),
    hasActiveBatch: Boolean(activeBatch),
    queuedFollowUpCount,
  }
}

export function canPublish(content: SkuContent): boolean {
  return getPublishSummary(content).publishable.length > 0
}
