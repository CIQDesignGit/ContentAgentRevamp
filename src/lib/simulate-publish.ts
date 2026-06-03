import type { PublishBatch, SkuContent } from "@/components/home/types"
function applySyncedFieldToPdp(prev: SkuContent, fieldKey: string): SkuContent {
  if (fieldKey === "title") {
    return {
      ...prev,
      pdpContent: { ...prev.pdpContent, title: prev.title },
    }
  }
  if (fieldKey === "description") {
    return {
      ...prev,
      pdpContent: { ...prev.pdpContent, description: prev.description },
    }
  }
  if (!fieldKey.startsWith("bullet:")) return prev

  const id = fieldKey.slice("bullet:".length)
  const reco = prev.bulletRecommendations.find((r) => r.id === id)
  if (!reco) return prev

  let pdpBullets = prev.pdpContent.bullets
  if (reco.kind === "add") {
    pdpBullets = [...pdpBullets, reco.recommendedText]
  } else if (reco.pimIndex !== undefined && reco.pimIndex < pdpBullets.length) {
    pdpBullets = pdpBullets.slice()
    pdpBullets[reco.pimIndex] = reco.recommendedText
  }

  return { ...prev, pdpContent: { ...prev.pdpContent, bullets: pdpBullets } }
}

export function createPublishBatch(fieldKeys: string[], queuedFollowUp = false): PublishBatch {
  return {
    id: `batch-${Date.now()}`,
    startedAt: new Date().toISOString(),
    fieldKeys,
    pim: "pending",
    retailer: "idle",
    pdp: "not_run",
    queuedFollowUp,
  }
}

/** Marks published fields as syncing and appends a new batch. */
export function applyPublishStart(prev: SkuContent, fieldKeys: string[], queuedFollowUp: boolean): SkuContent {
  const batch = createPublishBatch(fieldKeys, queuedFollowUp)
  let next: SkuContent = {
    ...prev,
    isPublishing: true,
    publishBatches: [...(prev.publishBatches ?? []), batch],
  }

  if (fieldKeys.includes("title")) {
    next = {
      ...next,
      titleSyncFootprint: "syncing",
      titleHasUnpublishedEdits: false,
    }
  }
  if (fieldKeys.includes("description")) {
    next = {
      ...next,
      descriptionSyncFootprint: "syncing",
      descriptionHasUnpublishedEdits: false,
    }
  }
  next = {
    ...next,
    bulletRecommendations: next.bulletRecommendations.map((r) => {
      const key = `bullet:${r.id}`
      if (!fieldKeys.includes(key)) return r
      return {
        ...r,
        syncFootprint: "syncing" as const,
        hasUnpublishedEdits: false,
        footprint: undefined,
      }
    }),
  }

  return next
}

export type PublishPhase = "pim_done" | "retailer_done" | "pdp_live" | "done"

export function applyPublishPhase(
  prev: SkuContent,
  batchId: string,
  phase: PublishPhase,
): SkuContent {
  const batches = prev.publishBatches ?? []
  const idx = batches.findIndex((b) => b.id === batchId)
  if (idx < 0) return { ...prev, isPublishing: false }

  const batch = { ...batches[idx] }
  if (phase === "pim_done") {
    batch.pim = "accepted"
    batch.retailer = "pending"
    batch.pdp = "not_run"
  } else if (phase === "retailer_done") {
    batch.pim = "accepted"
    batch.retailer = "accepted"
    batch.pdp = "pending"
  } else if (phase === "pdp_live" || phase === "done") {
    batch.pim = "accepted"
    batch.retailer = "accepted"
    batch.pdp = "live"
    if (!batch.completedAt) {
      batch.completedAt = new Date().toISOString()
    }
  }

  const nextBatches = [...batches]
  nextBatches[idx] = batch

  const fieldKeys = batch.fieldKeys
  const markSynced = phase === "pdp_live" || phase === "done"

  let next: SkuContent = {
    ...prev,
    publishBatches: nextBatches,
    isPublishing: phase !== "done",
  }

  if (markSynced) {
    if (fieldKeys.includes("title")) {
      next = { ...next, titleSyncFootprint: "synced" }
    }
    if (fieldKeys.includes("description")) {
      next = { ...next, descriptionSyncFootprint: "synced" }
    }
    next = {
      ...next,
      bulletRecommendations: next.bulletRecommendations.map((r) => {
        const key = `bullet:${r.id}`
        if (!fieldKeys.includes(key)) return r
        return { ...r, syncFootprint: "synced" as const, footprint: "recently-updated" }
      }),
    }
    for (const fieldKey of fieldKeys) {
      next = applySyncedFieldToPdp(next, fieldKey)
    }
  }

  if (phase === "done") {
    next.isPublishing = false
  }

  return next
}

/** Prototype pacing — PDP verifying waits 5s after retailer step (production: often hours). */
export const PUBLISH_PHASE_DELAYS_MS = {
  pim_done: 2500,
  retailer_done: 7000,
  pdp_live: 12000,
  done: 12500,
} as const
