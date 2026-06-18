"use client"

import { AlignJustify, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Sku } from "./types"

// Bordered chip metric — same visual language as the ProductHeader chips
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
    return (
      <img
        src={sku.thumbnailUrl}
        alt=""
        className="size-11 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-contain p-0.5"
      />
    )
  }
  return (
    <div className="size-11 shrink-0 rounded-lg border border-slate-100 bg-slate-100" aria-hidden />
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
          <h2 className="text-sm font-semibold text-slate-700">SKUs with Issues</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
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
                    "flex w-full flex-col overflow-hidden rounded-xl border text-left transition-colors",
                    isActive
                      ? "border-primary bg-brand-25"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  {/* Zone 1: tag row (ASIN · Brand · Category) + thumbnail + title */}
                  <div className="flex flex-col gap-2 px-3 pt-3 pb-2.5">
                    {/* Tags above the thumbnail — same row as original */}
                    <p className="flex flex-wrap items-center gap-1">
                      <span className="font-mono text-[10px] text-slate-400">{sku.asin}</span>
                      <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
                      <span className="text-[10px] text-slate-400">{sku.brand}</span>
                      <span aria-hidden className="size-0.5 rounded-full bg-slate-300" />
                      <span className="text-[10px] text-slate-400">{sku.category}</span>
                      {sku.hasPimData === false && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide",
                            isActive
                              ? "border-brand-300 bg-brand-100 text-primary"
                              : "border-brand-200 bg-brand-50 text-brand-700",
                          )}
                        >
                          PDP only
                        </span>
                      )}
                    </p>
                    {/* Thumbnail + title */}
                    <div className="flex gap-3">
                      <SkuThumb sku={sku} />
                      <p className="line-clamp-2 flex-1 text-[13px] font-medium leading-snug text-slate-700">
                        {sku.title}
                      </p>
                    </div>
                  </div>

                  {/* Zone 2: metric chips */}
                  <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-0">
                    <CardMetric label="Compliance" value={sku.metrics.compliance} />
                    <CardMetric label="SEO" value={sku.metrics.seo} />
                    <CardMetric label="AEO" value={sku.metrics.aeo} />
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
