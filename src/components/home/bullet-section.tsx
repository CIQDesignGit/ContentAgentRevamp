"use client"

import { useState } from "react"
import { GripVertical, ListChecks, Plus, Sparkles, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BulletItemProps {
  bullet: string
  index: number
  readOnly?: boolean
  onChange: (index: number, value: string) => void
  onDelete: (index: number) => void
  dragOverIndex: number | null
  onDragStart: (index: number) => void
  onDragEnter: (index: number) => void
  onDragEnd: () => void
  onDrop: (index: number) => void
  isDragging: boolean
}

function BulletItem({ bullet, index, readOnly, onChange, onDelete, dragOverIndex, onDragStart, onDragEnter, onDragEnd, onDrop, isDragging }: BulletItemProps) {
  return (
    <li
      draggable={!readOnly}
      onDragStart={() => onDragStart(index)}
      onDragEnter={(e) => { e.preventDefault(); onDragEnter(index) }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      onDrop={(e) => { e.preventDefault(); onDrop(index) }}
      className={cn(
        "group/bullet flex items-start gap-2 rounded-lg border border-transparent p-2 hover:border-slate-200 hover:bg-slate-50",
        dragOverIndex === index && "bullet-drag-over",
        isDragging && "dragging",
      )}
    >
      <div className="flex flex-col items-center gap-1.5 pt-1">
        <span className="grid size-5 place-items-center rounded-md bg-violet-100 text-[11px] font-semibold text-primary">
          {index + 1}
        </span>
        {!readOnly && (
          <span aria-label={`Drag bullet ${index + 1}`} className="cursor-grab text-slate-400 opacity-0 group-hover/bullet:opacity-100 active:cursor-grabbing">
            <GripVertical className="size-4" />
          </span>
        )}
      </div>

      <div className="relative flex flex-1 items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
        {readOnly ? (
          <p className="flex-1 text-sm leading-relaxed text-slate-900">{bullet}</p>
        ) : (
          <textarea
            value={bullet}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder="Enter bullet point..."
            rows={2}
            className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-slate-900 focus:outline-none"
          />
        )}
        {!readOnly && (
          <button
            type="button"
            aria-label={`Delete bullet ${index + 1}`}
            onClick={() => onDelete(index)}
            className="grid size-7 shrink-0 place-items-center rounded-md text-error-600 opacity-0 hover:bg-error-50 group-hover/bullet:opacity-100"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </li>
  )
}

interface BulletPointsSectionProps {
  bullets: string[]
  onChange: (bullets: string[]) => void
  readOnly?: boolean
  recommendationCount?: number
}

export function BulletPointsSection({ bullets, onChange, readOnly, recommendationCount = 0 }: BulletPointsSectionProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleDrop(targetIndex: number) {
    if (draggingIndex === null || draggingIndex === targetIndex) { setDraggingIndex(null); setDragOverIndex(null); return }
    const next = bullets.slice()
    const [moved] = next.splice(draggingIndex, 1)
    next.splice(targetIndex, 0, moved)
    onChange(next)
    setDraggingIndex(null)
    setDragOverIndex(null)
  }

  function handleItemChange(index: number, value: string) {
    const next = bullets.slice()
    next[index] = value
    onChange(next)
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-3">
          <ListChecks className="size-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">Bullet Points</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-success-100 bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600">
            {bullets.length} of 7
          </span>
        </div>
      </header>

      <ol className="space-y-1.5">
        {bullets.map((bullet, idx) => (
          <BulletItem
            key={idx}
            bullet={bullet}
            index={idx}
            readOnly={readOnly}
            onChange={handleItemChange}
            onDelete={(i) => onChange(bullets.filter((_, j) => j !== i))}
            dragOverIndex={dragOverIndex}
            onDragStart={setDraggingIndex}
            onDragEnter={setDragOverIndex}
            onDragEnd={() => { setDraggingIndex(null); setDragOverIndex(null) }}
            onDrop={handleDrop}
            isDragging={draggingIndex === idx}
          />
        ))}
      </ol>

      {!readOnly && (
        <button type="button" onClick={() => onChange([...bullets, ""])} className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary hover:bg-violet-50">
          <Plus className="size-4" /> Insert new line
        </button>
      )}

      {recommendationCount > 0 && !readOnly && (
        <div className="mt-2 flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-xs font-medium">{recommendationCount} AI recommendation{recommendationCount === 1 ? "" : "s"} available</span>
          </div>
          <button type="button" className="inline-flex h-7 items-center px-2 text-xs font-medium text-primary hover:bg-violet-100">Review</button>
        </div>
      )}
    </section>
  )
}
