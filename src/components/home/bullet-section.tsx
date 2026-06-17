"use client"

import { useMemo, useState } from "react"
import { Columns2, ListChecks } from "lucide-react"
import { buildDisplayBulletLists } from "@/lib/build-display-bullet-lists"
import { titleMatchPercent } from "@/lib/title-match"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import { resolveBulletSyncFootprint } from "@/lib/sync-footprint"
import { BulletBulkActions } from "./bullet-bulk-actions"
import { BulletsSourceCompare } from "./bullets-source-compare"
import { ContentRecommendationHeader } from "./content-recommendation-card"
import { AiRecommendationSparklesIcon, SourceChannelLabel } from "./bullet-source-cell"
import {
  BulletRecommendationBlock,
  type BulletRecommendationSlotProps,
} from "./bullet-recommendation-slot"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import { VerticalSourceCompareGrid } from "./vertical-source-compare-grid"
import type { FieldPublishQueueItem } from "@/lib/build-field-publish-queue"
import type { BulletRecommendation, PublishBatch } from "./types"

interface BulletPointsSectionProps {
  pimBullets: string[]
  pdpBullets: string[]
  recommendations: BulletRecommendation[]
  originals: Record<string, string>
  /** When false, no PIM catalog entry exists — recommendations go into the PIM column. */
  hasPimData?: boolean
  getFieldPublishBatch?: (fieldKey: string) => PublishBatch | undefined
  getBulletPublishQueue?: (bulletId: string) => FieldPublishQueueItem[]
  onRecommendationTextChange: (id: string, text: string) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onReset: (id: string) => void
  onUndoAccept: (id: string) => void
  onUndoReject: (id: string) => void
  onPushUpdate: (id: string) => void
  onAcceptAll: () => void
  onRejectAll: () => void
  onResetAll: () => void
  onAcceptNewDraft?: (id: string, text: string) => void
}

function getBulletBaselines(
  reco: BulletRecommendation,
  pimBullets: string[],
  pdpBullets: string[],
  getFieldPublishBatch?: (fieldKey: string) => PublishBatch | undefined,
) {
  if (reco.kind === "add") {
    return { pimBaseline: "", pdpBaseline: "" }
  }

  const index = reco.pimIndex ?? 0
  const pimText = pimBullets[index] ?? ""
  const pdpText = pdpBullets[index] ?? ""
  const fp = resolveBulletSyncFootprint(reco)
  const batch = getFieldPublishBatch?.(`bullet:${reco.id}`)
  const display = resolvePublishedSourceDisplay(
    pimText,
    pdpText,
    reco.recommendedText,
    fp,
    batch,
  )

  return { pimBaseline: display.pim, pdpBaseline: display.pdp }
}

function buildRecommendationBlockProps(
  reco: BulletRecommendation,
  pimBullets: string[],
  pdpBullets: string[],
  originals: Record<string, string>,
  compareTarget: FieldCompareTarget,
  getFieldPublishBatch: BulletPointsSectionProps["getFieldPublishBatch"],
  getBulletPublishQueue: BulletPointsSectionProps["getBulletPublishQueue"],
  handlers: Pick<
    BulletPointsSectionProps,
    | "onRecommendationTextChange"
    | "onAccept"
    | "onReject"
    | "onReset"
    | "onUndoAccept"
    | "onUndoReject"
    | "onPushUpdate"
    | "onAcceptNewDraft"
  >,
): BulletRecommendationSlotProps {
  const { pimBaseline, pdpBaseline } = getBulletBaselines(
    reco,
    pimBullets,
    pdpBullets,
    getFieldPublishBatch,
  )

  return {
    item: reco,
    pimBaseline,
    pdpBaseline,
    originalText: originals[reco.id] ?? reco.recommendedText,
    compareTarget,
    publishQueue: getBulletPublishQueue?.(reco.id) ?? [],
    activeBatch: getFieldPublishBatch?.(`bullet:${reco.id}`),
    onTextChange: (text) => handlers.onRecommendationTextChange(reco.id, text),
    onAccept: () => handlers.onAccept(reco.id),
    onReject: () => handlers.onReject(reco.id),
    onReset: () => handlers.onReset(reco.id),
    onUndoAccept: () => handlers.onUndoAccept(reco.id),
    onUndoReject: () => handlers.onUndoReject(reco.id),
    onPushUpdate: () => handlers.onPushUpdate(reco.id),
    onAcceptNewDraft: handlers.onAcceptNewDraft
      ? (text) => handlers.onAcceptNewDraft!(reco.id, text)
      : undefined,
  }
}

