"use client"

import { useEffect, useMemo, useState } from "react"
import { Columns2, Type } from "lucide-react"
import { titleMatchPercent } from "@/lib/title-match"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import type { FieldPublishQueueItem } from "@/lib/build-field-publish-queue"
import { fieldLabelContentStack } from "./field-layout"
import {
  ContentRecommendationBody,
  ContentRecommendationHeader,
} from "./content-recommendation-card"
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
  onRecommendationChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onUndoAccept: () => void
  onUndoReject: () => void
  onPushUpdate?: () => void
  onAcceptNewDraft?: (text: string) => void
  onUndoStagedNewTitle?: () => void
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
  onRecommendationChange,
  onAccept,
  onReject,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
  onAcceptNewDraft,
  onUndoStagedNewTitle,
}: ProductTitleSectionProps) {
  const [compareTarget, setCompareTarget] = useState<FieldCompareTarget>("pim")
  const [draftCompareTarget, setDraftCompareTarget] = useState<FieldCompareTarget>("pim")

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
    () => titleMatchPercent(displayPim, displayPdp),
    [displayPim, displayPdp],
  )

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
          pimBaseline={displayPim}
          pdpBaseline={displayPdp}
          originalText={draftOriginalText}
          compareTarget={draftCompareTarget}
          status="pending"
          syncFootprint="none"
          onRecommendedTextChange={setDraftText}
          onAccept={handleAcceptDraft}
          onReject={() => setIsAddingNew(false)}
          onReset={() => setDraftText(draftOriginalText)}
          onUndoAccept={() => setIsAddingNew(false)}
          hideReasoning
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
          pimBaseline={displayPim}
          pdpBaseline={displayPdp}
          originalText={recommendation.recommendedText}
          compareTarget={compareTarget}
          status="accepted"
          syncFootprint="none"
          hasUnpublishedEdits={hasUnpublishedEdits}
          onRecommendedTextChange={onRecommendationChange}
          onAccept={onAccept}
          onReject={onReject}
          onReset={() => onRecommendationChange(recommendation.recommendedText)}
          onUndoAccept={onUndoAccept}
          hideReasoning
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
        compareTarget={compareTarget}
        onCompareTargetChange={setCompareTarget}
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 px-1 py-2">
        <Type className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Title</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-normal text-slate-500">
          <Columns2 className="size-3.5 shrink-0 text-slate-400" aria-hidden />
          {matchPercent}% match between PIM and retailer
        </span>
      </header>

      <VerticalSourceCompareGrid
        pimValue={displayPim}
        pdpValue={displayPdp}
        compareTarget={compareTarget}
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
                pimBaseline={displayPim}
                pdpBaseline={displayPdp}
                originalText={originalText}
                compareTarget={compareTarget}
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
                addNewLabel={isAddingNew ? undefined : "Add New Title"}
                onAddNew={isAddingNew ? undefined : handleAddNewTitle}
                editAriaLabel={
                  isManualTitleEdit ? "Edit title" : "Edit AI recommended title"
                }
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
