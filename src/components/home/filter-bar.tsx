"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Check, ChevronDown, FunnelPlus, History, Lock, Map, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { COLUMNS, ColumnFilterPanel, type ColumnFilters } from "./column-filter-dialog"

// ─── Shared constants ─────────────────────────────────────────────────────────

const FILTERS = [
  {
    key: "compliance",
    label: "Compliance",
    description: "Checks content against retailer policy requirements",
  },
  {
    key: "compliance-seo",
    label: "Compliance + SEO",
    description: "Policy checks plus keyword optimization",
  },
  {
    key: "compliance-seo-aeo",
    label: "Compliance + SEO + AEO",
    description: "Full optimization with AI answer engine visibility",
  },
  {
    key: "title-optimization",
    label: "Title Optimization",
    description: "AI-powered title rewrites for discoverability",
  },
]

export const BRANDS = ["Yankee Candle", "NutriChef", "Vevor", "Proctor Silex", "Dyson"]

// ─── Shared dropdown trigger styles ───────────────────────────────────────────

function DropdownTrigger({
  field,
  value,
  className,
}: {
  field: string        // muted label e.g. "Type", "Brand"
  value?: string       // bold value e.g. "All", "Vevor & 1 more" — omit when nothing selected
  className?: string
}) {
  return (
    <PopoverTrigger
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1 pl-2.5 pr-1 text-xs whitespace-nowrap transition-colors outline-none select-none hover:bg-slate-50",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="font-normal text-slate-400">{field}</span>
      {value && <span className="font-semibold text-slate-800">{value}</span>}
      <ChevronDown className="size-3.5 shrink-0 text-slate-400" />
    </PopoverTrigger>
  )
}

// ─── Shared checkbox item ─────────────────────────────────────────────────────

function DropdownItem({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        <span
          className={cn(
            "grid size-4 shrink-0 place-items-center rounded border",
            checked ? "border-primary bg-primary text-white" : "border-slate-300 bg-transparent",
          )}
        >
          {checked && <Check className="size-3" />}
        </span>
        {label}
      </button>
    </li>
  )
}

// ─── Radio item for single-select filters ─────────────────────────────────────

function RadioItem({
  label,
  description,
  checked,
  locked,
  onSelect,
}: {
  label: string
  description: string
  checked: boolean
  locked?: boolean
  onSelect: () => void
}) {
  if (locked) {
    return (
      <li>
        <span className="flex w-full cursor-not-allowed items-start gap-2.5 rounded-md px-2.5 py-2 text-slate-400">
          <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-slate-200 bg-slate-50">
            <Lock className="size-2.5 text-slate-300" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs">{description}</span>
          </span>
        </span>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
          checked ? "bg-primary/5 text-slate-900" : "text-slate-700 hover:bg-slate-50",
        )}
      >
        {/* Radio circle */}
        <span
          className={cn(
            "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
            checked ? "border-primary bg-primary" : "border-slate-300",
          )}
        >
          {checked && <span className="size-1.5 rounded-full bg-white" />}
        </span>

        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium leading-snug">{label}</span>
          <span className={cn("text-xs leading-snug", checked ? "text-slate-500" : "text-slate-400")}>
            {description}
          </span>
        </span>
      </button>
    </li>
  )
}

// ─── Type single-select dropdown ──────────────────────────────────────────────

