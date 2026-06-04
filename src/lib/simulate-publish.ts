import type { PublishBatch, SkuContent } from "@/components/home/types"

function applySyncedFieldToPdp(
  prev: SkuContent,
  fieldKey: string,
  snapshotText?: string,
): SkuContent {
  if (fieldKey === "title") {
    const title = snapshotText ?? prev.title
    return {
      ...prev,
      title,
      pdpContent: { ...prev.pdpContent, title },
    }
  }
  if (fieldKey === "description") {
    const description = snapshotText ?? prev.description
    return {
      ...prev,
      description,
      pdpContent: { ...prev.pdpContent, description },
    }
  }
  if (!fieldKey.startsWith("bullet:")) return prev

  const id = fieldKey.slice("bullet:".length)
  const reco = prev.bulletRecommendations.find((r) => r.id === id)
  if (!reco) return prev

  const text = snapshotText ?? reco.recommendedText
  let pdpBullets = prev.pdpContent.bullets
  if (reco.kind === "add") {
    pdpBullets = [...pdpBullets, text]
  } else if (reco.pimIndex !== undefined && reco.pimIndex < pdpBullets.length) {
    pdpBullets = pdpBullets.slice()
    pdpBullets[reco.pimIndex] = text
  }

  return { ...prev, pdpContent: { ...prev.pdpContent, bullets: pdpBullets } }
}

function captureFieldSnapshots(prev: SkuContent, fieldKeys: string[]): Record<string, string> {
  const snapshots: Record<string, string> = {}
  for (const key of fieldKeys) {
    if (key === "title") snapshots.title = prev.title
    if (key === "description") snapshots.description = prev.description
    if (key.startsWith("bullet:")) {
      const id = key.slice("bullet:".length)
      const reco = prev.bulletRecommendations.find((r) => r.id === id)
      if (reco) snapshots[key] = reco.recommendedText
    }
  }
  return snapshots
}

function hasPendingTitleBatches(batches: PublishBatch[], excludeId?: string): boolean {
  return batches.some(
    (b) => b.fieldKeys.includes("title") && !b.completedAt && b.id !== excludeId,
  )
}

export function createPublishBatch(fieldKeys: string[], queuedFollowUp = false): PublishBatch {
  return {
    id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    startedAt: new Date().toISOString(),
    fieldKeys,
    fieldSnapshots: {},
    pim: queuedFollowUp ? "idle" : "pending",
    retailer: "idle",
    pdp: "not_run",
    queuedFollowUp,
  }
}

/** Next follow-up batch waiting to start after the current one finishes. */
export function getNextDeferredBatch(
  content: SkuContent,
  afterBatchId: string,
): PublishBatch | undefined {
  const batches = content.publishBatches ?? []
  const idx = batches.findIndex((b) => b.id === afterBatchId)
  if (idx < 0) return undefined
  return batches.slice(idx + 1).find((b) => b.queuedFollowUp && b.pim === "idle")
}

/** Starts a deferred batch that was queued behind an in-flight publish. */
export function activateDeferredBatch(prev: SkuContent, batchId: string): SkuContent {
  const batches = prev.publishBatches ?? []
  const idx = batches.findIndex((b) => b.id === batchId)
  if (idx < 0) return prev

  const batch = { ...batches[idx], pim: "pending" as const }
  const fieldKeys = batch.fieldKeys
  const nextBatches = [...batches]
  nextBatches[idx] = batch

  let next: SkuContent = {
    ...prev,
    publishBatches: nextBatches,
    isPublishing: true,
  }

  if (fieldKeys.includes("title")) {
    next = { ...next, titleSyncFootprint: "syncing", titleHasUnpublishedEdits: false }
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

/** Marks published fields as syncing and appends a new batch. */
export function applyPublishStart(
  prev: SkuContent,
  fieldKeys: string[],
  queuedFollowUp: boolean,
): SkuContent {
  const batch = createPublishBatch(fieldKeys, queuedFollowUp)
  batch.fieldSnapshots = captureFieldSnapshots(prev, fieldKeys)

  let next: SkuContent = {
    ...prev,
    publishBatches: [...(prev.publishBatches ?? []), batch],
  }

  if (queuedFollowUp) {
    if (fieldKeys.includes("title")) {
      next = { ...next, titleSyncFootprint: "queued", titleHasUnpublishedEdits: false }
    }
    if (fieldKeys.includes("description")) {
      next = {
        ...next,
        descriptionSyncFootprint: "queued",
        descriptionHasUnpublishedEdits: false,
      }
    }
    next = {
      ...next,
      bulletRecommendations: next.bulletRecommendations.map((r) => {
        const key = `bullet:${r.id}`
        if (!fieldKeys.includes(key)) return r
        return { ...r, syncFootprint: "queued" as const, hasUnpublishedEdits: false }
      }),
    }
    return next
  }

  next = { ...next, isPublishing: true }

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
  const moreTitlePending = hasPendingTitleBatches(nextBatches, batchId)

  let next: SkuContent = {
    ...prev,
    publishBatches: nextBatches,
    isPublishing: phase !== "done",
  }

  if (markSynced) {
    if (fieldKeys.includes("title")) {
      const snap = batch.fieldSnapshots?.title
      next = {
        ...next,
        titleSyncFootprint: moreTitlePending ? "queued" : "synced",
      }
      next = applySyncedFieldToPdp(next, "title", snap)
    }
    if (fieldKeys.includes("description")) {
      const snap = batch.fieldSnapshots?.description
      const moreDesc = nextBatches.some(
        (b) => b.fieldKeys.includes("description") && !b.completedAt && b.id !== batchId,
      )
      next = {
        ...next,
        descriptionSyncFootprint: moreDesc ? "queued" : "synced",
      }
      next = applySyncedFieldToPdp(next, "description", snap)
    }
    next = {
      ...next,
      bulletRecommendations: next.bulletRecommendations.map((r) => {
        const key = `bullet:${r.id}`
        if (!fieldKeys.includes(key)) return r
        const moreBullet = nextBatches.some(
          (b) => b.fieldKeys.includes(key) && !b.completedAt && b.id !== batchId,
        )
        return {
          ...r,
          syncFootprint: moreBullet ? "queued" : ("synced" as const),
          footprint: moreBullet ? undefined : "recently-updated",
        }
      }),
    }
    for (const fieldKey of fieldKeys) {
      if (fieldKey === "title" || fieldKey === "description") continue
      next = applySyncedFieldToPdp(next, fieldKey, batch.fieldSnapshots?.[fieldKey])
    }
  }

  if (phase === "done") {
    const stillActive = nextBatches.some(
      (b) => b.pim === "pending" || b.retailer === "pending" || b.pdp === "pending",
    )
    next.isPublishing = stillActive
  }

  return next
}

/**
 * Prototype pacing — absolute ms from publish start (production: often hours).
 * ~12s between each step so PIM → retailer → PDP chips are easy to read.
 */
export const PUBLISH_PHASE_DELAYS_MS = {
  pim_done: 12_000,
  retailer_done: 24_000,
  pdp_live: 36_000,
  done: 48_000,
} as const
