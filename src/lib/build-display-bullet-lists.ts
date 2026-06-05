import type { BulletRecommendation, PublishBatch } from "@/components/home/types"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import { resolveBulletSyncFootprint } from "@/lib/sync-footprint"

/** Resolves per-side bullet lines for the unified PIM / PDP compare columns. */
export function buildDisplayBulletLists(
  pimBullets: string[],
  pdpBullets: string[],
  recommendations: BulletRecommendation[],
  getFieldPublishBatch?: (fieldKey: string) => PublishBatch | undefined,
): { pim: string[]; pdp: string[] } {
  const pim: string[] = []
  const pdp: string[] = []

  for (let i = 0; i < pimBullets.length; i++) {
    const pimText = pimBullets[i]
    const pdpText = pdpBullets[i] ?? ""
    const reco = recommendations.find((r) => r.kind === "edit" && r.pimIndex === i)

    if (reco) {
      const fp = resolveBulletSyncFootprint(reco)
      const batch = getFieldPublishBatch?.(`bullet:${reco.id}`)
      const display = resolvePublishedSourceDisplay(
        pimText,
        pdpText,
        reco.recommendedText,
        fp,
        batch,
      )
      pim.push(display.pim)
      pdp.push(display.pdp || pdpText)
    } else {
      pim.push(pimText)
      pdp.push(pdpText)
    }
  }

  for (let i = pimBullets.length; i < pdpBullets.length; i++) {
    pdp.push(pdpBullets[i])
  }

  return { pim, pdp }
}
