"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Check, ChevronDown, ChevronRight, RotateCcw, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildTitleDiff } from "@/lib/build-title-diff"
import {
  isFieldInSyndication,
  isFieldPublishingLocked,
  resolveFieldSyncFootprint,
} from "@/lib/sync-footprint"
import {
  AiRecommendationSparklesIcon,
  QueuedChangesTimerIcon,
  SourceChannelLabel,
} from "./bullet-source-cell"
import { fieldLabelContentStack, FIELD_RECO_HEADER_GAP } from "./field-layout"
import { EditableRecommendationField } from "./editable-recommendation-field"
import { FieldSyncStatusRow } from "./recommendation-sync-ui"
import { ToggleSwitch } from "./reasoning-ui"
import { ReasoningAltKeywordsBlock } from "./reasoning-alt-keywords-block"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import type { PublishBatch, TitleRecommendation, TitleStatus, SyncFootprint } from "./types"

/** Prevents textarea blur from stealing the first click on Accept / Cancel. */
function keepFieldFocusOnPointerDown(e: React.MouseEvent) {
  e.preventDefault()
}

const VARIANT_CLASS: Record<string, string> = {
  bordered:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  ghost:
    "px-1 text-slate-500 hover:text-slate-900",
  accept:
    "border border-success-100 bg-success-50 text-success-700 hover:bg-success-100",
  reject:
    "border border-error-100 bg-error-50 text-error-700 hover:bg-error-100",
}

function RecoActionButton({
  onClick,
  label,
  icon,
  iconOnly = false,
  variant = "bordered",
}: {
  onClick: () => void
  label: string
  icon: ReactNode
  iconOnly?: boolean
  variant?: "bordered" | "ghost" | "accept" | "reject"
}) {
  if (iconOnly) {
    return (
      <button
        type="button"
        onMouseDown={keepFieldFocusOnPointerDown}
        onClick={onClick}
        aria-label={label}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md border transition-colors",
          variant === "accept"
            ? "border-success-100 bg-success-50 hover:bg-success-100"
            : variant === "reject"
              ? "border-error-100 bg-error-50 hover:bg-error-100"
              : "border-slate-200 bg-white hover:bg-slate-50",
        )}
      >
        {icon}
      </button>
    )
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onMouseDown={keepFieldFocusOnPointerDown}
        onClick={onClick}
        className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <button
      type="button"
      onMouseDown={keepFieldFocusOnPointerDown}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
        VARIANT_CLASS[variant] ?? VARIANT_CLASS.bordered,
      )}
    >
      {icon}
      {label}
    </button>
  )
}

export type RecommendationLabels = {
  pending: string
  accepted: string
  rejected: string
  /** Shown after publish when the field is in syndication. */
  queued?: string
}

const COMPARE_OPTIONS: { key: FieldCompareTarget; label: string }[] = [
  { key: "final", label: "Text" },
  { key: "pim", label: "vs. PIM" },
  { key: "pdp", label: "vs. PDP" },
]

