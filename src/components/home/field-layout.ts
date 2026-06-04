import { cn } from "@/lib/utils"

/** Tailwind gap-2 (8px) — label/title row to content below. */
export const FIELD_LABEL_CONTENT_GAP = "gap-2" as const

/** Tailwind gap-1 (4px) — reco header row to editable field. */
export const FIELD_RECO_HEADER_GAP = "gap-1" as const

/** Tailwind gap-3 (12px) — space between major blocks (e.g. source compare vs AI reco). */
export const FIELD_SECTION_GAP = "gap-3" as const

/** Stack a field label or section title above its content. */
export function fieldLabelContentStack(...extra: (string | undefined)[]) {
  return cn("flex flex-col", FIELD_LABEL_CONTENT_GAP, ...extra)
}

/** Stack major field sections (source columns, recommendation block, etc.). */
export function fieldSectionStack(...extra: (string | undefined)[]) {
  return cn("flex flex-col", FIELD_SECTION_GAP, ...extra)
}
