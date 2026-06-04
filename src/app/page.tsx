"use client"

export const dynamic = "force-static"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { AppHeader } from "@/components/home/app-header"
import { FilterBar } from "@/components/home/filter-bar"
import { SkuSidebar } from "@/components/home/sku-sidebar"
import { ProductHeader, type PublishBarState } from "@/components/home/product-header"
import { ProductTitleSection } from "@/components/home/title-section"
import { ImageSection } from "@/components/home/image-section"
import { BulletPointsSection } from "@/components/home/bullet-section"
import { DescriptionSection } from "@/components/home/description-section"
import { PublishConfirmDialog } from "@/components/home/publish-confirm-dialog"

import { applyBulletRecommendation } from "@/lib/apply-bullet-recommendation"
import { getFieldPublishQueue } from "@/lib/build-field-publish-queue"
import { getActivePublishBatch, getPublishBatchForField } from "@/lib/publish-batch"
import { getPublishSummary } from "@/lib/publish-changes"
import {
  activateDeferredBatch,
  applyPublishPhase,
  applyPublishStart,
  getNextDeferredBatch,
  PUBLISH_PHASE_DELAYS_MS,
} from "@/lib/simulate-publish"
import { resolveBulletSyncFootprint } from "@/lib/sync-footprint"
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
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const publishTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const filteredSkus = useMemo(
    () => MOCK_SKUS.filter((s) => passesFilter(s, filter) && passesSearch(s, search)),
    [filter, search],
  )

  const selectedSku = MOCK_SKUS.find((s) => s.id === selectedSkuId) ?? MOCK_SKUS[0]
  const content: SkuContent = contentState[selectedSkuId] ?? makeInitialContent(selectedSku)

  const publishSummary = useMemo(() => getPublishSummary(content), [content])
  const activeBatch = useMemo(() => getActivePublishBatch(content), [content])
  const titlePublishQueue = useMemo(
    () => getFieldPublishQueue(content, "title"),
    [content],
  )
  const titlePublishBatch = useMemo(() => {
    const active = getActivePublishBatch(content)
    if (active?.fieldKeys.includes("title")) return active
    return getPublishBatchForField(content, "title")
  }, [content])
  const descriptionPublishBatch = useMemo(
    () => getPublishBatchForField(content, "description"),
    [content],
  )

  const publishBarState: PublishBarState = useMemo(() => {
    const hasPublishable = publishSummary.publishable.length > 0
    const inFlight = Boolean(activeBatch) || Boolean(content.isPublishing)

    if (inFlight) {
      // Keep publish enabled when more accepted changes are staged during an active sync.
      return hasPublishable ? "syncing" : "publishing"
    }
    if (hasPublishable) return "ready"
    return "disabled"
  }, [content.isPublishing, activeBatch, publishSummary.publishable.length])

  function patch(updater: (prev: SkuContent) => SkuContent) {
    setContentState((prev) => ({ ...prev, [selectedSkuId]: updater(prev[selectedSkuId]) }))
  }

  function patchSku(skuId: string, updater: (prev: SkuContent) => SkuContent) {
    setContentState((prev) => ({ ...prev, [skuId]: updater(prev[skuId]) }))
  }

  const clearPublishTimers = useCallback(() => {
    publishTimersRef.current.forEach(clearTimeout)
    publishTimersRef.current = []
  }, [])

  useEffect(() => {
    clearPublishTimers()
  }, [selectedSkuId, clearPublishTimers])

  function schedulePublishSimulation(skuId: string, batchId: string) {
    const phases = ["pim_done", "retailer_done", "pdp_live", "done"] as const
    phases.forEach((phase) => {
      const timer = setTimeout(() => {
        patchSku(skuId, (prev) => {
          let next = applyPublishPhase(prev, batchId, phase)
          if (phase === "done") {
            const deferred = getNextDeferredBatch(next, batchId)
            if (deferred) {
              next = activateDeferredBatch(next, deferred.id)
              schedulePublishSimulation(skuId, deferred.id)
            }
          }
          return next
        })
      }, PUBLISH_PHASE_DELAYS_MS[phase])
      publishTimersRef.current.push(timer)
    })
  }

  function handlePublishConfirm() {
    setPublishDialogOpen(false)
    const fieldKeys = publishSummary.publishable.map((f) => f.key)
    const queuedFollowUp = Boolean(activeBatch)

    patch((prev) => {
      const next = applyPublishStart(prev, fieldKeys, queuedFollowUp)
      const batch = next.publishBatches?.[next.publishBatches.length - 1]
      if (batch && !batch.queuedFollowUp) {
        schedulePublishSimulation(selectedSkuId, batch.id)
      }
      return next
    })
  }

  const bulletOriginals = useMemo(() => {
    const initial = makeInitialContent(selectedSku).bulletRecommendations
    return Object.fromEntries(initial.map((r) => [r.id, r.recommendedText]))
  }, [selectedSkuId])

  const titleOriginal = useMemo(
    () => makeInitialContent(selectedSku).titleRecommendation?.recommendedText ?? "",
    [selectedSkuId],
  )

  const descriptionOriginal = useMemo(
    () => makeInitialContent(selectedSku).descriptionRecommendation?.recommendedText ?? "",
    [selectedSkuId],
  )

  function mapBulletReco(
    prev: SkuContent,
    mapper: (r: BulletRecommendation) => BulletRecommendation,
  ): SkuContent {
    return {
      ...prev,
      bulletRecommendations: prev.bulletRecommendations.map(mapper),
    }
  }

  function markTitleEdits(prev: SkuContent, text: string): SkuContent {
    if (prev.titleStatus !== "accepted") {
      return {
        ...prev,
        titleRecommendation: prev.titleRecommendation
          ? { ...prev.titleRecommendation, recommendedText: text }
          : null,
      }
    }
    const fp = prev.titleSyncFootprint ?? "none"
    const syncing = fp === "syncing"
    return {
      ...prev,
      titleRecommendation: prev.titleRecommendation
        ? { ...prev.titleRecommendation, recommendedText: text }
        : null,
      titleHasUnpublishedEdits: true,
      titleSyncFootprint: syncing ? "queued" : fp,
    }
  }

  function handleAcceptTitle() {
    const recommended = content.titleRecommendation?.recommendedText
    if (!recommended) return
    patch((prev) => ({
      ...prev,
      title: recommended,
      titleStatus: "accepted",
      titleSyncFootprint: "none",
      titleHasUnpublishedEdits: false,
    }))
  }

  function handleRejectTitle() {
    patch((prev) => ({ ...prev, titleStatus: "rejected" }))
  }

  function handleUndoAcceptTitle() {
    const initial = makeInitialContent(selectedSku)
    patch((prev) => ({
      ...prev,
      title: initial.title,
      titleStatus: "pending",
      titleSyncFootprint: undefined,
      titleHasUnpublishedEdits: false,
      titleRecommendation: prev.titleRecommendation
        ? {
            ...prev.titleRecommendation,
            recommendedText: titleOriginal || prev.titleRecommendation.recommendedText,
          }
        : null,
    }))
  }

  function handleUndoRejectTitle() {
    patch((prev) => ({ ...prev, titleStatus: "pending" }))
  }

  function handlePushUpdateTitle() {
    patch((prev) => ({
      ...prev,
      titleHasUnpublishedEdits: true,
      titleSyncFootprint: prev.titleSyncFootprint === "syncing" ? "queued" : prev.titleSyncFootprint,
    }))
  }

  function handleAcceptNewTitleDraft(text: string) {
    patch((prev) => ({
      ...prev,
      title: text,
      titleStatus: "accepted",
      titleRecommendation: prev.titleRecommendation
        ? { ...prev.titleRecommendation, recommendedText: text }
        : null,
      titleHasUnpublishedEdits: false,
      // Same as first accept — staged for publish; queue updates only after Publish.
      titleSyncFootprint: "none",
    }))
  }

  function handleUndoStagedNewTitle() {
    patch((prev) => {
      const queue = getFieldPublishQueue(prev, "title")
      const revertText = queue.at(-1)?.text ?? prev.title

      return {
        ...prev,
        title: revertText,
        titleStatus: "accepted",
        titleRecommendation: prev.titleRecommendation
          ? { ...prev.titleRecommendation, recommendedText: revertText }
          : null,
        titleHasUnpublishedEdits: false,
        titleSyncFootprint: "none",
      }
    })
  }

  function markDescriptionEdits(prev: SkuContent, text: string): SkuContent {
    if (prev.descriptionStatus !== "accepted") {
      return {
        ...prev,
        descriptionRecommendation: prev.descriptionRecommendation
          ? { ...prev.descriptionRecommendation, recommendedText: text }
          : null,
      }
    }
    const fp = prev.descriptionSyncFootprint ?? "none"
    const syncing = fp === "syncing"
    return {
      ...prev,
      descriptionRecommendation: prev.descriptionRecommendation
        ? { ...prev.descriptionRecommendation, recommendedText: text }
        : null,
      descriptionHasUnpublishedEdits: true,
      descriptionSyncFootprint: syncing ? "queued" : fp,
    }
  }

  function handleAcceptDescription() {
    const recommended = content.descriptionRecommendation?.recommendedText
    if (!recommended) return
    patch((prev) => ({
      ...prev,
      description: recommended,
      descriptionStatus: "accepted",
      descriptionSyncFootprint: "none",
      descriptionHasUnpublishedEdits: false,
    }))
  }

  function handleRejectDescription() {
    patch((prev) => ({ ...prev, descriptionStatus: "rejected" }))
  }

  function handleUndoAcceptDescription() {
    const initial = makeInitialContent(selectedSku)
    patch((prev) => ({
      ...prev,
      description: initial.description,
      descriptionStatus: "pending",
      descriptionSyncFootprint: undefined,
      descriptionHasUnpublishedEdits: false,
      descriptionRecommendation: prev.descriptionRecommendation
        ? {
            ...prev.descriptionRecommendation,
            recommendedText:
              descriptionOriginal || prev.descriptionRecommendation.recommendedText,
          }
        : null,
    }))
  }

  function handleUndoRejectDescription() {
    patch((prev) => ({ ...prev, descriptionStatus: "pending" }))
  }

  function handlePushUpdateDescription() {
    patch((prev) => ({
      ...prev,
      descriptionHasUnpublishedEdits: true,
      descriptionSyncFootprint:
        prev.descriptionSyncFootprint === "syncing" ? "queued" : prev.descriptionSyncFootprint,
    }))
  }

  function handleAcceptNewDescriptionDraft(text: string) {
    patch((prev) => ({
      ...prev,
      description: text,
      descriptionStatus: "accepted",
      descriptionRecommendation: prev.descriptionRecommendation
        ? { ...prev.descriptionRecommendation, recommendedText: text }
        : null,
      descriptionHasUnpublishedEdits: false,
      descriptionSyncFootprint: "none",
    }))
  }

  function handleBulletTextChange(id: string, text: string) {
    patch((prev) =>
      mapBulletReco(prev, (r) => {
        if (r.id !== id) return r
        if (r.status !== "accepted") return { ...r, recommendedText: text }
        const fp = resolveBulletSyncFootprint(r)
        return {
          ...r,
          recommendedText: text,
          hasUnpublishedEdits: true,
          syncFootprint: fp === "syncing" ? "queued" : r.syncFootprint ?? "none",
        }
      }),
    )
  }

  function handleAcceptBullet(id: string) {
    patch((prev) => {
      const reco = prev.bulletRecommendations.find((r) => r.id === id)
      if (!reco) return prev
      if (reco.status === "rejected") {
        return mapBulletReco(prev, (r) =>
          r.id === id
            ? {
                ...r,
                status: "accepted",
                syncFootprint: "none",
                hasUnpublishedEdits: false,
                footprint: undefined,
              }
            : r,
        )
      }
      if (reco.status !== "pending" && reco.status !== "accepted") return prev
      return {
        ...prev,
        bullets: applyBulletRecommendation(prev.bullets, reco),
        bulletRecommendations: prev.bulletRecommendations.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "accepted" as const,
                syncFootprint: "none" as const,
                hasUnpublishedEdits: false,
                footprint: undefined,
              }
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

  function handleUndoAcceptBullet(id: string) {
    const initial = makeInitialContent(selectedSku)
    const original = bulletOriginals[id]
    patch((prev) => {
      const reco = prev.bulletRecommendations.find((r) => r.id === id)
      if (!reco || reco.kind !== "edit" || reco.pimIndex === undefined) return prev
      const bullets = [...prev.bullets]
      if (initial.bullets[reco.pimIndex] !== undefined) {
        bullets[reco.pimIndex] = initial.bullets[reco.pimIndex]
      }
      return {
        ...prev,
        bullets,
        bulletRecommendations: prev.bulletRecommendations.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "pending",
                syncFootprint: undefined,
                hasUnpublishedEdits: false,
                footprint: undefined,
                recommendedText: original ?? r.recommendedText,
              }
            : r,
        ),
      }
    })
  }

  function handleUndoRejectBullet(id: string) {
    patch((prev) =>
      mapBulletReco(prev, (r) => (r.id === id ? { ...r, status: "pending" } : r)),
    )
  }

  function handlePushUpdateBullet(id: string) {
    patch((prev) =>
      mapBulletReco(prev, (r) => {
        if (r.id !== id) return r
        const fp = resolveBulletSyncFootprint(r)
        return {
          ...r,
          hasUnpublishedEdits: true,
          syncFootprint: fp === "syncing" || fp === "synced" ? "queued" : r.syncFootprint,
        }
      }),
    )
  }

  function handleAcceptAllBullets() {
    patch((prev) => {
      let bullets = prev.bullets
      const nextRecos = prev.bulletRecommendations.map((r) => {
        if (r.status !== "pending") return r
        bullets = applyBulletRecommendation(bullets, r)
        return {
          ...r,
          status: "accepted" as const,
          syncFootprint: "none" as const,
          hasUnpublishedEdits: false,
          footprint: undefined,
        }
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
            publishState={publishBarState}
            publishableCount={publishSummary.publishable.length}
            pendingReviewCount={publishSummary.pendingReviewCount}
            queuedFollowUpCount={publishSummary.queuedFollowUpCount}
            activeBatch={activeBatch}
            onPublishClick={() => {
              if (publishSummary.publishable.length > 0) {
                setPublishDialogOpen(true)
              }
            }}
          />

          <PublishConfirmDialog
            open={publishDialogOpen}
            onOpenChange={setPublishDialogOpen}
            summary={publishSummary}
            hasActiveBatch={publishSummary.hasActiveBatch}
            onConfirm={handlePublishConfirm}
          />

          <div className="flex min-h-0 flex-1">
            <section className="flex min-w-0 flex-1 flex-col">
              <div className="space-y-4 overflow-y-auto p-5">
                <ProductTitleSection
                  pimTitle={content.title}
                  pdpTitle={pdp.title}
                  status={content.titleStatus}
                  recommendation={content.titleRecommendation}
                  syncFootprint={content.titleSyncFootprint}
                  hasUnpublishedEdits={content.titleHasUnpublishedEdits}
                  activeBatch={titlePublishBatch}
                  publishQueue={titlePublishQueue}
                  onRecommendationChange={(text) => patch((prev) => markTitleEdits(prev, text))}
                  onAccept={handleAcceptTitle}
                  onReject={handleRejectTitle}
                  onUndoAccept={handleUndoAcceptTitle}
                  onUndoReject={handleUndoRejectTitle}
                  onPushUpdate={handlePushUpdateTitle}
                  onAcceptNewDraft={handleAcceptNewTitleDraft}
                  onUndoStagedNewTitle={handleUndoStagedNewTitle}
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
                  getFieldPublishBatch={(fieldKey) => getPublishBatchForField(content, fieldKey)}
                  onRecommendationTextChange={handleBulletTextChange}
                  onAccept={handleAcceptBullet}
                  onReject={handleRejectBullet}
                  onReset={handleResetBullet}
                  onUndoAccept={handleUndoAcceptBullet}
                  onUndoReject={handleUndoRejectBullet}
                  onPushUpdate={handlePushUpdateBullet}
                  onAcceptAll={handleAcceptAllBullets}
                  onRejectAll={handleRejectAllBullets}
                  onResetAll={handleResetAllBullets}
                />
                <DescriptionSection
                  pimDescription={content.description}
                  pdpDescription={pdp.description}
                  status={content.descriptionStatus}
                  recommendation={content.descriptionRecommendation}
                  syncFootprint={content.descriptionSyncFootprint}
                  hasUnpublishedEdits={content.descriptionHasUnpublishedEdits}
                  activeBatch={descriptionPublishBatch}
                  onRecommendationChange={(text) => patch((prev) => markDescriptionEdits(prev, text))}
                  onAccept={handleAcceptDescription}
                  onReject={handleRejectDescription}
                  onUndoAccept={handleUndoAcceptDescription}
                  onUndoReject={handleUndoRejectDescription}
                  onPushUpdate={handlePushUpdateDescription}
                  onAcceptNewDraft={handleAcceptNewDescriptionDraft}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
