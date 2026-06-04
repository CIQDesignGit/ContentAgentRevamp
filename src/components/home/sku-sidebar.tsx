"use client"

import { AlignJustify, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Sku } from "./types"
import { MetricChip } from "./metric-chip"

function SkuThumb({ sku }: { sku: Sku }) {
  if (sku.thumbnailUrl) {
    return (
      <img
        src={sku.thumbnailUrl}
        alt=""
        className="size-10 shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-contain p-0.5"
      />
    )
  }
  return (
    <div className="size-10 shrink-0 rounded-lg border border-slate-200 bg-slate-100" aria-hidden />
  )
}

interface SkuSidebarProps {
  skus: Sku[]
  selectedSkuId: string
  onSelect: (id: string) => void
  totalCount: number
  collapsed: boolean
  onToggle: () => void
}

export function SkuSidebar({ skus, selectedSkuId, onSelect, totalCount, collapsed, onToggle }: SkuSidebarProps) {
  // ── Collapsed strip ──────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <aside className="flex w-10 shrink-0 flex-col items-center border-r border-slate-200 bg-white pt-4">
        <button
          type="button"
          aria-label="Expand panel"
          title="Expand SKU list"
          onClick={onToggle}
          className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          <PanelLeftOpen className="size-4" />
        </button>
      </aside>
    )
  }

  // ── Expanded sidebar ─────────────────────────────────────────────────────────
  return (
    <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
      <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">SKUs with Issues</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Showing {skus.length} of {totalCount}
          </p>
        </div>
        <button
          type="button"
          aria-label="Collapse panel"
          title="Collapse panel"
          onClick={onToggle}
          className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          <AlignJustify className="size-4" />
        </button>
      </div>

      {skus.length === 0 ? (
        <p className="px-4 pb-4 text-xs text-slate-500">No SKUs match the current filter.</p>
      ) : (
        <ul className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-4">
          {skus.map((sku) => {
            const isActive = sku.id === selectedSkuId
            return (
              <li key={sku.id}>
                <button
                  type="button"
                  onClick={() => onSelect(sku.id)}
                  className={cn(
                    "flex w-full flex-col gap-3 rounded-xl border p-3.5 text-left transition-colors",
                    isActive
                      ? "border-primary bg-brand-25"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  {/* Row 1: thumbnail + title/meta */}
                  <div className="flex flex-col gap-2">
                    {/* asin + category */}
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-mono">{sku.asin}</span>
                      <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
                      <span>{sku.category}</span>
                    </p>
                    {/* thumbnail + title */}
                    <div className="flex gap-3">
                      <SkuThumb sku={sku} />
                      <p className="line-clamp-2 flex-1 overflow-hidden text-sm font-medium leading-snug text-slate-800">
                        {sku.title}
                      </p>
                    </div>
                  </div>

                  {/* Row 2: metric chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <MetricChip label="Compliance" value={sku.metrics.compliance} />
                    <MetricChip label="SEO" value={sku.metrics.seo} />
                    <MetricChip label="AEO" value={sku.metrics.aeo} />
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
