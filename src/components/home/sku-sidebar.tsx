"use client"

import { AlignJustify, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox, ContentAgentSkuCard, TitleOptimizationSkuCard } from "./sku-card"
import type { BulkField } from "./bulk-publish-confirm-dialog"
import type { Sku } from "./types"

// All fields forwarded to the confirm dialog — no per-field toggle in sidebar
const ALL_BULK_FIELDS: BulkField[] = ["title", "images", "bullets", "description"]

// ─── Main sidebar ─────────────────────────────────────────────────────────────

interface SkuSidebarProps {
  skus: Sku[]
  selectedSkuId: string
  onSelect: (id: string) => void
  totalCount: number
  collapsed: boolean
  onToggle: () => void
  /** When true, renders TitleOptimizationSkuCard (no quality-score chips). Defaults to false. */
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

  // Select the right named card component based on the page context
  const SkuCardComponent = hideMetrics ? TitleOptimizationSkuCard : ContentAgentSkuCard

  return (
    <aside className="flex w-[420px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-start justify-between px-4 pb-2 pt-4">
        {isSelectionMode ? (
          <>
            {/* Master checkbox + count */}
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
              <SkuCardComponent
                sku={sku}
                isActive={sku.id === selectedSkuId}
                isSelected={selectedSkuIds.has(sku.id)}
                isSelectionMode={isSelectionMode}
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
