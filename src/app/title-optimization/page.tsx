"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BulkSelectControl } from "@/components/home/section-controls"

import { AppHeader } from "@/components/home/app-header"
import { FilterBar } from "@/components/home/filter-bar"
import { SkuSidebar } from "@/components/home/sku-sidebar"
import { ProductHeader, type PublishBarState } from "@/components/home/product-header"
import { ProductTitleSection } from "@/components/home/title-section"
import { PublishConfirmDialog } from "@/components/home/publish-confirm-dialog"
import { BulkPublishConfirmDialog, BulkPublishSuccessDialog, type BulkField } from "@/components/home/bulk-publish-confirm-dialog"
import { UnpublishedChangesGuardDialog } from "@/components/home/unpublished-changes-guard-dialog"
import { ItemHighlightsSection, type ItemHighlight } from "@/components/title-optimization/item-highlights-section"
import {
  LockedBulletsSection,
  LockedDescriptionSection,
  LockedImagesSection,
} from "@/components/title-optimization/locked-section"
import { HIGHLIGHTS_BY_SKU, DEFAULT_HIGHLIGHTS } from "@/components/title-optimization/highlights-data"
import { toast } from "sonner"

import { getFieldPublishQueue } from "@/lib/build-field-publish-queue"
import { getActivePublishBatch, getPublishBatchForField } from "@/lib/publish-batch"
import { getPublishSummary, revertUnpublishedAcceptedChanges } from "@/lib/publish-changes"
import {
  activateDeferredBatch,
  applyPublishPhase,
  applyPublishStart,
  getNextDeferredBatch,
  PUBLISH_PHASE_DELAYS_MS,
} from "@/lib/simulate-publish"
import {
  MOCK_SKUS,
  buildInitialState,
  makeInitialContent,
  passesFilter,
  passesSearch,
} from "@/components/home/data"
import type { ContentState, SkuContent } from "@/components/home/types"

const TITLE_CHAR_LIMIT = 75

type PendingNavigation = { kind: "sku"; skuId: string } | { kind: "route"; path: string }


function makeHighlights(skuId: string): ItemHighlight[] {
  return (HIGHLIGHTS_BY_SKU[skuId] ?? DEFAULT_HIGHLIGHTS).map((h) => ({
    ...h,
    status: "pending" as const,
  }))
}

