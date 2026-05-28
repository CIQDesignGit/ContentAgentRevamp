"use client"

import { Bell, ChevronRight, HelpCircle, Home, Mail, Rocket, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

function IconHeaderButton({
  badge,
  label,
  children,
}: {
  badge?: number | string
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="relative grid size-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100"
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-error-600 px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  )
}

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="grid size-8 place-items-center rounded-md bg-primary text-white">
          <ChevronRight className="size-4" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <Home className="size-4 text-slate-500" />
          <span>Content Agent</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconHeaderButton label="Alerts" badge={6}>
          <Bell className="size-5" />
        </IconHeaderButton>
        <IconHeaderButton label="Help">
          <HelpCircle className="size-5" />
        </IconHeaderButton>
        <IconHeaderButton label="Activity">
          <Rocket className="size-5" />
        </IconHeaderButton>
        <IconHeaderButton label="Share">
          <Share2 className="size-5" />
        </IconHeaderButton>
        <IconHeaderButton label="Inbox">
          <Mail className="size-5" />
        </IconHeaderButton>
        <span
          className={cn(
            "ml-1 grid size-7 place-items-center rounded-full",
            "bg-warning-600 text-xs font-semibold text-white",
          )}
        >
          MR
        </span>
      </div>
    </header>
  )
}
