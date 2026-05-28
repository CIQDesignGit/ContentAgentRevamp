"use client"

import { Type } from "lucide-react"

interface DescriptionSectionProps {
  value: string
  onChange: (v: string) => void
  readOnly?: boolean
}

export function DescriptionSection({ value, onChange, readOnly }: DescriptionSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex items-center gap-3 px-1 py-2">
        <Type className="size-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-900">Description</span>
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
          Optional
        </span>
      </header>

      {readOnly ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-900">
          {value}
        </p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="Describe the product..."
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      )}
    </section>
  )
}