export function BulletPointsSection({
  pimBullets,
  pdpBullets,
  recommendations,
  originals,
  hasPimData = true,
  getFieldPublishBatch,
  getBulletPublishQueue,
  onRecommendationTextChange,
  onAccept,
  onReject,
  onReset,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
  onAcceptAll,
  onRejectAll,
  onResetAll,
  onAcceptNewDraft,
}: BulletPointsSectionProps) {
  const [gridCompareTarget] = useState<FieldCompareTarget>("pim")
  const [recoCompareTarget, setRecoCompareTarget] = useState<FieldCompareTarget>("pim")

  // No PIM to compare against — always diff against PDP
  const effectiveRecoCompareTarget: FieldCompareTarget = hasPimData ? recoCompareTarget : "pdp"

  const matchPercent = useMemo(
    () => (hasPimData ? titleMatchPercent(pimBullets.join("\n"), pdpBullets.join("\n")) : 0),
    [hasPimData, pimBullets, pdpBullets],
  )

  const displayLists = useMemo(
    () => buildDisplayBulletLists(pimBullets, pdpBullets, recommendations, getFieldPublishBatch),
    [pimBullets, pdpBullets, recommendations, getFieldPublishBatch],
  )

  const activeRecommendations = useMemo(
    () =>
      recommendations.filter(
        (reco) =>
          reco.status === "pending" ||
          reco.status === "accepted" ||
          reco.status === "rejected",
      ),
    [recommendations],
  )

  const hasPendingRecommendations = useMemo(
    () => activeRecommendations.some((reco) => reco.status === "pending"),
    [activeRecommendations],
  )

  const recommendationBlocks = activeRecommendations.map((reco) => (
    <BulletRecommendationBlock
      key={reco.id}
      {...buildRecommendationBlockProps(
        reco,
        pimBullets,
        pdpBullets,
        originals,
        effectiveRecoCompareTarget,
        getFieldPublishBatch,
        getBulletPublishQueue,
        {
          onRecommendationTextChange,
          onAccept,
          onReject,
          onReset,
          onUndoAccept,
          onUndoReject,
          onPushUpdate,
          onAcceptNewDraft,
        },
      )}
    />
  ))

  // When no PIM data: all bullet recommendations live in the left (PIM) column
  const noPimBulletsCell =
    !hasPimData && recommendationBlocks.length > 0 ? (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="divide-y divide-slate-200">{recommendationBlocks}</div>
        <BulletBulkActions
          recommendations={recommendations}
          originals={originals}
          onAcceptAll={onAcceptAll}
          onRejectAll={onRejectAll}
          onResetAll={onResetAll}
        />
      </div>
    ) : null

  const pdpCompareForPim = useMemo(
    () => displayLists.pim.map((_, index) => displayLists.pdp[index] ?? ""),
    [displayLists],
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 px-1 py-2">
        <ListChecks className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Bullet Points</span>
        {hasPimData && (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-normal text-slate-500">
              <Columns2 className="size-3.5 shrink-0 text-slate-400" aria-hidden />
              {matchPercent}% match between PIM and retailer
            </span>
            <span className="text-xs text-slate-400">
              {pimBullets.length} PIM · {pdpBullets.length} PDP
            </span>
          </>
        )}
      </header>

      <VerticalSourceCompareGrid
        pimValue=""
        pdpValue=""
        compareTarget={gridCompareTarget}
        pimCell={
          noPimBulletsCell ?? (
            <BulletsSourceCompare
              bullets={displayLists.pim}
              compareBullets={pdpCompareForPim}
              side="pim"
            />
          )
        }
        pimCellBare={!hasPimData}
        pimColumnLabel={
          !hasPimData ? (
            <SourceChannelLabel
              icon={<AiRecommendationSparklesIcon />}
              label="AI Recommended Bullets"
            />
          ) : undefined
        }
        pdpCell={
          <BulletsSourceCompare
            bullets={displayLists.pdp}
            compareBullets={hasPimData ? displayLists.pim : []}
            side="pdp"
          />
        }
        recommendationBody={
          hasPimData && recommendationBlocks.length > 0 ? (
            <div className="w-full min-w-0">
              <div className="border-b border-slate-200 pb-3">
                <ContentRecommendationHeader
                  labels={{
                    pending: "AI Recommended Bullets",
                    accepted: "AI Recommended Bullets",
                    rejected: "AI Recommended Bullets",
                    queued: "Changes queued",
                  }}
                  status={hasPendingRecommendations ? "pending" : "accepted"}
                  compareTarget={recoCompareTarget}
                  onCompareTargetChange={setRecoCompareTarget}
                  isOpen
                  collapsible={false}
                  onToggleOpen={() => undefined}
                />
              </div>
              <div className="divide-y divide-slate-200">{recommendationBlocks}</div>
              <BulletBulkActions
                recommendations={recommendations}
                originals={originals}
                onAcceptAll={onAcceptAll}
                onRejectAll={onRejectAll}
                onResetAll={onResetAll}
              />
            </div>
          ) : undefined
        }
      />
    </section>
  )
}
