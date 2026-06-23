import { makePdpImagesFromPim } from "@/lib/image-match"
import type { ContentState, Sku, SkuContent } from "./types"
import { SKU_CONTENT } from "./sku-content-data"

export const MOCK_SKUS: Sku[] = [
  {
    id: "sku-1",
    asin: "B08NF9KBZ4",
    productId: "9876542501",
    category: "Home Fragrance",
    brand: "Yankee Candle",
    title: "Yankee Candle Black Cherry Large Jar Candle, 22 oz",
    thumbnailUrl: "https://placehold.co/64x64/fce7f3/be185d?text=YC",
    metrics: { compliance: 54, seo: 22, aeo: 16 },
    salsifyIssues: [
      { type: "error", label: "Image mismatch" },
      { type: "warning", label: "Title too long" },
    ],
    lastUpdated: "Apr 8, 2025",
    actionStatus: "to-do",
  },
  {
    id: "sku-2",
    asin: "B00I0DI0Z6",
    productId: "9876542536",
    category: "Kitchen Appliances",
    brand: "NutriChef",
    title: "NutriChef Food Processor - 8-Cup Capacity, Digital Control Panel",
    thumbnailUrl: "https://placehold.co/64x64/ede9fe/7c3aed?text=NC",
    metrics: { compliance: 54, seo: 30, aeo: 40 },
    hasPimData: false,
    salsifyIssues: [
      { type: "error", label: "No PIM catalog entry" },
      { type: "warning", label: "PDP-only SKU" },
    ],
    lastUpdated: "Mar 7, 2025",
    actionStatus: "in-progress",
  },
  {
    id: "sku-3",
    asin: "B07GR5MSKD",
    productId: "8722510044",
    category: "Home Essentials",
    brand: "Dyson",
    title: "Dyson V11 Animal Cordless Vacuum Cleaner with Powerful Suction",
    thumbnailUrl: "https://placehold.co/64x64/dbeafe/1d4ed8?text=DY",
    metrics: { compliance: 54, seo: 40, aeo: 16 },
    salsifyIssues: [{ type: "error", label: "Image mismatch" }],
    lastUpdated: "Feb 14, 2025",
    actionStatus: "to-do",
  },
  {
    id: "sku-4",
    asin: "B00FQK1H8C",
    productId: "3344210099",
    category: "Kitchen Appliances",
    brand: "Proctor Silex",
    title: "Proctor Silex 2-Slice Toaster with Wide Slots",
    thumbnailUrl: "https://placehold.co/64x64/fef3c7/92400e?text=PS",
    metrics: { compliance: 54, seo: 30, aeo: 40 },
    salsifyIssues: [{ type: "warning", label: "Bullet count low" }],
    lastUpdated: "Jan 22, 2025",
    actionStatus: "saved-for-later",
  },
  {
    id: "sku-5",
    asin: "B00H8R3KM2",
    productId: "5612430018",
    category: "Kitchen Appliances",
    brand: "Vevor",
    title: "Vevor Electric Grain Mill Grinder - High Speed, Commercial Grade",
    thumbnailUrl: "https://placehold.co/64x64/dcfce7/15803d?text=VV",
    metrics: { compliance: 30, seo: 25, aeo: 20 },
    salsifyIssues: [
      { type: "error", label: "Description missing" },
      { type: "error", label: "Image mismatch" },
    ],
    lastUpdated: "Mar 19, 2025",
    actionStatus: "in-progress",
  },
  {
    id: "sku-6",
    asin: "B003IH3JN4",
    productId: "7701230056",
    category: "Home Essentials",
    brand: "Shark",
    title: "Shark Navigator Lift-Away Professional Upright Vacuum NV356E",
    thumbnailUrl: "https://placehold.co/64x64/e0f2fe/0369a1?text=SH",
    metrics: { compliance: 72, seo: 55, aeo: 48 },
    salsifyIssues: [{ type: "warning", label: "Title too long" }],
    lastUpdated: "Mar 3, 2025",
    actionStatus: "to-do",
  },
  {
    id: "sku-7",
    asin: "B00005UP2P",
    productId: "6600450077",
    category: "Kitchen Appliances",
    brand: "KitchenAid",
    title: "KitchenAid Artisan 5-Quart Tilt-Head Stand Mixer KSM150PS",
    thumbnailUrl: "https://placehold.co/64x64/fee2e2/b91c1c?text=KA",
    metrics: { compliance: 88, seo: 75, aeo: 62 },
    salsifyIssues: [{ type: "error", label: "Image mismatch" }],
    lastUpdated: "Apr 12, 2025",
    actionStatus: "to-do",
  },
  {
    id: "sku-8",
    asin: "B00FLYWNYQ",
    productId: "4412870088",
    category: "Kitchen Appliances",
    brand: "Instant Pot",
    title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Qt",
    thumbnailUrl: "https://placehold.co/64x64/f3e8ff/7e22ce?text=IP",
    metrics: { compliance: 45, seo: 38, aeo: 30 },
    salsifyIssues: [{ type: "warning", label: "Bullet count low" }],
    lastUpdated: "Apr 1, 2025",
    actionStatus: "to-do",
  },
  {
    id: "sku-9",
    asin: "B079KLGWGR",
    productId: "3301990099",
    category: "Kitchen Appliances",
    brand: "Vitamix",
    title: "Vitamix E310 Explorian Blender, Professional Grade",
    thumbnailUrl: "https://placehold.co/64x64/ecfdf5/065f46?text=VM",
    metrics: { compliance: 65, seo: 50, aeo: 42 },
    salsifyIssues: [{ type: "error", label: "Description missing" }],
    lastUpdated: "Mar 28, 2025",
    actionStatus: "to-do",
  },
  {
    id: "sku-10",
    asin: "B08C4L7HC1",
    productId: "2209880010",
    category: "Home Essentials",
    brand: "iRobot",
    title: "iRobot Roomba i3+ EVO Self-Emptying Robot Vacuum",
    thumbnailUrl: "https://placehold.co/64x64/fafafa/374151?text=iR",
    metrics: { compliance: 38, seo: 22, aeo: 18 },
    salsifyIssues: [
      { type: "error", label: "Image mismatch" },
      { type: "error", label: "Description missing" },
    ],
    lastUpdated: "Feb 27, 2025",
    actionStatus: "to-do",
  },
]

