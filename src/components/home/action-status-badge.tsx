import type { ElementType } from "react"
import { Bookmark, Hourglass } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActionStatus } from "./types"

// Only "in-progress" gets a visible badge — all other statuses render nothing
const STATUS_CONFIG: Partial<Record<ActionStatus, {
  icon: ElementType
  label: string
  colorClass: string
  iconClass: string
  fillIcon?: boolean
}>> = {
  "in-progress": {
    icon: Hourglass,
    label: "In progress",
    colorClass: "text-warning-600",
    iconClass: "size-3.5",
  },
  "saved-for-later": {
    icon: Bookmark,
    label: "Saved",
    colorClass: "text-info-600",
    iconClass: "size-3",
    fillIcon: true,   // renders as a solid bookmark, not outline
  },
}

interface ActionStatusBadgeProps {
  status: ActionStatus
  /** When false, only the icon is shown (compact sidebar mode). Defaults to true. */
  showLabel?: boolean
  className?: string
}

export function ActionStatusBadge({ status, showLabel = true, className }: ActionStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  if (!config) return null   // to-do renders nothing

  const { icon: Icon, label, colorClass, iconClass, fillIcon } = config
  return (
    <span className={cn("inline-flex items-center gap-1 shrink-0", colorClass, className)}>
      <Icon className={cn("shrink-0", iconClass)} {...(fillIcon ? { fill: "currentColor" } : {})} />
      {showLabel && (
        <span className="text-[10px] font-medium leading-none">{label}</span>
      )}
    </span>
  )
}
