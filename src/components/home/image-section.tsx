"use client"

import { useMemo, useRef, useState, type ReactNode } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  Image as ImageIcon,
  ImagePlus,
  Link2,
  Trash2,
} from "lucide-react"
import { alignImageSlots, imageMatchPercent, imagePresentCount, makeRecommendedImages } from "@/lib/image-match"
import { cn } from "@/lib/utils"
import { fieldLabelContentStack, fieldSectionStack } from "./field-layout"
import { AiRecommendationSparklesIcon, SourceCellLabel, SourceChannelLabel } from "./bullet-source-cell"
import { PIM_CHANNEL_LABEL, PIM_LOGO_ALT, RETAILER_LOGO_SRC, SALSIFY_LOGO_SRC } from "./source-logos"
import type { ProductImage } from "./types"

const CARD_WIDTH_PX = 136
const CARD_GAP_PX = 12

function ProductImageCard({
  image,
  onDelete,
  readOnly,
}: {
  image: ProductImage
  onDelete?: () => void
  readOnly?: boolean
}) {
  const hasContent = Boolean(image.url) || image.hue !== undefined

  return (
    <div className="group flex h-44 w-[136px] shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50">
      <header className="flex items-center justify-between gap-2 px-2 py-1.5">
        <span className="truncate text-xs font-medium text-slate-900">{image.label}</span>
        {!readOnly && hasContent ? (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              aria-label="Open image"
              className="grid size-5 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Link2 className="size-3.5" />
            </button>
            {onDelete ? (
              <button
                type="button"
                aria-label={`Delete ${image.label}`}
                onClick={onDelete}
                className="grid size-5 place-items-center rounded text-error-600 hover:bg-error-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            ) : null}
          </div>
        ) : null}
      </header>
      <div className="flex-1 overflow-hidden rounded-b-xl border-t border-slate-200 bg-white">
        {image.url ? (
          <img src={image.url} alt={image.label} className="size-full object-contain p-2" />
        ) : image.hue !== undefined ? (
          // Dynamic HSL gradient from data — inline style required for computed color
          <div
            className="size-full"
            style={{
              background: `linear-gradient(135deg, hsl(${image.hue} 60% 88%), hsl(${((image.hue ?? 0) + 30) % 360} 50% 78%))`,
            }}
            aria-hidden
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-slate-50 p-2">
            <span className="text-center text-xs text-slate-400 italic">No image</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ImageCarousel({
  images,
  scrollIndex,
  onScrollIndexChange,
  onDelete,
  readOnly,
  ariaLabel,
}: {
  images: ProductImage[]
  scrollIndex: number
  onScrollIndexChange: (index: number) => void
  onDelete?: (id: string) => void
  readOnly?: boolean
  ariaLabel: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageCount = Math.max(0, images.length - 1)

  function scrollByPage(dir: number) {
    const target = Math.max(0, Math.min(pageCount, scrollIndex + dir))
    onScrollIndexChange(target)
    scrollRef.current?.scrollTo({
      left: target * (CARD_WIDTH_PX + CARD_GAP_PX),
      behavior: "smooth",
    })
  }

  return (
    <div className="relative min-w-0">
      <div
        ref={scrollRef}
        aria-label={ariaLabel}
        className="scroll-thin flex gap-3 overflow-x-auto scroll-smooth pb-1 pt-0.5"
      >
        {images.map((image) => (
          <ProductImageCard
            key={image.id}
            image={image}
            readOnly={readOnly}
            onDelete={
              readOnly || !onDelete ? undefined : () => onDelete(image.id)
            }
          />
        ))}
      </div>
      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => scrollByPage(-1)}
            disabled={scrollIndex === 0}
            className="absolute left-0 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => scrollByPage(1)}
            disabled={scrollIndex >= pageCount}
            className="absolute right-0 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </>
      ) : null}
    </div>
  )
}

function ImageCarouselIndicators({
  count,
  activeIndex,
  onSelect,
}: {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
}) {
  if (count <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      {Array.from({ length: count }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          aria-label={`Go to image ${idx + 1}`}
          onClick={() => onSelect(idx)}
          className={cn(
            "h-1 rounded-full transition-all",
            idx === activeIndex ? "w-6 bg-primary" : "w-3 bg-slate-200",
          )}
        />
      ))}
    </div>
  )
}

function ImageCompareColumn({
  columnLabel,
  logoSrc,
  logoAlt,
  sublabel,
  images,
  presentCount,
  scrollIndex,
  onScrollIndexChange,
  onDelete,
  readOnly,
  ariaLabel,
}: {
  columnLabel?: ReactNode
  logoSrc?: string
  logoAlt?: string
  sublabel?: string
  images: ProductImage[]
  presentCount: number
  scrollIndex: number
  onScrollIndexChange: (index: number) => void
  onDelete?: (id: string) => void
  readOnly?: boolean
  ariaLabel: string
}) {
  return (
    <div className={fieldLabelContentStack("min-h-0 min-w-0")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {columnLabel ?? (
          <SourceCellLabel logoSrc={logoSrc!} logoAlt={logoAlt!} sublabel={sublabel!} />
        )}
        <span className="inline-flex items-center gap-1 rounded-md border border-warning-200 bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-600">
          {presentCount}/{images.length} Present
        </span>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
        <ImageCarousel
          images={images}
          scrollIndex={scrollIndex}
          onScrollIndexChange={onScrollIndexChange}
          onDelete={onDelete}
          readOnly={readOnly}
          ariaLabel={ariaLabel}
        />
        <ImageCarouselIndicators
          count={images.length}
          activeIndex={scrollIndex}
          onSelect={onScrollIndexChange}
        />
      </div>
    </div>
  )
}

interface ImageSectionProps {
  pimImages: ProductImage[]
  pdpImages: ProductImage[]
  hasPimData?: boolean
  onDelete: (id: string) => void
  readOnly?: boolean
}

export function ImageSection({
  pimImages,
  pdpImages,
  hasPimData = true,
  onDelete,
  readOnly,
}: ImageSectionProps) {
  const [pimScrollIndex, setPimScrollIndex] = useState(0)
  const [pdpScrollIndex, setPdpScrollIndex] = useState(0)

  const { pim, pdp } = useMemo(
    () => alignImageSlots(pimImages, pdpImages),
    [pimImages, pdpImages],
  )

  const recommendedImages = useMemo(() => {
    if (hasPimData) return pim
    if (pimImages.length > 0) return pimImages
    return makeRecommendedImages(Math.max(pdpImages.length, pdp.length, 1))
  }, [hasPimData, pim, pimImages, pdpImages.length, pdp.length])

  const leftImages = hasPimData ? pim : recommendedImages
  const matchPercent = useMemo(
    () => (hasPimData ? imageMatchPercent(pimImages, pdpImages) : 0),
    [hasPimData, pimImages, pdpImages],
  )
  const leftPresentCount = imagePresentCount(leftImages)
  const pdpPresentCount = imagePresentCount(pdp)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 px-1 py-2">
        <ImageIcon className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Image</span>
        {hasPimData ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-normal text-slate-500">
            <Columns2 className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            {matchPercent}% match between PIM and retailer
          </span>
        ) : null}
        {!readOnly ? (
          <button
            type="button"
            className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary hover:bg-brand-50"
          >
            <ImagePlus className="size-4" /> Add image
          </button>
        ) : null}
      </header>

      <div className={fieldSectionStack("w-full")}>
        <div className="grid grid-cols-2 items-start gap-x-3">
          <ImageCompareColumn
            columnLabel={
              !hasPimData ? (
                <SourceChannelLabel
                  icon={<AiRecommendationSparklesIcon />}
                  label="AI Recommended Images"
                />
              ) : undefined
            }
            logoSrc={SALSIFY_LOGO_SRC}
            logoAlt={PIM_LOGO_ALT}
            sublabel={PIM_CHANNEL_LABEL}
            images={leftImages}
            presentCount={leftPresentCount}
            scrollIndex={pimScrollIndex}
            onScrollIndexChange={setPimScrollIndex}
            onDelete={onDelete}
            readOnly={readOnly}
            ariaLabel={hasPimData ? "PIM catalog images" : "AI recommended images"}
          />
          <ImageCompareColumn
            logoSrc={RETAILER_LOGO_SRC}
            logoAlt="Amazon"
            sublabel="Retailer"
            images={pdp}
            presentCount={pdpPresentCount}
            scrollIndex={pdpScrollIndex}
            onScrollIndexChange={setPdpScrollIndex}
            readOnly
            ariaLabel="PDP images on retailer"
          />
        </div>
      </div>
    </section>
  )
}
