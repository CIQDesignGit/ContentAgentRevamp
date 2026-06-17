import type { ProductImage } from "@/components/home/types"

function imageHasContent(image?: ProductImage): boolean {
  if (!image) return false
  return Boolean(image.url) || image.hue !== undefined
}

function imagesMatch(a?: ProductImage, b?: ProductImage): boolean {
  if (!imageHasContent(a) && !imageHasContent(b)) return true
  if (!imageHasContent(a) || !imageHasContent(b)) return false
  if (a!.url && b!.url) return a!.url === b!.url
  if (a!.url || b!.url) return false
  return a!.hue === b!.hue
}

/** Aligns image lists to the same slot count for side-by-side comparison. */
export function alignImageSlots(pimImages: ProductImage[], pdpImages: ProductImage[]): {
  pim: ProductImage[]
  pdp: ProductImage[]
} {
  const slotCount = Math.max(pimImages.length, pdpImages.length, 1)
  const pad = (images: ProductImage[], prefix: string) =>
    Array.from({ length: slotCount }, (_, i) => {
      const existing = images[i]
      if (existing) return existing
      return { id: `${prefix}-empty-${i + 1}`, label: `Image ${i + 1}` }
    })

  return { pim: pad(pimImages, "pim"), pdp: pad(pdpImages, "pdp") }
}

export function imagePresentCount(images: ProductImage[]): number {
  return images.filter(imageHasContent).length
}

export function imageMatchPercent(pimImages: ProductImage[], pdpImages: ProductImage[]): number {
  const { pim, pdp } = alignImageSlots(pimImages, pdpImages)
  const matched = pim.filter((_, i) => imagesMatch(pim[i], pdp[i])).length
  return Math.round((matched / pim.length) * 100)
}

export function makePdpImagesFromPim(pimImages: ProductImage[], pdpPresentCount: number): ProductImage[] {
  const slotCount = Math.max(pimImages.length, pdpPresentCount, 1)
  return Array.from({ length: slotCount }, (_, i) => {
    if (i >= pdpPresentCount) {
      return { id: `pdp-img-${i + 1}`, label: `Image ${i + 1}` }
    }
    const pim = pimImages[i]
    const hue =
      pim?.hue !== undefined ? (pim.hue + 45) % 360 : (140 + i * 22) % 360
    return {
      id: `pdp-img-${i + 1}`,
      label: `Image ${i + 1}`,
      hue,
    }
  })
}

/** Gradient placeholder slots for AI-recommended images when no PIM catalog exists. */
export function makeRecommendedImages(count: number, baseHue = 260): ProductImage[] {
  const slotCount = Math.max(count, 1)
  return Array.from({ length: slotCount }, (_, i) => ({
    id: `reco-img-${i + 1}`,
    label: `Image ${i + 1}`,
    hue: (baseHue + i * 28) % 360,
  }))
}
