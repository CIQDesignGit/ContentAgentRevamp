"use client"

import { useState } from "react"
import { ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReasoningPanel } from "./reasoning-ui"
import { AltKeywordsPanel } from "./alt-keywords-panel"
import type { AeoPerformance, AltKeyword, ReasoningCategory } from "./types"

interface ReasoningAltKeywordsBlockProps {
  reasoning: ReasoningCategory[]
  altKeywords?: AltKeyword[]
  aeoPerformance?: AeoPerformance
  hideReasoning?: boolean
  hideAltKeywords?: boolean
  defaultReasoningOpen?: boolean
  /** When true, only the toggle buttons row is rendered — panels are suppressed.
   *  Use when the parent wants to render the expanded panels separately (e.g. full-width). */
  hideExpandedPanels?: boolean
  // Controlled mode — when provided, parent manages open/closed state
  showReasoning?: boolean
  showAltKeywords?: boolean
  onReasoningToggle?: (show: boolean) => void
  onAltKeywordsToggle?: (show: boolean) => void
  // Alt keywords action handlers
  usedKeywordIds?: Set<string>
  onUseKeyword?: (keyword: AltKeyword) => void
  onRemoveKeyword?: (keyword: AltKeyword) => void
}

/**
 * Reusable toggle-buttons + expanded-panels block for Reasoning and Alt Keywords.
 * Used uniformly across Title, Item Highlights, Bullets, and Description sections.
 * Supports both uncontrolled (default) and controlled (parent-managed) state.
 */
export function ReasoningAltKeywordsBlock({
  reasoning,
  altKeywords = [],
  aeoPerformance,
  hideReasoning = false,
  hideAltKeywords = false,
  defaultReasoningOpen = false,
  hideExpandedPanels = false,
  showReasoning: controlledShowReasoning,
  showAltKeywords: controlledShowAltKeywords,
  onReasoningToggle,
  onAltKeywordsToggle,
  usedKeywordIds = new Set(),
  onUseKeyword = () => {},
  onRemoveKeyword = () => {},
}: ReasoningAltKeywordsBlockProps) {
  const [localShowReasoning, setLocalShowReasoning] = useState(defaultReasoningOpen)
  const [localShowAltKeywords, setLocalShowAltKeywords] = useState(false)

  // Use controlled state if provided, else fall back to local state
  const showReasoning = controlledShowReasoning ?? localShowReasoning
  const showAltKeywords = controlledShowAltKeywords ?? localShowAltKeywords

  const hasReasoning = !hideReasoning && reasoning.length > 0
  const hasAltKeywords = !hideAltKeywords && altKeywords.length > 0

  // Nothing to show — render nothing
  if (!hasReasoning && !hasAltKeywords) return null

  return (
    <div className="flex flex-col">
      {/* Toggle buttons row */}
      <div className="flex items-center gap-3 py-1.5">
        {hasReasoning && (
          <button
            type="button"
            onClick={() => {
              const next = !showReasoning
              onReasoningToggle ? onReasoningToggle(next) : setLocalShowReasoning(next)
            }}
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
        {hasAltKeywords && (
          <button
            type="button"
            onClick={() => {
              const next = !showAltKeywords
              onAltKeywordsToggle ? onAltKeywordsToggle(next) : setLocalShowAltKeywords(next)
            }}
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

      {/* Expanded panels — suppressed when hideExpandedPanels=true (parent renders them separately) */}
      {!hideExpandedPanels && (showReasoning || showAltKeywords) && (
        <div className="flex flex-col">
          {showReasoning && hasReasoning && (
            <div className="pb-2">
              <ReasoningPanel reasoning={reasoning} aeoPerformance={aeoPerformance} />
            </div>
          )}
          {showAltKeywords && hasAltKeywords && (
            <div className="pb-2">
              <AltKeywordsPanel
                keywords={altKeywords}
                usedIds={usedKeywordIds}
                onUse={onUseKeyword}
                onRemove={onRemoveKeyword}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
