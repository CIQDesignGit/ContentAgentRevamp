"use client"

import { useEffect, useMemo, useState } from "react"
import { Columns2, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionSelectToggle } from "./section-controls"
import { titleMatchPercent } from "@/lib/title-match"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import type { FieldPublishQueueItem } from "@/lib/build-field-publish-queue"
import { fieldLabelContentStack, fieldSectionStack } from "./field-layout"
import {
  ContentRecommendationBody,
  ContentRecommendationHeader,
} from "./content-recommendation-card"
import { BulletSourceCell, SourceCellLabel } from "./bullet-source-cell"
import { ReasoningAltKeywordsBlock } from "./reasoning-alt-keywords-block"
import type { AltKeyword } from "./types"
import { RETAILER_LOGO_SRC } from "./source-logos"
import { PublishQueueList } from "./publish-queue-list"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import { VerticalSourceCompareGrid } from "./vertical-source-compare-grid"
import type {
  PublishBatch,
  TitleEditSource,
  TitleRecommendation,
  TitleStatus,
  SyncFootprint,
} from "./types"


interface ProductTitleSectionProps {
  pimTitle: string
  pdpTitle: string
  status: TitleStatus
  titleEditSource?: TitleEditSource
  recommendation: TitleRecommendation | null
  syncFootprint?: SyncFootprint
  hasUnpublishedEdits?: boolean
  activeBatch?: PublishBatch
  publishQueue?: FieldPublishQueueItem[]
  /** When false, no PIM catalog entry exists — recommendation goes into the PIM column. */
  hasPimData?: boolean
  onRecommendationChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onUndoAccept: () => void
  onUndoReject: () => void
  onPushUpdate?: () => void
  onAcceptNewDraft?: (text: string) => void
  onUndoStagedNewTitle?: () => void
  /** When set, shows a character counter on the recommendation field. */
  charLimit?: number
  isIncluded?: boolean
  onToggleInclude?: () => void
  /** When true, hides Accept/Reject/Undo buttons (section toggle handles inclusion instead). */
  hideActions?: boolean
  /** When true, Reasoning panel starts expanded on mount (title-optimization mode). */
  defaultReasoningOpen?: boolean
}

