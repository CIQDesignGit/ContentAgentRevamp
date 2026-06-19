"use client"

import { useState } from "react"
import { Lightbulb, ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { AiRecommendationSparklesIcon, BulletSourceCell, SourceCellLabel } from "@/components/home/bullet-source-cell"
import { fieldLabelContentStack, fieldSectionStack } from "@/components/home/field-layout"
import { ReasoningPanel } from "@/components/home/reasoning-ui"
import { AltKeywordsPanel } from "@/components/home/alt-keywords-panel"
import { RETAILER_LOGO_SRC } from "@/components/home/source-logos"
import type { AltKeyword, ReasoningCategory } from "@/components/home/types"

export type HighlightStatus = "pending" | "accepted" | "rejected"

export type ItemHighlight = {
  id: string
  text: string
  status: HighlightStatus
  reasoning?: ReasoningCategory[]
  altKeywords?: AltKeyword[]
}


// ─── Single highlight row (text box + toggle buttons only) ────────────────────

function HighlightRow({
  highlight,
  showReasoning,
  showAltKeywords,
  onToggleReasoning,
  onToggleAltKeywords,
}: {
  highlight: ItemHighlight
  showReasoning: boolean
  showAltKeywords: boolean
  onToggleReasoning: () => void
  onToggleAltKeywords: () => void
}) {
  const { status, text, reasoning = [], altKeywords = [] } = highlight
  const outerBg = status === "accepted" ? "bg-success-50" : "bg-brand-50"
  const innerBorder = status === "accepted" ? "border-success-200" : "border-brand-300"

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("min-w-0 flex-1 rounded-lg px-0.5 py-0.5 transition-colors", outerBg)}>
        <div className={cn("rounded-md border bg-white px-3 py-2", innerBorder)}>
          <p className="text-sm leading-relaxed text-slate-800">{text}</p>
        </div>
      </div>

      {(reasoning.length > 0 || altKeywords.length > 0) && (
        <div className="flex items-center gap-3 pl-1">
          {reasoning.length > 0 && (
            <button
              type="button"
              onClick={onToggleReasoning}
              className={cn(
                "inline-flex items-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
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
              onClick={onToggleAltKeywords}
              className={cn(
                "inline-flex items-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
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
  /** When true, all reasoning panels start open on mount. */
  defaultReasoningOpen?: boolean
}

type PanelState = { reasoning: boolean; altKeywords: boolean }

export function ItemHighlightsSection({
  highlights,
  hasPimData = true,
  isIncluded = true,
  onToggleInclude,
  onAccept,
  onUndoAccept,
  defaultReasoningOpen = false,
}: ItemHighlightsSectionProps) {
  const [panelState, setPanelState] = useState<Record<string, PanelState>>({})

  function toggleReasoning(id: string) {
    setPanelState((prev) => ({
      ...prev,
      [id]: { ...prev[id], reasoning: !(prev[id]?.reasoning ?? false), altKeywords: prev[id]?.altKeywords ?? false },
    }))
  }

  function toggleAltKeywords(id: string) {
    setPanelState((prev) => ({
      ...prev,
      [id]: { reasoning: prev[id]?.reasoning ?? false, altKeywords: !(prev[id]?.altKeywords ?? false) },
    }))
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 px-1 py-2">
        <Lightbulb className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Item Highlights</span>
        <Checkbox
          checked={isIncluded}
          onCheckedChange={onToggleInclude}
          aria-label={isIncluded ? "Remove from publish" : "Include in publish"}
          className="ml-auto size-5 shrink-0 rounded-[3px]"
        />
      </header>

      <div className={fieldSectionStack("w-full")}>
        {/* Two-column source grid */}
        <div className="grid grid-cols-2 items-start gap-x-3">
          {/* Left: AI highlights */}
          <div className={fieldLabelContentStack("min-h-0 min-w-0")}>
            <div className="flex min-h-[30px] items-center gap-1.5">
              <AiRecommendationSparklesIcon />
              <span className="text-xs font-semibold text-slate-700">AI Recommended Item Highlights</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {highlights.map((h) => (
                <HighlightRow
                  key={h.id}
                  highlight={h}
                  showReasoning={panelState[h.id]?.reasoning ?? defaultReasoningOpen}
                  showAltKeywords={panelState[h.id]?.altKeywords ?? false}
                  onToggleReasoning={() => toggleReasoning(h.id)}
                  onToggleAltKeywords={() => toggleAltKeywords(h.id)}
                />
              ))}
            </div>
          </div>

          {/* Right: Retailer (empty) */}
          <div className={fieldLabelContentStack("min-h-0 min-w-0")}>
            <div className="flex min-h-[30px] items-center">
              <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <BulletSourceCell
                logoSrc={RETAILER_LOGO_SRC}
                logoAlt="Amazon"
                sublabel="Retailer"
                value=""
                compareValue=""
                side="pdp"
                showLabel={false}
              />
            </div>
          </div>
        </div>

        {/* Full-width expanded panels — rendered below the grid, outside column constraints */}
        {highlights.map((h) => {
          const state = panelState[h.id]
          const reasoning = h.reasoning ?? []
          const altKeywords = h.altKeywords ?? []
          const showReasoning = state?.reasoning ?? defaultReasoningOpen
          const showAltKeywords = state?.altKeywords ?? false
          if (!showReasoning && !showAltKeywords) return null

          return (
            <div key={h.id} className="flex flex-col gap-3 border-t border-slate-100 pt-3">
              {showReasoning && reasoning.length > 0 && (
                <ReasoningPanel reasoning={reasoning} />
              )}
              {showAltKeywords && altKeywords.length > 0 && (
                <AltKeywordsPanel
                  keywords={altKeywords}
                  usedIds={new Set()}
                  onUse={() => {}}
                  onRemove={() => {}}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
