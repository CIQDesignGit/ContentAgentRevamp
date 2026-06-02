import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock,
  FileQuestionMark,
  Minus,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PdpStatus, PimStatus, RetailerStatus, StatusTabKey } from "./types"
import { COLOR_INTENT_CLASSES, statusColorIntent, statusLabel } from "./status-styles"

interface BadgeSpec {
  icon: LucideIcon
}

const PIM_SPECS: Record<PimStatus, BadgeSpec> = {
  accepted: { icon: Check },
  pending: { icon: Clock },
  rejected: { icon: X },
}

const RETAILER_SPECS: Record<RetailerStatus | "not_run", BadgeSpec> = {
  accepted: { icon: Check },
  pending: { icon: Clock },
  rejected: { icon: X },
  not_run: { icon: Minus },
}

const PDP_SPECS: Record<PdpStatus, BadgeSpec> = {
  live: { icon: CheckCircle2 },
  pending: { icon: Clock },
  partially_live: { icon: FileQuestionMark },
  not_reflected: { icon: AlertTriangle },
  not_run: { icon: Minus },
  verification_unavailable: { icon: CircleHelp },
}

function NotAvailableMark() {
  return (
    <span
      className="inline-block text-sm text-slate-400"
      aria-label="Not available"
      title="—"
    >
      —
    </span>
  )
}

function StageBadge({
  status,
  spec,
}: {
  status: string
  spec: BadgeSpec
}) {
  const intent = statusColorIntent(status as Parameters<typeof statusColorIntent>[0])
  const colors = COLOR_INTENT_CLASSES[intent]
  const Icon = spec.icon
  const label = statusLabel(status as Parameters<typeof statusLabel>[0])

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        colors.chip,
      )}
    >
      <Icon className={cn("size-3 shrink-0", colors.icon)} />
      {label}
    </span>
  )
}

export function stageStatusIcon(
  stage: "PIM" | "Retailer" | "PDP",
  status: PimStatus | RetailerStatus | PdpStatus | "not_run",
) {
  if (stage === "PIM") {
    if (status === "not_run") return Minus
    return PIM_SPECS[status as PimStatus].icon
  }
  if (stage === "Retailer") {
    const key = status === "not_run" ? "not_run" : (status as RetailerStatus)
    return RETAILER_SPECS[key].icon
  }
  const key = status === "not_run" ? "not_run" : (status as PdpStatus)
  return PDP_SPECS[key].icon
}

export function PimStatusBadge({ status }: { status: PimStatus | "not_run" }) {
  if (status === "not_run") {
    return <NotAvailableMark />
  }
  return <StageBadge status={status} spec={PIM_SPECS[status]} />
}

export function RetailerStatusBadge({
  status,
}: {
  status: RetailerStatus | "not_run" | "pending"
}) {
  const key = status === "pending" ? "pending" : status
  if (key === "not_run") {
    return <NotAvailableMark />
  }
  return <StageBadge status={key} spec={RETAILER_SPECS[key as RetailerStatus]} />
}

export function PdpStatusBadge({
  status,
}: {
  status: PdpStatus | "not_run" | "pending"
}) {
  const key = status === "pending" ? "pending" : status
  if (key === "not_run") {
    return <NotAvailableMark />
  }
  return <StageBadge status={key} spec={PDP_SPECS[key as PdpStatus]} />
}

export function PanelScenarioBadge({
  scenario,
  label,
}: {
  scenario: string
  label: string
}) {
  const intent =
    scenario === "live"
      ? COLOR_INTENT_CLASSES.success
      : scenario === "pending"
        ? COLOR_INTENT_CLASSES.info
        : scenario === "partially_live" || scenario === "not_reflected"
          ? COLOR_INTENT_CLASSES.warning
          : scenario === "rejected_but_live"
            ? COLOR_INTENT_CLASSES.warning
            : scenario === "rejected"
              ? COLOR_INTENT_CLASSES.error
              : COLOR_INTENT_CLASSES.neutral

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        intent.chip,
      )}
    >
      {label}
    </span>
  )
}

export function TabStatusIcon({
  tab,
  className,
}: {
  tab: Exclude<StatusTabKey, "all">
  className?: string
}) {
  if (tab === "pending") {
    return <Clock className={cn("size-3.5 text-info-600", className)} />
  }
  if (tab === "live_on_pdp") {
    return <Check className={cn("size-3.5 text-success-600", className)} />
  }
  if (tab === "needs_attention") {
    return <AlertTriangle className={cn("size-3.5 text-warning-600", className)} />
  }
  return <Minus className={cn("size-3.5 text-slate-400", className)} />
}