export default function TitleOptimizationPage() {
  const [selectedSkuId, setSelectedSkuId] = useState(MOCK_SKUS[0].id)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("title-optimization")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contentState, setContentState] = useState<ContentState>(() => buildInitialState())
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [unpublishedGuardOpen, setUnpublishedGuardOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null)
  const [highlights, setHighlights] = useState<ItemHighlight[]>(() => makeHighlights(MOCK_SKUS[0].id))
  // Section-level publish inclusion (independent of accept/reject status, both selected by default)
  const [titleIncluded, setTitleIncluded] = useState(true)
  const [highlightIncluded, setHighlightIncluded] = useState(true)
  const publishTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // ── Bulk SKU selection ───────────────────────────────────────────────────
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedSkuIds, setSelectedSkuIds] = useState<Set<string>>(new Set())
  const [bulkPublishDialogOpen, setBulkPublishDialogOpen] = useState(false)
  const [pendingBulkFields, setPendingBulkFields] = useState<BulkField[]>([])
  const [bulkSuccessOpen, setBulkSuccessOpen] = useState(false)
  const [bulkSuccessInfo, setBulkSuccessInfo] = useState<{ skuCount: number; fields: BulkField[] } | null>(null)

  const filteredSkus = useMemo(
    () => MOCK_SKUS.filter((s) => passesFilter(s, filter) && passesSearch(s, search)),
    [filter, search],
  )

  const selectedSku = MOCK_SKUS.find((s) => s.id === selectedSkuId) ?? MOCK_SKUS[0]
  const content: SkuContent = contentState[selectedSkuId] ?? makeInitialContent(selectedSku)
  const publishSummary = useMemo(() => getPublishSummary(content), [content])
  const activeBatch = useMemo(() => getActivePublishBatch(content), [content])
  const titlePublishQueue = useMemo(() => getFieldPublishQueue(content, "title"), [content])
  const titlePublishBatch = useMemo(() => {
    const active = getActivePublishBatch(content)
    if (active?.fieldKeys.includes("title")) return active
    return getPublishBatchForField(content, "title")
  }, [content])

  const publishBarState: PublishBarState = useMemo(() => {
    const hasPublishable = publishSummary.publishable.length > 0
    const inFlight = Boolean(activeBatch) || Boolean(content.isPublishing)
    if (inFlight) return hasPublishable ? "syncing" : "publishing"
    if (hasPublishable) return "ready"
    return "disabled"
  }, [content.isPublishing, activeBatch, publishSummary.publishable.length])

  const hasUnpublished = publishSummary.publishable.length > 0

  // Reset highlights and inclusion state when SKU changes
  useEffect(() => {
    setHighlights(makeHighlights(selectedSkuId))
    setTitleIncluded(true)
    setHighlightIncluded(true)
  }, [selectedSkuId])

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

  useEffect(() => { clearPublishTimers() }, [selectedSkuId, clearPublishTimers])

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
    const fieldNames = publishSummary.publishable.map((f) => f.label).join(", ")
    const queuedFollowUp = Boolean(activeBatch)
    patch((prev) => {
      const next = applyPublishStart(prev, fieldKeys, queuedFollowUp)
      const batch = next.publishBatches?.[next.publishBatches.length - 1]
      if (batch && !batch.queuedFollowUp) schedulePublishSimulation(selectedSkuId, batch.id)
      return next
    })
    toast.success("Your changes are published", { description: `${fieldNames} sent to PIM & PDP.` })
  }

  const titleOriginal = useMemo(
    () => makeInitialContent(selectedSku).titleRecommendation?.recommendedText ?? "",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSkuId],
  )

  // ── Title handlers ────────────────────────────────────────────────────────

  function handleAcceptTitle() {
    if (!content.titleRecommendation?.recommendedText) return
    patch((prev) => ({ ...prev, titleStatus: "accepted", titleEditSource: "ai", titleSyncFootprint: "none", titleHasUnpublishedEdits: false }))
  }
  function handleRejectTitle() { patch((prev) => ({ ...prev, titleStatus: "rejected" })) }
  function handleUndoAcceptTitle() {
    const initial = makeInitialContent(selectedSku)
    patch((prev) => ({
      ...prev,
      title: initial.title,
      titleStatus: "pending",
      titleSyncFootprint: undefined,
      titleHasUnpublishedEdits: false,
      titleEditSource: "ai",
      titleRecommendation: prev.titleRecommendation
        ? { ...prev.titleRecommendation, recommendedText: titleOriginal || prev.titleRecommendation.recommendedText }
        : null,
    }))
  }
  function handleUndoRejectTitle() { patch((prev) => ({ ...prev, titleStatus: "pending" })) }
  function handleTitleChange(text: string) {
    patch((prev) => ({
      ...prev,
      titleRecommendation: prev.titleRecommendation
        ? { ...prev.titleRecommendation, recommendedText: text }
        : null,
    }))
  }
  function handleAcceptNewTitleDraft(text: string) {
    patch((prev) => ({
      ...prev,
      titleStatus: "accepted",
      titleEditSource: "manual",
      titleRecommendation: prev.titleRecommendation
        ? { ...prev.titleRecommendation, recommendedText: text }
        : null,
      titleHasUnpublishedEdits: false,
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

  // ── Bulk SKU selection handlers ──────────────────────────────────────────

  function handleToggleSelectionMode() {
    setIsSelectionMode((v) => !v)
    setSelectedSkuIds(new Set())
  }

  function handleToggleSkuSelection(id: string) {
    setSelectedSkuIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelectAllSkus() {
    setSelectedSkuIds(new Set(filteredSkus.map((s) => s.id)))
  }

  function handleDeselectAllSkus() {
    setSelectedSkuIds(new Set())
  }

  function handleBulkPublishConfirm(fields: BulkField[]) {
    setBulkPublishDialogOpen(false)
    const includeTitle = fields.includes("title")
    const includeBullets = fields.includes("bullets")
    const includeDescription = fields.includes("description")

    const skuIds = Array.from(selectedSkuIds)
    const newState = { ...contentState }
    const batchesToSchedule: { skuId: string; batchId: string }[] = []

    for (const skuId of skuIds) {
      const skuContent = newState[skuId] ?? makeInitialContent(MOCK_SKUS.find((s) => s.id === skuId)!)
      const accepted: typeof skuContent = {
        ...skuContent,
        titleStatus: includeTitle && skuContent.titleStatus === "pending" ? "accepted" : skuContent.titleStatus,
        titleSyncFootprint: includeTitle && skuContent.titleStatus === "pending" ? "none" : skuContent.titleSyncFootprint,
        descriptionStatus: includeDescription && skuContent.descriptionStatus === "pending" ? "accepted" : skuContent.descriptionStatus,
        descriptionSyncFootprint: includeDescription && skuContent.descriptionStatus === "pending" ? "none" : skuContent.descriptionSyncFootprint,
        bulletRecommendations: skuContent.bulletRecommendations.map((r) =>
          includeBullets && r.status === "pending"
            ? { ...r, status: "accepted" as const, syncFootprint: "none" as const, hasUnpublishedEdits: false, footprint: undefined }
            : r,
        ),
      }
      const fieldKeys = [
        includeTitle && accepted.titleStatus === "accepted" ? "title" : null,
        includeDescription && accepted.descriptionStatus === "accepted" ? "description" : null,
        ...(includeBullets
          ? accepted.bulletRecommendations.filter((r) => r.status === "accepted").map((r) => `bullet:${r.id}`)
          : []),
      ].filter(Boolean) as string[]

      if (fieldKeys.length === 0) { newState[skuId] = accepted; continue }

      const published = applyPublishStart(accepted, fieldKeys, false)
      newState[skuId] = published

      const batch = published.publishBatches?.[published.publishBatches.length - 1]
      if (batch) batchesToSchedule.push({ skuId, batchId: batch.id })
    }

    setContentState(newState)
    batchesToSchedule.forEach(({ skuId, batchId }) => schedulePublishSimulation(skuId, batchId))

    setBulkSuccessInfo({ skuCount: batchesToSchedule.length || skuIds.length, fields })
    setBulkSuccessOpen(true)
    setIsSelectionMode(false)
    setSelectedSkuIds(new Set())
  }

  // ── Navigation guard ──────────────────────────────────────────────────────

  const bulletOriginals = useMemo(() => {
    const initial = makeInitialContent(selectedSku).bulletRecommendations
    return Object.fromEntries(initial.map((r) => [r.id, r.recommendedText]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkuId])

  function applyNavigation(nav: PendingNavigation) {
    if (nav.kind === "sku") { setSelectedSkuId(nav.skuId); return }
  }
  function requestNavigation(nav: PendingNavigation) {
    if (nav.kind === "sku" && nav.skuId === selectedSkuId) return
    if (!hasUnpublished) { applyNavigation(nav); return }
    setPendingNavigation(nav)
    setUnpublishedGuardOpen(true)
  }
  function handleGuardStay() { setPendingNavigation(null); setUnpublishedGuardOpen(false) }
  function handleGuardLeave() {
    const nav = pendingNavigation
    const skuId = selectedSkuId
    setPendingNavigation(null)
    setUnpublishedGuardOpen(false)
    if (hasUnpublished) {
      const sku = MOCK_SKUS.find((s) => s.id === skuId) ?? MOCK_SKUS[0]
      setContentState((prev) => ({
        ...prev,
        [skuId]: revertUnpublishedAcceptedChanges(prev[skuId], makeInitialContent(sku), bulletOriginals),
      }))
    }
    if (nav) applyNavigation(nav)
  }

  // ── Highlights handlers ───────────────────────────────────────────────────

  function patchHighlight(id: string, status: ItemHighlight["status"]) {
    setHighlights((prev) => prev.map((h) => (h.id === id ? { ...h, status } : h)))
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader title="Title Optimization" backHref="/" />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeFilter={filter}
        onFilterChange={setFilter}
        selectedBrands={selectedBrands}
        onBrandsChange={setSelectedBrands}
        matchCount={filteredSkus.length}
        onActivityLogClick={() => {}}
        lockedFilter="title-optimization"
      />

      <div className="flex min-h-0 flex-1">
        <SkuSidebar
          skus={filteredSkus}
          selectedSkuId={selectedSkuId}
          onSelect={(skuId) => requestNavigation({ kind: "sku", skuId })}
          totalCount={MOCK_SKUS.length}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          hideMetrics
          isSelectionMode={isSelectionMode}
          selectedSkuIds={selectedSkuIds}
          onToggleSelectionMode={handleToggleSelectionMode}
          onToggleSkuSelection={handleToggleSkuSelection}
          onSelectAllSkus={handleSelectAllSkus}
          onDeselectAllSkus={handleDeselectAllSkus}
          onBulkAcceptAndPublish={(fields) => { setPendingBulkFields(fields); setBulkPublishDialogOpen(true) }}
        />

        <BulkPublishConfirmDialog
          open={bulkPublishDialogOpen}
          onOpenChange={setBulkPublishDialogOpen}
          skuCount={selectedSkuIds.size}
          fields={pendingBulkFields}
          onConfirm={() => handleBulkPublishConfirm(pendingBulkFields)}
        />

        <BulkPublishSuccessDialog
          open={bulkSuccessOpen}
          onOpenChange={setBulkSuccessOpen}
          skuCount={bulkSuccessInfo?.skuCount ?? 0}
          fields={bulkSuccessInfo?.fields ?? []}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ProductHeader
            title={selectedSku.title}
            asin={selectedSku.asin}
            productId={selectedSku.productId}
            brand={selectedSku.brand}
            thumbnailUrl={selectedSku.thumbnailUrl}
            compliance={selectedSku.metrics.compliance}
            seo={selectedSku.metrics.seo}
            aeo={selectedSku.metrics.aeo}
            publishState={publishBarState}
            publishableCount={publishSummary.publishable.length}
            hideMetrics
            selectedCount={[titleIncluded, highlightIncluded].filter(Boolean).length}
            totalSections={2}
            onPublishClick={() => { if (publishSummary.publishable.length > 0) setPublishDialogOpen(true) }}
          />

          <UnpublishedChangesGuardDialog
            open={unpublishedGuardOpen}
            onOpenChange={(open) => { if (!open) handleGuardStay() }}
            onStay={handleGuardStay}
            onLeave={handleGuardLeave}
          />
          <PublishConfirmDialog
            open={publishDialogOpen}
            onOpenChange={setPublishDialogOpen}
            summary={publishSummary}
            hasActiveBatch={publishSummary.hasActiveBatch}
            onConfirm={handlePublishConfirm}
          />

          <div className="flex-1 overflow-y-auto">
            {/* Bulk select — own tight strip, not part of section spacing */}
            <div className="flex items-center justify-end px-5 pt-3 pb-1">
              <BulkSelectControl
                selectedCount={[titleIncluded, highlightIncluded].filter(Boolean).length}
                totalCount={2}
                onSelectAll={() => { setTitleIncluded(true); setHighlightIncluded(true) }}
                onDeselectAll={() => { setTitleIncluded(false); setHighlightIncluded(false) }}
              />
            </div>

            <div className="space-y-4 px-5 pb-5">
              {/* Title — fully interactive, 75-char limit */}
              <ProductTitleSection
                key={selectedSkuId}
                pimTitle={content.title}
                pdpTitle={content.pdpContent.title}
                status={content.titleStatus}
                titleEditSource={content.titleEditSource}
                recommendation={content.titleRecommendation}
                hasPimData={content.hasPimData}
                syncFootprint={content.titleSyncFootprint}
                hasUnpublishedEdits={content.titleHasUnpublishedEdits}
                activeBatch={titlePublishBatch}
                publishQueue={titlePublishQueue}
                onRecommendationChange={handleTitleChange}
                onAccept={handleAcceptTitle}
                onReject={handleRejectTitle}
                onUndoAccept={handleUndoAcceptTitle}
                onUndoReject={handleUndoRejectTitle}
                onAcceptNewDraft={handleAcceptNewTitleDraft}
                onUndoStagedNewTitle={handleUndoStagedNewTitle}
                charLimit={TITLE_CHAR_LIMIT}
                isIncluded={titleIncluded}
                onToggleInclude={() => setTitleIncluded((v) => !v)}
                hideActions
              />

              {/* Item Highlights — new AI-generated info points */}
              <ItemHighlightsSection
                highlights={highlights}
                hasPimData={content.hasPimData}
                onAccept={(id) => patchHighlight(id, "accepted")}
                onUndoAccept={(id) => patchHighlight(id, "pending")}
                isIncluded={highlightIncluded}
                onToggleInclude={() => setHighlightIncluded((v) => !v)}
              />

              {/* Locked sections — visible but not interactive in this module */}
              <LockedBulletsSection
                bullets={content.bullets}
                recommendations={content.bulletRecommendations}
                pdpBullets={content.pdpContent.bullets}
                hasPimData={content.hasPimData}
              />
              <LockedImagesSection
                count={content.images.length}
                pdpImages={content.pdpContent.images ?? []}
                hasPimData={content.hasPimData}
              />
              <LockedDescriptionSection
                description={content.description}
                recommendation={content.descriptionRecommendation}
                pdpDescription={content.pdpContent.description}
                hasPimData={content.hasPimData}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
