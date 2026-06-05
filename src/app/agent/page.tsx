"use client"

export const dynamic = "force-static"

import { useRouter } from "next/navigation"
import { ArrowLeft, BrainCircuit } from "lucide-react"
import { AppHeader } from "@/components/home/app-header"

export default function AgentPage() {
  const router = useRouter()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader />
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.push("/")}
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <BrainCircuit className="size-4 shrink-0 text-slate-500" aria-hidden />
          <h1 className="truncate text-sm font-semibold text-slate-900">Agent network</h1>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Agent network view coming soon.</p>
      </main>
    </div>
  )
}
