import type { BulletRecommendation } from "@/components/home/types"

export type BulletSlot =
  | {
      id: string
      kind: "indexed"
      index: number
      pimText: string
      pdpText: string | null
      recommendation: BulletRecommendation | null
    }
  | {
      id: string
      kind: "retailer-only"
      index: number
      pdpText: string
    }
  | {
      id: string
      kind: "add"
      recommendation: BulletRecommendation
    }

export function buildBulletSlots(
  pimBullets: string[],
  pdpBullets: string[],
  recommendations: BulletRecommendation[],
): BulletSlot[] {
  const slots: BulletSlot[] = []
  const addRecos = recommendations.filter((r) => r.kind === "add")

  for (let i = 0; i < pimBullets.length; i++) {
    const reco =
      recommendations.find((r) => r.kind === "edit" && r.pimIndex === i) ?? null
    slots.push({
      id: `indexed-${i}`,
      kind: "indexed",
      index: i,
      pimText: pimBullets[i],
      pdpText: pdpBullets[i] ?? null,
      recommendation: reco,
    })
  }

  for (let i = pimBullets.length; i < pdpBullets.length; i++) {
    slots.push({
      id: `retailer-only-${i}`,
      kind: "retailer-only",
      index: i,
      pdpText: pdpBullets[i],
    })
  }

  for (const reco of addRecos) {
    slots.push({ id: `add-${reco.id}`, kind: "add", recommendation: reco })
  }

  return slots
}
