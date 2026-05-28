"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Image as ImageIcon, ImagePlus, Link2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductImage } from "./types"

function ProductImageCard({ image, onDelete }: { image: ProductImage; onDelete?: () => void }) {
  return (
    <div className="group flex h-56 w-44 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50">
      <header className="flex items-center justify-between gap-2 px-2 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-900">{image.label}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" aria-label="Open image" className="grid size-5 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <Link2 className="size-3.5" />
          </button>
          {onDelete && (
            <button type="button" aria-label={`Delete ${image.label}`} onClick={onDelete} className="grid size-5 place-items-center rounded text-error-600 hover:bg-error-50">
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </header>
      <div className="flex-1 overflow-hidden rounded-b-xl border-t border-slate-200 bg-white">
        {image.url ? (
          <img src={image.url} alt={image.label} className="size-full object-contain p-2" />
        ) : (
          // Dynamic HSL gradient from data — inline style required for computed color
          <div
            className="size-full"
            style={{ background: `linear-gradient(135deg, hsl(${image.hue} 60% 88%), hsl(${((image.hue ?? 0) + 30) % 360} 50% 78%))` }}
            aria-hidden
          />
        )}
      </div>
    </div>
  )
}

interface ImageSectionProps {
  images: ProductImage[]
  onDelete: (id: string) => void
  readOnly?: boolean
}

export function ImageSection({ images, onDelete, readOnly }: ImageSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollIndex, setScrollIndex] = useState(0)
  const presentCount = images.filter((i) => i.url).length
  const pageCount = Math.max(1, images.length - 3)

  function scrollByPage(dir: number) {
    const node = scrollRef.current
    if (!node) return
    const target = Math.max(0, Math.min(images.length - 1, scrollIndex + dir))
    setScrollIndex(target)
    node.scrollTo({ left: target * 188, behavior: "smooth" })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-3">
          <ImageIcon className="size-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">Image</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-warning-200 bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-600">
            {presentCount}/{images.length} Images Present
          </span>
        </div>
        {!readOnly && (
          <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary hover:bg-violet-50">
            <ImagePlus className="size-4" /> Add image
          </button>
        )}
      </header>

      <div className="relative">
        <div ref={scrollRef} className="scroll-thin flex gap-3 overflow-x-auto scroll-smooth px-1 pb-2 pt-1">
          {images.map((image) => (
            <ProductImageCard key={image.id} image={image} onDelete={readOnly ? undefined : () => onDelete(image.id)} />
          ))}
        </div>
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => scrollByPage(-1)}
          disabled={scrollIndex === 0}
          className="absolute left-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next image"
          onClick={() => scrollByPage(1)}
          disabled={scrollIndex >= pageCount}
          className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1">
        {Array.from({ length: pageCount + 1 }).map((_, idx) => (
          <span key={idx} className={cn("h-1 rounded-full transition-all", idx === scrollIndex ? "w-6 bg-primary" : "w-3 bg-slate-200")} />
        ))}
      </div>
    </section>
  )
}
