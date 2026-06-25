"use client"

import { useState } from "react"
import { Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionSelectToggle } from "@/components/home/section-controls"
import { AiRecommendationSparklesIcon, BulletSourceCell, SourceCellLabel } from "@/components/home/bullet-source-cell"
import { ReasoningAltKeywordsBlock } from "@/components/home/reasoning-alt-keywords-block"
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

// ─── Panel open/close state per highlight ────────────────────────────────────

type HighlightPanelState = {
  showReasoning: boolean
  showAltKeywords: boolean
}

// ─── Single highlight text box (no panels — rendered full-width by parent) ───

function HighlightTextBox({ highlight }: { highlight: ItemHighlight }) {
  const { status, text } = highlight
  const outerBg = status === "accepted" ? "bg-success-50" : "bg-brand-50"
  const innerBorder = status === "accepted" ? "border-success-200" : "border-brand-300"

  return (
    <div className={cn("min-w-0 flex-1 rounded-lg px-0.5 py-0.5 transition-colors", outerBg)}>
      <div className={cn("rounded-md border bg-white px-3 py-2", innerBorder)}>
        <p className="text-sm leading-relaxed text-slate-800">{text}</p>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface ItemHighlightsSectionProps {
  highlights: ItemHighlight[]
  hasPimData?: boolean
  isIncluded?: boolean
  onToggleInclude?: () => void
  onAccept: (id: string) => void
  onUndoAccept: (id: string) => void
  defaultReasoningOpen?: boolean
}

export function ItemHighlightsSection({
  highlights,
  isIncluded = true,
  onToggleInclude,
  defaultReasoningOpen = false,
}: ItemHighlightsSectionProps) {
  // Track open/close state for each highlight's panels, keyed by highlight id
  const [panelStates, setPanelStates] = useState<Record<string, HighlightPanelState>>(() =>
    Object.fromEntries(
      highlights.map((h) => [h.id, { showReasoning: defaultReasoningOpen, showAltKeywords: false }])
    )
  )

  function getPanel(id: string): HighlightPanelState {
    return panelStates[id] ?? { showReasoning: false, showAltKeywords: false }
  }

  function setPanel(id: string, key: keyof HighlightPanelState, value: boolean) {
    setPanelStates((prev) => ({
      ...prev,
      [id]: { ...getPanel(id), [key]: value },
    }))
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 pl-1 py-2">
        <Lightbulb className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Item Highlights</span>
        <div className="ml-auto">
          <SectionSelectToggle selected={isIncluded} onToggle={onToggleInclude} />
        </div>
      </header>

      <div className="flex flex-col gap-3 w-full">
        {/* Column headers */}
        <div className="grid grid-cols-2 gap-x-3">
          <div className="flex min-h-[30px] items-center gap-1.5">
            <AiRecommendationSparklesIcon />
            <span className="text-xs font-semibold text-slate-700">AI Recommended Item Highlights</span>
          </div>
          <div className="flex min-h-[30px] items-center">
            <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
          </div>
        </div>

        {/* One block per highlight — text row (2-col) + full-width panels below */}
        {highlights.map((h) => {
          const { showReasoning, showAltKeywords } = getPanel(h.id)
          const reasoning = h.reasoning ?? []
          const altKeywords = h.altKeywords ?? []
          const hasAnyPanel = reasoning.length > 0 || altKeywords.length > 0

          return (
            <div key={h.id} className="flex flex-col">
              {/* 2-col row: AI text box | Retailer source cell */}
              <div className="grid grid-cols-2 items-start gap-x-3">
                <HighlightTextBox highlight={h} />
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

              {/* Toggle buttons + expanded panels — shared component handles both */}
              {hasAnyPanel && (
                <div className="pt-1">
                  <ReasoningAltKeywordsBlock
                    reasoning={reasoning}
                    altKeywords={altKeywords}
                    showReasoning={showReasoning}
                    showAltKeywords={showAltKeywords}
                    onReasoningToggle={(v) => setPanel(h.id, "showReasoning", v)}
                    onAltKeywordsToggle={(v) => setPanel(h.id, "showAltKeywords", v)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
