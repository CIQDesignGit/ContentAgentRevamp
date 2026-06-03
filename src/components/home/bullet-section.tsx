"use client"

import { useMemo } from "react"
import { Columns2, ListChecks } from "lucide-react"
import { buildBulletSlots } from "@/lib/build-bullet-slots"
import { titleMatchPercent } from "@/lib/title-match"
import { BulletBulkActions, bulletBulkPendingLabel } from "./bullet-bulk-actions"
import { BulletSlotRow } from "./bullet-slot-card"
import type { BulletRecommendation } from "./types"

interface BulletPointsSectionProps {
  pimBullets: string[]
  pdpBullets: string[]
  recommendations: BulletRecommendation[]
  originals: Record<string, string>
  onRecommendationTextChange: (id: string, text: string) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onReset: (id: string) => void
  onAcceptAll: () => void
  onRejectAll: () => void
  onResetAll: () => void
}

export function BulletPointsSection({
  pimBullets,
  pdpBullets,
  recommendations,
  originals,
  onRecommendationTextChange,
  onAccept,
  onReject,
  onReset,
  onAcceptAll,
  onRejectAll,
  onResetAll,
}: BulletPointsSectionProps) {
  const matchPercent = useMemo(
    () => titleMatchPercent(pimBullets.join("\n"), pdpBullets.join("\n")),
    [pimBullets, pdpBullets],
  )

  const slots = useMemo(
    () => buildBulletSlots(pimBullets, pdpBullets, recommendations),
    [pimBullets, pdpBullets, recommendations],
  )

  const pendingLabel = bulletBulkPendingLabel(recommendations)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-1 py-2">
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
          {pendingLabel ? (
            <span className="text-xs text-slate-500">{pendingLabel}</span>
          ) : null}
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

      <div className="-mx-3 mt-3 divide-y-2 divide-slate-200">
        {slots.map((slot) => (
          <BulletSlotRow
            key={slot.id}
            slot={slot}
            originals={originals}
            onTextChange={onRecommendationTextChange}
            onAccept={onAccept}
            onReject={onReject}
            onReset={onReset}
          />
        ))}
      </div>
    </section>
  )
}
