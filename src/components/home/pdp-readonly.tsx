import { Image as ImageIcon, ListChecks, Type } from "lucide-react"

function PdpCard({
  icon,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode
  title: string
  badge: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/70 p-3">
      <header className="flex items-center gap-3 px-1 py-2">
        <span className="text-slate-500">{icon}</span>
        <span className="text-sm font-medium text-slate-900">{title}</span>
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
          {badge}
        </span>
      </header>
      <div className="px-1 pb-1">{children}</div>
    </section>
  )
}

interface PdpReadOnlyContentProps {
  title: string
  description: string
  bullets: string[]
  imageCount: number
}

export function PdpReadOnlyContent({ title, description, bullets, imageCount }: PdpReadOnlyContentProps) {
  return (
    <div className="space-y-3 p-3">
      <PdpCard icon={<Type className="size-4" />} title="Product Title" badge="Match">
        <p className="text-sm leading-relaxed text-slate-900">{title}</p>
      </PdpCard>

      <PdpCard icon={<ImageIcon className="size-4" />} title="Image" badge={`${imageCount}/${imageCount} Present`}>
        <div className="scroll-thin flex gap-3 overflow-x-auto pb-1">
          {Array.from({ length: imageCount }).map((_, i) => (
            <div
              key={i}
              className="flex h-44 w-36 shrink-0 rounded-lg border border-slate-200 bg-slate-100"
              aria-hidden
            />
          ))}
        </div>
      </PdpCard>

      <PdpCard icon={<ListChecks className="size-4" />} title="Bullet Points" badge={`${bullets.length} of ${bullets.length}`}>
        <ol className="space-y-1.5">
          {bullets.map((b, idx) => (
            <li key={idx} className="flex gap-2 text-sm leading-relaxed text-slate-900">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500">
                {idx + 1}
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ol>
      </PdpCard>

      <PdpCard icon={<Type className="size-4" />} title="Description" badge="Match">
        <p className="text-sm leading-relaxed text-slate-900">{description}</p>
      </PdpCard>
    </div>
  )
}
