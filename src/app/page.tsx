"use client"

export const dynamic = "force-static"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { BulkSelectControl } from "@/components/home/section-controls"
import { SourceLogoBadge } from "@/components/home/bullet-source-cell"
import {
  RETAILER_LOGO_SRC,
  SALSIFY_LOGO_SRC,
} from "@/components/home/source-logos"
import { AppHeader } from "@/components/home/app-header"
import { FilterBar } from "@/components/home/filter-bar"
import { SkuSidebar } from "@/components/home/sku-sidebar"
import { ProductHeader, type PublishBarState } from "@/components/home/product-header"
import { ProductTitleSection } from "@/components/home/title-section"
import { ImageSection } from "@/components/home/image-section"
import { BulletPointsSection } from "@/components/home/bullet-section"
import { DescriptionSection } from "@/components/home/description-section"
import { PublishConfirmDialog } from "@/components/home/publish-confirm-dialog"
import { BulkPublishConfirmDialog, FIELD_LABELS, type BulkField } from "@/components/home/bulk-publish-confirm-dialog"
import { BRD_INPUT_KEY, BRD_OUTPUT_KEY, type BrdOutput } from "@/components/home/bulk-review-view"
import { toast } from "sonner"
import { UnpublishedChangesGuardDialog } from "@/components/home/unpublished-changes-guard-dialog"
import { QueueEmptyState } from "@/components/home/queue-empty-state"

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
import { resolveBulletSyncFootprint } from "@/lib/sync-footprint"
import {
  MOCK_SKUS,
  buildInitialState,
  makeInitialContent,
  passesFilter,
  passesSearch,
} from "@/components/home/data"
import type { ActionStatus, BulletRecommendation, ContentState, SkuContent } from "@/components/home/types"

type PendingNavigation =
  | { kind: "sku"; skuId: string }
  | { kind: "route"; path: string }

