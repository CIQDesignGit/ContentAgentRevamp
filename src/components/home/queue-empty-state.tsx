"use client"

import { motion } from "framer-motion"

// ─── Shared primitives ────────────────────────────────────────────────────────

// All placeholder shapes use the same dashed outline style
const d = "border border-dashed border-slate-300 bg-transparent"
const card = `rounded-xl shadow-sm ${d} bg-white overflow-hidden`

function Bar({ w, h = "h-2.5" }: { w: string; h?: string }) {
  return <div className={`${h} ${w} rounded-full ${d}`} />
}

function Chip({ w }: { w: string }) {
  return <div className={`h-6 ${w} rounded-md ${d}`} />
}

// ─── Skeleton card: Title / Description style ─────────────────────────────────
// Mirrors: section label + accept/reject actions + two-column source comparison

function TitleCardSkeleton() {
  return (
    <div className={card}>
      {/* Card header row */}
      <div className="flex items-center justify-between border-b border-dashed border-slate-300 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`size-4 rounded ${d}`} />
          <Bar w="w-12" h="h-2.5" />
        </div>
        <div className={`size-5 rounded ${d}`} />
      </div>

      {/* Two-column source comparison */}
      <div className="grid grid-cols-2 divide-x divide-dashed divide-slate-300">
        {/* PIM column */}
        <div className="flex flex-col gap-2 px-4 py-3">
          <Bar w="w-16" h="h-2" />
          <Bar w="w-full" />
          <Bar w="w-3/4" />
        </div>
        {/* PDP column */}
        <div className="flex flex-col gap-2 px-4 py-3">
          <Bar w="w-16" h="h-2" />
          <Bar w="w-full" />
          <Bar w="w-4/5" />
        </div>
      </div>

      {/* Accept / reject action bar */}
      <div className="flex items-center gap-2 border-t border-dashed border-slate-300 px-4 py-2.5">
        <Chip w="w-20" />
        <Chip w="w-16" />
      </div>
    </div>
  )
}

// ─── Skeleton card: Bullets style ────────────────────────────────────────────
// Mirrors: section label + bulk actions + 3 bullet rows each with a rec text block

function BulletRow() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {/* Bullet number */}
      <div className={`mt-0.5 size-5 shrink-0 rounded-md ${d}`} />
      {/* Text + action chips in a row */}
      <div className="flex flex-1 items-center gap-3">
        <Bar w="flex-1" />
        <div className="flex shrink-0 items-center gap-2">
          <Chip w="w-14" />
          <Chip w="w-14" />
        </div>
      </div>
    </div>
  )
}

function BulletsCardSkeleton() {
  return (
    <div className={card}>
      {/* Card header row */}
      <div className="flex items-center justify-between border-b border-dashed border-slate-300 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`size-4 rounded ${d}`} />
          <Bar w="w-14" h="h-2.5" />
        </div>
        <div className={`size-5 rounded ${d}`} />
      </div>

      {/* Bullet rows */}
      <BulletRow />
      <BulletRow />
      <BulletRow />
    </div>
  )
}

// ─── Main empty state ─────────────────────────────────────────────────────────

/**
 * Wireframe placeholder shown in the main content area when the SKU queue
 * is fully empty. Shows a ghost of the real layout — dashed outlines only,
 * no fills, no text.
 */
export function QueueEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-1 flex-col overflow-hidden"
    >
      {/* ── Header skeleton — mirrors ProductHeader ──────────────────────── */}
      <div className="flex shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <div className={`size-14 shrink-0 rounded-lg ${d}`} />
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Bar w="w-20" />
            <div className="size-1 rounded-full bg-slate-300" />
            <Bar w="w-24" />
          </div>
          <Bar w="w-72" h="h-3" />
          <div className="flex items-center gap-2">
            <Chip w="w-20" />
            <Chip w="w-16" />
            <Chip w="w-16" />
            <Chip w="w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-8 w-28 rounded-md ${d}`} />
          <div className={`size-8 rounded-md ${d}`} />
        </div>
      </div>

      {/* ── Content skeleton — two detailed card skeletons ───────────────── */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 px-5 py-4">
        <TitleCardSkeleton />
        <BulletsCardSkeleton />
      </div>
    </motion.div>
  )
}
