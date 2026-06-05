export const SALSIFY_LOGO_SRC = "/logos/salsify.png"
export const RETAILER_LOGO_SRC = "/logos/retailer-amazon.png"

/** User-facing label for the PIM / catalog source column (logo remains Salsify). */
export const PIM_CHANNEL_LABEL = "PIM"
export const PIM_LOGO_ALT = "PIM"

/** Square logo chip — rounded-xl (12px), 2px inset padding on each side. */
export const SOURCE_LOGO_BADGE_CLASS =
  "inline-flex size-6 shrink-0 rounded-lg border border-1 border-slate-200 bg-white p-[2px]"

/** Inner frame for the logo; parent badge supplies padding. */
export const SOURCE_LOGO_FRAME_CLASS = "relative block size-full overflow-hidden rounded-[10px]"

/** Fit inside the padded frame without cropping. */
export const SOURCE_LOGO_IMAGE_CLASS = "object-contain"

export function logoBadgeClass(_logoSrc?: string): string {
  return SOURCE_LOGO_BADGE_CLASS
}
