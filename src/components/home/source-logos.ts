export const SALSIFY_LOGO_SRC = "/logos/salsify.png"
export const RETAILER_LOGO_SRC = "/logos/retailer-amazon.png"

/** Circular logo chip used beside Salsify / retailer labels. */
export const SOURCE_LOGO_BADGE_CLASS =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white"

/** Amazon logo chip — white background so the mark reads clearly on light UI. */
export const RETAILER_LOGO_BADGE_CLASS =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white p-1"

export function logoBadgeClass(logoSrc: string): string {
  return logoSrc === RETAILER_LOGO_SRC ? RETAILER_LOGO_BADGE_CLASS : SOURCE_LOGO_BADGE_CLASS
}