export function CompareTabs({
  value,
  onChange,
  exclude = [],
}: {
  value: FieldCompareTarget
  onChange: (v: FieldCompareTarget) => void
  /** Keys to omit from the tab list (e.g. hide "pim" when no PIM data exists). */
  exclude?: FieldCompareTarget[]
}) {
  const visibleOptions = exclude.length
    ? COMPARE_OPTIONS.filter((opt) => !exclude.includes(opt.key))
    : COMPARE_OPTIONS

  return (
    <div
      role="tablist"
      aria-label="Compare recommendation with"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
    >
      {visibleOptions.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={value === opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === opt.key ? "bg-brand-100 text-primary" : "text-slate-600 hover:bg-slate-50",
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
  syncFootprint,
  compareTarget,
  onCompareTargetChange,
  isOpen,
  onToggleOpen,
  collapsible = false,
  isAiRecommendation = true,
  hideCompareTabs = false,
  compareTabsExclude = [],
}: {
  labels: RecommendationLabels
  status: TitleStatus
  syncFootprint?: SyncFootprint
  compareTarget: FieldCompareTarget
  onCompareTargetChange: (target: FieldCompareTarget) => void
  isOpen: boolean
  onToggleOpen: () => void
  /** When true, shows an expand/collapse chevron. Defaults to false — always shown. */
  collapsible?: boolean
  /** Sparkles icon is shown only for AI-generated recommendations. */
  isAiRecommendation?: boolean
  /** When true, PIM/PDP tabs are omitted (controlled by a parent toolbar). */
  hideCompareTabs?: boolean
  /** Keys to exclude from the compare tab list (e.g. hide "pim" when no PIM data). */
  compareTabsExclude?: FieldCompareTarget[]
}) {
  const fp = resolveFieldSyncFootprint(syncFootprint)
  const isPublishedLocked = status === "accepted" && isFieldPublishingLocked(fp)
  // "Changes queued" state is always collapsible so users can collapse it out of the way
  const effectivelyCollapsible = collapsible || isPublishedLocked
  const headerLabel = isPublishedLocked
    ? (labels.queued ?? "Changes queued")
    : status === "accepted"
      ? labels.accepted
      : status === "rejected"
        ? labels.rejected
        : labels.pending

  const labelRow = (
    <SourceChannelLabel
      icon={
        isPublishedLocked ? (
          <QueuedChangesTimerIcon />
        ) : isAiRecommendation ? (
          <AiRecommendationSparklesIcon />
        ) : null
      }
      label={headerLabel}
    />
  )

  return (
    <div className="flex min-h-[30px] w-full flex-nowrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {effectivelyCollapsible ? (
            <button
              type="button"
              onClick={onToggleOpen}
              className="flex min-w-0 items-center gap-2 text-left"
              aria-expanded={isOpen}
            >
              {labelRow}
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
          ) : (
            labelRow
          )}
        </div>

      {!hideCompareTabs ? (
        <div
          className={cn(
            "flex h-[30px] shrink-0 items-center justify-end",
            status === "pending" && isOpen ? "visible" : "invisible pointer-events-none",
          )}
          aria-hidden={!(status === "pending" && isOpen)}
        >
          <CompareTabs value={compareTarget} onChange={onCompareTargetChange} exclude={compareTabsExclude} />
        </div>
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
  addNewLabel?: string
  onAddNew?: () => void
  hideReasoning?: boolean
  hideAltKeywords?: boolean
  rejectLabel?: string
  editAriaLabel?: string
  editRows?: number
  compact?: boolean
  /** Icon-only bordered actions (e.g. per-bullet Accept / Reject). */
  iconOnlyActions?: boolean
  /** Renders above the field in one group (gap-1 / 4px). */
  header?: ReactNode
  /** When set, shows a character counter below the field (red when over limit). */
  charLimit?: number
  /** When true, hides the Accept / Reject / Undo action buttons entirely. */
  hideActions?: boolean
  /** When true, suppresses inline expanded panels — parent is responsible for rendering them. */
  hideExpandedPanels?: boolean
  /** When true, the Reasoning panel starts open on mount (uncontrolled default). */
  defaultReasoningOpen?: boolean
  /** External controlled show-state for the Reasoning panel toggle. */
  showReasoningPanel?: boolean
  /** External controlled show-state for the AltKeywords panel toggle. */
  showAltKeywordsPanel?: boolean
  /** Called when the user clicks the Reasoning toggle (controlled mode). */
  onReasoningToggle?: (show: boolean) => void
  /** Called when the user clicks the AltKeywords toggle (controlled mode). */
  onAltKeywordsToggle?: (show: boolean) => void
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
  addNewLabel,
  onAddNew,
  hideReasoning = false,
  hideAltKeywords = false,
  rejectLabel = "Reject",
  editAriaLabel = "Edit AI recommendation",
  editRows = 3,
  compact = false,
  iconOnlyActions = false,
  header,
  charLimit,
  hideActions = false,
  hideExpandedPanels = false,
  defaultReasoningOpen = false,
  showReasoningPanel,
  showAltKeywordsPanel,
  onReasoningToggle,
  onAltKeywordsToggle,
}: ContentRecommendationBodyProps) {
  const [showReasoningLocal, setShowReasoningLocal] = useState(defaultReasoningOpen)
  const [showAltKeywordsLocal, setShowAltKeywordsLocal] = useState(false)
  // Prefer external controlled state when provided (controlled mode)
  const showReasoning = showReasoningPanel ?? showReasoningLocal
  const showAltKeywords = showAltKeywordsPanel ?? showAltKeywordsLocal
  const [usedKeywordIds, setUsedKeywordIds] = useState<Set<string>>(new Set())
  // Tracks the exact string each keyword appended so removal can precisely strip it
  const [appliedSuffixes, setAppliedSuffixes] = useState<Map<string, string>>(new Map())
  // Transient highlight for newly inserted keyword text
  const [insertHighlight, setInsertHighlight] = useState<{ key: number; text: string } | null>(null)
  const altKeywords = recommendation.altKeywords ?? []

  function handleUseKeyword(kw: { id: string; keyword: string; replacesWord?: string }) {
    if (kw.replacesWord) {
      // Targeted swap: replace the specific word/phrase in the recommendation text
      const escaped = kw.replacesWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const newText = recommendation.recommendedText.replace(new RegExp(escaped, "i"), kw.keyword)
      onRecommendedTextChange(newText)
    } else {
      // Append keyword as an additional descriptor
      const suffix = `, ${kw.keyword}`
      onRecommendedTextChange(recommendation.recommendedText + suffix)
      setAppliedSuffixes((prev) => new Map(prev).set(kw.id, suffix))
    }
    setUsedKeywordIds((prev) => new Set(prev).add(kw.id))
    setInsertHighlight({ key: Date.now(), text: kw.keyword })
  }

  function handleRemoveKeyword(kw: { id: string }) {
    const suffix = appliedSuffixes.get(kw.id)
    if (suffix) {
      // Strip only this keyword's contribution from the current text
      onRecommendedTextChange(recommendation.recommendedText.replace(suffix, ""))
      setAppliedSuffixes((prev) => { const m = new Map(prev); m.delete(kw.id); return m })
    }
    setUsedKeywordIds((prev) => { const s = new Set(prev); s.delete(kw.id); return s })
  }

  const isModified = recommendation.recommendedText !== originalText
  const fp = resolveFieldSyncFootprint(syncFootprint)
  const isSyncing = fp === "syncing"
  const isPublishedLocked = status === "accepted" && isFieldPublishingLocked(fp)
  const showEditor = status === "pending" || status === "accepted" || status === "rejected"
  // "final" mode shows clean output with no diff; fall back to pim for baseline calc
  const isFinalView = compareTarget === "final"
  const baseline = compareTarget === "pim" || isFinalView ? pimBaseline : pdpBaseline
  const compareDiff = useMemo(
    () => buildTitleDiff(baseline, recommendation.recommendedText),
    [baseline, recommendation.recommendedText],
  )

  const fieldTone =
    status === "rejected" || isPublishedLocked
      ? "muted"
      : fp === "synced"
        ? "success"
        : status === "accepted"
          ? "accepted"
          : "highlight"

  function handleResetRecommendation() {
    onRecommendedTextChange(originalText)
    // Clear all keyword applied states so cards reset to "+" when text is reverted
    setUsedKeywordIds(new Set())
    setAppliedSuffixes(new Map())
  }

  if (!showEditor) {
    return (
      <div className="w-full min-w-0 space-y-2">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <p className="text-sm leading-relaxed text-slate-900">{recommendation.recommendedText}</p>
        </div>
        <button
          type="button"
          onMouseDown={keepFieldFocusOnPointerDown}
          onClick={onAccept}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
        >
          <Check className="size-4 text-success-600" /> Accept anyway
        </button>
      </div>
    )
  }

  const showPushUpdate =
    !isPublishedLocked &&
    status === "accepted" &&
    hasUnpublishedEdits &&
    (isSyncing || fp === "queued") &&
    onPushUpdate
  const inSyndication = status === "accepted" && isFieldInSyndication(fp)
  const showReacceptActions =
    status === "accepted" && !inSyndication && Boolean(hasUnpublishedEdits)
  const showAcceptedReviewActions =
    status === "accepted" && !isFieldInSyndication(fp) && !showReacceptActions

  const recommendationField = (
    <EditableRecommendationField
      value={recommendation.recommendedText}
      diff={compareDiff}
      originalValue={originalText}
      onChange={onRecommendedTextChange}
      tone={fieldTone}
      showDiff={status === "pending" && !isFinalView}
      readOnly={status === "rejected" || isPublishedLocked}
      editAriaLabel={editAriaLabel}
      editRows={editRows}
      compact={compact}
      charLimit={charLimit}
      exitEditKey={compareTarget}
      highlightedText={insertHighlight?.text}
      highlightKey={insertHighlight?.key}
    />
  )

  return (
    <div className="w-full min-w-0">
      <div className={fieldLabelContentStack("w-full")}>
        {header ? (
          <div className={cn("flex w-full flex-col", FIELD_RECO_HEADER_GAP)}>
            {header}
            {recommendationField}
          </div>
        ) : (
          recommendationField
        )}

        {/* Action bar — only rendered when there are actual actions or the Add New button */}
          {(!hideActions || (isPublishedLocked && addNewLabel && onAddNew)) && (
          <div className="space-y-1 py-1.5">
            {/* Action bar: add-new on the left, Accept/Reject on the right */}
            <div className="flex items-center justify-between gap-3">

              {/* Left side: addNewLabel when locked */}
              {isPublishedLocked && addNewLabel && onAddNew ? (
                <button
                  type="button"
                  onClick={onAddNew}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {addNewLabel}
                </button>
              ) : (
                <span />
              )}

              {/* Right side: Accept / Reject / Undo buttons */}
              {!hideActions && <div className="flex shrink-0 flex-col items-end justify-center gap-1">
                {status === "pending" ||
                showReacceptActions ||
                showAcceptedReviewActions ||
                showPushUpdate ||
                (status === "rejected" && onUndoReject) ? (
                  <div className="flex items-center gap-2">
                    {showReacceptActions ? (
                      <>
                        <RecoActionButton
                          onClick={onReset}
                          label="Reset recommendation"
                          icon={<RotateCcw className="size-3.5" />}
                          iconOnly={iconOnlyActions}
                          variant="ghost"
                        />
                        <RecoActionButton
                          onClick={onUndoAccept}
                          label="Undo"
                          icon={<Undo2 className="size-3.5" />}
                          iconOnly={iconOnlyActions}
                        />
                        <RecoActionButton
                          onClick={onAccept}
                          label="Accept"
                          icon={<Check className="size-4 text-success-600" />}
                          iconOnly={iconOnlyActions}
                        />
                      </>
                    ) : null}
                    {!showReacceptActions && isModified && !isFieldPublishingLocked(fp) ? (
                      <RecoActionButton
                        onClick={handleResetRecommendation}
                        label="Reset recommendation"
                        icon={<RotateCcw className="size-3.5" />}
                        iconOnly={iconOnlyActions}
                        variant="ghost"
                      />
                    ) : null}
                    {status === "pending" ? (
                      <>
                        <RecoActionButton
                          onClick={onReject}
                          label={rejectLabel}
                          icon={<X className="size-4 text-error-600" />}
                          iconOnly={iconOnlyActions}
                          variant="reject"
                        />
                        <RecoActionButton
                          onClick={onAccept}
                          label="Accept"
                          icon={<Check className="size-4 text-success-600" />}
                          iconOnly={iconOnlyActions}
                          variant="accept"
                        />
                      </>
                    ) : null}
                    {showAcceptedReviewActions ? (
                      <>
                        {!iconOnlyActions ? (
                          <span className="inline-flex h-8 items-center gap-1.5 text-xs font-medium text-success-600">
                            <Check className="size-4 shrink-0" aria-hidden />
                            Accepted
                          </span>
                        ) : null}
                        <RecoActionButton
                          onClick={onUndoAccept}
                          label="Undo accept"
                          icon={<Undo2 className="size-3.5" />}
                          iconOnly={iconOnlyActions}
                        />
                      </>
                    ) : null}
                    {showPushUpdate ? (
                      <RecoActionButton
                        onClick={onPushUpdate!}
                        label="Accept"
                        icon={<Check className="size-4 text-success-600" />}
                        iconOnly={iconOnlyActions}
                      />
                    ) : null}
                    {status === "rejected" && onUndoReject ? (
                      <>
                        {!iconOnlyActions ? (
                          <span className="inline-flex h-8 items-center gap-1.5 text-xs font-medium text-slate-500">
                            <X className="size-4 shrink-0" aria-hidden />
                            Rejected
                          </span>
                        ) : null}
                        <RecoActionButton
                          onClick={onUndoReject}
                          label="Undo reject"
                          icon={<Undo2 className="size-3.5" />}
                          iconOnly={iconOnlyActions}
                        />
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
              </div>}
            </div>
          </div>
          )}

          {/* Reasoning + Alt Keywords block */}
          {!hideExpandedPanels && !isPublishedLocked && (
            <ReasoningAltKeywordsBlock
              reasoning={recommendation.reasoning}
              altKeywords={altKeywords}
              aeoPerformance={recommendation.aeoPerformance}
              hideReasoning={hideReasoning}
              hideAltKeywords={hideAltKeywords}
              showReasoning={showReasoning}
              showAltKeywords={showAltKeywords}
              onReasoningToggle={(next) => onReasoningToggle ? onReasoningToggle(next) : setShowReasoningLocal(next)}
              onAltKeywordsToggle={(next) => onAltKeywordsToggle ? onAltKeywordsToggle(next) : setShowAltKeywordsLocal(next)}
              usedKeywordIds={usedKeywordIds}
              onUseKeyword={handleUseKeyword}
              onRemoveKeyword={handleRemoveKeyword}
            />
          )}
      </div>
    </div>
  )
}