export function ProductTitleSection({
  pimTitle,
  pdpTitle,
  status,
  titleEditSource = "ai",
  recommendation,
  syncFootprint,
  hasUnpublishedEdits,
  activeBatch,
  publishQueue = [],
  hasPimData = true,
  onRecommendationChange,
  onAccept,
  onReject,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
  onAcceptNewDraft,
  onUndoStagedNewTitle,
  charLimit,
  isIncluded = true,
  onToggleInclude,
  hideActions = false,
  defaultReasoningOpen = false,
}: ProductTitleSectionProps) {
  const [compareTarget, setCompareTarget] = useState<FieldCompareTarget>("final")
  const [draftCompareTarget, setDraftCompareTarget] = useState<FieldCompareTarget>("final")

  // "Changes queued" state — collapsed by default so users aren't overwhelmed
  const isPublishedLocked =
    status === "accepted" && (syncFootprint === "syncing" || syncFootprint === "queued")
  const [isOpen, setIsOpen] = useState(() => !isPublishedLocked)
  // Keep open/collapsed in sync with the queued state across the full publish lifecycle
  useEffect(() => {
    setIsOpen(!isPublishedLocked)
  }, [isPublishedLocked])

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [draftText, setDraftText] = useState("")
  const [draftOriginalText, setDraftOriginalText] = useState("")
  const [originalText] = useState(() => recommendation?.recommendedText ?? "")

  // No-PIM layout: expanded panel state + keyword interaction (lifted so panels render full-width)
  const [noPimShowReasoning, setNoPimShowReasoning] = useState(defaultReasoningOpen)
  const [noPimShowAltKeywords, setNoPimShowAltKeywords] = useState(false)
  const [noPimUsedKeywordIds, setNoPimUsedKeywordIds] = useState<Set<string>>(new Set())
  const [noPimAppliedSuffixes, setNoPimAppliedSuffixes] = useState<Map<string, string>>(new Map())

  function handleNoPimUseKeyword(kw: AltKeyword) {
    if (kw.replacesWord) {
      const escaped = kw.replacesWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const newText = (recommendation?.recommendedText ?? "").replace(new RegExp(escaped, "i"), kw.keyword)
      onRecommendationChange(newText)
    } else {
      const suffix = `, ${kw.keyword}`
      onRecommendationChange((recommendation?.recommendedText ?? "") + suffix)
      setNoPimAppliedSuffixes((prev) => new Map(prev).set(kw.id, suffix))
    }
    setNoPimUsedKeywordIds((prev) => new Set(prev).add(kw.id))
  }

  function handleNoPimRemoveKeyword(kw: AltKeyword) {
    const suffix = noPimAppliedSuffixes.get(kw.id)
    if (suffix) {
      onRecommendationChange((recommendation?.recommendedText ?? "").replace(suffix, ""))
      setNoPimAppliedSuffixes((prev) => { const m = new Map(prev); m.delete(kw.id); return m })
    }
    setNoPimUsedKeywordIds((prev) => { const s = new Set(prev); s.delete(kw.id); return s })
  }

  const publishedText = recommendation?.recommendedText
  const { pim: displayPim, pdp: displayPdp } = useMemo(
    () =>
      resolvePublishedSourceDisplay(
        pimTitle,
        pdpTitle,
        publishedText,
        syncFootprint,
        activeBatch,
      ),
    [pimTitle, pdpTitle, publishedText, syncFootprint, activeBatch],
  )

  const matchPercent = useMemo(
    () => (hasPimData ? titleMatchPercent(displayPim, displayPdp) : 0),
    [hasPimData, displayPim, displayPdp],
  )

  // When no PIM data exists, "vs. PIM" falls back to "vs. PDP"; "Text" is still allowed.
  const effectiveCompareTarget: FieldCompareTarget =
    !hasPimData && compareTarget === "pim" ? "pdp" : compareTarget

  const showReco = Boolean(recommendation)
  const hasPublishQueue = publishQueue.length > 0
  const showRecoBody = showReco && isOpen
  const hasStagedAwaitingPublish =
    hasPublishQueue &&
    status === "accepted" &&
    (syncFootprint === "none" || syncFootprint === undefined)
  const isFullySynced =
    status === "accepted" && syncFootprint === "synced" && !hasPublishQueue
  const isManualTitleEdit = titleEditSource === "manual"

  function handleAddNewTitle() {
    setDraftText(pimTitle)
    setDraftOriginalText(pimTitle)
    setDraftCompareTarget("pim")
    setIsAddingNew(true)
  }

  function handleAcceptDraft() {
    if (!draftText.trim() || !onAcceptNewDraft) return
    onAcceptNewDraft(draftText)
    setIsAddingNew(false)
  }

  const draftRecommendation = recommendation
    ? { ...recommendation, recommendedText: draftText }
    : null

  const draftBlock =
    isAddingNew && draftRecommendation ? (
      <div className="border-t border-slate-200 pt-3">
        <ContentRecommendationBody
          header={
            <ContentRecommendationHeader
              labels={{
                pending: "Add new title",
                accepted: "Accepted",
                rejected: "Rejected",
              }}
              status="pending"
              compareTarget={draftCompareTarget}
              onCompareTargetChange={setDraftCompareTarget}
              isOpen
              collapsible={false}
              onToggleOpen={() => undefined}
              isAiRecommendation={false}
            />
          }
          recommendation={draftRecommendation}
          pimBaseline={hasPimData ? displayPim : ""}
          pdpBaseline={displayPdp}
          originalText={draftOriginalText}
          compareTarget={hasPimData ? draftCompareTarget : "pdp"}
          status="pending"
          syncFootprint="none"
          onRecommendedTextChange={setDraftText}
          onAccept={handleAcceptDraft}
          onReject={() => setIsAddingNew(false)}
          onReset={() => setDraftText(draftOriginalText)}
          onUndoAccept={() => setIsAddingNew(false)}
          hideReasoning
          hideActions={hideActions}
          rejectLabel="Cancel"
          editAriaLabel="Edit new title"
        />
      </div>
    ) : null

  const stagedAcceptedBlock =
    hasStagedAwaitingPublish && hasPublishQueue && recommendation ? (
      <div className="border-t border-slate-200 pt-3">
        <ContentRecommendationBody
          header={
            <ContentRecommendationHeader
              labels={{
                pending: "New title",
                accepted: "Accepted Title",
                rejected: "Rejected",
              }}
              status="accepted"
              syncFootprint="none"
              compareTarget={compareTarget}
              onCompareTargetChange={setCompareTarget}
              isOpen
              collapsible={false}
              onToggleOpen={() => undefined}
              isAiRecommendation={false}
            />
          }
          recommendation={recommendation}
          pimBaseline={hasPimData ? displayPim : ""}
          pdpBaseline={displayPdp}
          originalText={recommendation.recommendedText}
          compareTarget={effectiveCompareTarget}
          status="accepted"
          syncFootprint="none"
          hasUnpublishedEdits={hasUnpublishedEdits}
          onRecommendedTextChange={onRecommendationChange}
          onAccept={onAccept}
          onReject={onReject}
          onReset={() => onRecommendationChange(recommendation.recommendedText)}
          onUndoAccept={onUndoAccept}
          hideReasoning
          hideActions={hideActions}
          editAriaLabel="Edit title"
        />
      </div>
    ) : null

  const recommendationHeaderEl =
    showReco && !isFullySynced ? (
      <ContentRecommendationHeader
        labels={{
          pending: isManualTitleEdit ? "Edit title" : "AI Recommended Title",
          accepted: "Accepted Title",
          rejected: "Rejected",
          queued: "Changes queued",
        }}
        status={status}
        syncFootprint={syncFootprint}
        compareTarget={effectiveCompareTarget}
        onCompareTargetChange={setCompareTarget}
        compareTabsExclude={hasPimData ? [] : ["pim"]}
        isOpen={isOpen}
        onToggleOpen={() => setIsOpen((v) => !v)}
        isAiRecommendation={!isManualTitleEdit}
      />
    ) : null

  // Don't show the grid header when stagedAcceptedBlock already renders it inside queueBody
  const showHeaderInGrid = Boolean(
    recommendationHeaderEl && (!showRecoBody || hasPublishQueue) && !hasStagedAwaitingPublish,
  )

  const queueBody = (
    <div className={fieldLabelContentStack("w-full")}>
      <PublishQueueList items={publishQueue} fieldKey="title" />
      {stagedAcceptedBlock}
    </div>
  )

  const noPimAltKeywords = recommendation?.altKeywords ?? []
  const noPimHasExpandedPanels = !isPublishedLocked && recommendation &&
    (noPimShowReasoning || noPimShowAltKeywords)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 pl-1 py-2">
        <Type className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Title</span>
        {hasPimData && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-normal text-slate-500">
            <Columns2 className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            {matchPercent}% match between PIM and retailer
          </span>
        )}
        {showReco && (
          <div className="ml-auto">
            <SectionSelectToggle
              selected={isIncluded}
              onToggle={onToggleInclude ?? (() => {})}
            />
          </div>
        )}
      </header>

      {!hasPimData ? (
        /* ── No-PIM layout: 2-column grid (AI Recommendation | Retailer) + full-width panels below ── */
        <div className="flex flex-col gap-3 w-full">
          <div className="grid grid-cols-2 items-start gap-x-3">
            {/* Left: AI Recommendation — panels are rendered full-width below, not inline */}
            <div className={fieldLabelContentStack("min-h-0 min-w-0")}>
              {recommendationHeaderEl}
              {isFullySynced ? (
                <div className={fieldLabelContentStack("w-full")}>
                  {!isAddingNew ? (
                    <>
                      <p className="text-xs text-slate-500">No AI recommendation</p>
                      <button
                        type="button"
                        onClick={handleAddNewTitle}
                        className="self-start text-sm font-medium text-primary hover:underline"
                      >
                        Edit Title
                      </button>
                    </>
                  ) : null}
                  {draftBlock}
                </div>
              ) : hasPublishQueue && showRecoBody ? (
                queueBody
              ) : showRecoBody && recommendation ? (
                <ContentRecommendationBody
                  key={`${pimTitle}|${pdpTitle}|nopim`}
                  recommendation={recommendation}
                  pimBaseline=""
                  pdpBaseline={displayPdp}
                  originalText={originalText}
                  compareTarget={effectiveCompareTarget}
                  status={status}
                  syncFootprint={syncFootprint}
                  hasUnpublishedEdits={hasUnpublishedEdits}
                  activeBatch={activeBatch}
                  fieldKey="title"
                  onRecommendedTextChange={onRecommendationChange}
                  onAccept={onAccept}
                  onReject={onReject}
                  onReset={() => onRecommendationChange(originalText)}
                  onUndoAccept={onUndoAccept}
                  onUndoReject={onUndoReject}
                  onPushUpdate={onPushUpdate}
                  hideReasoning={isManualTitleEdit}
                  hideActions={hideActions}
                  editAriaLabel={isManualTitleEdit ? "Edit title" : "Edit AI recommended title"}
                  charLimit={charLimit}
                  hideExpandedPanels
                  showReasoningPanel={noPimShowReasoning}
                  showAltKeywordsPanel={noPimShowAltKeywords}
                  onReasoningToggle={setNoPimShowReasoning}
                  onAltKeywordsToggle={setNoPimShowAltKeywords}
                />
              ) : null}
            </div>

            {/* Right: Retailer source */}
            <div className={fieldLabelContentStack("min-h-0 min-w-0")}>
              <div className="flex min-h-[30px] items-center">
                <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                <BulletSourceCell
                  logoSrc={RETAILER_LOGO_SRC}
                  logoAlt="Amazon"
                  sublabel="Retailer"
                  value={displayPdp}
                  compareValue=""
                  side="pdp"
                  showLabel={false}
                  charLimit={charLimit}
                />
              </div>
            </div>
          </div>

          {/* Full-width expanded panels */}
          {!isManualTitleEdit && recommendation && (
            <ReasoningAltKeywordsBlock
              reasoning={recommendation.reasoning}
              altKeywords={noPimAltKeywords}
              aeoPerformance={recommendation.aeoPerformance}
              showReasoning={noPimShowReasoning}
              showAltKeywords={noPimShowAltKeywords}
              onReasoningToggle={setNoPimShowReasoning}
              onAltKeywordsToggle={setNoPimShowAltKeywords}
              usedKeywordIds={noPimUsedKeywordIds}
              onUseKeyword={handleNoPimUseKeyword}
              onRemoveKeyword={handleNoPimRemoveKeyword}
            />
          )}
        </div>
      ) : (
        /* ── Has-PIM layout: standard 2-column source grid ── */
        <VerticalSourceCompareGrid
          pimValue={displayPim}
          pdpValue={displayPdp}
          compareTarget={effectiveCompareTarget}
          charLimit={charLimit}
          recommendationHeader={showHeaderInGrid ? recommendationHeaderEl : undefined}
          recommendationBody={
            !recommendation ? undefined : isFullySynced ? (
              <div className={fieldLabelContentStack("w-full")}>
                {!isAddingNew ? (
                  <>
                    <p className="text-xs text-slate-500">No AI recommendation</p>
                    <button
                      type="button"
                      onClick={handleAddNewTitle}
                      className="self-start text-sm font-medium text-primary hover:underline"
                    >
                      Edit Title
                    </button>
                  </>
                ) : null}
                {draftBlock}
              </div>
            ) : hasPublishQueue && showRecoBody ? (
              queueBody
            ) : showRecoBody ? (
              <div className={fieldLabelContentStack("w-full")}>
                <ContentRecommendationBody
                  key={`${pimTitle}|${pdpTitle}|locked`}
                  header={recommendationHeaderEl ?? undefined}
                  recommendation={recommendation}
                  pimBaseline={displayPim}
                  pdpBaseline={displayPdp}
                  originalText={originalText}
                  compareTarget={effectiveCompareTarget}
                  status={status}
                  syncFootprint={syncFootprint}
                  hasUnpublishedEdits={hasUnpublishedEdits}
                  activeBatch={activeBatch}
                  fieldKey="title"
                  onRecommendedTextChange={onRecommendationChange}
                  onAccept={onAccept}
                  onReject={onReject}
                  onReset={() => onRecommendationChange(originalText)}
                  onUndoAccept={onUndoAccept}
                  onUndoReject={onUndoReject}
                  onPushUpdate={onPushUpdate}
                  hideReasoning={isManualTitleEdit}
                  hideActions={hideActions}
                  addNewLabel={isAddingNew ? undefined : "Add New Title"}
                  onAddNew={isAddingNew ? undefined : handleAddNewTitle}
                  editAriaLabel={isManualTitleEdit ? "Edit title" : "Edit AI recommended title"}
                  charLimit={charLimit}
                  defaultReasoningOpen={defaultReasoningOpen}
                />
                {draftBlock}
              </div>
            ) : undefined
          }
        />
      )}

      {/* "Add New Title" stays visible even when the queued dropdown is collapsed */}
      {hasPublishQueue && showReco && !isFullySynced && (
        <>
          {!isAddingNew && !hasStagedAwaitingPublish ? (
            <button
              type="button"
              onClick={handleAddNewTitle}
              className="mt-1 self-start text-xs font-medium text-primary hover:underline"
            >
              Add New Title
            </button>
          ) : null}
          {draftBlock}
        </>
      )}
    </section>
  )
}
