"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlignJustify, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox, ContentAgentSkuCard, TitleOptimizationSkuCard } from "./sku-card"
import type { BulkField } from "./bulk-publish-confirm-dialog"
import type { Sku } from "./types"

// ─── Slide-out hook ───────────────────────────────────────────────────────────

// Total animation budget: 350ms slide starts → 550ms slide ends
//                         350ms delay → 500ms height collapse (ends at 850ms)
const TOTAL_MS = 950

function useSlidingList(incoming: Sku[]) {
  const [rendered, setRendered] = useState<Sku[]>(incoming)
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set())
  const prevIdsRef = useRef(new Set(incoming.map((s) => s.id)))

  useEffect(() => {
    const incomingIds = new Set(incoming.map((s) => s.id))
    const removed = [...prevIdsRef.current].filter((id) => !incomingIds.has(id))
    prevIdsRef.current = incomingIds

    if (removed.length === 0) {
      setRendered(incoming)
      return
    }

    setLeavingIds((prev) => new Set([...prev, ...removed]))
    setRendered((prev) => prev.map((s) => incoming.find((i) => i.id === s.id) ?? s))

    const timer = setTimeout(() => {
      setLeavingIds((prev) => {
        const next = new Set(prev)
        removed.forEach((id) => next.delete(id))
        return next
      })
      setRendered(incoming)
    }, TOTAL_MS)

    return () => clearTimeout(timer)
  }, [incoming]) // eslint-disable-line react-hooks/exhaustive-deps

  return { rendered, leavingIds }
}

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

  const SkuCardComponent = hideMetrics ? TitleOptimizationSkuCard : ContentAgentSkuCard
  const { rendered, leavingIds } = useSlidingList(skus)

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
      {skus.length === 0 && leavingIds.size === 0 ? (
        <p className="px-4 pb-4 text-xs text-slate-500">No SKUs match the current filter.</p>
      ) : (
        <ul className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-3 pb-4">
          {rendered.map((sku) => {
            const isLeaving = leavingIds.has(sku.id)
            return (
              /**
               * Outer <li> — handles height + gap collapse via CSS grid-rows trick.
               * This layer is purely layout: it never moves visually.
               * The delay means the space only starts closing AFTER the card has
               * mostly slid off screen.
               */
              <li
                key={sku.id}
                className={cn(
                  "grid transition-[grid-template-rows,margin-bottom] ease-in-out",
                  isLeaving
                    ? "grid-rows-[0fr] mb-0 duration-500 delay-[350ms]"
                    : "grid-rows-[1fr] mb-2 duration-200 delay-0",
                )}
              >
                {/**
                 * Inner div — min-h-0 + overflow-hidden are REQUIRED for the
                 * grid-rows collapse to actually hide content.
                 * This clips the card at the li boundary as it slides left.
                 */}
                <div className="min-h-0 overflow-hidden">
                  <AnimatePresence>
                    {!isLeaving && (
                      <motion.div
                        key={sku.id}
                        exit={{ x: "-110%", opacity: 0 }}
                        transition={{
                          x:       { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.3,  ease: "easeOut" },
                        }}
                      >
                        <SkuCardComponent
                          sku={sku}
                          isActive={sku.id === selectedSkuId}
                          isSelected={selectedSkuIds.has(sku.id)}
                          isSelectionMode={isSelectionMode}
                          onSelect={() => onSelect(sku.id)}
                          onToggle={() => onToggleSkuSelection(sku.id)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            )
          })}
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
              Approve {selectedCount} SKU{selectedCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}
    </aside>
  )
}
