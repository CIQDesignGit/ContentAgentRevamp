/** AI-generated item highlight per SKU id. Falls back to sku-1 entry when unmatched. */
export const HIGHLIGHTS_BY_SKU: Record<string, { id: string; text: string }[]> = {
  "sku-1": [{ id: "h1", text: "Long-lasting 110–150 hour burn time in a hand-poured 22 oz glass jar" }],
  "sku-2": [{ id: "h1", text: "8-cup capacity with intuitive digital touchscreen control panel" }],
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
