import type { PublishBatch, SkuContent } from "@/components/home/types"

export function getActivePublishBatch(content: SkuContent): PublishBatch | undefined {
  const batches = content.publishBatches ?? []
  return [...batches].reverse().find(
    (b) => b.pim === "pending" || b.retailer === "pending" || b.pdp === "pending",
  )
}

export function getLatestPublishBatch(content: SkuContent): PublishBatch | undefined {
  const batches = content.publishBatches ?? []
  return batches[batches.length - 1]
}

/** Batch that includes this field (most recent first). */
export function getPublishBatchForField(
  content: SkuContent,
  fieldKey: string,
): PublishBatch | undefined {
  const batches = content.publishBatches ?? []
  return [...batches].reverse().find((b) => b.fieldKeys.includes(fieldKey))
}
