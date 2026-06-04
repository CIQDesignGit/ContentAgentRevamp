import type { PublishBatch, SkuContent, SyncFootprint } from "@/components/home/types"
import { getActivePublishBatch } from "@/lib/publish-batch"

export type FieldPublishQueueItem = {
  batchId: string
  text: string
  footprint: SyncFootprint
  batch: PublishBatch
}

function resolveBatchQueueFootprint(
  batch: PublishBatch,
  activeBatch?: PublishBatch,
): SyncFootprint {
  if (batch.completedAt) return "synced"
  if (activeBatch?.id === batch.id) return "syncing"
  return "queued"
}

function fieldText(content: SkuContent, fieldKey: string, batch: PublishBatch): string {
  const snapshot = batch.fieldSnapshots?.[fieldKey]
  if (snapshot) return snapshot
  if (fieldKey === "title") {
    return content.titleRecommendation?.recommendedText?.trim() || content.title
  }
  if (fieldKey === "description") {
    return content.descriptionRecommendation?.recommendedText?.trim() || content.description
  }
  if (fieldKey.startsWith("bullet:")) {
    const id = fieldKey.slice("bullet:".length)
    return content.bulletRecommendations.find((r) => r.id === id)?.recommendedText ?? ""
  }
  return ""
}

/** Pending publish batches for one field (oldest first). */
export function getFieldPublishQueue(
  content: SkuContent,
  fieldKey: string,
): FieldPublishQueueItem[] {
  const activeBatch = getActivePublishBatch(content)
  const batches = content.publishBatches ?? []

  return batches
    .filter((b) => b.fieldKeys.includes(fieldKey) && !b.completedAt)
    .map((batch) => ({
      batchId: batch.id,
      text: fieldText(content, fieldKey, batch),
      footprint: resolveBatchQueueFootprint(batch, activeBatch),
      batch,
    }))
}

export function countPendingFieldQueue(content: SkuContent, fieldKey: string): number {
  return getFieldPublishQueue(content, fieldKey).length
}
