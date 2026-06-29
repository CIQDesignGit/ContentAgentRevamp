export const heroData = {
  brand: "Yankee Candle",
  report: "Amazon Alexa AI Visibility Report",
  visibilityScore: 34,
  categoryRank: 2,
  categoryLabel: "Top Contender",
  brandsAhead: [
    { name: "Bath & Body Works", score: 48, initials: "BBW", colorClass: "bg-info-600" },
  ],
  summary:
    "Yankee Candle ranks #2 in AI visibility across tracked categories, with strong performance in seasonal and scented jar candle prompts. Bath & Body Works (48%) leads while opportunity remains in gift-giving and home décor searches.",
}

export const leaderboardData = [
  { rank: 1,  brand: "Bath & Body Works",      score: 48, isYou: false },
  { rank: 2,  brand: "Yankee Candle",           score: 34, isYou: true  },
  { rank: 3,  brand: "Voluspa",                 score: 27, isYou: false },
  { rank: 4,  brand: "WoodWick",                score: 22, isYou: false },
  { rank: 5,  brand: "Nest Fragrances",         score: 18, isYou: false },
  { rank: 6,  brand: "Paddywax",                score: 14, isYou: false },
  { rank: 7,  brand: "DW Home",                 score: 11, isYou: false },
  { rank: 8,  brand: "Chesapeake Bay Candle",   score: 9,  isYou: false },
  { rank: 9,  brand: "Thymes",                  score: 7,  isYou: false },
  { rank: 10, brand: "Illume",                  score: 5,  isYou: false },
]

export const promptData = [
  { prompt: "looking for a big fall jar candle to display on my table",              visibility: 82.35, weightedSov: 84.19, rank: 1, isStar: true  },
  { prompt: "looking for a large jar summer scent that will last a long time",       visibility: 78.26, weightedSov: 80.54, rank: 1, isStar: true  },
  { prompt: "I need a big candle that will last many evenings this summer",          visibility: 73.53, weightedSov: 80.31, rank: 1, isStar: false },
  { prompt: "browsing large candles to keep my whole living room smelling beachy",   visibility: 71.43, weightedSov: 77.55, rank: 1, isStar: false },
  { prompt: "show me scented options that smell like berry lemonade",                visibility: 68.75, weightedSov: 77.28, rank: 1, isStar: false },
  { prompt: "looking for a classic jar candle to sit on my mantle",                 visibility: 66.67, weightedSov: 76.95, rank: 1, isStar: false },
  { prompt: "Christmas scented option that will fill my living room for many nights",visibility: 64.52, weightedSov: 76.92, rank: 1, isStar: false },
  { prompt: "best holiday scented candles that burn for a long time",                visibility: 60.00, weightedSov: 72.4,  rank: 2, isStar: false },
  { prompt: "where can I find apple-cinnamon candles for fall decorating",           visibility: 55.56, weightedSov: 68.15, rank: 2, isStar: false },
  { prompt: "candles that smell like a cozy fireplace on a winter night",            visibility: 50.00, weightedSov: 65.3,  rank: 2, isStar: false },
  { prompt: "fresh linen scented candles for a bedroom refresh",                     visibility: 43.75, weightedSov: 58.72, rank: 3, isStar: false },
  { prompt: "best candles for creating a romantic dinner atmosphere",                visibility: 36.84, weightedSov: 51.19, rank: 3, isStar: false },
]

export const topicData: Array<{
  topic: string
  visibility: number     // % visible in AI responses for this category
  weightedSov: number   // AI share of voice within this category (%)
  rank: number | null   // average rank position (lower = better), null if not ranked
}> = [
  { topic: "Tropical and Beachy Scents",       visibility: 92.17, weightedSov: 28.56, rank: 3.17 },
  { topic: "Gourmand and Dessert Scents",       visibility: 91.4,  weightedSov: 28.32, rank: 3.34 },
  { topic: "Floral and Fresh Scents",           visibility: 82.91, weightedSov: 23.59, rank: 5.58 },
  { topic: "Seasonal and Holiday Scents",       visibility: 78.3,  weightedSov: 22.79, rank: 6.81 },
  { topic: "Gift-Giving and Decorative Scents", visibility: 74.19, weightedSov: 15.19, rank: 9.3  },
]
