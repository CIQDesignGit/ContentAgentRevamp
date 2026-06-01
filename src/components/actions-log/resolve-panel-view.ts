import type {
  ActionLogEntry,
  AttemptedChange,
  FieldCardView,
  FieldReflectionStatus,
  PanelScenario,
  PanelViewModel,
  PdpRemarks,
  PdpStatus,
  PimStatus,
  RetailerStatus,
  SyndicationRemarks,
  TimelineStep,
  TimelineVariant,
} from "./types"
import {
  isRejectedButLive,
  statusColorIntent,
  statusLabel,
  type StageStatus,
} from "./status-styles"

type EffectiveStage = StageStatus

function effectiveRetailerStatus(entry: ActionLogEntry): EffectiveStage {
  if (entry.pimStatus === "pending") return "pending"
  if (entry.pimStatus === "rejected") return "not_run"
  return entry.retailerStatus
}

function effectivePdpStatus(entry: ActionLogEntry): EffectiveStage {
  if (entry.pimStatus === "pending") return "pending"
  if (entry.pimStatus === "rejected") return "not_run"

  const retailer = effectiveRetailerStatus(entry)
  if (retailer === "pending") return "pending"
  if (retailer === "rejected" || retailer === "not_run") {
    if (isRejectedButLive(entry)) return entry.pdpStatus
    return "not_run"
  }

  return entry.pdpStatus
}

function variantFor(status: EffectiveStage): TimelineVariant {
  const intent = statusColorIntent(status)
  if (intent === "success") return "success"
  if (intent === "info") return "info"
  if (intent === "warning") return "warning"
  if (intent === "error") return "error"
  return "neutral"
}

function deriveTimeline(entry: ActionLogEntry): TimelineStep[] {
  const pimStatus: EffectiveStage = entry.pimStatus
  const retailerStatus = effectiveRetailerStatus(entry)
  const pdpStatus = effectivePdpStatus(entry)

  return [
    {
      stage: "PIM",
      statusKey: pimStatus,
      statusLabel: statusLabel(pimStatus),
      meta: entry.pimWrittenAt,
      variant: variantFor(pimStatus),
    },
    {
      stage: "Retailer",
      statusKey: retailerStatus,
      statusLabel: statusLabel(retailerStatus),
      meta: retailerStatus === "not_run" ? undefined : entry.retailerAt,
      variant: variantFor(retailerStatus),
    },
    {
      stage: "PDP",
      statusKey: pdpStatus,
      statusLabel: statusLabel(pdpStatus),
      meta: pdpMeta(entry, pdpStatus),
      variant: variantFor(pdpStatus),
    },
  ]
}

function pdpMeta(entry: ActionLogEntry, status: EffectiveStage): string | undefined {
  if (status === "not_run") return undefined
  if (status === "pending" && entry.pdpProgress) {
    return `day ${entry.pdpProgress.day} of ${entry.pdpProgress.total}`
  }
  if (status === "partially_live" && entry.fieldsLive) {
    return `${entry.fieldsLive.live} of ${entry.fieldsLive.total} fields`
  }
  return entry.pdpAt
}

function deriveScenario(entry: ActionLogEntry): PanelScenario {
  if (entry.panelScenario) return entry.panelScenario
  if (isRejectedButLive(entry)) return "rejected_but_live"
  if (entry.pimStatus === "rejected" || entry.retailerStatus === "rejected") {
    return "rejected"
  }
  if (entry.pdpStatus === "live") return "live"
  if (entry.pdpStatus === "partially_live") return "partially_live"
  if (entry.pdpStatus === "not_reflected") return "not_reflected"
  return "pending"
}

const SCENARIO_LABELS: Record<PanelScenario, string> = {
  live: "Live",
  pending: "Pending",
  partially_live: "Partially live",
  not_reflected: "Not reflected",
  rejected: "Rejected",
  rejected_but_live: "Rejected · live on PDP",
  loading: "Loading",
}

function deriveRemarks(entry: ActionLogEntry): PdpRemarks | SyndicationRemarks | null {
  if (
    (entry.pimStatus === "rejected" || entry.retailerStatus === "rejected") &&
    entry.syndicationRemarksDetail
  ) {
    return entry.syndicationRemarksDetail
  }

  const pdpStatus = effectivePdpStatus(entry)
  const hasNotReflected = entry.attemptedChanges.some(
    (c) => c.fieldReflection === "not_reflected",
  )

  if (
    pdpStatus === "partially_live" ||
    pdpStatus === "not_reflected" ||
    hasNotReflected
  ) {
    return entry.pdpRemarks ?? null
  }

  return null
}

function deriveBodyMode(entry: ActionLogEntry): PanelViewModel["bodyMode"] {
  const retailer = effectiveRetailerStatus(entry)
  const pdp = effectivePdpStatus(entry)
  if (
    (entry.pimStatus === "rejected" || retailer === "rejected") &&
    pdp === "not_run"
  ) {
    return "attempted_not_applied"
  }
  return "change_record"
}

function defaultFieldReflection(
  entry: ActionLogEntry,
  change: AttemptedChange,
): FieldReflectionStatus {
  if (change.fieldReflection) return change.fieldReflection

  const pdp = effectivePdpStatus(entry)

  if (isRejectedButLive(entry)) {
    return change.liveDate ? "live" : "not_submitted"
  }
  if (entry.retailerStatus === "pending" || entry.pimStatus === "pending") {
    return "submitted"
  }
  if (pdp === "live") return "live"
  if (pdp === "pending") return "pending"
  if (pdp === "partially_live" || pdp === "not_reflected") return "pending"
  return "not_submitted"
}

function chipLabelFor(status: FieldReflectionStatus, liveDate?: string): string {
  switch (status) {
    case "live":
      return liveDate ? `Live · ${liveDate}` : "Live"
    case "pending":
      return "Pending"
    case "not_reflected":
      return "Not reflected"
    case "submitted":
      return "Submitted"
    default:
      return ""
  }
}

function deriveFieldViews(entry: ActionLogEntry): FieldCardView[] {
  if (deriveBodyMode(entry) === "attempted_not_applied") return []

  const views: FieldCardView[] = []
  for (const change of entry.attemptedChanges) {
    const reflectionStatus = defaultFieldReflection(entry, change)
    if (reflectionStatus === "not_submitted") continue
    const liveDate =
      change.type === "text" || change.type === "bullets" ? change.liveDate : undefined
    views.push({
      change,
      reflectionStatus,
      chipLabel: chipLabelFor(reflectionStatus, liveDate),
    })
  }
  return views
}

/** Table display: apply cascade for downstream columns. */
export function effectiveTableStatuses(entry: ActionLogEntry): {
  pim: PimStatus | "not_run"
  retailer: RetailerStatus | "not_run" | "pending"
  pdp: PdpStatus | "not_run" | "pending"
} {
  return {
    pim: entry.pimStatus,
    retailer: effectiveRetailerStatus(entry) as RetailerStatus | "not_run" | "pending",
    pdp: effectivePdpStatus(entry) as PdpStatus | "not_run" | "pending",
  }
}

export function resolvePanelView(entry: ActionLogEntry): PanelViewModel {
  const scenario = deriveScenario(entry)
  return {
    scenario,
    scenarioLabel: SCENARIO_LABELS[scenario],
    timeline: deriveTimeline(entry),
    remarks: deriveRemarks(entry),
    bodyMode: deriveBodyMode(entry),
    fieldViews: deriveFieldViews(entry),
    attemptedFields: entry.attemptedChanges.map((c) => c.field),
    showRejectedButLiveBanner: isRejectedButLive(entry),
  }
}
