"use client"

import { useState } from "react"
import { AlignJustify, AlignLeft, Check, Image, List, Minus, PanelLeftOpen, Square, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BulkField } from "./bulk-publish-confirm-dialog"
import type { Sku } from "./types"

const BULK_FIELDS: { id: BulkField; label: string; icon: React.ElementType }[] = [
  { id: "title",       label: "Title",       icon: Type      },
  { id: "images",      label: "Images",      icon: Image     },
  { id: "bullets",     label: "Bullets",     icon: List      },
  { id: "description", label: "Description", icon: AlignLeft },
]

function CardMetric({ label, value }: { label: string; value: number }) {
  const isBad = value < 40
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]",
        isBad ? "border-error-100 bg-error-50 text-slate-500" : "border-slate-200 bg-white text-slate-500",
      )}
    >
      {label}
      <span className={cn("font-semibold tabular-nums", isBad ? "text-error-600" : "text-slate-700")}>
        {value}%
      </span>
    </span>
  )
}

function SkuThumb({ sku }: { sku: Sku }) {
  if (sku.thumbnailUrl) {
    return <img src={sku.thumbnailUrl} alt="" className="size-11 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-contain p-0.5" />
  }
  return <div className="size-11 shrink-0 rounded-lg border border-slate-100 bg-slate-100" aria-hidden />
}

