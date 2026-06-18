import { AlignLeft, Image as ImageIcon, List, Lock } from "lucide-react"
import type { ReactNode } from "react"
import type { BulletRecommendation, ProductImage, TitleRecommendation } from "@/components/home/types"
import {
  PdpOnlyBulletsPreview,
  PdpOnlyDescriptionPreview,
  PdpOnlyImagePreview,
} from "./pdp-only-previews"

// ─── Generic overlay wrapper ──────────────────────────────────────────────────

interface LockedSectionProps {
  icon: ReactNode
  label: string
  children: ReactNode
}

export function LockedSection({ icon, label, children }: LockedSectionProps) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex items-center gap-2 px-1 py-2">
        {icon}
        <span className="text-sm font-semibold text-slate-900">{label}</span>
      </header>

      {/* Dimmed read-only content */}
      <div className="pointer-events-none select-none opacity-40 blur-[3px]">
        {children}
      </div>

      {/* Centred lock badge */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl">
          <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2.5 shadow-md">
          <Lock className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-700">
            Upgrade to get full Content Agent access
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Locked preview bodies ────────────────────────────────────────────────────

export function LockedBulletsSection({
  bullets,
  recommendations,
  pdpBullets,
  hasPimData,
}: {
  bullets: string[]
  recommendations?: BulletRecommendation[]
  pdpBullets?: string[]
  hasPimData?: boolean
}) {
  return (
    <LockedSection
      icon={<List className="size-4 shrink-0 text-slate-400" />}
      label="Bullet Points"
    >
      {!hasPimData && recommendations && pdpBullets ? (
        <PdpOnlyBulletsPreview recommendations={recommendations} pdpBullets={pdpBullets} />
      ) : (
        <ul className="space-y-1.5 px-1 pb-2">
          {bullets.slice(0, 4).map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="mt-0.5 shrink-0 text-slate-300">•</span>
              <span className="line-clamp-1">{b}</span>
            </li>
          ))}
        </ul>
      )}
    </LockedSection>
  )
}

export function LockedDescriptionSection({
  description,
  recommendation,
  pdpDescription,
  hasPimData,
}: {
  description: string
  recommendation?: TitleRecommendation | null
  pdpDescription?: string
  hasPimData?: boolean
}) {
  return (
    <LockedSection
      icon={<AlignLeft className="size-4 shrink-0 text-slate-400" />}
      label="Description"
    >
      {!hasPimData && pdpDescription !== undefined ? (
        <PdpOnlyDescriptionPreview
          recommendation={recommendation ?? null}
          pdpDescription={pdpDescription}
        />
      ) : (
        <p className="line-clamp-3 px-1 pb-2 text-sm leading-relaxed text-slate-700">
          {description}
        </p>
      )}
    </LockedSection>
  )
}

export function LockedImagesSection({
  count,
  pdpImages,
  hasPimData,
}: {
  count: number
  pdpImages?: ProductImage[]
  hasPimData?: boolean
}) {
  return (
    <LockedSection
      icon={<ImageIcon className="size-4 shrink-0 text-slate-400" />}
      label="Images"
    >
      {!hasPimData && pdpImages ? (
        <PdpOnlyImagePreview pdpImages={pdpImages} />
      ) : (
        <div className="flex gap-3 overflow-hidden px-1 pb-2">
          {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
            <div
              key={i}
              className="h-24 w-24 shrink-0 rounded-lg border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      )}
    </LockedSection>
  )
}
