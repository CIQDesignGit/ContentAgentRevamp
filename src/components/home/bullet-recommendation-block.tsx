"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Check, RotateCcw, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildTitleDiff } from "@/lib/build-title-diff"
import { isFieldInSyndication, resolveBulletSyncFootprint } from "@/lib/sync-footprint"
import { AiRecommendationSparklesIcon, SourceChannelLabel } from "./bullet-source-cell"
import { fieldLabelContentStack } from "./field-layout"
import { EditableRecommendationField } from "./editable-recommendation-field"
import { FieldSyncStatusRow } from "./recommendation-sync-ui"
import { ReasoningPanel, ToggleSwitch } from "./reasoning-ui"
import type { BulletRecommendation, PublishBatch } from "./types"

export type BulletCompareTarget = "pim" | "pdp"

function CompareTabs({
  value,
  onChange,
}: {
  value: BulletCompareTarget
  onChange: (v: BulletCompareTarget) => void
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

/** Title, badge, and PIM/PDP tabs — aligned with source compare row. */
export function BulletRecommendationHeader({
  item,
  compareTarget,
  onCompareTargetChange,
}: {
  item: BulletRecommendation
  compareTarget: BulletCompareTarget
  onCompareTargetChange: (target: BulletCompareTarget) => void
}) {
  return (
    <div className="flex w-full flex-wrap items-end justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <SourceChannelLabel icon={<AiRecommendationSparklesIcon />} label="AI Recommendation" />
        </div>
      {item.status === "pending" ? (
        <CompareTabs value={compareTarget} onChange={onCompareTargetChange} />
      ) : null}
    </div>
  )
}

interface BulletRecommendationBodyProps {
  item: BulletRecommendation
  pimBaseline: string
  pdpBaseline: string
  originalText: string
  compareTarget: BulletCompareTarget
  onTextChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onReset: () => void
  onUndoAccept?: () => void
  onUndoReject?: () => void
  onPushUpdate?: () => void
  activeBatch?: PublishBatch
  className?: string
  /** Renders above the field with standard label-to-content spacing (gap-2). */
  header?: ReactNode
}

/** Editable recommendation field and actions — aligned beside the active source row. */
export function BulletRecommendationBody({
  item,
  pimBaseline,
  pdpBaseline,
  originalText,
  compareTarget,
  onTextChange,
  onAccept,
  onReject,
  onReset,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
  activeBatch,
  className,
  header,
}: BulletRecommendationBodyProps) {
  const [showReasoning, setShowReasoning] = useState(false)
  const isModified = item.recommendedText !== originalText
  const fp = resolveBulletSyncFootprint(item)
  const isSyncing = fp === "syncing"
  const showEditor =
    item.status === "pending" || item.status === "accepted" || item.status === "rejected"

  const baseline = compareTarget === "pim" ? pimBaseline : pdpBaseline
  const compareDiff = useMemo(
    () => buildTitleDiff(baseline, item.recommendedText),
    [baseline, item.recommendedText],
  )

  const fieldTone =
    item.status === "rejected" ? "muted" : fp === "synced" ? "success" : "highlight"

  if (!showEditor) {
    return (
      <div className={cn("w-full min-w-0 space-y-2", className)}>
        <p className="text-sm leading-relaxed text-slate-700">{item.recommendedText}</p>
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
    item.status === "accepted" &&
    item.hasUnpublishedEdits &&
    (isSyncing || fp === "queued") &&
    onPushUpdate
  const inSyndication = item.status === "accepted" && isFieldInSyndication(fp)
  const showReacceptActions =
    item.status === "accepted" &&
    !inSyndication &&
    Boolean(item.hasUnpublishedEdits) &&
    onUndoAccept
  const showAcceptedReviewActions =
    item.status === "accepted" && !isFieldInSyndication(fp) && onUndoAccept && !showReacceptActions

  const recommendationField = (
    <EditableRecommendationField
      value={item.recommendedText}
      diff={compareDiff}
      originalValue={originalText}
      onChange={onTextChange}
      tone={fieldTone}
      showDiff={item.status !== "rejected"}
      readOnly={item.status === "rejected"}
      compact
    />
  )

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className={fieldLabelContentStack("w-full")}>
        {header ? (
          <div className={fieldLabelContentStack("w-full")}>
            {header}
            {recommendationField}
          </div>
        ) : (
          recommendationField
        )}

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
            {item.status === "pending" ||
            showReacceptActions ||
            showAcceptedReviewActions ||
            showPushUpdate ||
            (item.status === "rejected" && onUndoReject) ? (
              <div className="flex items-center gap-2">
                {showReacceptActions ? (
                  <>
                    <button
                      type="button"
                      onClick={onReset}
                      className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      <RotateCcw className="size-3.5" />
                      Reset Recommendation
                    </button>
                    <button
                      type="button"
                      onClick={onUndoAccept}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
                    >
                      <Undo2 className="size-3.5" /> Undo
                    </button>
                    <button
                      type="button"
                      onClick={onAccept}
                      aria-label="Accept recommendation"
                      title="Accept"
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
                    >
                      <Check className="size-4 text-success-600" /> Accept
                    </button>
                  </>
                ) : null}
                {!showReacceptActions && isModified && !inSyndication ? (
                  <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset Recommendation
                  </button>
                ) : null}
                {item.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={onReject}
                      aria-label="Reject recommendation"
                      title="Reject"
                      className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                    >
                      <X className="size-4 text-error-600" />
                    </button>
                    <button
                      type="button"
                      onClick={onAccept}
                      aria-label="Accept recommendation"
                      title="Accept"
                      className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                    >
                      <Check className="size-4 text-success-600" />
                    </button>
                  </>
                ) : null}
                {showAcceptedReviewActions ? (
                  <>
                    <span
                      className="inline-flex h-8 items-center gap-1.5 text-xs font-medium text-success-600"
                      aria-label="Accepted"
                    >
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
                {item.status === "rejected" && onUndoReject ? (
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
            {item.status === "accepted" ? (
              <FieldSyncStatusRow
                syncFootprint={fp}
                hasUnpublishedEdits={item.hasUnpublishedEdits}
                batch={activeBatch}
                fieldKey={`bullet:${item.id}`}
              />
            ) : null}
          </div>
        </div>

        {showReasoning && item.reasoning.length > 0 ? (
          <ReasoningPanel reasoning={item.reasoning} />
        ) : null}
      </div>
    </div>
  )
}
