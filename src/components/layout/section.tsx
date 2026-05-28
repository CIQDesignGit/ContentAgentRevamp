import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("w-full max-w-5xl mx-auto px-4 py-8", className)}>
      {children}
    </section>
  )
}
