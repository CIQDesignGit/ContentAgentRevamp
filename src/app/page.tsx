"use client"

// All data is mock/client-side — no dynamic server data needed.
// This prevents Next.js 15 from creating params/searchParams Proxy objects
// that trigger "params are being enumerated" warnings in development.
export const dynamic = "force-static"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

import { AppHeader } from "@/components/home/app-header"
import { FilterBar } from "@/components/home/filter-bar"
import { SkuSidebar } from "@/components/home/sku-sidebar"
import { ProductHeader } from "@/components/home/product-header"
import { SalsifyHeader, PdpHeader } from "@/components/home/content-headers"
import { RightRail } from "@/components/home/right-rail"
import { ProductTitleSection } from "@/components/home/title-section"
import { ImageSection } from "@/components/home/image-section"
import { BulletPointsSection } from "@/components/home/bullet-section"
import { DescriptionSection } from "@/components/home/description-section"
import { PdpReadOnlyContent } from "@/components/home/pdp-readonly"

import {
  MOCK_SKUS,
  buildInitialState,
  makeInitialContent,
  passesFilter,
  passesSearch,
} from "@/components/home/data"
import type { ContentState, SkuContent } from "@/components/home/types"

export default function Home() {
  const [selectedSkuId, setSelectedSkuId] = useState(MOCK_SKUS[0].id)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contentState, setContentState] = useState<ContentState>(() => buildInitialState())

  const filteredSkus = useMemo(
    () => MOCK_SKUS.filter((s) => passesFilter(s, filter) && passesSearch(s, search)),
    [filter, search],
  )

  const selectedSku = MOCK_SKUS.find((s) => s.id === selectedSkuId) ?? MOCK_SKUS[0]
  const content: SkuContent = contentState[selectedSkuId] ?? makeInitialContent(selectedSku)

  function patch(updater: (prev: SkuContent) => SkuContent) {
    setContentState((prev) => ({ ...prev, [selectedSkuId]: updater(prev[selectedSkuId]) }))
  }

  function handleAcceptTitle() {
    const recommended = content.titleRecommendation?.recommendedText
    if (recommended) patch((prev) => ({ ...prev, title: recommended, titleStatus: "accepted" }))
  }
  function handleRejectTitle() {
    patch((prev) => ({ ...prev, titleStatus: "rejected" }))
  }
  function handleRevertTitle() {
    const original = makeInitialContent(selectedSku).title
    patch((prev) => ({ ...prev, title: original, titleStatus: "pending" }))
  }

  const pdp = content.pdpContent

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeFilter={filter}
        onFilterChange={setFilter}
        selectedBrands={selectedBrands}
        onBrandsChange={setSelectedBrands}
        matchCount={filteredSkus.length}
      />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar shows collapsed strip when sidebarCollapsed; hidden only in compare mode */}
        {!compareMode && (
          <SkuSidebar
            skus={filteredSkus}
            selectedSkuId={selectedSkuId}
            onSelect={setSelectedSkuId}
            totalCount={MOCK_SKUS.length}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
          />
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ProductHeader
            title={selectedSku.title}
            asin={selectedSku.asin}
            productId={selectedSku.productId}
            brand={selectedSku.brand}
            compliance={selectedSku.metrics.compliance}
            seo={selectedSku.metrics.seo}
            aeo={selectedSku.metrics.aeo}
          />

          <div className="flex min-h-0 flex-1">
            {/* Salsify editor pane */}
            <section className={cn("flex min-w-0 flex-col", compareMode ? "w-1/2" : "flex-1")}>
              <SalsifyHeader
                date={selectedSku.lastUpdated}
                issues={selectedSku.salsifyIssues}
                compareMode={compareMode}
                onToggleCompare={() => setCompareMode((v) => !v)}
              />
              <div className="space-y-4 overflow-y-auto p-5">
                <ProductTitleSection
                  title={content.title}
                  onTitleChange={(v) => patch((prev) => ({ ...prev, title: v }))}
                  status={content.titleStatus}
                  recommendation={content.titleRecommendation}
                  onAccept={handleAcceptTitle}
                  onReject={handleRejectTitle}
                  onRevert={handleRevertTitle}
                />
                <ImageSection
                  images={content.images}
                  onDelete={(id) =>
                    patch((prev) => ({
                      ...prev,
                      images: prev.images.map((img) => (img.id === id ? { ...img, url: undefined } : img)),
                    }))
                  }
                />
                <BulletPointsSection
                  bullets={content.bullets}
                  onChange={(next) => patch((prev) => ({ ...prev, bullets: next }))}
                  recommendationCount={3}
                />
                <DescriptionSection
                  value={content.description}
                  onChange={(v) => patch((prev) => ({ ...prev, description: v }))}
                />
              </div>
            </section>

            {/* PDP comparison pane (per-SKU) or right rail */}
            {compareMode ? (
              <section className="flex w-1/2 min-w-0 flex-col border-l border-slate-200">
                <PdpHeader date={pdp.lastUpdated} />
                <div className="flex-1 overflow-y-auto bg-slate-50/40">
                  <PdpReadOnlyContent
                    title={pdp.title}
                    description={pdp.description}
                    bullets={pdp.bullets}
                    imageCount={pdp.imageCount}
                  />
                </div>
              </section>
            ) : (
              <RightRail />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
