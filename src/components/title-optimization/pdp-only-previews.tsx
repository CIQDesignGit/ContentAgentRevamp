import { AiRecommendationSparklesIcon, SourceCellLabel, SourceChannelLabel } from "@/components/home/bullet-source-cell"
import { RETAILER_LOGO_SRC } from "@/components/home/source-logos"
import type { BulletRecommendation, ProductImage, TitleRecommendation } from "@/components/home/types"

// ─── Shared layout primitives ─────────────────────────────────────────────────

function PreviewGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 items-start gap-x-3 px-1 pb-2">
      {children}
    </div>
  )
}

function PreviewColumn({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-6 items-center">{label}</div>
      {children}
    </div>
  )
}

const retailerLabel = (
  <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
)

// ─── PDP-only Bullets preview ─────────────────────────────────────────────────

export function PdpOnlyBulletsPreview({
  pdpBullets,
  recommendations,
}: {
  pdpBullets: string[]
  recommendations: BulletRecommendation[]
}) {
  const recoItems = recommendations.slice(0, 4)
  const pdpItems = pdpBullets.slice(0, 4)

  return (
    <PreviewGrid>
      <PreviewColumn
        label={
          <SourceChannelLabel
            icon={<AiRecommendationSparklesIcon />}
            label="AI Recommended Bullets"
          />
        }
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <ol className="space-y-1.5">
            {recoItems.map((r, i) => (
              <li key={r.id} className="flex gap-2 text-sm text-slate-700">
                <span className="shrink-0 tabular-nums text-slate-400">{i + 1}</span>
                <span className="line-clamp-2">{r.recommendedText}</span>
              </li>
            ))}
          </ol>
        </div>
      </PreviewColumn>

      <PreviewColumn label={retailerLabel}>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <ol className="space-y-1.5">
            {pdpItems.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="shrink-0 tabular-nums text-slate-400">{i + 1}</span>
                <span className="line-clamp-2">{b}</span>
              </li>
            ))}
          </ol>
        </div>
      </PreviewColumn>
    </PreviewGrid>
  )
}

// ─── PDP-only Description preview ────────────────────────────────────────────

export function PdpOnlyDescriptionPreview({
  pdpDescription,
  recommendation,
}: {
  pdpDescription: string
  recommendation: TitleRecommendation | null
}) {
  return (
    <PreviewGrid>
      <PreviewColumn
        label={
          <SourceChannelLabel
            icon={<AiRecommendationSparklesIcon />}
            label="AI Recommended Description"
          />
        }
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-700">
            {recommendation?.recommendedText ?? "—"}
          </p>
        </div>
      </PreviewColumn>

      <PreviewColumn label={retailerLabel}>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-700">
            {pdpDescription || "—"}
          </p>
        </div>
      </PreviewColumn>
    </PreviewGrid>
  )
}

// ─── PDP-only Image preview ───────────────────────────────────────────────────

function ImageThumb({ hue }: { hue?: number }) {
  return (
    <div className="h-20 w-[88px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {hue !== undefined ? (
        <div
          className="size-full"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 60% 88%), hsl(${(hue + 30) % 360} 50% 78%))`,
          }}
          aria-hidden
        />
      ) : (
        <div className="size-full bg-slate-100" aria-hidden />
      )}
    </div>
  )
}

export function PdpOnlyImagePreview({ pdpImages }: { pdpImages: ProductImage[] }) {
  const previewCount = 3
  const pdpSlice = pdpImages.slice(0, previewCount)

  return (
    <PreviewGrid>
      <PreviewColumn
        label={
          <SourceChannelLabel
            icon={<AiRecommendationSparklesIcon />}
            label="AI Recommended Images"
          />
        }
      >
        <div className="flex gap-2">
          {Array.from({ length: previewCount }).map((_, i) => (
            <ImageThumb key={i} />
          ))}
        </div>
      </PreviewColumn>

      <PreviewColumn label={retailerLabel}>
        <div className="flex gap-2">
          {pdpSlice.map((img) => (
            <ImageThumb key={img.id} hue={img.hue} />
          ))}
          {Array.from({ length: Math.max(0, previewCount - pdpSlice.length) }).map((_, i) => (
            <ImageThumb key={`empty-${i}`} />
          ))}
        </div>
      </PreviewColumn>
    </PreviewGrid>
  )
}
