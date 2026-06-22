"use client"

import { AlignJustify, Check, Minus, PanelLeftOpen, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BulkField } from "./bulk-publish-confirm-dialog"
import type { Sku } from "./types"

// All fields forwarded to the confirm dialog — no per-field toggle in sidebar
const ALL_BULK_FIELDS: BulkField[] = ["title", "images", "bullets", "description"]

// ─── Small helpers ────────────────────────────────────────────────────────────

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

function Checkbox({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
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

// ─── SKU card — switches between normal (vertical) and selection (horizontal) ─

interface SkuCardProps {
  sku: Sku
  isActive: boolean
  isSelected: boolean
  isSelectionMode: boolean
  hideMetrics: boolean
  onSelect: () => void
  onToggle: () => void
}

function SkuCard({ sku, isActive, isSelected, isSelectionMode, hideMetrics, onSelect, onToggle }: SkuCardProps) {
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
        // Two-row layout:
        // Row 1: [checkbox] [ASIN · Brand · Category]
        // Row 2: [avatar]   [Title]
        <div className="flex flex-col gap-2 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <Checkbox checked={isSelected} />
            <p className="flex flex-wrap items-center gap-1">
              <span className="font-mono text-[10px] text-slate-400">{sku.asin}</span>
              <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
              <span className="text-[10px] text-slate-400">{sku.brand}</span>
              <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
              <span className="text-[10px] text-slate-400">{sku.category}</span>
              {sku.hasPimData === false && (
                <span className="inline-flex items-center rounded-md border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-brand-700">
                  PDP only
                </span>
              )}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <SkuThumb sku={sku} />
            <p className="line-clamp-2 flex-1 text-[13px] font-medium leading-snug text-slate-700">
              {sku.title}
            </p>
          </div>
        </div>
      ) : (
        // Normal vertical layout: meta row → [avatar + title]
        <div className="flex flex-col gap-2 px-3 pb-2.5 pt-3">
          <p className="flex flex-wrap items-center gap-1">
            <span className="font-mono text-[10px] text-slate-400">{sku.asin}</span>
            <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
            <span className="text-[10px] text-slate-400">{sku.brand}</span>
            <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
            <span className="text-[10px] text-slate-400">{sku.category}</span>
            {sku.hasPimData === false && (
              <span className={cn(
                "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide",
                isActive
                  ? "border-brand-300 bg-brand-100 text-primary"
                  : "border-brand-200 bg-brand-50 text-brand-700",
              )}>
                PDP only
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <SkuThumb sku={sku} />
            <p className="line-clamp-2 flex-1 text-[13px] font-medium leading-snug text-slate-700">
              {sku.title}
            </p>
          </div>
        </div>
      )}

      {/* Metrics chips — shown in both normal and selection mode */}
      {!hideMetrics && (
        <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-0">
          <CardMetric label="Compliance" value={sku.metrics.compliance} />
          <CardMetric label="SEO" value={sku.metrics.seo} />
          <CardMetric label="AEO" value={sku.metrics.aeo} />
        </div>
      )}
    </button>
  )
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

interface SkuSidebarProps {
  skus: Sku[]
  selectedSkuId: string
  onSelect: (id: string) => void
  totalCount: number
  collapsed: boolean
  onToggle: () => void
  hideMetrics?: boolean
  isSelectionMode?: boolean
  selectedSkuIds?: Set<string>
  onToggleSelectionMode?: () => void
  onToggleSkuSelection?: (id: string) => void
  onSelectAllSkus?: () => void
  onDeselectAllSkus?: () => void
  onBulkAcceptAndPublish?: (fields: BulkField[]) => void
  /** Called when "Review" is clicked — defaults to exiting selection mode */
  onBulkReview?: () => void
}

export function SkuSidebar({
  skus,
  selectedSkuId,
  onSelect,
  totalCount,
  collapsed,
  onToggle,
  hideMetrics = false,
  isSelectionMode = false,
  selectedSkuIds = new Set(),
  onToggleSelectionMode = () => {},
  onToggleSkuSelection = () => {},
  onSelectAllSkus = () => {},
  onDeselectAllSkus = () => {},
  onBulkAcceptAndPublish = () => {},
  onBulkReview,
}: SkuSidebarProps) {
  if (collapsed) {
    return (
      <aside className="flex w-10 shrink-0 flex-col items-center border-r border-slate-200 bg-white pt-4">
        <button
          type="button"
          aria-label="Expand panel"
          onClick={onToggle}
          className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          <PanelLeftOpen className="size-4" />
        </button>
      </aside>
    )
  }

  const selectedCount = selectedSkuIds.size
  const allSelected = selectedCount === skus.length && skus.length > 0
  const someSelected = selectedCount > 0 && !allSelected

  return (
    <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-start justify-between px-4 pb-2 pt-4">
        {isSelectionMode ? (
          <>
            {/* Master checkbox + count + subtitle */}
            <button
              type="button"
              aria-label={allSelected ? "Deselect all" : "Select all"}
              onClick={allSelected ? onDeselectAllSkus : onSelectAllSkus}
              className="flex items-start gap-2 rounded-md px-1 py-0.5 hover:bg-slate-50"
            >
              <span className="mt-0.5">
                <Checkbox checked={allSelected} indeterminate={someSelected} />
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">
                  {selectedCount > 0
                    ? `${selectedCount.toLocaleString()} selected`
                    : "Select SKUs"}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={onToggleSelectionMode}
              className="mt-0.5 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-sm font-semibold text-slate-700">SKUs with Issues</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Showing {skus.length} of {totalCount}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleSelectionMode}
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                Select
              </button>
              <button
                type="button"
                aria-label="Collapse panel"
                onClick={onToggle}
                className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <AlignJustify className="size-4" />
              </button>
            </div>
          </>
        )}
      </div>


      {/* ── SKU list ─────────────────────────────────────────────────────────── */}
      {skus.length === 0 ? (
        <p className="px-4 pb-4 text-xs text-slate-500">No SKUs match the current filter.</p>
      ) : (
        <ul className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-4">
          {skus.map((sku) => (
            <li key={sku.id}>
              <SkuCard
                sku={sku}
                isActive={sku.id === selectedSkuId}
                isSelected={selectedSkuIds.has(sku.id)}
                isSelectionMode={isSelectionMode}
                hideMetrics={hideMetrics}
                onSelect={() => onSelect(sku.id)}
                onToggle={() => onToggleSkuSelection(sku.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* ── Bottom action bar — visible when ≥1 SKU is selected ──────────────── */}
      {isSelectionMode && selectedCount > 0 && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {selectedCount.toLocaleString()} SKU{selectedCount !== 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">ready to bulk approve</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-brand-200 text-xs text-brand-600 hover:bg-brand-50"
              onClick={onBulkReview ?? onToggleSelectionMode}
            >
              Review
            </Button>
            <Button
              size="sm"
              className="bg-brand-500 text-xs text-white hover:bg-brand-600"
              onClick={() => onBulkAcceptAndPublish(ALL_BULK_FIELDS)}
            >
              Bulk approve
            </Button>
          </div>
        </div>
      )}
    </aside>
  )
}
