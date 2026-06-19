import type { AltKeyword, ReasoningCategory } from "@/components/home/types"

type HighlightEntry = {
  id: string
  text: string
  reasoning?: ReasoningCategory[]
  altKeywords?: AltKeyword[]
}

/** AI-generated item highlight per SKU id. Falls back to sku-1 entry when unmatched. */
export const HIGHLIGHTS_BY_SKU: Record<string, HighlightEntry[]> = {
  "sku-1": [{
    id: "h1",
    text: "Long-lasting 110–150 hour burn time in a hand-poured 22 oz glass jar",
    reasoning: [
      {
        key: "compliance",
        label: "Compliance",
        reasons: [
          { type: "ADDED", summary: "Burn time claim is substantiated", detail: "The '110–150 hour' range is backed by product specs — no compliance risk from making this claim in a highlight." },
        ],
      },
      {
        key: "seo",
        label: "SEO",
        reasons: [
          { type: "ADDED", summary: "Burn time is a top search qualifier", detail: "Shoppers filter by burn hours — surfacing '110–150 hour' directly addresses the #2 category query." },
          { type: "ADDED", summary: "Hand-poured signals premium quality", detail: "Search data shows 'hand-poured candle' queries convert 28% higher than generic candle searches." },
        ],
      },
      {
        key: "aeo",
        label: "AEO",
        reasons: [
          { type: "ADDED", summary: "Answers 'how long does this candle last?'", detail: "Voice assistants surface burn time as the top answered question for jar candle searches — explicit hours answer the query directly." },
        ],
      },
    ],
    altKeywords: [
      { id: "k1", keyword: "long burn candle", rank: 12, volume: "45K" },
      { id: "k2", keyword: "22 oz candle jar", rank: 24, volume: "22K" },
      { id: "k3", keyword: "hand poured soy candle", rank: 31, volume: "18K" },
      { id: "k4", keyword: "premium scented candle", rank: 38, volume: "67K" },
      { id: "k5", keyword: "large jar candle", rank: 9, volume: "89K" },
      { id: "k6", keyword: "150 hour burn time", rank: 55, volume: "11K" },
    ],
  }],
  "sku-2": [{
    id: "h1",
    text: "8-cup capacity with intuitive digital touchscreen control panel",
    reasoning: [
      {
        key: "compliance",
        label: "Compliance",
        reasons: [
          { type: "ADDED", summary: "Capacity disclosure meets category policy", detail: "Retailer category policy requires explicit capacity in highlights for kitchen appliances — '8-cup' satisfies this requirement." },
        ],
      },
      {
        key: "seo",
        label: "SEO",
        reasons: [
          { type: "ADDED", summary: "Capacity is the #1 purchase decision driver", detail: "'8-cup food processor' has 110K monthly searches — front-loading it captures high-intent queries." },
          { type: "REPLACED", summary: "Digital touchscreen differentiates from competitors", detail: "Only 12% of listings in this category mention touchscreen controls, creating a strong differentiator." },
        ],
      },
      {
        key: "aeo",
        label: "AEO",
        reasons: [
          { type: "ADDED", summary: "Answers 'how many cups does it hold?'", detail: "Capacity is the top voice-search query for food processors — stating '8-cup' directly surfaces in AI shopping answers." },
        ],
      },
    ],
    altKeywords: [
      { id: "k1", keyword: "8 cup food processor", rank: 4, volume: "110K" },
      { id: "k2", keyword: "digital food processor", rank: 17, volume: "34K" },
      { id: "k3", keyword: "touchscreen food processor", rank: 29, volume: "14K" },
      { id: "k4", keyword: "electric food processor", rank: 7, volume: "78K" },
    ],
  }],
  "sku-3": [{ id: "h1", text: "Powerful V11 motor delivers up to 60 minutes of cord-free runtime" }],
  "sku-4": [{ id: "h1", text: "Extra-wide slots fit thick artisan bread, bagels, and English muffins" }],
  "sku-5": [{ id: "h1", text: "High-speed steel burrs grind whole grains into ultra-fine flour in seconds" }],
  "sku-6": [{ id: "h1", text: "Lift-Away canister detaches for above-floor, stair, and car cleaning" }],
  "sku-7": [{ id: "h1", text: "5-quart stainless bowl handles up to 9 dozen cookies in a single batch" }],
  "sku-8": [{ id: "h1", text: "7-in-1 functionality replaces pressure cooker, slow cooker, rice cooker and more" }],
  "sku-9": [{ id: "h1", text: "Variable 10-speed dial blends smoothies, soups, and nut butters with ease" }],
  "sku-10": [{ id: "h1", text: "Self-emptying base holds up to 60 days of dirt — no manual emptying" }],
}

export const DEFAULT_HIGHLIGHTS = HIGHLIGHTS_BY_SKU["sku-1"]
