/** Rough word-overlap score between PIM and PDP titles (0–100). */
export function titleMatchPercent(pimTitle: string, pdpTitle: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 1),
    )

  const a = tokenize(pimTitle)
  const b = tokenize(pdpTitle)
  if (a.size === 0 && b.size === 0) return 100
  if (a.size === 0 || b.size === 0) return 0

  let overlap = 0
  for (const word of a) {
    if (b.has(word)) overlap++
  }
  const union = new Set([...a, ...b]).size
  return Math.round((overlap / union) * 100)
}
