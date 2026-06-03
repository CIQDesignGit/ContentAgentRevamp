"use client"

// All data is mock/client-side — no dynamic server data needed.
// This prevents Next.js 15 from creating params/searchParams Proxy objects
// that trigger "params are being enumerated" warnings in development.
export const dynamic = "force-static"

import { useMemo, useState } from "react"

import { AppHeader } from "@/components/home/app-header"
import { FilterBar } from "@/components/home/filter-bar"
import { SkuSidebar } from "@/components/home/sku-sidebar"
import { ProductHeader } from "@/components/home/product-header"
import { ProductTitleSection } from "@/components/home/title-section"
import { ImageSection } from "@/components/home/image-section"
import { BulletPointsSection } from "@/components/home/bullet-section"
import { DescriptionSection } from "@/components/home/description-section"

import { applyBulletRecommendation } from "@/lib/apply-bullet-recommendation"
import {
  MOCK_SKUS,
  buildInitialState,
  makeInitialContent,
  passesFilter,
  passesSearch,
} from "@/components/home/data"
import type { BulletRecommendation, ContentState, SkuContent } from "@/components/home/types"

export default function Home() {
  const [selectedSkuId, setSelectedSkuId] = useState(MOCK_SKUS[0].id)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
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

  function handleAcceptDescription() {
    const recommended = content.descriptionRecommendation?.recommendedText
    if (recommended) patch((prev) => ({ ...prev, description: recommended, descriptionStatus: "accepted" }))
  }
  function handleRejectDescription() {
    patch((prev) => ({ ...prev, descriptionStatus: "rejected" }))
  }
  function handleRevertDescription() {
    const original = makeInitialContent(selectedSku).description
    patch((prev) => ({ ...prev, description: original, descriptionStatus: "pending" }))
  }

  const pdp = content.pdpContent

  const bulletOriginals = useMemo(() => {
    const initial = makeInitialContent(selectedSku).bulletRecommendations
    return Object.fromEntries(initial.map((r) => [r.id, r.recommendedText]))
  }, [selectedSkuId])

  function mapBulletReco(
    prev: SkuContent,
    mapper: (r: BulletRecommendation) => BulletRecommendation,
  ): SkuContent {
    return {
      ...prev,
      bulletRecommendations: prev.bulletRecommendations.map(mapper),
    }
  }

  function handleBulletTextChange(id: string, text: string) {
    patch((prev) => mapBulletReco(prev, (r) => (r.id === id ? { ...r, recommendedText: text } : r)))
  }

  function handleAcceptBullet(id: string) {
    patch((prev) => {
      const reco = prev.bulletRecommendations.find((r) => r.id === id)
      if (!reco) return prev
      const canAccept =
        reco.status === "pending" ||
        reco.footprint === "processing" ||
        reco.footprint === "recently-updated"
      if (!canAccept) return prev
      return {
        ...prev,
        bullets: applyBulletRecommendation(prev.bullets, reco),
        bulletRecommendations: prev.bulletRecommendations.map((r) =>
          r.id === id
            ? { ...r, status: "accepted" as const, footprint: "processing" as const }
            : r,
        ),
      }
    })
  }

  function handleRejectBullet(id: string) {
    patch((prev) =>
      mapBulletReco(prev, (r) => (r.id === id && r.status === "pending" ? { ...r, status: "rejected" } : r)),
    )
  }

  function handleAcceptAllBullets() {
    patch((prev) => {
      let bullets = prev.bullets
      const nextRecos = prev.bulletRecommendations.map((r) => {
        if (r.status !== "pending") return r
        bullets = applyBulletRecommendation(bullets, r)
        return { ...r, status: "accepted" as const, footprint: "processing" as const }
      })
      return { ...prev, bullets, bulletRecommendations: nextRecos }
    })
  }

  function handleRejectAllBullets() {
    patch((prev) =>
      mapBulletReco(prev, (r) => (r.status === "pending" ? { ...r, status: "rejected" } : r)),
    )
  }

  function handleResetBullet(id: string) {
    const original = bulletOriginals[id]
    if (original === undefined) return
    patch((prev) =>
      mapBulletReco(prev, (r) => (r.id === id ? { ...r, recommendedText: original } : r)),
    )
  }

  function handleResetAllBullets() {
    patch((prev) =>
      mapBulletReco(prev, (r) =>
        bulletOriginals[r.id] !== undefined
          ? { ...r, recommendedText: bulletOriginals[r.id] }
          : r,
      ),
    )
  }

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
        <SkuSidebar
          skus={filteredSkus}
          selectedSkuId={selectedSkuId}
          onSelect={setSelectedSkuId}
          totalCount={MOCK_SKUS.length}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />

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
            <section className="flex min-w-0 flex-1 flex-col">
              <div className="space-y-4 overflow-y-auto p-5">
                <ProductTitleSection
                  pimTitle={content.title}
                  pdpTitle={pdp.title}
                  status={content.titleStatus}
                  recommendation={content.titleRecommendation}
                  onRecommendationChange={(text) =>
                    patch((prev) => ({
                      ...prev,
                      titleRecommendation: prev.titleRecommendation
                        ? { ...prev.titleRecommendation, recommendedText: text }
                        : null,
                    }))
                  }
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
                  pimBullets={content.bullets}
                  pdpBullets={pdp.bullets}
                  recommendations={content.bulletRecommendations}
                  originals={bulletOriginals}
                  onRecommendationTextChange={handleBulletTextChange}
                  onAccept={handleAcceptBullet}
                  onReject={handleRejectBullet}
                  onReset={handleResetBullet}
                  onAcceptAll={handleAcceptAllBullets}
                  onRejectAll={handleRejectAllBullets}
                  onResetAll={handleResetAllBullets}
                />
                <DescriptionSection
                  pimDescription={content.description}
                  pdpDescription={pdp.description}
                  status={content.descriptionStatus}
                  recommendation={content.descriptionRecommendation}
                  onRecommendationChange={(text) =>
                    patch((prev) => ({
                      ...prev,
                      descriptionRecommendation: prev.descriptionRecommendation
                        ? { ...prev.descriptionRecommendation, recommendedText: text }
                        : null,
                    }))
                  }
                  onAccept={handleAcceptDescription}
                  onReject={handleRejectDescription}
                  onRevert={handleRevertDescription}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
