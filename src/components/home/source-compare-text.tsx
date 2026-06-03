import { buildTitleDiff } from "@/lib/build-title-diff"

/** Inline diff for PIM vs retailer source cells — differing spans are semibold. */
export function SourceCompareText({
  value,
  compareValue,
  side,
}: {
  value: string
  compareValue: string
  side: "pim" | "pdp"
}) {
  const segments = buildTitleDiff(
    side === "pim" ? value : compareValue,
    side === "pim" ? compareValue : value,
  )

  return (
    <p className="flex-1 px-3 py-2 pr-10 text-sm leading-relaxed text-slate-800">
      {segments.map((seg, idx) => {
        if (side === "pim" && seg.kind === "added") return null
        if (side === "pdp" && seg.kind === "removed") return null
        const isDiff = seg.kind === "removed" || seg.kind === "added"
        return (
          <span key={idx} className={isDiff ? "font-medium text-slate-800" : undefined}>
            {seg.text}
          </span>
        )
      })}
    </p>
  )
}
