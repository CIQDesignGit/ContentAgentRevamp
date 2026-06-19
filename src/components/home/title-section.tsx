"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Columns2, Square, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { titleMatchPercent } from "@/lib/title-match"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import type { FieldPublishQueueItem } from "@/lib/build-field-publish-queue"
import { fieldLabelContentStack } from "./field-layout"
import {
  CompareTabs,
  ContentRecommendationBody,
  ContentRecommendationHeader,
} from "./content-recommendation-card"
import { AiRecommendationSparklesIcon, SourceCellLabel, SourceChannelLabel } from "./bullet-source-cell"
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

// ─── Section select toggle (shared pattern) ──────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

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

  // When no PIM data: the recommendation UI lives inside the PIM column cell
  const noPimRecoCell =
    !hasPimData && recommendation ? (
      <div className="flex h-full flex-col gap-3 pb-3">
        <ContentRecommendationBody
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
          hideActions={hideActions}
          editAriaLabel={isManualTitleEdit ? "Edit title" : "Edit AI recommended title"}
          charLimit={charLimit}
        />
      </div>
    ) : null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 px-1 py-2">
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

      <VerticalSourceCompareGrid
        pimValue={hasPimData ? displayPim : displayPdp}
        pdpValue={hasPimData ? displayPdp : ""}
        compareTarget={effectiveCompareTarget}
        reverseColumns={!hasPimData}
        charLimit={charLimit}
        pimColumnLabel={
          !hasPimData ? (
            <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
          ) : undefined
        }
        pdpCell={!hasPimData && noPimRecoCell ? noPimRecoCell : undefined}
        pdpCellBare={!hasPimData}
        pdpColumnLabel={
          !hasPimData ? (
            <SourceChannelLabel
              icon={<AiRecommendationSparklesIcon />}
              label="AI Recommended Title"
            />
          ) : undefined
        }
        recommendationHeader={hasPimData && showHeaderInGrid ? recommendationHeaderEl : undefined}
        recommendationBody={
          !hasPimData || !recommendation ? undefined : isFullySynced ? (
            <div className={fieldLabelContentStack("w-full")}>
              {!isAddingNew ? (
                <>
                  <p className="text-xs text-slate-500">No AI recommendation</p>
                  <button
                    type="button"
                    onClick={handleAddNewTitle}
                    className="self-start text-base font-medium text-primary hover:underline"
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
                pimBaseline={hasPimData ? displayPim : ""}
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
                editAriaLabel={
                  isManualTitleEdit ? "Edit title" : "Edit AI recommended title"
                }
                charLimit={charLimit}
              />
              {draftBlock}
            </div>
          ) : undefined
        }
      />

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
