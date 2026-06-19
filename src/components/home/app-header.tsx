"use client"

import Link from "next/link"
import { Bell, ChevronLeft, ChevronRight, HelpCircle, Home, Mail, Rocket, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

function IconHeaderButton({
  badge,
  label,
  href,
  className,
  children,
}: {
  badge?: number | string
  label: string
  href?: string
  className?: string
  children: ReactNode
}) {
  const baseClass = cn("relative grid size-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100", className)

  const inner = (
    <>
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-error-600 px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={baseClass}>
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={baseClass}
    >
      {inner}
    </button>
  )
}

interface AppHeaderProps {
  /** Page title shown next to the Home icon. Defaults to "Content Agent". */
  title?: string
  /** When provided, the left button becomes a back-link navigating to this path. */
  backHref?: string
}

export function AppHeader({ title = "Content Agent", backHref }: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        {/* Left button — back link when backHref is provided, decorative otherwise */}
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Go back"
            className="grid size-8 place-items-center rounded-md bg-primary text-white hover:bg-brand-600 transition-colors"
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <div className="grid size-8 place-items-center rounded-md bg-primary text-white">
            <ChevronRight className="size-4" />
          </div>
        )}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <Home className="size-4 text-slate-500" />
          <span>{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconHeaderButton
          label={backHref ? "Content Agent" : "Title Optimization"}
          href={backHref ? "/" : "/title-optimization"}
          className="bg-brand-100"
        >
          <Rocket className="size-4 text-brand-500" />
        </IconHeaderButton>
        <IconHeaderButton label="Alerts" badge={6}>
          <Bell className="size-5" />
        </IconHeaderButton>
        <IconHeaderButton label="Help">
          <HelpCircle className="size-5" />
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
