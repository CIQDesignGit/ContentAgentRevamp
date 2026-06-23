"use client"

import { useEffect, useRef, useState } from "react"

// ─── Single-line / paragraph editable cell ────────────────────────────────────
// Fully controlled — parent <td> drives `editing` via onClick / onBlur.

interface EditableCellProps {
  value: string
  editing: boolean
  onChange: (next: string) => void
  onBlur: () => void
  placeholder?: string
}

export function EditableCell({
  value,
  editing,
  onChange,
  onBlur,
  placeholder = "—",
}: EditableCellProps) {
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)

  // Sync draft whenever we enter edit mode
  useEffect(() => {
    if (editing) {
      setDraft(value)
      // Give the browser a tick to mount the textarea before focusing
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.focus()
          ref.current.style.height = "auto"
          ref.current.style.height = `${ref.current.scrollHeight}px`
        }
      })
    }
  }, [editing]) // intentionally omit `value` — don't reset draft on external changes

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          setDraft(e.target.value)
          e.target.style.height = "auto"
          e.target.style.height = `${e.target.scrollHeight}px`
        }}
        onBlur={() => {
          onChange(draft.trim())
          onBlur()
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            e.currentTarget.blur()
          }
          if (e.key === "Escape") {
            setDraft(value)
            onBlur()
          }
        }}
        // Stop clicks on the textarea propagating to the <td> onClick
        onClick={(e) => e.stopPropagation()}
        rows={1}
        className="w-full resize-none overflow-hidden bg-transparent text-sm font-medium leading-relaxed text-slate-800 outline-none"
      />
    )
  }

  return (
    <p className="text-sm font-medium leading-relaxed text-slate-800">
      {value || <span className="text-slate-400">{placeholder}</span>}
    </p>
  )
}

// ─── Bullet-list editable cell ────────────────────────────────────────────────
// Fully controlled — parent <td> drives `editing` via onClick / onBlur.

interface EditableBulletCellProps {
  items: string[]
  editing: boolean
  onChange: (next: string[]) => void
  onBlur: () => void
}

export function EditableBulletCell({
  items,
  editing,
  onChange,
  onBlur,
}: EditableBulletCellProps) {
  const [draft, setDraft] = useState(items.join("\n"))
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(items.join("\n"))
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.focus()
          ref.current.style.height = "auto"
          ref.current.style.height = `${ref.current.scrollHeight}px`
        }
      })
    }
  }, [editing])

  function commit() {
    onChange(
      draft
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    )
    onBlur()
  }

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        placeholder="One bullet per line"
        onChange={(e) => {
          setDraft(e.target.value)
          e.target.style.height = "auto"
          e.target.style.height = `${e.target.scrollHeight}px`
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDraft(items.join("\n"))
            onBlur()
          }
        }}
        onClick={(e) => e.stopPropagation()}
        rows={items.length || 3}
        className="w-full resize-none overflow-hidden bg-transparent text-sm leading-relaxed text-slate-700 outline-none"
      />
    )
  }

  if (items.length === 0) {
    return <span className="text-sm text-slate-400">—</span>
  }

  return (
    <ul className="space-y-1.5">
      {items.map((b, i) => (
        <li key={i} className="flex gap-1 text-sm leading-snug text-slate-700">
          <span className="shrink-0">•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}
