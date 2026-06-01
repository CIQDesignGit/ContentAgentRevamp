import type { ActionLogEntry, AttemptedChange } from "./types"

export const DEFAULT_DATE_RANGE = "May 03, 2026 - Jun 01, 2026"

const TIDY_CATS_CHANGES: AttemptedChange[] = [
  {
    type: "text",
    field: "Title",
    changeKind: "edit",
    liveDate: "May 23",
    fieldReflection: "live",
    before: [
      { text: "Tidy Cats " },
      { text: "Cat Litter, 20 lb", variant: "removed" },
    ],
    after: [
      { text: "Tidy Cats " },
      { text: "LightWeight Free & Clean, 17 lb", variant: "added" },
    ],
  },
  {
    type: "bullets",
    field: "Bullets",
    changeKind: "add",
    liveDate: "May 24",
    fieldReflection: "live",
    items: [
      { text: "Odor control for 14 days" },
      { text: "Lightweight — half the weight", added: true },
      { text: "Free of dyes & fragrances", added: true },
    ],
  },
  {
    type: "text",
    field: "Description",
    changeKind: "edit",
    liveDate: "May 28",
    fieldReflection: "live",
    before: [
      {
        text: "Keep litter boxes fresh with powerful odor control. ",
      },
      {
        text: "Our standard clay formula is ideal for everyday use in single-cat homes.",
        variant: "removed",
      },
    ],
    after: [
      {
        text: "Tidy Cats LightWeight Free & Clean is now half the weight of traditional clay litter, with 14-day odor control and a dye-free, fragrance-free formula ideal for multi-cat households.",
        variant: "added",
      },
    ],
  },
]

const AMAZON_REJECTION_RAW = `Amazon SP-API Error Response (Acceptance):
ErrorCode: 8541
Message: Value for External Product ID is longer than the allowed maximum (14 characters).
Message: Value provided for ISBN/UCCID is invalid for attribute External Product ID.
Message: You can't change External Product ID from its original value 00070230100658.`

const AMAZON_REJECTION: ActionLogEntry["syndicationRemarksDetail"] = {
  kind: "syndication",
  stage: "retailer",
  headline: "Rejected by Amazon at acceptance",
  plainTerms:
    "Amazon refused the update because the External Product ID is too long and can't be changed from its original value.",
  errors: [
    "Value for External Product ID is longer than the allowed maximum (14 characters).",
    "Value provided for ISBN/UCCID is invalid for attribute External Product ID. To fix, resubmit with the correct value.",
    "You can't change External Product ID from its original value 00070230100658. Revert to the original value, or contact Amazon Support if you believe it's incorrect.",
  ],
  suggestedFix:
    "Suggested fix: Revert External Product ID to 00070230100658 (within the 14-character limit) and resubmit.",
  rawText: AMAZON_REJECTION_RAW,
}

