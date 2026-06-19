"use client"

import { Check, Lightbulb, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AiRecommendationSparklesIcon } from "@/components/home/bullet-source-cell"

export type HighlightStatus = "pending" | "accepted" | "rejected"

export type ItemHighlight = {
  id: string
  text: string
  status: HighlightStatus
}

// ─── Single highlight row ─────────────────────────────────────────────────────

function HighlightRow({
  highlight,
  onAccept,
  onReject,
  onUndoAccept,
  onUndoReject,
}: {
  highlight: ItemHighlight
  onAccept: () => void
  onReject: () => void
  onUndoAccept: () => void
  onUndoReject: () => void
}) {
  const { status, text } = highlight

  const outerBg =
    status === "accepted" ? "bg-success-50"
    : status === "rejected" ? "bg-slate-50"
    : "bg-brand-50"

  const innerBorder =
    status === "accepted" ? "border-success-200"
    : status === "rejected" ? "border-slate-200"
    : "border-brand-300"

  const innerBg =
    status === "rejected" ? "bg-slate-100" : "bg-white"

  return (
    <div className="flex items-start gap-3">
      <div className="mt-2.5 shrink-0">
        <AiRecommendationSparklesIcon />
      </div>

      {/* Outer tinted pill → inner white box — matches EditableRecommendationField */}
      <div className={cn("min-w-0 flex-1 rounded-lg px-0.5 py-0.5 transition-colors", outerBg)}>
        <div className={cn("rounded-md border px-3 py-2", innerBorder, innerBg)}>
          <p
            className={cn(
              "text-sm leading-relaxed",
              status === "rejected" ? "text-slate-400 line-through" : "text-slate-800",
            )}
          >
            {text}
          </p>
        </div>
      </div>

      {/* Labeled action buttons — fit-content width */}
      <div className="flex w-fit shrink-0 items-center gap-1.5">
        {status === "pending" && (
          <>
            <button
              type="button"
              onClick={onReject}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-error-100 bg-error-50 px-3 text-xs font-medium text-error-700 hover:bg-error-100"
            >
              <X className="size-3.5" /> Reject
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-success-100 bg-success-50 px-3 text-xs font-medium text-success-700 hover:bg-success-100"
            >
              <Check className="size-3.5" /> Accept
            </button>
          </>
        )}
        {status === "accepted" && (
          <button
            type="button"
            onClick={onUndoAccept}
            aria-label="Undo accept"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <Undo2 className="size-3.5" />
          </button>
        )}
        {status === "rejected" && (
          <button
            type="button"
            onClick={onUndoReject}
            aria-label="Undo reject"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <Undo2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface ItemHighlightsSectionProps {
  highlights: ItemHighlight[]
  /** When false (no PIM entry), a badge clarifies the highlights are PDP-derived. */
  hasPimData?: boolean
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onUndoAccept: (id: string) => void
  onUndoReject: (id: string) => void
}

export function ItemHighlightsSection({
  highlights,
  hasPimData = true,
  onAccept,
  onReject,
  onUndoAccept,
  onUndoReject,
}: ItemHighlightsSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 px-1 py-2">
        <Lightbulb className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Item Highlights</span>

        {!hasPimData && (
          <span className="rounded-full border border-info-200 bg-info-50 px-2.5 py-0.5 text-xs text-info-700">
            Generated from PDP data only
          </span>
        )}

      </header>

      <div className="mt-1 space-y-2 px-1">
        {highlights.map((h) => (
          <HighlightRow
            key={h.id}
            highlight={h}
            onAccept={() => onAccept(h.id)}
            onReject={() => onReject(h.id)}
            onUndoAccept={() => onUndoAccept(h.id)}
            onUndoReject={() => onUndoReject(h.id)}
          />
        ))}
      </div>
    </section>
  )
}
