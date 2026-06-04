"use client"

import { useMemo } from "react"
import { Columns2, ListChecks } from "lucide-react"
import { buildBulletSlots } from "@/lib/build-bullet-slots"
import { titleMatchPercent } from "@/lib/title-match"
import { BulletBulkActions } from "./bullet-bulk-actions"
import { BulletSlotRow } from "./bullet-slot-card"
import type { FieldPublishQueueItem } from "@/lib/build-field-publish-queue"
import type { BulletRecommendation, PublishBatch } from "./types"

interface BulletPointsSectionProps {
  pimBullets: string[]
  pdpBullets: string[]
  recommendations: BulletRecommendation[]
  originals: Record<string, string>
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

export function BulletPointsSection({
  pimBullets,
  pdpBullets,
  recommendations,
  originals,
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
  const matchPercent = useMemo(
    () => titleMatchPercent(pimBullets.join("\n"), pdpBullets.join("\n")),
    [pimBullets, pdpBullets],
  )

  const slots = useMemo(
    () => buildBulletSlots(pimBullets, pdpBullets, recommendations),
    [pimBullets, pdpBullets, recommendations],
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 pt-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <ListChecks className="size-4 shrink-0 text-slate-400" aria-hidden />
          <span className="text-sm font-semibold text-slate-900">Bullet Points</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-normal text-slate-500">
            <Columns2 className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            {matchPercent}% match between PIM and retailer
          </span>
          <span className="text-xs text-slate-400">
            {pimBullets.length} PIM · {pdpBullets.length} PDP
          </span>
        </div>

        <BulletBulkActions
          recommendations={recommendations}
          originals={originals}
          onAcceptAll={onAcceptAll}
          onRejectAll={onRejectAll}
          onResetAll={onResetAll}
          actionsOnly
        />
      </header>

      <div className="-mx-3 mt-1 divide-y divide-slate-200">
        {slots.map((slot, index) => {
          const bulletId =
            slot.kind === "add"
              ? slot.recommendation.id
              : slot.kind === "indexed" && slot.recommendation
                ? slot.recommendation.id
                : undefined
          const fieldKey = bulletId ? `bullet:${bulletId}` : ""
          return (
          <BulletSlotRow
            key={slot.id}
            slot={slot}
            bulletNumber={index + 1}
            showColumnLabels={index === 0}
            originals={originals}
            publishQueue={bulletId ? (getBulletPublishQueue?.(bulletId) ?? []) : []}
            activeBatch={fieldKey ? getFieldPublishBatch?.(fieldKey) : undefined}
            onTextChange={onRecommendationTextChange}
            onAccept={onAccept}
            onReject={onReject}
            onReset={onReset}
            onUndoAccept={onUndoAccept}
            onUndoReject={onUndoReject}
            onPushUpdate={onPushUpdate}
            onAcceptNewDraft={onAcceptNewDraft}
          />
          )
        })}
      </div>
    </section>
  )
}