// Inline checkbox — reused for both per-card and master checkbox
function Checkbox({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  if (checked) {
    return (
      <span className="flex size-4 items-center justify-center rounded-[3px] bg-brand-500 shrink-0">
        <Check className="size-2.5 stroke-3 text-white" />
      </span>
    )
  }
  if (indeterminate) {
    return (
      <span className="flex size-4 items-center justify-center rounded-[3px] bg-brand-200 shrink-0">
        <Minus className="size-2.5 stroke-3 text-brand-600" />
      </span>
    )
  }
  return <Square className="size-4 text-slate-300 shrink-0" />
}

interface SkuSidebarProps {
  skus: Sku[]
  selectedSkuId: string
  onSelect: (id: string) => void
  totalCount: number
  collapsed: boolean
  onToggle: () => void
  hideMetrics?: boolean
  // Bulk selection — optional; page defaults to disabled
  isSelectionMode?: boolean
  selectedSkuIds?: Set<string>
  onToggleSelectionMode?: () => void
  onToggleSkuSelection?: (id: string) => void
  onSelectAllSkus?: () => void
  onDeselectAllSkus?: () => void
  onBulkAcceptAndPublish?: (fields: BulkField[]) => void
}

export function SkuSidebar({
  skus, selectedSkuId, onSelect, totalCount, collapsed, onToggle, hideMetrics = false,
  isSelectionMode = false,
  selectedSkuIds = new Set(),
  onToggleSelectionMode = () => {},
  onToggleSkuSelection = () => {},
  onSelectAllSkus = () => {},
  onDeselectAllSkus = () => {},
  onBulkAcceptAndPublish = () => {},
}: SkuSidebarProps) {
  // Field selection lives here — resets whenever selection mode is exited
  const [selectedFields, setSelectedFields] = useState<Set<BulkField>>(
    new Set(BULK_FIELDS.map((f) => f.id)),
  )

  function toggleField(id: BulkField) {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  if (collapsed) {
    return (
      <aside className="flex w-10 shrink-0 flex-col items-center border-r border-slate-200 bg-white pt-4">
        <button type="button" aria-label="Expand panel" onClick={onToggle}
          className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
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
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
        {isSelectionMode ? (
          // Selection mode header: master checkbox + count
          <>
            <button
              type="button"
              aria-label={allSelected ? "Deselect all" : "Select all"}
              onClick={allSelected ? onDeselectAllSkus : onSelectAllSkus}
              className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-slate-50"
            >
              <Checkbox checked={allSelected} indeterminate={someSelected} />
              <span className="text-sm font-medium text-slate-600">
                {selectedCount > 0 ? `${selectedCount} of ${skus.length} selected` : "Select SKUs"}
              </span>
            </button>
            <button type="button" onClick={onToggleSelectionMode}
              className="text-xs font-medium text-slate-500 hover:text-slate-700">
              Cancel
            </button>
          </>
        ) : (
          // Normal header: title + Select toggle + collapse
          <>
            <div>
              <h2 className="text-sm font-semibold text-slate-700">SKUs with Issues</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">Showing {skus.length} of {totalCount}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={onToggleSelectionMode}
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                Select
              </button>
              <button type="button" aria-label="Collapse panel" onClick={onToggle}
                className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
                <AlignJustify className="size-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── SKU list ────────────────────────────────────────────────────── */}
      {skus.length === 0 ? (
        <p className="px-4 pb-4 text-xs text-slate-500">No SKUs match the current filter.</p>
      ) : (
        <ul className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-4">
          {skus.map((sku) => {
            const isActive = sku.id === selectedSkuId
            const isSelected = selectedSkuIds.has(sku.id)
            return (
              <li key={sku.id}>
                <button
                  type="button"
                  onClick={() => isSelectionMode ? onToggleSkuSelection(sku.id) : onSelect(sku.id)}
                  className={cn(
                    "relative flex w-full flex-col overflow-hidden rounded-xl border text-left transition-colors",
                    isSelectionMode
                      ? isSelected
                        ? "border-brand-400 bg-brand-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                      : isActive
                        ? "border-primary bg-brand-25"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  {/* Checkbox overlay — top-right corner in selection mode */}
                  {isSelectionMode && (
                    <span className="absolute top-2.5 right-2.5">
                      <Checkbox checked={isSelected} />
                    </span>
                  )}

                  <div className="flex flex-col gap-2 px-3 pt-3 pb-2.5">
                    <p className="flex flex-wrap items-center gap-1 pr-6">
                      <span className="font-mono text-[10px] text-slate-400">{sku.asin}</span>
                      <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
                      <span className="text-[10px] text-slate-400">{sku.brand}</span>
                      <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
                      <span className="text-[10px] text-slate-400">{sku.category}</span>
                      {sku.hasPimData === false && (
                        <span className={cn(
                          "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide",
                          isActive ? "border-brand-300 bg-brand-100 text-primary" : "border-brand-200 bg-brand-50 text-brand-700",
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

                  {!hideMetrics && (
                    <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-0">
                      <CardMetric label="Compliance" value={sku.metrics.compliance} />
                      <CardMetric label="SEO" value={sku.metrics.seo} />
                      <CardMetric label="AEO" value={sku.metrics.aeo} />
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* ── Selection action bar — sticky bottom, visible when ≥1 selected ── */}
      {isSelectionMode && selectedCount > 0 && (
        <div className="shrink-0 space-y-3 border-t border-slate-200 bg-slate-50 p-3">
          {/* Count */}
          <p className="px-0.5 text-[11px] font-semibold text-slate-500">
            {selectedCount} SKU{selectedCount > 1 ? "s" : ""} selected
          </p>

          {/* Field selector — 2×2 grid */}
          <div>
            <p className="mb-1.5 px-0.5 text-[11px] font-medium text-slate-500">
              Accept changes for
            </p>
            <div className="grid grid-cols-2 gap-1">
              {BULK_FIELDS.map(({ id, label, icon: Icon }) => {
                const checked = selectedFields.has(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleField(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
                      checked
                        ? "border-brand-200 bg-brand-50"
                        : "border-slate-200 bg-white hover:bg-slate-100",
                    )}
                  >
                    {checked ? (
                      <span className="flex size-3.5 shrink-0 items-center justify-center rounded-[3px] bg-brand-500">
                        <Check className="size-2 stroke-3 text-white" />
                      </span>
                    ) : (
                      <Square className="size-3.5 shrink-0 text-slate-300" />
                    )}
                    <Icon className={cn("size-3 shrink-0", checked ? "text-brand-500" : "text-slate-400")} />
                    <span className={cn("text-[11px] font-medium", checked ? "text-slate-700" : "text-slate-400")}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <Button
            size="sm"
            disabled={selectedFields.size === 0}
            className="w-full bg-brand-500 text-xs text-white hover:bg-brand-600 disabled:opacity-50"
            onClick={() => onBulkAcceptAndPublish(Array.from(selectedFields))}
          >
            Accept All &amp; Publish
          </Button>
        </div>
      )}
    </aside>
  )
}
