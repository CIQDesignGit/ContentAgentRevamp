"use client"

import { BookmarkPlus, Search, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricChip } from "./metric-chip"

export type PublishBarState = "disabled" | "ready" | "publishing" | "syncing" | "complete"

interface ProductHeaderProps {
  title: string
  asin: string
  productId: string
  brand: string
  thumbnailUrl?: string
  compliance: number
  seo: number
  aeo: number
  publishState: PublishBarState
  publishableCount: number
  onPublishClick: () => void
}

export function ProductHeader({
  title,
  asin,
  productId,
  brand,
  thumbnailUrl,
  compliance,
  seo,
  aeo,
  publishState,
  publishableCount,
  onPublishClick,
}: ProductHeaderProps) {
  const canPublish = publishState === "ready" || (publishState === "syncing" && publishableCount > 0)

  return (
    <div className="flex shrink-0 flex-col border-b border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-6 px-6 py-4">
        {/* Left: thumbnail + product info */}
        <div className="flex min-w-0 items-start gap-3">
          {/* Product thumbnail */}
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="size-14 shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-contain p-1"
            />
          ) : (
            <div
              className="size-14 shrink-0 rounded-lg border border-slate-200 bg-slate-100"
              aria-hidden
            />
          )}

          {/* Metadata above title, then metric chips below */}
          <div className="min-w-0 space-y-1">
            <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{asin}</span>
              <span aria-hidden className="size-1 rounded-full bg-slate-300" />
              <span>{productId}</span>
              <span aria-hidden className="size-1 rounded-full bg-slate-300" />
              <span>{brand}</span>
            </span>
            <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <MetricChip label="Compliance" value={compliance} icon={<ShieldCheck className="size-3" />} />
              <MetricChip label="SEO" value={seo} icon={<Search className="size-3" />} />
              <MetricChip label="AEO" value={aeo} icon={<Sparkles className="size-3" />} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPublishClick}
              disabled={!canPublish}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md px-4 text-xs font-medium text-white",
                canPublish ? "bg-primary hover:bg-brand-700" : "cursor-not-allowed bg-slate-300",
              )}
            >
              Publish to PIM &amp; PDP
            </button>
            <button
              type="button"
              aria-label="Bookmark"
              title="Bookmark"
              className="grid size-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <BookmarkPlus className="size-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
