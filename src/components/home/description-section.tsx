"use client"

import { useMemo, useState } from "react"
import { AlignLeft, Columns2 } from "lucide-react"
import { titleMatchPercent } from "@/lib/title-match"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import {
  ContentRecommendationBody,
  ContentRecommendationHeader,
} from "./content-recommendation-card"
import { fieldLabelContentStack } from "./field-layout"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import { VerticalSourceCompareGrid } from "./vertical-source-compare-grid"
import type { PublishBatch, TitleRecommendation, TitleStatus, SyncFootprint } from "./types"

interface DescriptionSectionProps {
  pimDescription: string
  pdpDescription: string
  status: TitleStatus
  recommendation: TitleRecommendation | null
  syncFootprint?: SyncFootprint
  hasUnpublishedEdits?: boolean
  activeBatch?: PublishBatch
  onRecommendationChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onUndoAccept: () => void
  onUndoReject: () => void
  onPushUpdate?: () => void
  onAcceptNewDraft?: (text: string) => void
}

export function DescriptionSection({
  pimDescription,
  pdpDescription,
  status,
  recommendation,
  syncFootprint,
  hasUnpublishedEdits,
  activeBatch,
  onRecommendationChange,
  onAccept,
  onReject,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
  onAcceptNewDraft,
}: DescriptionSectionProps) {
  const [compareTarget, setCompareTarget] = useState<FieldCompareTarget>("pim")
  const [draftCompareTarget, setDraftCompareTarget] = useState<FieldCompareTarget>("pim")
  const [isOpen, setIsOpen] = useState(true)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [draftText, setDraftText] = useState("")
  const [draftOriginalText, setDraftOriginalText] = useState("")
  const [originalText] = useState(() => recommendation?.recommendedText ?? "")

  const publishedText = recommendation?.recommendedText
  const { pim: displayPim, pdp: displayPdp } = useMemo(
    () =>
      resolvePublishedSourceDisplay(
        pimDescription,
        pdpDescription,
        publishedText,
        syncFootprint,
        activeBatch,
      ),
    [pimDescription, pdpDescription, publishedText, syncFootprint, activeBatch],
  )

  const matchPercent = useMemo(
    () => titleMatchPercent(displayPim, displayPdp),
    [displayPim, displayPdp],
  )

  const showReco = Boolean(recommendation)
  const showRecoBody = showReco && isOpen
  const isFullySynced = status === "accepted" && syncFootprint === "synced"

  const recommendationHeaderEl =
    showReco && !isFullySynced ? (
      <ContentRecommendationHeader
        labels={{
          pending: "AI Recommended Description",
          accepted: "Accepted",
          rejected: "Rejected",
          queued: "Changes queued",
        }}
        status={status}
        syncFootprint={syncFootprint}
        compareTarget={compareTarget}
        onCompareTargetChange={setCompareTarget}
        isOpen={isOpen}
        onToggleOpen={() => setIsOpen((v) => !v)}
      />
    ) : null

  const showHeaderInGrid = Boolean(recommendationHeaderEl && !showRecoBody)

  function handleAddNewDescription() {
    setDraftText(pimDescription)
    setDraftOriginalText(pimDescription)
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 px-1 py-2">
        <AlignLeft className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Description</span>
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
          Optional
        </span>
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
                    onClick={handleAddNewDescription}
                    className="self-start text-xs font-medium text-primary hover:underline"
                  >
                    Edit Description
                  </button>
                </>
              ) : null}
              {isAddingNew && draftRecommendation ? (
                <div className="border-t border-slate-200 pt-3">
                  <ContentRecommendationBody
                    header={
                      <ContentRecommendationHeader
                        labels={{
                          pending: "Add new description",
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
                    editAriaLabel="Edit new description"
                    editRows={5}
                  />
                </div>
              ) : null}
            </div>
          ) : showRecoBody ? (
            <div className={fieldLabelContentStack("w-full")}>
              <ContentRecommendationBody
                key={`${pimDescription}|${pdpDescription}|locked`}
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
                fieldKey="description"
                onRecommendedTextChange={onRecommendationChange}
                onAccept={onAccept}
                onReject={onReject}
                onReset={() => onRecommendationChange(originalText)}
                onUndoAccept={onUndoAccept}
                onUndoReject={onUndoReject}
                onPushUpdate={onPushUpdate}
                addNewLabel={isAddingNew ? undefined : "Add New Description"}
                onAddNew={isAddingNew ? undefined : handleAddNewDescription}
                editAriaLabel="Edit AI recommended description"
                editRows={5}
              />
              {isAddingNew && draftRecommendation ? (
                <div className="border-t border-slate-200 pt-3">
                  <ContentRecommendationBody
                    header={
                      <ContentRecommendationHeader
                        labels={{
                          pending: "Add new description",
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
                    editAriaLabel="Edit new description"
                    editRows={5}
                  />
                </div>
              ) : null}
            </div>
          ) : undefined
        }
      />
    </section>
  )
}
