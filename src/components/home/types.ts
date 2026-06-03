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

/** Post-accept lifecycle shown on the bullet slot (no new AI suggestion yet). */
export type BulletRecoFootprint = "processing" | "recently-updated"

export type BulletRecommendation = {
  id: string
  label: string
  recommendedText: string
  status: BulletRecoStatus
  kind: "edit" | "add"
  reasoning: ReasoningCategory[]
  /** Index in PIM bullets to replace when kind is "edit" */
  pimIndex?: number
  /**
   * When accepted: `processing` = propagating to channels (PIM/PDP cells show reco text).
   * `recently-updated` = synced, no further AI optimization; last reco available to tweak.
   */
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
  descriptionStatus: TitleStatus
  descriptionRecommendation: TitleRecommendation | null
  bulletRecommendations: BulletRecommendation[]
  pdpContent: PdpContent
}

export type ContentState = Record<string, SkuContent>
