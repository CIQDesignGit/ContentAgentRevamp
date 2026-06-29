"use client"

import Link from "next/link"
import { ArrowLeft, Bell, ChevronRight, Home, HelpCircle, LayoutDashboard, Mail, Rocket, Share2 } from "lucide-react"
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

interface BreadcrumbItem {
  label: string
  /** When provided, the item is a clickable link. Omit for the current (last) page. */
  href?: string
}

interface AppHeaderProps {
  /** Simple page title. Ignored when `breadcrumb` is provided. */
  title?: string
  /** When provided, the left button becomes a back-link navigating to this path. */
  backHref?: string
  /** Renders a breadcrumb trail instead of a plain title. Last item = current page (no link). */
  breadcrumb?: BreadcrumbItem[]
}

export function AppHeader({ title = "Content Agent", backHref, breadcrumb }: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        {/* Left button — back link or brand mark */}
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Go back"
            className="grid size-8 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft className="size-5" />
          </Link>
        ) : (
          <div className="grid size-8 place-items-center rounded-md bg-primary text-white">
            <Home className="size-4" />
          </div>
        )}

        {/* Breadcrumb trail or plain title */}
        {breadcrumb ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1">
            {breadcrumb.map((item, i) => {
              const isLast = i === breadcrumb.length - 1
              return (
                <span key={item.label} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5 text-slate-300" />}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-slate-900">{item.label}</span>
                  )}
                </span>
              )
            })}
          </nav>
        ) : (
          <span className="text-sm font-medium text-slate-900">{title}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <IconHeaderButton label="Brand Performance" href="/brand-performance">
          <LayoutDashboard className="size-4" />
        </IconHeaderButton>
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
