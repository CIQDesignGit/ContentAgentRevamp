import type { BulletRecommendation, SyncFootprint } from "@/components/home/types"

/** Resolves sync state from new field or legacy bullet footprint. */
export function resolveBulletSyncFootprint(reco: BulletRecommendation): SyncFootprint {
  if (reco.syncFootprint) return reco.syncFootprint
  if (reco.footprint === "processing") return "syncing"
  if (reco.footprint === "recently-updated") return "synced"
  return "none"
}

export function resolveFieldSyncFootprint(
  footprint: SyncFootprint | undefined,
): SyncFootprint {
  return footprint ?? "none"
}

export function isFieldSyncing(footprint: SyncFootprint): boolean {
  return footprint === "syncing"
}

/** Accepted field has entered publish / syndication (no review accept/undo). */
export function isFieldInSyndication(footprint: SyncFootprint): boolean {
  return footprint === "syncing" || footprint === "synced" || footprint === "queued"
}
