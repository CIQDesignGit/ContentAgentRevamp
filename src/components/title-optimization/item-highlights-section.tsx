"use client"

import { Check, Lightbulb, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { AiRecommendationSparklesIcon } from "@/components/home/bullet-source-cell"

export type HighlightStatus = "pending" | "accepted" | "rejected"

export type ItemHighlight = {
  id: string
  text: string
  status: HighlightStatus
}

// ─── Section select toggle ─────────────────────────────────────────────────────

function SectionSelectToggle({
  selected,
  onToggle,
}: {
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={selected ? "Deselect section" : "Select section"}
      title={selected ? "Remove from publish" : "Include in publish"}
      className="rounded p-0.5 transition-colors hover:bg-slate-100"
    >
      {selected ? (
        <span className="flex size-5 items-center justify-center rounded-[3px] bg-brand-500">
          <Check className="size-3 stroke-3 text-white" />
        </span>
      ) : (
        <Square className="size-5 text-slate-300" />
      )}
    </button>
  )
}

// ─── Single highlight row (display-only — selection is at section level) ──────

function HighlightRow({ highlight }: { highlight: ItemHighlight }) {
  const { status, text } = highlight

  const outerBg =
    status === "accepted" ? "bg-success-50"
    : "bg-brand-50"

  const innerBorder =
    status === "accepted" ? "border-success-200"
    : "border-brand-300"

  return (
    <div className="flex items-start gap-3">
      <div className="mt-2.5 shrink-0">
        <AiRecommendationSparklesIcon />
      </div>

      <div className={cn("min-w-0 flex-1 rounded-lg px-0.5 py-0.5 transition-colors", outerBg)}>
        <div className={cn("rounded-md border bg-white px-3 py-2", innerBorder)}>
          <p className="text-sm leading-relaxed text-slate-800">{text}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface ItemHighlightsSectionProps {
  highlights: ItemHighlight[]
  /** When false (no PIM entry), a badge clarifies the highlights are PDP-derived. */
  hasPimData?: boolean
  isIncluded?: boolean
  onToggleInclude?: () => void
  onAccept: (id: string) => void
  onUndoAccept: (id: string) => void
}

export function ItemHighlightsSection({
  highlights,
  hasPimData = true,
  isIncluded = true,
  onToggleInclude,
  onAccept,
  onUndoAccept,
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

        <div className="ml-auto">
          <SectionSelectToggle selected={isIncluded} onToggle={onToggleInclude ?? (() => {})} />
        </div>
      </header>

      <div className={cn("mt-1 space-y-2 px-1 transition-opacity", !isIncluded && "opacity-40")}>
        {highlights.map((h) => (
          <HighlightRow key={h.id} highlight={h} />
        ))}
      </div>
    </section>
  )
}
