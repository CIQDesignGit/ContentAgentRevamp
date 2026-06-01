import type { PdpStatus, PimStatus, RetailerStatus } from "./types"

export type StageStatus =
  | PimStatus
  | RetailerStatus
  | PdpStatus
  | "not_run"

export type StatusColorIntent = "success" | "info" | "warning" | "error" | "neutral"

/** Display labels — use exactly as specified. */
export const STAGE_STATUS_LABELS: Record<string, string> = {
  accepted: "Accepted",
  pending: "Pending",
  rejected: "Rejected",
  live: "Live",
  partially_live: "Partially live",
  not_reflected: "Not reflected",
  not_run: "—",
  verification_unavailable: "Verification unavailable",
}

export function statusLabel(status: StageStatus): string {
  return STAGE_STATUS_LABELS[status] ?? status
}

/** Colour intent: Green=Accepted/Live, Blue=Pending, Amber=Partial/Not reflected, Red=Rejected, Grey=—/unavailable */
export function statusColorIntent(status: StageStatus): StatusColorIntent {
  if (status === "not_run" || status === "verification_unavailable") return "neutral"
  if (status === "rejected") return "error"
  if (status === "pending") return "info"
  if (status === "partially_live" || status === "not_reflected") return "warning"
  if (status === "live" || status === "accepted") return "success"
  return "neutral"
}

export const COLOR_INTENT_CLASSES: Record<
  StatusColorIntent,
  { chip: string; text: string; icon: string }
> = {
  success: {
    chip: "bg-success-50 text-success-700 border-success-100",
    text: "text-success-700",
    icon: "text-success-600",
  },
  info: {
    chip: "bg-info-50 text-info-700 border-info-100",
    text: "text-info-700",
    icon: "text-info-600",
  },
  warning: {
    chip: "bg-warning-50 text-warning-700 border-warning-200",
    text: "text-warning-700",
    icon: "text-warning-600",
  },
  error: {
    chip: "bg-error-50 text-error-700 border-error-100",
    text: "text-error-700",
    icon: "text-error-600",
  },
  neutral: {
    chip: "bg-slate-100 text-slate-500 border-slate-200",
    text: "text-slate-500",
    icon: "text-slate-500",
  },
}

export function isRejectedButLive(entry: {
  retailerStatus: RetailerStatus
  pimStatus: PimStatus
  pdpStatus: PdpStatus
}): boolean {
  const upstreamRejected =
    entry.pimStatus === "rejected" || entry.retailerStatus === "rejected"
  const pdpShowsContent =
    entry.pdpStatus === "live" || entry.pdpStatus === "partially_live"
  return upstreamRejected && pdpShowsContent
}
