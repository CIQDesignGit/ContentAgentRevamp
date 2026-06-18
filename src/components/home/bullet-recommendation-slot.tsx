"use client"

import { useMemo, useState, type ReactNode } from "react"
import type { FieldPublishQueueItem } from "@/lib/build-field-publish-queue"
import {
  bulletAsTitleRecommendation,
  bulletRecommendationLabels,
} from "@/lib/bullet-title-recommendation"
import { resolveBulletSyncFootprint } from "@/lib/sync-footprint"
import {
  ContentRecommendationBody,
  ContentRecommendationHeader,
} from "./content-recommendation-card"
import { fieldLabelContentStack } from "./field-layout"
import { PublishQueueList } from "./publish-queue-list"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import type { BulletRecommendation, PublishBatch } from "./types"

export interface BulletRecommendationSlotProps {
  item: BulletRecommendation
  pimBaseline: string
  pdpBaseline: string
  originalText: string
  compareTarget: FieldCompareTarget
  publishQueue: FieldPublishQueueItem[]
  activeBatch?: PublishBatch
  onTextChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onReset: () => void
  onUndoAccept: () => void
  onUndoReject: () => void
  onPushUpdate: () => void
  onAcceptNewDraft?: (text: string) => void
}

/** Shared title-parity layout: grid header + body slots for one bullet reco. */
export function useBulletRecommendationView({
  item,
  pimBaseline,
  pdpBaseline,
  originalText,
  compareTarget,
  publishQueue,
  activeBatch,
  onTextChange,
  onAccept,
  onReject,
  onReset,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
  onAcceptNewDraft,
  hideLabel = false,
}: BulletRecommendationSlotProps & {
  /** When true, suppresses the per-bullet label row (e.g. "Bullet 1"). */
  hideLabel?: boolean
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [draftText, setDraftText] = useState("")
  const [draftOriginalText, setDraftOriginalText] = useState("")

  const fp = resolveBulletSyncFootprint(item)
  const fieldKey = `bullet:${item.id}`
  const hasPublishQueue = publishQueue.length > 0
  const showRecoBody = isOpen
  const isFullySynced =
    item.status === "accepted" && fp === "synced" && !hasPublishQueue

  const labels = useMemo(() => bulletRecommendationLabels(item), [item])
  const recommendation = useMemo(() => bulletAsTitleRecommendation(item), [item])
  const draftRecommendation = useMemo(
    () => ({ ...recommendation, recommendedText: draftText }),
    [recommendation, draftText],
  )

  function handleStartEditBullet() {
    setDraftText(item.recommendedText)
    setDraftOriginalText(originalText)
    setIsEditing(true)
  }

  function handleAcceptDraft() {
    const text = draftText.trim()
    if (!text) return
    onAcceptNewDraft?.(text)
    setIsEditing(false)
  }

  const recommendationHeaderEl = !isFullySynced && !hideLabel ? (
    <ContentRecommendationHeader
      labels={labels}
      status={item.status}
      syncFootprint={fp}
      compareTarget={compareTarget}
      onCompareTargetChange={() => undefined}
      isOpen={isOpen}
      onToggleOpen={() => setIsOpen((v) => !v)}
      hideCompareTabs
      isAiRecommendation={false}
    />
  ) : null

  const showHeaderInGrid = Boolean(recommendationHeaderEl && (!showRecoBody || hasPublishQueue))

  const draftBlock =
    isEditing && onAcceptNewDraft ? (
      <div className="border-t border-slate-200 pt-3">
        <ContentRecommendationBody
          header={
            <ContentRecommendationHeader
              labels={{
                pending: item.kind === "add" ? "Edit bullet" : `Edit ${item.label}`,
                accepted: labels.accepted,
                rejected: "Rejected",
              }}
              status="pending"
              compareTarget={compareTarget}
              onCompareTargetChange={() => undefined}
              isOpen
              collapsible={false}
              onToggleOpen={() => undefined}
              isAiRecommendation={false}
              hideCompareTabs
            />
          }
          recommendation={draftRecommendation}
          pimBaseline={pimBaseline}
          pdpBaseline={pdpBaseline}
          originalText={draftOriginalText}
          compareTarget={compareTarget}
          status="pending"
          syncFootprint="none"
          onRecommendedTextChange={setDraftText}
          onAccept={handleAcceptDraft}
          onReject={() => setIsEditing(false)}
          onReset={() => setDraftText(draftOriginalText)}
          onUndoAccept={() => setIsEditing(false)}
          hideReasoning
          rejectLabel="Cancel"
          editAriaLabel={`Edit ${item.label}`}
          compact
          iconOnlyActions
        />
      </div>
    ) : null

  const queueBody = (
    <div className={fieldLabelContentStack("w-full")}>
      <PublishQueueList items={publishQueue} fieldKey={fieldKey} />
      {hasPublishQueue && !isEditing && onAcceptNewDraft ? (
        <button
          type="button"
          onClick={handleStartEditBullet}
          className="self-start text-xs font-medium text-primary hover:underline"
        >
          Edit bullet
        </button>
      ) : null}
      {draftBlock}
    </div>
  )

  let gridBody: ReactNode = null

  if (isFullySynced) {
    gridBody = null
  } else if (hasPublishQueue && showRecoBody) {
    gridBody = queueBody
  } else if (showRecoBody) {
    gridBody = (
      <ContentRecommendationBody
        header={recommendationHeaderEl ?? undefined}
        recommendation={recommendation}
        pimBaseline={pimBaseline}
        pdpBaseline={pdpBaseline}
        originalText={originalText}
        compareTarget={compareTarget}
        status={item.status}
        syncFootprint={fp}
        hasUnpublishedEdits={item.hasUnpublishedEdits}
        activeBatch={activeBatch}
        fieldKey={fieldKey}
        onRecommendedTextChange={onTextChange}
        onAccept={onAccept}
        onReject={onReject}
        onReset={onReset}
        onUndoAccept={onUndoAccept}
        onUndoReject={onUndoReject}
        onPushUpdate={onPushUpdate}
        editAriaLabel={`Edit ${item.label}`}
        compact
        iconOnlyActions
      />
    )
  }

  return {
    gridHeader: showHeaderInGrid ? recommendationHeaderEl : null,
    gridBody,
    isFullySynced,
  }
}

/** AI recommendation block for one bullet — used below the unified compare grid. */
export function BulletRecommendationBlock(
  props: BulletRecommendationSlotProps & { hideLabel?: boolean },
) {
  const { gridHeader, gridBody, isFullySynced } = useBulletRecommendationView(props)

  if (isFullySynced || (!gridHeader && !gridBody)) return null

  return (
    <div className={fieldLabelContentStack("w-full min-w-0 pb-3 pt-3 first:pt-0")}>
      {gridHeader}
      {gridBody}
    </div>
  )
}