export default function Home() {
  const router = useRouter()
  const [selectedSkuId, setSelectedSkuId] = useState(MOCK_SKUS[0].id)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("compliance")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contentState, setContentState] = useState<ContentState>(() => buildInitialState())
  // Tracks each SKU's workflow state: to-do → in-progress (after publish) → success
  const [actionStatusMap, setActionStatusMap] = useState<Record<string, ActionStatus>>(() =>
    Object.fromEntries(MOCK_SKUS.map((s) => [s.id, s.actionStatus ?? "to-do"]))
  )
  // Bookmark is orthogonal to workflow state — a SKU can be bookmarked at any stage
  const [bookmarkSet, setBookmarkSet] = useState<Set<string>>(
    () => new Set(MOCK_SKUS.filter((s) => s.isBookmarked).map((s) => s.id))
  )
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [unpublishedGuardOpen, setUnpublishedGuardOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null)
  const publishTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)

  // Controls the column-filter popover in FilterBar — lifted so the sidebar
  // empty-state nudge can open it programmatically.
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  // ── Bulk SKU selection state ──────────────────────────────────────────────
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedSkuIds, setSelectedSkuIds] = useState<Set<string>>(new Set())
  const [bulkPublishDialogOpen, setBulkPublishDialogOpen] = useState(false)
  const [pendingBulkFields, setPendingBulkFields] = useState<BulkField[]>([])

  // Section-level publish inclusion — all selected by default
  const [titleIncluded, setTitleIncluded] = useState(true)
  const [imageIncluded, setImageIncluded] = useState(true)
  const [bulletsIncluded, setBulletsIncluded] = useState(true)
  const [descriptionIncluded, setDescriptionIncluded] = useState(true)

  const includedCount = [titleIncluded, imageIncluded, bulletsIncluded, descriptionIncluded].filter(Boolean).length

  const filteredSkus = useMemo(
    () => MOCK_SKUS
      // Sidebar is a "to-do" list — only show SKUs that haven't been actioned yet
      .filter((s) => (actionStatusMap[s.id] ?? "to-do") === "to-do")
      .filter((s) => passesFilter(s, filter) && passesSearch(s, search))
      // When the bookmarks toggle is active, only show bookmarked SKUs
      .filter((s) => !bookmarkedOnly || bookmarkSet.has(s.id))
      // Merge live actionStatus and isBookmarked so cards reflect current state
      .map((s) => ({
        ...s,
        actionStatus: actionStatusMap[s.id] ?? ("to-do" as ActionStatus),
        isBookmarked: bookmarkSet.has(s.id),
      })),
    [actionStatusMap, bookmarkSet, bookmarkedOnly, filter, search],
  )

  // True when every SKU has been actioned (none remain with "to-do" status),
  // regardless of active filters. Used to show the "All caught up!" empty state.
  const queueEmpty = useMemo(
    () => MOCK_SKUS.every((s) => (actionStatusMap[s.id] ?? "to-do") !== "to-do"),
    [actionStatusMap],
  )

  const selectedSku = useMemo(() => {
    const sku = MOCK_SKUS.find((s) => s.id === selectedSkuId) ?? MOCK_SKUS[0]
    return {
      ...sku,
      actionStatus: actionStatusMap[sku.id] ?? ("to-do" as ActionStatus),
      isBookmarked: bookmarkSet.has(sku.id),
    }
  }, [selectedSkuId, actionStatusMap, bookmarkSet])
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
    // Pending reviews (unreviewed AI suggestions) also count — user can publish directly.
    const hasPending = publishSummary.pendingReviewCount > 0
    const inFlight = Boolean(activeBatch) || Boolean(content.isPublishing)

    if (inFlight) {
      return hasPublishable ? "syncing" : "publishing"
    }
    if (hasPublishable || hasPending) return "ready"
    return "disabled"
  }, [content.isPublishing, activeBatch, publishSummary.publishable.length, publishSummary.pendingReviewCount])

  // Combines accepted + still-pending AI suggestions so the dialog shows everything
  // that will be published (pending items are auto-accepted on confirm).
  const effectivePublishSummary = useMemo(() => {
    const acceptedKeys = new Set(publishSummary.publishable.map((f) => f.key))
    const pendingFields: { key: string; label: string }[] = []

    if (content.titleStatus === "pending" && content.titleRecommendation) {
      pendingFields.push({ key: "title", label: "Title" })
    }
    content.bulletRecommendations.forEach((r) => {
      if (r.status === "pending") {
        pendingFields.push({ key: `bullet:${r.id}`, label: r.label || "Bullet" })
      }
    })
    if (content.descriptionStatus === "pending" && content.descriptionRecommendation) {
      pendingFields.push({ key: "description", label: "Description" })
    }

    return {
      ...publishSummary,
      publishable: [
        ...publishSummary.publishable,
        ...pendingFields.filter((f) => !acceptedKeys.has(f.key)),
      ],
    }
  }, [publishSummary, content])

  const hasUnpublishedAcceptedChanges = publishSummary.publishable.length > 0

  function applyNavigation(nav: PendingNavigation) {
    if (nav.kind === "sku") {
      setSelectedSkuId(nav.skuId)
      return
    }
    router.push(nav.path)
  }

  function requestNavigation(nav: PendingNavigation) {
    if (nav.kind === "sku" && nav.skuId === selectedSkuId) return
    if (!hasUnpublishedAcceptedChanges) {
      applyNavigation(nav)
      return
    }
    setPendingNavigation(nav)
    setUnpublishedGuardOpen(true)
  }

  function handleUnpublishedGuardStay() {
    setPendingNavigation(null)
    setUnpublishedGuardOpen(false)
  }

  function handleUnpublishedGuardLeave() {
    const nav = pendingNavigation
    const skuId = selectedSkuId
    setPendingNavigation(null)
    setUnpublishedGuardOpen(false)

    if (hasUnpublishedAcceptedChanges) {
      const sku = MOCK_SKUS.find((s) => s.id === skuId) ?? MOCK_SKUS[0]
      setContentState((prev) => ({
        ...prev,
        [skuId]: revertUnpublishedAcceptedChanges(
          prev[skuId],
          makeInitialContent(sku),
          bulletOriginals,
        ),
      }))
    }

    if (nav) applyNavigation(nav)
  }

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
    setTitleIncluded(true)
    setImageIncluded(true)
    setBulletsIncluded(true)
    setDescriptionIncluded(true)
  }, [selectedSkuId, clearPublishTimers])

  // When the user returns from /bulk-review, pick up the approve result
  useEffect(() => {
    const raw = sessionStorage.getItem(BRD_OUTPUT_KEY)
    if (!raw) return
    sessionStorage.removeItem(BRD_OUTPUT_KEY)
    const { fields, skuIds } = JSON.parse(raw) as BrdOutput
    setSelectedSkuIds(new Set(skuIds))
    setPendingBulkFields(fields)
    setBulkPublishDialogOpen(true)
  }, [])

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
    const queuedFollowUp = Boolean(activeBatch)
    const fieldNames = effectivePublishSummary.publishable.map((f) => f.label).join(", ")

    patch((prev) => {
      // Auto-accept any still-pending recommendations so they get included in this publish.
      const withAccepted: SkuContent = {
        ...prev,
        titleStatus: prev.titleStatus === "pending" ? "accepted" : prev.titleStatus,
        titleSyncFootprint: prev.titleStatus === "pending" ? "none" : prev.titleSyncFootprint,
        descriptionStatus: prev.descriptionStatus === "pending" ? "accepted" : prev.descriptionStatus,
        descriptionSyncFootprint: prev.descriptionStatus === "pending" ? "none" : prev.descriptionSyncFootprint,
        bulletRecommendations: prev.bulletRecommendations.map((r) =>
          r.status === "pending"
            ? { ...r, status: "accepted" as const, syncFootprint: "none" as const, hasUnpublishedEdits: false, footprint: undefined }
            : r,
        ),
      }

      const fieldKeys = getPublishSummary(withAccepted).publishable.map((f) => f.key)
      if (fieldKeys.length === 0) return withAccepted

      const next = applyPublishStart(withAccepted, fieldKeys, queuedFollowUp)
      const batch = next.publishBatches?.[next.publishBatches.length - 1]
      if (batch && !batch.queuedFollowUp) {
        schedulePublishSimulation(selectedSkuId, batch.id)
      }
      return next
    })

    toast.success("Your changes are published", {
      description: `${fieldNames} sent to PIM & PDP.`,
    })

    // Capture the next SKU now — filteredSkus still contains the current SKU at this point.
    // After the status update below it will be removed from the list.
    const currentIndex = filteredSkus.findIndex((s) => s.id === selectedSkuId)
    const nextSkuId = filteredSkus[currentIndex + 1]?.id

    // Delay sidebar removal until the confirm dialog has finished closing (~300ms)
    // so the card exit animation starts after the popup is gone, then auto-advance.
    setTimeout(() => {
      setActionStatusMap((prev) => ({ ...prev, [selectedSkuId]: "in-progress" }))
      if (nextSkuId) setSelectedSkuId(nextSkuId)
    }, 300)
  }

  function handleBookmarkToggle() {
    setBookmarkSet((prev) => {
      const next = new Set(prev)
      if (next.has(selectedSkuId)) {
        next.delete(selectedSkuId)
      } else {
        next.add(selectedSkuId)
      }
      return next
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

  /** Accepts all pending recommendations for selected SKUs — does not publish. */
  function handleBulkAccept() {
    const skuIds = Array.from(selectedSkuIds)
    const newState = { ...contentState }

    for (const skuId of skuIds) {
      const skuContent = newState[skuId] ?? makeInitialContent(MOCK_SKUS.find((s) => s.id === skuId)!)
      newState[skuId] = {
        ...skuContent,
        titleStatus: skuContent.titleStatus === "pending" ? "accepted" : skuContent.titleStatus,
        titleSyncFootprint: skuContent.titleStatus === "pending" ? "none" : skuContent.titleSyncFootprint,
        descriptionStatus: skuContent.descriptionStatus === "pending" ? "accepted" : skuContent.descriptionStatus,
        descriptionSyncFootprint: skuContent.descriptionStatus === "pending" ? "none" : skuContent.descriptionSyncFootprint,
        bulletRecommendations: skuContent.bulletRecommendations.map((r) =>
          r.status !== "pending"
            ? r
            : { ...r, status: "accepted" as const, syncFootprint: "none" as const, hasUnpublishedEdits: false, footprint: undefined },
        ),
      }
    }

    setContentState(newState)
    toast.success(`Accepted recommendations for ${skuIds.length} SKU${skuIds.length > 1 ? "s" : ""}`, {
      description: "Changes staged — click Publish when ready.",
    })
    setIsSelectionMode(false)
    setSelectedSkuIds(new Set())
  }

  /** Accept pending recs for selected SKUs (only for chosen fields), then publish. */
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

      // Accept pending recs only for the fields the user selected
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

      // Build publish field key list from accepted state
      const fieldKeys = [
        includeTitle && accepted.titleStatus === "accepted" ? "title" : null,
        includeDescription && accepted.descriptionStatus === "accepted" ? "description" : null,
        ...(includeBullets
          ? accepted.bulletRecommendations.filter((r) => r.status === "accepted").map((r) => `bullet:${r.id}`)
          : []),
      ].filter(Boolean) as string[]

      if (fieldKeys.length === 0) {
        newState[skuId] = accepted
        continue
      }

      const published = applyPublishStart(accepted, fieldKeys, false)
      newState[skuId] = published

      const batch = published.publishBatches?.[published.publishBatches.length - 1]
      if (batch) batchesToSchedule.push({ skuId, batchId: batch.id })
    }

    setContentState(newState)
    batchesToSchedule.forEach(({ skuId, batchId }) => schedulePublishSimulation(skuId, batchId))

    // Show success toast (bottom-left, slides in)
    const skuCount = batchesToSchedule.length || skuIds.length
    const fieldList = fields.map((f) => FIELD_LABELS[f]).join(" · ")
    toast.success("Changes sent!", {
      description: `${skuCount} SKU${skuCount !== 1 ? "s" : ""} · ${fieldList} — PIM and PDP sync in progress.`,
      duration: 6000,
      dismissible: true,
    })
    setIsSelectionMode(false)
    setSelectedSkuIds(new Set())

    // Mark published SKUs as "in-progress" so they leave the sidebar list and
    // trigger the staggered exit animation. Small delay lets the confirm dialog
    // finish closing first (matches the single-SKU publish flow).
    const publishedIds = batchesToSchedule.map(({ skuId }) => skuId)
    if (publishedIds.length > 0) {
      setTimeout(() => {
        setActionStatusMap((prev) => {
          const next = { ...prev }
          publishedIds.forEach((id) => { next[id] = "in-progress" })
          return next
        })
      }, 300)
    }
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
      titleStatus: "accepted",
      titleEditSource: "ai",
      titleSyncFootprint: "none",
      titleHasUnpublishedEdits: false,
    }))
  }

  function handleRejectTitle() {
    patch((prev) => ({ ...prev, titleStatus: "rejected" }))
  }

  function handleUndoAcceptTitle() {
    const initial = makeInitialContent(selectedSku)
    patch((prev) => {
      if (prev.titleEditSource === "manual") {
        const text = prev.titleRecommendation?.recommendedText ?? prev.title
        return {
          ...prev,
          title: initial.title,
          titleStatus: "pending",
          titleSyncFootprint: undefined,
          titleHasUnpublishedEdits: false,
          titleEditSource: "manual",
          titleRecommendation: prev.titleRecommendation
            ? { ...prev.titleRecommendation, recommendedText: text }
            : null,
        }
      }
      return {
        ...prev,
        title: initial.title,
        titleStatus: "pending",
        titleSyncFootprint: undefined,
        titleHasUnpublishedEdits: false,
        titleEditSource: "ai",
        titleRecommendation: prev.titleRecommendation
          ? {
              ...prev.titleRecommendation,
              recommendedText: titleOriginal || prev.titleRecommendation.recommendedText,
            }
          : null,
      }
    })
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
      titleStatus: "accepted",
      titleEditSource: "manual",
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

  function handleAcceptNewBulletDraft(id: string, text: string) {
    patch((prev) => {
      const fieldKey = `bullet:${id}`
      const hasInFlightPublish = (prev.publishBatches ?? []).some(
        (b) => b.fieldKeys.includes(fieldKey) && !b.completedAt,
      )
      return mapBulletReco(prev, (r) =>
        r.id === id
          ? {
              ...r,
              recommendedText: text,
              status: "accepted" as const,
              syncFootprint: hasInFlightPublish ? ("queued" as const) : ("none" as const),
              hasUnpublishedEdits: false,
              footprint: undefined,
            }
          : r,
      )
    })
  }

  function handleAcceptNewDescriptionDraft(text: string) {
    patch((prev) => ({
      ...prev,
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
      const fieldKey = `bullet:${id}`
      const hasInFlightPublish = (prev.publishBatches ?? []).some(
        (b) => b.fieldKeys.includes(fieldKey) && !b.completedAt,
      )

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

      if (reco.status === "accepted" && reco.hasUnpublishedEdits) {
        return mapBulletReco(prev, (r) =>
          r.id === id
            ? {
                ...r,
                hasUnpublishedEdits: false,
                syncFootprint: hasInFlightPublish ? ("queued" as const) : (r.syncFootprint ?? "none"),
                footprint: undefined,
              }
            : r,
        )
      }

      if (reco.status !== "pending" && reco.status !== "accepted") return prev
      return {
        ...prev,
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
    patch((prev) => {
      const fieldKey = `bullet:${id}`
      const hasInFlightPublish = (prev.publishBatches ?? []).some(
        (b) => b.fieldKeys.includes(fieldKey) && !b.completedAt,
      )
      return mapBulletReco(prev, (r) => {
        if (r.id !== id) return r
        const fp = resolveBulletSyncFootprint(r)
        const queueFollowUp = hasInFlightPublish || fp === "syncing" || fp === "synced"
        return {
          ...r,
          hasUnpublishedEdits: false,
          syncFootprint: queueFollowUp ? ("queued" as const) : (r.syncFootprint ?? "none"),
          footprint: undefined,
        }
      })
    })
  }

  function handleAcceptAllBullets() {
    patch((prev) => ({
      ...prev,
      bulletRecommendations: prev.bulletRecommendations.map((r) =>
        r.status !== "pending"
          ? r
          : {
              ...r,
              status: "accepted" as const,
              syncFootprint: "none" as const,
              hasUnpublishedEdits: false,
              footprint: undefined,
            },
      ),
    }))
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
        onActivityLogClick={() => requestNavigation({ kind: "route", path: "/actions-log" })}
        bookmarkedCount={bookmarkSet.size}
        bookmarkedOnly={bookmarkedOnly}
        onBookmarkedOnlyChange={setBookmarkedOnly}
        filterPopoverOpen={filterPopoverOpen}
        onFilterPopoverOpenChange={setFilterPopoverOpen}
      />

      <div className="flex min-h-0 flex-1">
        <SkuSidebar
          skus={filteredSkus}
          selectedSkuId={selectedSkuId}
          onSelect={(skuId) => requestNavigation({ kind: "sku", skuId })}
          totalCount={MOCK_SKUS.length}
          queueEmpty={queueEmpty}
          onOpenFilterPanel={() => setFilterPopoverOpen(true)}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          isSelectionMode={isSelectionMode}
          selectedSkuIds={selectedSkuIds}
          onToggleSelectionMode={handleToggleSelectionMode}
          onToggleSkuSelection={handleToggleSkuSelection}
          onSelectAllSkus={handleSelectAllSkus}
          onDeselectAllSkus={handleDeselectAllSkus}
          onBulkAcceptAndPublish={(fields) => { setPendingBulkFields(fields); setBulkPublishDialogOpen(true) }}
          onBulkReview={() => {
            // Store current state so the bulk-review page can read it
            sessionStorage.setItem(
              BRD_INPUT_KEY,
              JSON.stringify({ selectedSkuIds: [...selectedSkuIds], contentState }),
            )
            router.push("/bulk-review")
          }}
        />

        <BulkPublishConfirmDialog
          open={bulkPublishDialogOpen}
          onOpenChange={setBulkPublishDialogOpen}
          skuCount={selectedSkuIds.size}
          fields={pendingBulkFields}
          onConfirm={(fields) => handleBulkPublishConfirm(fields)}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {queueEmpty ? (
            <QueueEmptyState />
          ) : (
            <>
            <ProductHeader
            title={selectedSku.title}
            asin={selectedSku.asin}
            productId={selectedSku.productId}
            brand={selectedSku.brand}
            thumbnailUrl={selectedSku.thumbnailUrl}
            compliance={selectedSku.metrics.compliance}
            seo={selectedSku.metrics.seo}
            aeo={selectedSku.metrics.aeo}
            ops={selectedSku.metrics.ops}
            publishState={publishBarState}
            publishableCount={effectivePublishSummary.publishable.length}
            selectedCount={includedCount}
            totalSections={4}
            actionStatus={selectedSku.actionStatus}
            isBookmarked={selectedSku.isBookmarked ?? false}
            onBookmarkClick={handleBookmarkToggle}
            lastUpdated={selectedSku.lastUpdated}
            onPublishClick={() => {
              if (includedCount > 0) setPublishDialogOpen(true)
            }}
          />

          <UnpublishedChangesGuardDialog
            open={unpublishedGuardOpen}
            onOpenChange={(open) => {
              if (!open) handleUnpublishedGuardStay()
            }}
            onStay={handleUnpublishedGuardStay}
            onLeave={handleUnpublishedGuardLeave}
          />

          <PublishConfirmDialog
            open={publishDialogOpen}
            onOpenChange={setPublishDialogOpen}
            summary={effectivePublishSummary}
            hasActiveBatch={effectivePublishSummary.hasActiveBatch}
            onConfirm={handlePublishConfirm}
          />

          <div className="flex min-h-0 flex-1">
            <section className="flex min-w-0 flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-100 px-5 pb-5">
                {/* Toolbar: sync info (left) + bulk select (right) */}
                <div className="flex items-center justify-between pt-3 pb-1">
                  {/* PIM sync + AI sync chips — icons match SourceLogoBadge styling */}
                  <div className="flex items-center gap-3">
                    {selectedSku.pimSyncedOn && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <SourceLogoBadge src={SALSIFY_LOGO_SRC} alt="PIM" />
                        Synced on {selectedSku.pimSyncedOn}
                      </span>
                    )}
                    {selectedSku.aiSyncedOn && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <SourceLogoBadge src={RETAILER_LOGO_SRC} alt="Amazon" />
                        Synced on {selectedSku.aiSyncedOn}
                      </span>
                    )}
                  </div>
                  <BulkSelectControl
                    selectedCount={includedCount}
                    totalCount={4}
                    onSelectAll={() => { setTitleIncluded(true); setImageIncluded(true); setBulletsIncluded(true); setDescriptionIncluded(true) }}
                    onDeselectAll={() => { setTitleIncluded(false); setImageIncluded(false); setBulletsIncluded(false); setDescriptionIncluded(false) }}
                  />
                </div>
                <ProductTitleSection
                  key={selectedSkuId}
                  pimTitle={content.title}
                  pdpTitle={pdp.title}
                  status={content.titleStatus}
                  titleEditSource={content.titleEditSource}
                  recommendation={content.titleRecommendation}
                  hasPimData={content.hasPimData}
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
                  isIncluded={titleIncluded}
                  onToggleInclude={() => setTitleIncluded((v) => !v)}
                  hideActions
                />
                <ImageSection
                  pimImages={content.images}
                  pdpImages={pdp.images ?? []}
                  hasPimData={content.hasPimData}
                  onDelete={(id) =>
                    patch((prev) => ({
                      ...prev,
                      images: prev.images.map((img) => (img.id === id ? { ...img, url: undefined } : img)),
                    }))
                  }
                  isIncluded={imageIncluded}
                  onToggleInclude={() => setImageIncluded((v) => !v)}
                />
                <BulletPointsSection
                  pimBullets={content.bullets}
                  pdpBullets={pdp.bullets}
                  recommendations={content.bulletRecommendations}
                  hasPimData={content.hasPimData}
                  originals={bulletOriginals}
                  getFieldPublishBatch={(fieldKey) => getPublishBatchForField(content, fieldKey)}
                  getBulletPublishQueue={(bulletId) =>
                    getFieldPublishQueue(content, `bullet:${bulletId}`)
                  }
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
                  onAcceptNewDraft={handleAcceptNewBulletDraft}
                  isIncluded={bulletsIncluded}
                  onToggleInclude={() => setBulletsIncluded((v) => !v)}
                  hideActions
                />
                <DescriptionSection
                  pimDescription={content.description}
                  pdpDescription={pdp.description}
                  status={content.descriptionStatus}
                  recommendation={content.descriptionRecommendation}
                  hasPimData={content.hasPimData}
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
                  isIncluded={descriptionIncluded}
                  onToggleInclude={() => setDescriptionIncluded((v) => !v)}
                  hideActions
                />
              </div>
            </section>
          </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
