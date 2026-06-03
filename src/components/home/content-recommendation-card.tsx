"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, ChevronRight, RotateCcw, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildTitleDiff } from "@/lib/build-title-diff"
import { isFieldInSyndication, resolveFieldSyncFootprint } from "@/lib/sync-footprint"
import { AiRecommendationSparklesIcon, SourceChannelLabel } from "./bullet-source-cell"
import { EditableRecommendationField } from "./editable-recommendation-field"
import { FieldSyncStatusRow } from "./recommendation-sync-ui"
import { ReasoningPanel, ToggleSwitch } from "./reasoning-ui"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import type { PublishBatch, TitleRecommendation, TitleStatus, SyncFootprint } from "./types"

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
}: {
  labels: RecommendationLabels
  status: TitleStatus
  compareTarget: FieldCompareTarget
  onCompareTargetChange: (target: FieldCompareTarget) => void
  isOpen: boolean
  onToggleOpen: () => void
}) {
  return (
    <div className="flex w-full flex-wrap items-end justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleOpen}
            className="flex min-w-0 items-center gap-2 text-left"
            aria-expanded={isOpen}
          >
            <SourceChannelLabel
              icon={<AiRecommendationSparklesIcon />}
              label={labels.pending}
            />
            {isOpen ? (
              <ChevronDown
                className={cn("size-4 shrink-0", status === "pending" ? "text-slate-500" : "text-slate-400")}
              />
            ) : (
              <ChevronRight
                className={cn("size-4 shrink-0", status === "pending" ? "text-slate-500" : "text-slate-400")}
              />
            )}
          </button>
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
  syncFootprint?: SyncFootprint
  hasUnpublishedEdits?: boolean
  activeBatch?: PublishBatch
  fieldKey?: string
  onRecommendedTextChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onReset: () => void
  onUndoAccept: () => void
  onUndoReject?: () => void
  onPushUpdate?: () => void
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
  syncFootprint = "none",
  hasUnpublishedEdits,
  activeBatch,
  fieldKey,
  onRecommendedTextChange,
  onAccept,
  onReject,
  onReset,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
  editAriaLabel = "Edit AI recommendation",
  editRows = 3,
  compact = false,
}: ContentRecommendationBodyProps) {
  const [showReasoning, setShowReasoning] = useState(false)
  const isModified = recommendation.recommendedText !== originalText
  const fp = resolveFieldSyncFootprint(syncFootprint)
  const isSyncing = fp === "syncing"
  const showEditor = status === "pending" || status === "accepted" || status === "rejected"
  const baseline = compareTarget === "pim" ? pimBaseline : pdpBaseline
  const compareDiff = useMemo(
    () => buildTitleDiff(baseline, recommendation.recommendedText),
    [baseline, recommendation.recommendedText],
  )

  const fieldTone =
    status === "rejected" ? "muted" : fp === "synced" ? "success" : "highlight"

  function handleResetRecommendation() {
    onRecommendedTextChange(originalText)
  }

  if (!showEditor) {
    return (
      <div className="w-full min-w-0 space-y-2">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <p className="text-sm leading-relaxed text-slate-900">{recommendation.recommendedText}</p>
        </div>
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
        >
          <Check className="size-4 text-success-600" /> Accept anyway
        </button>
      </div>
    )
  }

  const showPushUpdate =
    status === "accepted" && hasUnpublishedEdits && (isSyncing || fp === "queued") && onPushUpdate
  const showAcceptedReviewActions = status === "accepted" && !isFieldInSyndication(fp)
  const inSyndication = status === "accepted" && isFieldInSyndication(fp)

  return (
    <div className="w-full min-w-0">
      <div className="w-full space-y-2">
        <EditableRecommendationField
          value={recommendation.recommendedText}
          diff={compareDiff}
          originalValue={originalText}
          onChange={onRecommendedTextChange}
          tone={fieldTone}
          showDiff={status !== "rejected"}
          readOnly={status === "rejected"}
          editAriaLabel={editAriaLabel}
          editRows={editRows}
          compact={compact}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">Show Reasoning</span>
              <ToggleSwitch
                checked={showReasoning}
                onChange={setShowReasoning}
                ariaLabel="Toggle reasoning"
              />
            </div>
            <div className="flex flex-col items-end gap-1">
              {status === "pending" ||
              showAcceptedReviewActions ||
              showPushUpdate ||
              (status === "rejected" && onUndoReject) ? (
                <div className="flex items-center gap-2">
                  {isModified && !inSyndication ? (
                    <button
                      type="button"
                      onClick={handleResetRecommendation}
                      className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      <RotateCcw className="size-3.5" />
                      Reset recommendation
                    </button>
                  ) : null}
                  {status === "pending" ? (
                    <>
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
                    </>
                  ) : null}
                  {showAcceptedReviewActions ? (
                    <>
                      <span className="inline-flex h-8 items-center gap-1.5 text-xs font-medium text-success-600">
                        <Check className="size-4 shrink-0" aria-hidden />
                        Accepted
                      </span>
                      <button
                        type="button"
                        onClick={onUndoAccept}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
                      >
                        <Undo2 className="size-3.5" /> Undo accept
                      </button>
                    </>
                  ) : null}
                  {showPushUpdate ? (
                    <button
                      type="button"
                      onClick={onPushUpdate}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
                    >
                      <Check className="size-4 text-success-600" /> Push update
                    </button>
                  ) : null}
                  {status === "rejected" && onUndoReject ? (
                    <>
                      <span className="inline-flex h-8 items-center gap-1.5 text-xs font-medium text-slate-500">
                        <X className="size-4 shrink-0" aria-hidden />
                        Rejected
                      </span>
                      <button
                        type="button"
                        onClick={onUndoReject}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
                      >
                        <Undo2 className="size-3.5" /> Undo reject
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
              {status === "accepted" ? (
                <FieldSyncStatusRow
                  syncFootprint={fp}
                  hasUnpublishedEdits={hasUnpublishedEdits}
                  batch={activeBatch}
                  fieldKey={fieldKey}
                />
              ) : null}
            </div>
          </div>
        </div>
        {showReasoning && <ReasoningPanel reasoning={recommendation.reasoning} />}
      </div>
    </div>
  )
}