function TypeFilterDropdown({
  value,
  onChange,
  lockedFilter,
}: {
  value: string
  onChange: (v: string) => void
  /** When set, this filter key is force-selected and all others are locked. */
  lockedFilter?: string
}) {
  const activeValue = lockedFilter ?? value
  const selected = FILTERS.find((f) => f.key === activeValue)

  return (
    <Popover>
      <DropdownTrigger
        field="Task type"
        value={selected?.label ?? FILTERS[0].label}
      />
      <PopoverContent align="start" className="w-72 p-1.5">
        <ul className="flex flex-col gap-0.5">
          {FILTERS.map((f) => (
            <RadioItem
              key={f.key}
              label={f.label}
              description={f.description}
              checked={f.key === activeValue}
              locked={!!lockedFilter && f.key !== lockedFilter}
              onSelect={() => onChange(f.key)}
            />
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

// ─── Brand multi-select dropdown ──────────────────────────────────────────────

function BrandMultiSelect({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (brands: string[]) => void
}) {
  function toggle(brand: string) {
    onChange(selected.includes(brand) ? selected.filter((b) => b !== brand) : [...selected, brand])
  }

  const brandValue = selected.length === 0
    ? undefined
    : selected.length === 1
      ? selected[0]
      : `${selected[0]} & ${selected.length - 1} more`

  return (
    <Popover>
      <DropdownTrigger
        field="Brand"
        value={brandValue}
      />
      <PopoverContent align="start" className="w-44 p-1">
        <ul>
          {BRANDS.map((brand) => (
            <DropdownItem
              key={brand}
              label={brand}
              checked={selected.includes(brand)}
              onToggle={() => toggle(brand)}
            />
          ))}
        </ul>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-1 w-full rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            Clear all
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Applied filter chip ──────────────────────────────────────────────────────

function FilterChip({
  field,
  values,
  onRemove,
}: {
  field: string
  values: string[]
  onRemove: () => void
}) {
  const display = values.length === 1
    ? values[0]
    : `${values[0]} & ${values.length - 1} more`

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1 pl-2.5 pr-1 text-xs">
      <span className="font-normal text-slate-400">{field}</span>
      <span className="font-semibold text-slate-800">{display}</span>
      <button
        type="button"
        aria-label={`Remove filter: ${field}`}
        onClick={onRemove}
        className="grid size-4 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  activeFilter: string
  onFilterChange: (v: string) => void
  selectedBrands: string[]
  onBrandsChange: (brands: string[]) => void
  matchCount: number
  onActivityLogClick?: () => void
  /** When set, locks the type filter to this key — all others are shown as disabled. */
  lockedFilter?: string
  /** Number of currently bookmarked SKUs — shows the bookmark toggle when > 0 */
  bookmarkedCount?: number
  /** When true, sidebar shows only bookmarked SKUs */
  bookmarkedOnly?: boolean
  onBookmarkedOnlyChange?: (v: boolean) => void
}

export function FilterBar({
  search, onSearchChange, activeFilter, onFilterChange,
  selectedBrands, onBrandsChange, matchCount, onActivityLogClick, lockedFilter,
  bookmarkedCount = 0, bookmarkedOnly = false, onBookmarkedOnlyChange,
}: FilterBarProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(search.length > 0)
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({})
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  const totalColumnFilters = Object.values(columnFilters).filter((v) => v.length > 0).length

  return (
    <div className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchOpen ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1">
            <Search className="size-3.5 text-slate-500" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search SKUs"
              className="h-5 w-40 bg-transparent text-xs text-slate-900 focus:outline-none"
            />
            <button type="button" aria-label="Close search" onClick={() => { onSearchChange(""); setSearchOpen(false) }} className="text-slate-400 hover:text-slate-700">
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <button type="button" aria-label="Search" title="Search SKUs" onClick={() => setSearchOpen(true)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            <Search className="size-3.5" />
          </button>
        )}

        <TypeFilterDropdown value={activeFilter} onChange={onFilterChange} lockedFilter={lockedFilter} />

        {/* Separator — Type is a distinct filter from column-based filters */}
        <span aria-hidden className="h-4 w-px shrink-0 bg-slate-200" />

        <BrandMultiSelect selected={selectedBrands} onChange={onBrandsChange} />

        {/* Bookmark quick-filter — only visible when at least one SKU is bookmarked */}
        {bookmarkedCount > 0 && (
          <button
            type="button"
            onClick={() => onBookmarkedOnlyChange?.(!bookmarkedOnly)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border py-1 pl-2 pr-2.5 text-xs whitespace-nowrap transition-colors outline-none",
              bookmarkedOnly
                ? "border-info-300 bg-info-50 text-info-700 hover:bg-info-100"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
            )}
          >
            <Bookmark
              className="size-3"
              fill={bookmarkedOnly ? "currentColor" : "none"}
            />
            Bookmarked
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
              bookmarkedOnly ? "bg-info-100 text-info-700" : "bg-slate-100 text-slate-500",
            )}>
              {bookmarkedCount}
            </span>
          </button>
        )}

        {/* Applied column filter chips — one per column, grouped */}
        {COLUMNS
          .filter((col) => (columnFilters[col.id] ?? []).length > 0)
          .map((col) => (
            <FilterChip
              key={col.id}
              field={col.label}
              values={columnFilters[col.id]}
              onRemove={() =>
                setColumnFilters((prev) => ({ ...prev, [col.id]: [] }))
              }
            />
          ))}

        {/* Filter popover — sits after chips so it always appears at the end */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger
            aria-label="Filter"
            title="View filters"
            className={cn(
              "grid place-items-center rounded-lg border py-1 px-2 hover:bg-slate-50 transition-colors",
              totalColumnFilters > 0 ? "border-primary text-primary" : "border-slate-200 text-slate-500",
              filterPopoverOpen && "bg-slate-50",
            )}
          >
            <FunnelPlus className="size-3.5" />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[580px] overflow-hidden rounded-xl p-0 shadow-lg"
          >
            <ColumnFilterPanel
              filters={columnFilters}
              onApply={setColumnFilters}
              onClose={() => setFilterPopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>

        {/* Clear all — appears after the filter button */}
        {totalColumnFilters > 0 && (
          <button
            type="button"
            onClick={() => setColumnFilters({})}
            className="text-xs text-slate-400 hover:text-slate-700"
          >
            Clear all
          </button>
        )}

        {matchCount === 0 && <span className="text-xs text-slate-500">No matching SKUs</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Agent network"
          title="Agent network"
          onClick={() => router.push("/agent")}
          className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          <Map className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Activity log"
          title="Recent activity"
          onClick={() => onActivityLogClick?.() ?? router.push("/actions-log")}
          className="relative grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          <History className="size-4" />
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error-600 px-1 text-[10px] font-semibold text-white">2</span>
        </button>
      </div>
    </div>
  )
}
