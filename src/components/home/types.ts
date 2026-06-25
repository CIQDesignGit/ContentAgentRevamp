import type { PdpStatus, PimStatus, RetailerStatus } from "@/components/actions-log/types"

export type Metrics = { compliance: number; seo: number; aeo: number; ops: number }

export type ActionStatus = "to-do" | "in-progress" | "success"

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
  /** When false, this SKU exists only on the retailer PDP — no PIM catalog entry. */
  hasPimData?: boolean
  /** True when the user has bookmarked this SKU for later attention. Independent of actionStatus. */
  isBookmarked?: boolean
  actionStatus?: ActionStatus
}

export type ProductImage = { id: string; label: string; url?: string; hue?: number }

export type DiffSegment = { kind: "kept" | "added" | "removed"; text: string }

export type ReasonType = "ADDED" | "REMOVED" | "REPLACED"

export type Reason = { type: ReasonType; summary: string; detail: string }

export type ReasoningCategory = { key: string; label: string; reasons: Reason[] }

export type AltKeyword = {
  id: string
  keyword: string
  /** Amazon/Helium10 search rank index */
  rank: number
  /** Monthly search volume, e.g. "90.5K" */
  volume: string
  /** If defined, clicking Insert swaps this word in the recommendation text */
  replacesWord?: string
}

export type ShopperQuestion = {
  question: string
  /** What aspect of the recommendation content answers this question */
  answer: string
  /** True when this question is newly answerable — wasn't before the recommendation */
  isNew?: boolean
}

export type AeoPerformance = {
  /** LLM shopping assistants this was benchmarked against */
  sources: string[]
  questions: ShopperQuestion[]
}

export type TitleRecommendation = {
  agentName: string
  recommendedText: string
  diff: DiffSegment[]
  reasoning: ReasoningCategory[]
  altKeywords?: AltKeyword[]
  aeoPerformance?: AeoPerformance
}

export type TitleStatus = "pending" | "accepted" | "rejected"

/** Whether the title workflow started from AI reco vs Add/Edit title. */
export type TitleEditSource = "ai" | "manual"
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
  altKeywords?: AltKeyword[]
  aeoPerformance?: AeoPerformance
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
  /** Number of images present on the live PDP (legacy; prefer `images`). */
  imageCount: number
  /** Live retailer image slots — derived from `imageCount` when omitted in seed data. */
  images?: ProductImage[]
  lastUpdated: string
}

export type SkuContent = {
  /** When false, no PIM catalog entry exists — only PDP data is available. Defaults to true. */
  hasPimData?: boolean
  title: string
  bullets: string[]
  description: string
  images: ProductImage[]
  titleStatus: TitleStatus
  titleRecommendation: TitleRecommendation | null
  titleEditSource?: TitleEditSource
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
