"use client"

import { useState } from "react"
import { Check, Lightbulb, Square, ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { AiRecommendationSparklesIcon } from "@/components/home/bullet-source-cell"
import { ReasoningPanel } from "@/components/home/reasoning-ui"
import type { AltKeyword, ReasoningCategory } from "@/components/home/types"

export type HighlightStatus = "pending" | "accepted" | "rejected"

export type ItemHighlight = {
  id: string
  text: string
  status: HighlightStatus
  reasoning?: ReasoningCategory[]
  altKeywords?: AltKeyword[]
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

// ─── Single highlight row ─────────────────────────────────────────────────────

function HighlightRow({ highlight }: { highlight: ItemHighlight }) {
  const { status, text, reasoning = [], altKeywords = [] } = highlight
  const [showReasoning, setShowReasoning] = useState(false)
  const [showAltKeywords, setShowAltKeywords] = useState(false)

  const outerBg = status === "accepted" ? "bg-success-50" : "bg-brand-50"
  const innerBorder = status === "accepted" ? "border-success-200" : "border-brand-300"

  return (
    <div className="flex flex-col gap-2">
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

      {/* Reasoning / Alt Keywords toggles — mirrors ContentRecommendationBody action bar */}
      {(reasoning.length > 0 || altKeywords.length > 0) && (
        <div className="flex items-center gap-3 pl-8">
          {reasoning.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReasoning((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium transition-colors",
                showReasoning ? "text-primary" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {showReasoning ? (
                <ToggleRight className="size-3.5 shrink-0 text-primary" aria-hidden />
              ) : (
                <ToggleLeft className="size-3.5 shrink-0 text-slate-400" aria-hidden />
              )}
              Reasoning
            </button>
          )}
          {altKeywords.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAltKeywords((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium transition-colors",
                showAltKeywords ? "text-primary" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {showAltKeywords ? (
                <ToggleRight className="size-3.5 shrink-0 text-primary" aria-hidden />
              ) : (
                <ToggleLeft className="size-3.5 shrink-0 text-slate-400" aria-hidden />
              )}
              Alt Keywords
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                {altKeywords.length}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Expanded panels */}
      {showReasoning && reasoning.length > 0 && (
        <div className="pl-8">
          <ReasoningPanel reasoning={reasoning} />
        </div>
      )}
      {showAltKeywords && altKeywords.length > 0 && (
        <div className="pl-8 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap gap-2">
            {altKeywords.map((kw) => (
              <span
                key={kw.id}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700"
              >
                <span className="font-medium">{kw.keyword}</span>
                <span className="text-slate-400">{kw.volume}</span>
              </span>
            ))}
          </div>
        </div>
      )}
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

      <div className={cn("mt-1 space-y-3 px-1 transition-opacity", !isIncluded && "opacity-40")}>
        {highlights.map((h) => (
          <HighlightRow key={h.id} highlight={h} />
        ))}
      </div>
    </section>
  )
}
