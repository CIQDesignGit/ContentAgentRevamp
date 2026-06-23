"use client"

import { Check, Minus, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionStatusBadge } from "./action-status-badge"
import type { Sku } from "./types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CardMetric({ label, value }: { label: string; value: number }) {
  const isBad = value < 40
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]",
      isBad ? "border-error-100 bg-error-50 text-slate-500" : "border-slate-200 bg-white text-slate-500",
    )}>
      {label}
      <span className={cn("font-semibold tabular-nums", isBad ? "text-error-600" : "text-slate-700")}>
        {value}%
      </span>
    </span>
  )
}

function SkuThumb({ sku }: { sku: Sku }) {
  if (sku.thumbnailUrl) {
    return (
      <img
        src={sku.thumbnailUrl}
        alt=""
        className="size-11 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-contain p-0.5"
      />
    )
  }
  return <div className="size-11 shrink-0 rounded-lg border border-slate-100 bg-slate-100" aria-hidden />
}

// Exported so SkuSidebar's master-select header can reuse it
export function Checkbox({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  if (checked) {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-brand-500">
        <Check className="size-2.5 stroke-3 text-white" />
      </span>
    )
  }
  if (indeterminate) {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-brand-200">
        <Minus className="size-2.5 stroke-3 text-brand-600" />
      </span>
    )
  }
  return <Square className="size-4 shrink-0 text-slate-300" />
}

// ─── Shared card props ────────────────────────────────────────────────────────

export interface SkuCardProps {
  sku: Sku
  isActive: boolean
  isSelected: boolean
  isSelectionMode: boolean
  /** When true the quality-score chips are hidden — used by Title Optimization page */
  hideMetrics: boolean
  onSelect: () => void
  onToggle: () => void
}

// ─── Meta row — ASIN · Brand · Category + optional status badge ───────────────

function MetaRow({ sku, isActive }: { sku: Sku; isActive: boolean }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <p className="flex min-w-0 flex-wrap items-center gap-1">
        {/* ASIN is the primary identifier — one step stronger than brand/category */}
        <span className="font-mono text-xs text-slate-500">{sku.asin}</span>
        <span aria-hidden className="size-1 rounded-full bg-slate-300" />
        <span className="text-xs text-slate-400">{sku.brand}</span>
        <span aria-hidden className="size-1 rounded-full bg-slate-300" />
        <span className="text-xs text-slate-400">{sku.category}</span>
      </p>
      {sku.actionStatus && (
        <ActionStatusBadge status={sku.actionStatus} showLabel={false} />
      )}
    </div>
  )
}

// ─── PDP-only tag ─────────────────────────────────────────────────────────────

function PdpOnlyTag({ isActive }: { isActive: boolean }) {
  return (
    <span className={cn(
      "inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide",
      isActive
        ? "border-brand-300 bg-brand-100 text-primary"
        : "border-brand-200 bg-brand-50 text-brand-700",
    )}>
      PDP only
    </span>
  )
}

// ─── Base card ────────────────────────────────────────────────────────────────

export function SkuCard({ sku, isActive, isSelected, isSelectionMode, hideMetrics, onSelect, onToggle }: SkuCardProps) {
  return (
    <button
      type="button"
      onClick={() => (isSelectionMode ? onToggle() : onSelect())}
      className={cn(
        "flex flex-col w-full overflow-hidden rounded-xl border text-left transition-colors",
        isSelectionMode
          ? isSelected
            ? "border-brand-200 bg-brand-25"
            : "border-slate-200 bg-white hover:bg-slate-50"
          : isActive
            ? "border-primary bg-brand-25"
            : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      {isSelectionMode ? (
        <div className="flex flex-col gap-2 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <Checkbox checked={isSelected} />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
              <p className="flex min-w-0 flex-wrap items-center gap-1">
                <span className="font-mono text-xs text-slate-500">{sku.asin}</span>
                <span aria-hidden className="size-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-400">{sku.brand}</span>
                <span aria-hidden className="size-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-400">{sku.category}</span>
              </p>
              {sku.actionStatus && (
                <ActionStatusBadge status={sku.actionStatus} showLabel={false} />
              )}
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <SkuThumb sku={sku} />
            {/* font-semibold: title must read as the dominant element */}
            <p className="line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-slate-700">
              {sku.title}
            </p>
          </div>
          {sku.hasPimData === false && <PdpOnlyTag isActive={false} />}
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-3 pb-2.5 pt-3">
          <MetaRow sku={sku} isActive={isActive} />
          <div className="flex gap-3">
            <SkuThumb sku={sku} />
            <p className="line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-slate-700">
              {sku.title}
            </p>
          </div>
          {sku.hasPimData === false && <PdpOnlyTag isActive={isActive} />}
        </div>
      )}

      {/* Metrics zone — border-t creates a clear visual break from the identity section above */}
      {!hideMetrics && (
        <div className="flex items-center gap-1.5 border-t border-slate-100 px-3 py-2">
          <CardMetric label="Compliance" value={sku.metrics.compliance} />
          <CardMetric label="SEO" value={sku.metrics.seo} />
          <CardMetric label="AEO" value={sku.metrics.aeo} />
        </div>
      )}
    </button>
  )
}

// ─── Named card variants ──────────────────────────────────────────────────────

type SkuCardVariantProps = Omit<SkuCardProps, "hideMetrics">

/** Card for the Content Agent (home) review page — shows quality score chips */
export function ContentAgentSkuCard(props: SkuCardVariantProps) {
  return <SkuCard {...props} hideMetrics={false} />
}

/** Card for the Title Optimization page — no quality score chips */
export function TitleOptimizationSkuCard(props: SkuCardVariantProps) {
  return <SkuCard {...props} hideMetrics={true} />
}
