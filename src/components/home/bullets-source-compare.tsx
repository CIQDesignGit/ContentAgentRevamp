"use client"

import { buildTitleDiff } from "@/lib/build-title-diff"
import { cn } from "@/lib/utils"

function BulletLineCompare({
  text,
  compareText,
  side,
}: {
  text: string
  compareText: string
  side: "pim" | "pdp"
}) {
  const trimmed = text.trim()
  if (!trimmed) {
    return <span className="italic text-slate-400">—</span>
  }

  const segments = buildTitleDiff(
    side === "pim" ? text : compareText,
    side === "pim" ? compareText : text,
  )

  return (
    <>
      {segments.map((seg, idx) => {
        if (side === "pim" && seg.kind === "added") return null
        if (side === "pdp" && seg.kind === "removed") return null
        const isDiff = seg.kind === "removed" || seg.kind === "added"
        return (
          <span key={idx} className={cn(isDiff && "font-medium text-slate-800")}>
            {seg.text}
          </span>
        )
      })}
    </>
  )
}

/** Ordered bullet list inside a PIM or PDP source compare cell. */
export function BulletsSourceCompare({
  bullets,
  compareBullets,
  side,
}: {
  bullets: string[]
  compareBullets: string[]
  side: "pim" | "pdp"
}) {
  if (bullets.length === 0) {
    return (
      <p className="flex-1 px-3 py-2 text-sm italic leading-relaxed text-slate-400">—</p>
    )
  }

  return (
    <ol className="flex flex-1 flex-col gap-2.5 px-3 py-2 pr-4">
      {bullets.map((text, index) => (
        <li key={index} className="flex gap-2 text-sm leading-relaxed text-slate-800">
          <span className="grid size-5 shrink-0 place-items-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <BulletLineCompare
              text={text}
              compareText={compareBullets[index] ?? ""}
              side={side}
            />
          </span>
        </li>
      ))}
    </ol>
  )
}
