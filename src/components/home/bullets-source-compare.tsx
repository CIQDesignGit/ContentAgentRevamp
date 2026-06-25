"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
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
  // null = nothing copied; number = index of bullet just copied; "all" = full list copied
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null)

  function copyBullet(index: number) {
    navigator.clipboard.writeText(bullets[index]).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    })
  }

  function copyAll() {
    const text = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex("all")
      setTimeout(() => setCopiedIndex(null), 1500)
    })
  }

  if (bullets.length === 0) {
    return (
      <p className="flex-1 px-3 py-2 text-sm italic leading-relaxed text-slate-400">—</p>
    )
  }

  return (
    <div className="group/bullets relative flex flex-1 flex-col">
      <ol className="flex flex-1 flex-col gap-2.5 px-3 py-2 pr-8">
        {bullets.map((text, index) => {
          const isCopied = copiedIndex === index
          return (
            <li key={index} className="group/row relative flex gap-2 pr-7 text-sm leading-relaxed text-slate-800">
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

              {/* Per-bullet copy button — appears on row hover */}
              <button
                type="button"
                onClick={() => copyBullet(index)}
                aria-label={`Copy bullet ${index + 1}`}
                title="Copy"
                className={cn(
                  "absolute right-0 top-0 grid size-6 place-items-center rounded border shadow-sm transition-opacity",
                  "opacity-0 group-hover/row:opacity-100",
                  isCopied
                    ? "border-success-200 bg-success-50 text-success-600"
                    : "border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
              </button>
            </li>
          )
        })}
      </ol>

      {/* Copy-all button — appears on hover of the whole cell */}
      <button
        type="button"
        onClick={copyAll}
        aria-label="Copy all bullet points"
        title="Copy all"
        className={cn(
          "absolute bottom-2 right-2 grid size-7 place-items-center rounded-md border shadow-sm transition-opacity",
          "opacity-0 group-hover/bullets:opacity-100",
          copiedIndex === "all"
            ? "border-success-200 bg-success-50 text-success-600"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900",
        )}
      >
        {copiedIndex === "all" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  )
}
