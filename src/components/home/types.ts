import type { PdpStatus, PimStatus, RetailerStatus } from "@/components/actions-log/types"

export type Metrics = { compliance: number; seo: number; aeo: number }

export type SalsifyIssue = {
  type: "error" | "warning"
  label: string
}

export type Sku = {
  id: string
  asin: string
  category: string
  brand: string
  title: string
  productId: string
  thumbnailUrl?: string
  thumbnailHue?: number
  metrics: Metrics
  salsifyIssues: SalsifyIssue[]
  lastUpdated: string
}

export type ProductImage = { id: string; label: string; url?: string; hue?: number }

export type DiffSegment = { kind: "kept" | "added" | "removed"; text: string }

export type ReasonType = "ADDED" | "REMOVED" | "REPLACED"

export type Reason = { type: ReasonType; summary: string; detail: string }

export type ReasoningCategory = { key: string; label: string; reasons: Reason[] }

export type TitleRecommendation = {
  agentName: string
  recommendedText: string
  diff: DiffSegment[]
  reasoning: ReasoningCategory[]
}

export type TitleStatus = "pending" | "accepted" | "rejected"
export type BulletRecoStatus = "pending" | "accepted" | "rejected"

/** @deprecated Use syncFootprint — kept for mock data migration */
export type BulletRecoFootprint = "processing" | "recently-updated"

/** Per-field syndication lifecycle after publish */
export type SyncFootprint = "none" | "syncing" | "synced" | "queued"

export type PublishBatch = {
  id: string
  startedAt: string
  /** When PIM + PDP both finished updating for this batch. */
  completedAt?: string
  fieldKeys: string[]
  /** Text captured at publish time, keyed by field (e.g. title, description). */
  fieldSnapshots?: Record<string, string>
  pim: PimStatus | "idle"
  retailer: RetailerStatus | "idle"
  pdp: PdpStatus
  queuedFollowUp?: boolean
}

export type BulletRecommendation = {
  id: string
  label: string
  recommendedText: string
  status: BulletRecoStatus
  kind: "edit" | "add"
  reasoning: ReasoningCategory[]
  pimIndex?: number
  syncFootprint?: SyncFootprint
  hasUnpublishedEdits?: boolean
  /** @deprecated Use syncFootprint */
  footprint?: BulletRecoFootprint
}

export type PdpContent = {
  title: string
  bullets: string[]
  description: string
  imageCount: number
  lastUpdated: string
}

export type SkuContent = {
  title: string
  bullets: string[]
  description: string
  images: ProductImage[]
  titleStatus: TitleStatus
  titleRecommendation: TitleRecommendation | null
  titleSyncFootprint?: SyncFootprint
  titleHasUnpublishedEdits?: boolean
  descriptionStatus: TitleStatus
  descriptionRecommendation: TitleRecommendation | null
  descriptionSyncFootprint?: SyncFootprint
  descriptionHasUnpublishedEdits?: boolean
  bulletRecommendations: BulletRecommendation[]
  pdpContent: PdpContent
  publishBatches?: PublishBatch[]
  isPublishing?: boolean
}

export type ContentState = Record<string, SkuContent>
