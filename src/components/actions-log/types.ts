export type LogStatus = "pending" | "success" | "failed" | "cancelled"

export type PimStatus = "accepted" | "pending" | "rejected"
export type RetailerStatus = "accepted" | "pending" | "rejected"
export type PdpStatus =
  | "live"
  | "pending"
  | "partially_live"
  | "not_reflected"
  | "not_run"
  | "verification_unavailable"

export type PanelScenario =
  | "live"
  | "pending"
  | "partially_live"
  | "not_reflected"
  | "rejected"
  | "rejected_but_live"
  | "loading"

export type ChangeKind = "edit" | "add" | "remove"
export type FieldReflectionStatus = "live" | "pending" | "not_reflected" | "submitted" | "not_submitted"

export interface ChangeSegment {
  text: string
  variant?: "removed" | "added"
}

export type TimelineVariant = "success" | "info" | "warning" | "error" | "neutral"

export interface TimelineStep {
  stage: "PIM" | "Retailer" | "PDP"
  statusKey: PimStatus | RetailerStatus | PdpStatus | "not_run"
  statusLabel: string
  meta?: string
  variant: TimelineVariant
}

export interface TextFieldChange {
  type: "text"
  field: "Title" | "Description"
  changeKind: ChangeKind
  liveDate?: string
  fieldReflection?: FieldReflectionStatus
  before: ChangeSegment[] | null
  after: ChangeSegment[] | null
}

export interface BulletsFieldChange {
  type: "bullets"
  field: "Bullets"
  changeKind: ChangeKind
  liveDate?: string
  fieldReflection?: FieldReflectionStatus
  items: { text: string; added?: boolean; removed?: boolean }[]
}

export type AttemptedChange = TextFieldChange | BulletsFieldChange

export interface PdpProgress {
  day: number
  total: number
}

export interface FieldsLive {
  live: number
  total: number
}

export interface PdpRemarks {
  kind: "pdp"
  headline: string
  body: string
  fields?: string[]
  likelyCause?: string
  nextStep?: string
}

export interface SyndicationRemarks {
  kind: "syndication"
  headline: string
  plainTerms: string
  errors: string[]
  suggestedFix: string
  rawText: string
  stage?: "pim" | "retailer"
}

export interface ActionLogEntry {
  id: string
  skuId: string
  name?: string
  thumbnailUrl?: string
  pimStatus: PimStatus
  retailerStatus: RetailerStatus
  pdpStatus: PdpStatus
  syndicationRemarks?: string
  actionedOn: string
  actionedShort: string
  updatedBy: string
  status: LogStatus
  pimWrittenAt: string
  retailerAt?: string
  pdpAt?: string
  attemptedChanges: AttemptedChange[]
  pdpRemarks?: PdpRemarks
  syndicationRemarksDetail?: SyndicationRemarks
  pdpProgress?: PdpProgress
  fieldsLive?: FieldsLive
  flaggedForFde?: boolean
  panelScenario?: PanelScenario
}

export type StatusTabKey = "all" | LogStatus

export interface FieldCardView {
  change: AttemptedChange
  reflectionStatus: FieldReflectionStatus
  chipLabel: string
}

export type PanelBodyMode = "change_record" | "attempted_not_applied"

export interface PanelViewModel {
  scenario: PanelScenario
  scenarioLabel: string
  timeline: TimelineStep[]
  remarks: PdpRemarks | SyndicationRemarks | null
  bodyMode: PanelBodyMode
  fieldViews: FieldCardView[]
  attemptedFields: string[]
  showRejectedButLiveBanner: boolean
}
