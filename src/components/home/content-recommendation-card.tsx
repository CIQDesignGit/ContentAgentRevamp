"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, ChevronRight, RotateCcw, Sparkles, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildTitleDiff } from "@/lib/build-title-diff"
import { EditableRecommendationField } from "./editable-recommendation-field"
import { ReasoningPanel, ToggleSwitch } from "./reasoning-ui"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import type { TitleRecommendation, TitleStatus } from "./types"

export type RecommendationLabels = {
  pending: string
  accepted: string
  rejected: string
}

function CompareTabs({
  value,
  onChange,
}: {
  value: FieldCompareTarget
  onChange: (v: FieldCompareTarget) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Compare recommendation with"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
    >
      {(
        [
          { key: "pim" as const, label: "PIM" },
          { key: "pdp" as const, label: "PDP" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={value === opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === opt.key ? "bg-violet-100 text-primary" : "text-slate-600 hover:bg-slate-50",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** AI recommendation title + PIM/PDP tabs in the section header row. */
export function ContentRecommendationHeader({
  labels,
  status,
  compareTarget,
  onCompareTargetChange,
  isOpen,
  onToggleOpen,
  onRevert,
}: {
  labels: RecommendationLabels
  status: TitleStatus
  compareTarget: FieldCompareTarget
  onCompareTargetChange: (target: FieldCompareTarget) => void
  isOpen: boolean
  onToggleOpen: () => void
  onRevert: () => void
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex min-w-0 items-center gap-2 text-left"
        aria-expanded={isOpen}
      >
        {status === "accepted" ? (
          <span className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-success-600" />
            <span className="text-xs font-medium text-success-600">{labels.accepted}</span>
          </span>
        ) : status === "rejected" ? (
          <span className="flex items-center gap-2">
            <X className="size-4 shrink-0 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">{labels.rejected}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-brand-500" />
            <span className="text-xs font-medium text-slate-700">{labels.pending}</span>
          </span>
        )}
        {isOpen ? (
          <ChevronDown
            className={cn("size-4 shrink-0", status === "pending" ? "text-slate-700" : "text-slate-400")}
          />
        ) : (
          <ChevronRight
            className={cn("size-4 shrink-0", status === "pending" ? "text-slate-700" : "text-slate-400")}
          />
        )}
      </button>

      {status === "accepted" ? (
        <button
          type="button"
          onClick={onRevert}
          className="inline-flex h-7 items-center gap-1.5 px-2 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <Undo2 className="size-3.5" /> Revert
        </button>
      ) : null}
      </div>

      {status === "pending" && isOpen ? (
        <CompareTabs value={compareTarget} onChange={onCompareTargetChange} />
      ) : null}
    </div>
  )
}

interface ContentRecommendationBodyProps {
  recommendation: TitleRecommendation
  pimBaseline: string
  pdpBaseline: string
  originalText: string
  compareTarget: FieldCompareTarget
  status: TitleStatus
  onRecommendedTextChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onReset: () => void
  editAriaLabel?: string
  editRows?: number
  compact?: boolean
}

/** Recommendation field and actions — aligned beside the active source text row. */
export function ContentRecommendationBody({
  recommendation,
  pimBaseline,
  pdpBaseline,
  originalText,
  compareTarget,
  status,
  onRecommendedTextChange,
  onAccept,
  onReject,
  onReset,
  editAriaLabel = "Edit AI recommendation",
  editRows = 3,
  compact = false,
}: ContentRecommendationBodyProps) {
  const [showReasoning, setShowReasoning] = useState(false)
  const isModified = recommendation.recommendedText !== originalText

  const baseline = compareTarget === "pim" ? pimBaseline : pdpBaseline
  const compareDiff = useMemo(
    () => buildTitleDiff(baseline, recommendation.recommendedText),
    [baseline, recommendation.recommendedText],
  )

  function handleResetRecommendation() {
    onRecommendedTextChange(originalText)
  }

  return (
    <div className="w-full min-w-0">
      {status === "pending" ? (
        <div className="w-full space-y-2">
          <EditableRecommendationField
            value={recommendation.recommendedText}
            diff={compareDiff}
            originalValue={originalText}
            onChange={onRecommendedTextChange}
            tone="highlight"
            editAriaLabel={editAriaLabel}
            editRows={editRows}
            compact={compact}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">Show Reasoning</span>
              <ToggleSwitch
                checked={showReasoning}
                onChange={setShowReasoning}
                ariaLabel="Toggle reasoning"
              />
            </div>
            <div className="flex items-center gap-2">
              {isModified ? (
                <button
                  type="button"
                  onClick={handleResetRecommendation}
                  className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  <RotateCcw className="size-3.5" />
                  Reset recommendation
                </button>
              ) : null}
              <button
                type="button"
                onClick={onReject}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
              >
                <X className="size-4 text-error-600" /> Reject
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
              >
                <Check className="size-4 text-success-600" /> Accept
              </button>
            </div>
          </div>
          {showReasoning && <ReasoningPanel reasoning={recommendation.reasoning} />}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-sm leading-relaxed text-slate-900">{recommendation.recommendedText}</p>
          </div>
          {status === "rejected" && (
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
            >
              <Check className="size-4 text-success-600" /> Accept anyway
            </button>
          )}
        </div>
      )}
    </div>
  )
}