export const ACTION_LOG_ENTRIES: ActionLogEntry[] = [
  // 1 — Live (happy path)
  {
    id: "log-1",
    skuId: "B07KYLBRT4",
    name: "Tidy Cats LightWeight Free & Clean",
    thumbnailUrl: "https://placehold.co/40x40/e0f2fe/0369a1?text=TC",
    pimStatus: "accepted",
    retailerStatus: "accepted",
    pdpStatus: "live",
    syndicationRemarks: "All 3 fields live (May 28).",
    actionedOn: "May 27, 2026, 07:56 PM",
    actionedShort: "actioned May 27 7:56 PM",
    updatedBy: "kathleen.fuller@purina.nestle.com",
    status: "success",
    panelScenario: "live",
    pimWrittenAt: "3:10 PM",
    retailerAt: "3:12 PM",
    pdpAt: "May 28",
    fieldsLive: { live: 3, total: 3 },
    attemptedChanges: TIDY_CATS_CHANGES,
  },
  // 2 — Pending (within 5-day crawl window)
  {
    id: "log-2",
    skuId: "B08NF9KBZ4",
    name: "Yankee Candle Black Cherry Large Jar Candle, 22 oz",
    thumbnailUrl: "https://placehold.co/40x40/fce7f3/be185d?text=YC",
    pimStatus: "accepted",
    retailerStatus: "accepted",
    pdpStatus: "pending",
    syndicationRemarks: "Accepted; awaiting PDP — day 2 of 5.",
    actionedOn: "May 19, 2026, 11:42 AM",
    actionedShort: "actioned May 19 11:42 AM",
    updatedBy: "maria.r@commerceiq.ai",
    status: "pending",
    panelScenario: "pending",
    pimWrittenAt: "10:15 AM",
    retailerAt: "10:18 AM",
    pdpProgress: { day: 2, total: 5 },
    fieldsLive: { live: 2, total: 3 },
    attemptedChanges: [
      {
        type: "text",
        field: "Title",
        changeKind: "edit",
        liveDate: "May 19",
        fieldReflection: "live",
        before: [
          { text: "Yankee Candle " },
          { text: "Black Cherry Jar, 22oz", variant: "removed" },
        ],
        after: [
          { text: "Yankee Candle " },
          { text: "Black Cherry Large Jar Candle, 22 oz", variant: "added" },
        ],
      },
      {
        type: "bullets",
        field: "Bullets",
        changeKind: "add",
        liveDate: "May 20",
        fieldReflection: "live",
        items: [
          { text: "Up to 150 hours of burn time" },
          { text: "Premium-grade paraffin wax", added: true },
        ],
      },
      {
        type: "text",
        field: "Description",
        changeKind: "edit",
        fieldReflection: "pending",
        before: [
          {
            text: "Authentic black cherry fragrance fills any room with rich, long-lasting scent. ",
          },
          {
            text: "Compact jar size ideal for bedside tables and small spaces.",
            variant: "removed",
          },
        ],
        after: [
          {
            text: "This 22 oz large jar delivers up to 150 hours of burn time with premium-grade paraffin wax for a clean, even burn from first light to last.",
            variant: "added",
          },
        ],
      },
    ],
  },
  // 3 — Partially live
  {
    id: "log-3",
    skuId: "B0BLXL6QK6",
    name: "Yankee Candle® Studio Scented Candle, Pink Sands",
    thumbnailUrl: "https://placehold.co/40x40/fce7f3/db2777?text=YC",
    pimStatus: "accepted",
    retailerStatus: "accepted",
    pdpStatus: "partially_live",
    syndicationRemarks: "Title + 2 bullets live; description not reflected.",
    actionedOn: "May 18, 2026, 04:15 PM",
    actionedShort: "actioned May 18 4:15 PM",
    updatedBy: "ayush.p@commerceiq.ai",
    status: "pending",
    panelScenario: "partially_live",
    pimWrittenAt: "2:05 PM",
    retailerAt: "2:08 PM",
    pdpProgress: { day: 5, total: 5 },
    fieldsLive: { live: 2, total: 3 },
    attemptedChanges: [
      {
        type: "text",
        field: "Title",
        changeKind: "edit",
        liveDate: "May 18",
        fieldReflection: "live",
        before: [
          { text: "Yankee Candle " },
          { text: "Studio Candle Pink Sand", variant: "removed" },
        ],
        after: [
          { text: "Yankee Candle® Studio " },
          { text: "Scented Candle, Pink Sands", variant: "added" },
        ],
      },
      {
        type: "bullets",
        field: "Bullets",
        changeKind: "add",
        liveDate: "May 19",
        fieldReflection: "live",
        items: [
          { text: "Coastal pink sands scent", added: true },
          { text: "Clean, even burn", added: true },
        ],
      },
      {
        type: "text",
        field: "Description",
        changeKind: "edit",
        liveDate: "May 18",
        fieldReflection: "not_reflected",
        before: [
          {
            text: "Bring coastal calm to your space with Pink Sands — ",
          },
          {
            text: "a light floral note for small rooms.",
            variant: "removed",
          },
        ],
        after: [
          {
            text: "a sun-warmed blend of floral and citrus notes inspired by beachside breezes, with a clean, even burn in a modern Studio collection vessel.",
            variant: "added",
          },
        ],
      },
    ],
    pdpRemarks: {
      kind: "pdp",
      headline: "Description — not reflected.",
      body: "Title and bullets are live on the PDP; the description never appeared across 5 daily crawls.",
      fields: ["Description"],
      likelyCause: "Vendor-code mapping may not syndicate this attribute to the PDP field Amazon crawls.",
      nextStep: "Check vendor-code mapping or contact FDE if the field should be syndicated separately.",
    },
  },
  // 4 — Retailer pending (cascade)
  {
    id: "log-4",
    skuId: "B00I0DI0Z6",
    name: "NutriChef Food Processor - 8-Cup Capacity",
    thumbnailUrl: "https://placehold.co/40x40/ede9fe/7c3aed?text=NC",
    pimStatus: "accepted",
    retailerStatus: "pending",
    pdpStatus: "pending",
    syndicationRemarks: "Awaiting retailer acceptance.",
    actionedOn: "May 17, 2026, 09:30 AM",
    actionedShort: "actioned May 17 9:30 AM",
    updatedBy: "jordan.k@commerceiq.ai",
    status: "pending",
    panelScenario: "pending",
    pimWrittenAt: "9:00 AM",
    attemptedChanges: [
      {
        type: "text",
        field: "Title",
        changeKind: "edit",
        before: [{ text: "NutriChef Processor 8 Cup", variant: "removed" }],
        after: [
          { text: "NutriChef Food Processor — " },
          { text: "8-Cup Capacity, Digital Control", variant: "added" },
        ],
      },
      {
        type: "bullets",
        field: "Bullets",
        changeKind: "add",
        items: [
          { text: "8-cup work bowl capacity" },
          { text: "Digital touch control panel", added: true },
        ],
      },
      {
        type: "text",
        field: "Description",
        changeKind: "add",
        before: null,
        after: [
          {
            text: "Versatile food processor for everyday meal prep — chop, slice, shred, and puree with an 8-cup work bowl and digital touch control panel. Ideal for sauces, dips, vegetables, and dough with dishwasher-safe parts for easy cleanup.",
          },
        ],
      },
    ],
  },
  // 5 — Rejected + long error (PDP —)
  {
    id: "log-5",
    skuId: "B07GR5MSKD",
    name: "Dyson V11 Animal Cordless Vacuum Cleaner",
    thumbnailUrl: "https://placehold.co/40x40/dbeafe/1d4ed8?text=DY",
    pimStatus: "accepted",
    retailerStatus: "rejected",
    pdpStatus: "not_run",
    syndicationRemarks: "Amazon rejected: External Product ID too long.",
    actionedOn: "May 15, 2026, 01:22 PM",
    actionedShort: "actioned May 15 1:22 PM",
    updatedBy: "ayush.p@commerceiq.ai",
    status: "failed",
    panelScenario: "rejected",
    pimWrittenAt: "7:37 PM",
    retailerAt: "7:38 PM",
    attemptedChanges: [
      {
        type: "text",
        field: "Title",
        changeKind: "edit",
        before: [{ text: "Dyson V11 Animal Vacuum", variant: "removed" }],
        after: [
          {
            text: "Dyson V11 Animal Cordless Vacuum Cleaner with Powerful Suction",
            variant: "added",
          },
        ],
      },
      {
        type: "bullets",
        field: "Bullets",
        changeKind: "add",
        items: [{ text: "Powerful suction for pet hair", added: true }],
      },
      {
        type: "text",
        field: "Description",
        changeKind: "add",
        before: null,
        after: [
          {
            text: "Cordless vacuum with advanced filtration captures pet hair, dust, and allergens across carpets and hard floors. The V11 Animal delivers powerful suction, up to 60 minutes of runtime, and a whole-machine filtration system certified asthma & allergy friendly.",
          },
        ],
      },
    ],
    syndicationRemarksDetail: AMAZON_REJECTION,
  },
  // 6 — Rejected but live anyway
  {
    id: "log-6",
    skuId: "B00H8R3KM2",
    name: "Vevor Electric Grain Mill Grinder - High Speed",
    thumbnailUrl: "https://placehold.co/40x40/dcfce7/15803d?text=VV",
    pimStatus: "accepted",
    retailerStatus: "rejected",
    pdpStatus: "live",
    syndicationRemarks:
      "Rejected by Amazon, but verified live on PDP May 24. Flagged for FDE.",
    actionedOn: "May 12, 2026, 10:05 AM",
    actionedShort: "actioned May 12 10:05 AM",
    updatedBy: "maria.r@commerceiq.ai",
    status: "pending",
    panelScenario: "rejected_but_live",
    flaggedForFde: true,
    pimWrittenAt: "9:50 AM",
    retailerAt: "9:55 AM",
    pdpAt: "May 24",
    fieldsLive: { live: 2, total: 3 },
    attemptedChanges: [
      {
        type: "text",
        field: "Title",
        changeKind: "edit",
        liveDate: "May 24",
        fieldReflection: "live",
        before: [{ text: "VEVOR Grain Mill Grinder" }],
        after: [
          { text: "Vevor Electric Grain Mill Grinder — " },
          { text: "High Speed, Commercial Grade", variant: "added" },
        ],
      },
      {
        type: "bullets",
        field: "Bullets",
        changeKind: "add",
        liveDate: "May 24",
        fieldReflection: "live",
        items: [
          { text: "304 stainless steel burrs", added: true },
          { text: "Commercial-grade motor", added: true },
        ],
      },
      {
        type: "text",
        field: "Description",
        changeKind: "add",
        fieldReflection: "not_submitted",
        before: null,
        after: [
          {
            text: "High-speed grain mill for commercial kitchens and home bakers — 304 stainless steel burrs grind wheat, corn, rice, and spices with a commercial-grade motor built for daily use. Adjustable texture from fine flour to coarse meal.",
          },
        ],
      },
    ],
    syndicationRemarksDetail: {
      kind: "syndication",
      stage: "retailer",
      headline: "Latest submission rejected — prior PDP still live",
      plainTerms:
        "Amazon rejected this submission, but an earlier version remains live on the PDP from May 24.",
      errors: [
        "Submission rejected at retailer acceptance.",
        "PDP crawl confirms prior title and bullets still live.",
      ],
      suggestedFix:
        "Review rejection reason and reconcile with live PDP content before resubmitting. Flagged for FDE.",
      rawText:
        "Retailer rejection on latest submission. PDP crawl verified prior content live May 24.",
    },
  },
]
