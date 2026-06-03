import type { PublishBatch, SyncFootprint } from "@/components/home/types"

/** PIM / PDP column text while a field is publishing or live. */
export function resolvePublishedSourceDisplay(
  pimValue: string,
  pdpValue: string,
  publishedText: string | undefined,
  syncFootprint?: SyncFootprint,
  batch?: PublishBatch,
): { pim: string; pdp: string } {
  if (!publishedText?.trim()) {
    return { pim: pimValue, pdp: pdpValue }
  }

  const fp = syncFootprint ?? "none"

  if (fp === "synced") {
    return { pim: publishedText, pdp: publishedText }
  }

  if (fp === "syncing") {
    if (!batch) {
      return { pim: publishedText, pdp: publishedText }
    }

    const pimPublished = batch.pim === "accepted"
    const pdpPublished =
      batch.pdp === "live" ||
      batch.pdp === "pending" ||
      batch.retailer === "accepted"

    return {
      pim: pimPublished ? publishedText : pimValue,
      pdp: pdpPublished ? publishedText : pdpValue,
    }
  }

  return { pim: pimValue, pdp: pdpValue }
}
