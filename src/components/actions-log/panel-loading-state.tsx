import { Skeleton } from "@/components/ui/skeleton"

export function PanelLoadingState() {
  return (
    <div className="space-y-4 px-1 py-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
