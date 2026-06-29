"use client"

import { Sparkles } from "lucide-react"

import { AppHeader } from "@/components/home/app-header"
import { PageShell } from "@/components/layout/page-shell"

import { AeoOverview } from "./aeo-overview"
import { BrandLeaderboardWidget } from "./brand-leaderboard-widget"
import { heroData } from "./data"
import { PromptPerformanceTable } from "./prompt-performance-table"
import { TopicCompetitionTable } from "./topic-competition-table"

export function BrandPerformanceView() {
  return (
    <PageShell>
      <AppHeader
        backHref="/"
        breadcrumb={[
          { label: "Content Agent", href: "/" },
          { label: "Brand Performance" },
        ]}
      />

      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
        <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-8">
          {/* Section 00 — hero metrics */}
          <AeoOverview />

          {/* AI Insight — gradient border card below the metrics */}
          <div className="mt-5 rounded-xl bg-linear-to-r from-brand-500 via-cyan-400 to-pink-500 p-px">
            <div className="flex flex-col gap-2 rounded-[11px] bg-brand-25 px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 shrink-0 text-brand-500" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-500">
                  AI Insight
                </p>
              </div>
              <p className="max-w-2xl text-[14px] leading-relaxed text-slate-600">{heroData.summary}</p>
            </div>
          </div>

          {/* Section 01 — brand leaderboard widget */}
          <div className="mt-5">
            <BrandLeaderboardWidget />
          </div>

          {/* Section 03 — AI Visibility by Topic */}
          <div className="mt-5">
            <TopicCompetitionTable />
          </div>

          {/* Section 02 — Prompt Performance */}
          <div className="mt-5">
            <PromptPerformanceTable />
          </div>
        </div>
      </div>
    </PageShell>
  )
}