// ─── Content initializer ──────────────────────────────────────────────────────

export function makeInitialContent(sku: Sku): SkuContent {
  const bundle = SKU_CONTENT[sku.id] ?? SKU_CONTENT["sku-1"]
  const pdpImages =
    bundle.pdpContent.images ??
    makePdpImagesFromPim(bundle.images, bundle.pdpContent.imageCount)
  return {
    ...bundle,
    pdpContent: { ...bundle.pdpContent, images: pdpImages },
    descriptionStatus: bundle.descriptionStatus ?? "pending",
    descriptionRecommendation: bundle.descriptionRecommendation ?? null,
  }
}

export function buildInitialState(): ContentState {
  return MOCK_SKUS.reduce<ContentState>((acc, sku) => {
    acc[sku.id] = makeInitialContent(sku)
    return acc
  }, {})
}

// ─── Filter utilities ─────────────────────────────────────────────────────────

export function passesFilter(sku: Sku, filter: string): boolean {
  if (filter === "compliance") return sku.metrics.compliance < 100
  if (filter === "seo") return sku.metrics.seo < 100
  if (filter === "aeo") return sku.metrics.aeo < 100
  return true
}

export function passesSearch(sku: Sku, q: string): boolean {
  if (!q.trim()) return true
  const needle = q.trim().toLowerCase()
  return (
    sku.title.toLowerCase().includes(needle) ||
    sku.asin.toLowerCase().includes(needle) ||
    sku.brand.toLowerCase().includes(needle) ||
    sku.category.toLowerCase().includes(needle)
  )
}
