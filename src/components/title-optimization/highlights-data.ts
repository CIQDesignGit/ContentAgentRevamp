/** AI-generated item highlights per SKU id. Falls back to sku-1 set when unmatched. */
export const HIGHLIGHTS_BY_SKU: Record<string, { id: string; text: string }[]> = {
  "sku-1": [
    { id: "h1", text: "Long-lasting 110–150 hour burn time in a hand-poured 22 oz glass jar" },
    { id: "h2", text: "Authentic Black Cherry fragrance with sweet, fruity top notes" },
    { id: "h3", text: "Natural cotton-braided wick for a clean, even burn every time" },
  ],
  "sku-2": [
    { id: "h1", text: "8-cup capacity with intuitive digital touchscreen control panel" },
    { id: "h2", text: "Comes with 5 interchangeable stainless-steel blades for versatile prep" },
    { id: "h3", text: "Dishwasher-safe bowl and blades for fast, effortless cleanup" },
  ],
  "sku-3": [
    { id: "h1", text: "Powerful V11 motor delivers up to 60 minutes of cord-free runtime" },
    { id: "h2", text: "Engineered to remove deep-embedded pet hair from carpets and hard floors" },
    { id: "h3", text: "Hygienic point-and-shoot bin emptying — no contact with debris" },
  ],
  "sku-4": [
    { id: "h1", text: "Extra-wide slots fit thick artisan bread, bagels, and English muffins" },
    { id: "h2", text: "Cool-touch exterior stays safe to handle during and after toasting" },
    { id: "h3", text: "Slide-out crumb tray makes cleaning quick and effortless" },
  ],
  "sku-5": [
    { id: "h1", text: "High-speed steel burrs grind whole grains into ultra-fine flour in seconds" },
    { id: "h2", text: "Commercial-grade motor handles continuous, heavy-duty milling without overheating" },
    { id: "h3", text: "Large-capacity hopper reduces interruptions during long milling sessions" },
  ],
  "sku-6": [
    { id: "h1", text: "Lift-Away canister detaches for above-floor, stair, and car cleaning" },
    { id: "h2", text: "Anti-Allergen Complete Seal traps 99.9% of dust and allergens" },
    { id: "h3", text: "Swivel steering enables precise navigation around furniture legs" },
  ],
  "sku-7": [
    { id: "h1", text: "5-quart stainless bowl handles up to 9 dozen cookies in a single batch" },
    { id: "h2", text: "10-speed slide control from a gentle stir to a fast whip" },
    { id: "h3", text: "Planetary mixing action reaches every part of the bowl for thorough mixing" },
  ],
  "sku-8": [
    { id: "h1", text: "7-in-1 functionality replaces pressure cooker, slow cooker, rice cooker and more" },
    { id: "h2", text: "6-quart capacity feeds 4–6 people, ideal for family meal prep" },
    { id: "h3", text: "Delay start and keep-warm modes keep meals ready on your schedule" },
  ],
  "sku-9": [
    { id: "h1", text: "Variable 10-speed dial blends smoothies, soups, and nut butters with ease" },
    { id: "h2", text: "64 oz BPA-free container handles large batches in one go" },
    { id: "h3", text: "Aircraft-grade stainless-steel blades withstand years of daily use" },
  ],
  "sku-10": [
    { id: "h1", text: "Self-emptying base holds up to 60 days of dirt — no manual emptying" },
    { id: "h2", text: "Smart mapping technology learns your floor plan for efficient coverage" },
    { id: "h3", text: "Works with Alexa and Google Assistant for hands-free scheduling" },
  ],
}

export const DEFAULT_HIGHLIGHTS = HIGHLIGHTS_BY_SKU["sku-1"]
