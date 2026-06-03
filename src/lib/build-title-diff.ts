import type { DiffSegment } from "@/components/home/types"

/** Character-level prefix/suffix diff: baseline → recommended. */
export function buildTitleDiff(baseline: string, recommended: string): DiffSegment[] {
  if (baseline === recommended) {
    return recommended ? [{ kind: "kept", text: recommended }] : []
  }

  let prefixLen = 0
  const minLen = Math.min(baseline.length, recommended.length)
  while (prefixLen < minLen && baseline[prefixLen] === recommended[prefixLen]) {
    prefixLen++
  }

  let suffixLen = 0
  while (
    suffixLen < minLen - prefixLen &&
    baseline[baseline.length - 1 - suffixLen] === recommended[recommended.length - 1 - suffixLen]
  ) {
    suffixLen++
  }

  const segments: DiffSegment[] = []
  const prefix = recommended.slice(0, prefixLen)
  const removed = baseline.slice(prefixLen, baseline.length - suffixLen)
  const added = recommended.slice(prefixLen, recommended.length - suffixLen)
  const suffix = recommended.slice(recommended.length - suffixLen)

  if (prefix) segments.push({ kind: "kept", text: prefix })
  if (removed) segments.push({ kind: "removed", text: removed })
  if (added) segments.push({ kind: "added", text: added })
  if (suffix) segments.push({ kind: "kept", text: suffix })

  return segments
}
