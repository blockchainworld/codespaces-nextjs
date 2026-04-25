import { readFile } from 'fs/promises'
import path from 'path'
import { getLiveMarkets, getLiveNews } from './liveData'

const dataDirectory = path.join(process.cwd(), 'data')

function isEnabled(value) {
  return value === '1' || value === 'true'
}

function useLiveOverlay() {
  return isEnabled(process.env.PREDICTINFO_ENABLE_LIVE_OVERLAY || '')
}

function createSearchText(parts) {
  return parts
    .flat()
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function scoreLiveMatch(searchText, terms = []) {
  if (!terms.length) {
    return 0
  }

  return terms.reduce((score, term) => (searchText.includes(term.toLowerCase()) ? score + 1 : score), 0)
}

function buildMarketSearchText(market) {
  return createSearchText([market.title, market.description, market.category, market.tags])
}

function buildNewsSearchText(story) {
  return createSearchText([story.headline, story.summary, story.source, story.desk])
}

function parseMovePoints(move) {
  const normalized = Number.parseInt(move, 10)
  return Number.isNaN(normalized) ? 0 : normalized
}

function clampProbability(value) {
  return Math.max(1, Math.min(99, Math.round(value)))
}

function buildOverlayCurve(staticCurve, liveProbability, liveMove) {
  const pointCount = Array.isArray(staticCurve) && staticCurve.length ? staticCurve.length : 9
  const current = clampProbability(liveProbability)
  const movePoints = parseMovePoints(liveMove)
  const start = clampProbability(current - movePoints)

  if (pointCount === 1) {
    return [current]
  }

  return Array.from({ length: pointCount }, (_, index) => {
    const progress = index / (pointCount - 1)
    const eased = progress * progress * (3 - 2 * progress)
    return clampProbability(start + (current - start) * eased)
  })
}

function findBestLiveItem(item, liveItems, getSearchText) {
  const liveMatch = item.liveMatch || {}

  if (liveMatch.externalId) {
    const byExternalId = liveItems.find((liveItem) => liveItem.externalId === liveMatch.externalId)

    if (byExternalId) {
      return byExternalId
    }
  }

  if (liveMatch.slug) {
    const bySlug = liveItems.find((liveItem) => liveItem.slug === liveMatch.slug)

    if (bySlug) {
      return bySlug
    }
  }

  const terms = Array.isArray(liveMatch.terms) ? liveMatch.terms : []

  if (!terms.length) {
    return null
  }

  const ranked = liveItems
    .map((liveItem) => ({
      liveItem,
      score: scoreLiveMatch(getSearchText(liveItem), terms),
    }))
    .sort((left, right) => right.score - left.score)

  if (!ranked[0] || ranked[0].score === 0) {
    return null
  }

  return ranked[0].liveItem
}

function withMarketOverlay(staticMarket, liveMarket) {
  if (!liveMarket) {
    return staticMarket
  }

  const curve = buildOverlayCurve(staticMarket.curve, liveMarket.probability, liveMarket.move)

  return {
    ...staticMarket,
    title: liveMarket.title || staticMarket.title,
    category: liveMarket.category || staticMarket.category,
    status: liveMarket.status || staticMarket.status,
    liquidityLabel: liveMarket.liquidityLabel || staticMarket.liquidityLabel,
    volumeLabel: liveMarket.volumeLabel || staticMarket.volumeLabel,
    participantsLabel: liveMarket.participantsLabel || staticMarket.participantsLabel,
    sourceQuality: liveMarket.sourceQuality || staticMarket.sourceQuality,
    probability: liveMarket.probability ?? staticMarket.probability,
    move: liveMarket.move || staticMarket.move,
    description: liveMarket.description || staticMarket.description,
    tags: liveMarket.tags?.length ? liveMarket.tags : staticMarket.tags,
    resolutionDate: liveMarket.resolutionDate || staticMarket.resolutionDate,
    settlementRule: liveMarket.settlementRule || staticMarket.settlementRule,
    orderBook: liveMarket.orderBook || staticMarket.orderBook,
    curve,
    liveMetadata: {
      source: liveMarket.source,
      externalId: liveMarket.externalId,
      url: liveMarket.url,
      curveMode: 'derived-24h-window',
      overlaid: true,
    },
  }
}

function withNewsOverlay(staticStory, liveStory) {
  if (!liveStory) {
    return staticStory
  }

  return {
    ...staticStory,
    source: liveStory.source || staticStory.source,
    desk: liveStory.desk || staticStory.desk,
    urgency: liveStory.urgency || staticStory.urgency,
    impact: liveStory.impact || staticStory.impact,
    sourceQuality: liveStory.sourceQuality || staticStory.sourceQuality,
    updateLag: liveStory.updateLag || staticStory.updateLag,
    signalScore: liveStory.signalScore ?? staticStory.signalScore,
    publishedAt: liveStory.publishedAt || staticStory.publishedAt,
    headline: liveStory.headline || staticStory.headline,
    summary: liveStory.summary || staticStory.summary,
    liveMetadata: {
      source: 'newsapi',
      url: liveStory.url,
      overlaid: true,
    },
  }
}

async function overlayMarkets(markets) {
  if (!useLiveOverlay()) {
    return markets
  }

  try {
    const liveMarkets = await getLiveMarkets()

    if (!liveMarkets.length) {
      return markets
    }

    return markets.map((market) => {
      const liveMarket = findBestLiveItem(market, liveMarkets, buildMarketSearchText)
      return withMarketOverlay(market, liveMarket)
    })
  } catch {
    return markets
  }
}

async function overlayNews(newsStories) {
  if (!useLiveOverlay()) {
    return newsStories
  }

  try {
    const liveNews = await getLiveNews()

    if (!liveNews.length) {
      return newsStories
    }

    return newsStories.map((story) => {
      const liveStory = findBestLiveItem(story, liveNews, buildNewsSearchText)
      return withNewsOverlay(story, liveStory)
    })
  } catch {
    return newsStories
  }
}

export function getGeneratedAt() {
  return new Date().toISOString()
}

async function readJsonFile(fileName) {
  const filePath = path.join(dataDirectory, fileName)
  const fileContents = await readFile(filePath, 'utf8')

  return JSON.parse(fileContents)
}

export async function getSiteContent() {
  return readJsonFile('site.json')
}

export async function getMarkets() {
  const markets = await readJsonFile('markets.json')
  return overlayMarkets(markets)
}

export async function getMarketSlugs() {
  const markets = await getMarkets()

  return markets.map((market) => market.slug)
}

export async function getMarketBySlug(slug) {
  const markets = await getMarkets()

  return markets.find((market) => market.slug === slug) || null
}

export async function getNewsStories() {
  const newsStories = await readJsonFile('news.json')
  return overlayNews(newsStories)
}

export async function getNewsSlugs() {
  const newsStories = await getNewsStories()

  return newsStories.map((story) => story.slug)
}

export async function getNewsBySlug(slug) {
  const newsStories = await getNewsStories()

  return newsStories.find((story) => story.slug === slug) || null
}

export async function getNewsForMarket(slug) {
  const newsStories = await getNewsStories()

  return newsStories.filter((story) => story.relatedMarketSlugs.includes(slug))
}

export async function getMarketsForNews(slug) {
  const markets = await getMarkets()

  return markets.filter((market) => market.relatedNewsSlugs.includes(slug))
}

export async function getHomepageContent() {
  const [site, markets, newsStories] = await Promise.all([
    getSiteContent(),
    getMarkets(),
    getNewsStories(),
  ])

  return {
    site,
    markets,
    newsStories,
  }
}

export function createCollectionResponse(items) {
  return {
    generatedAt: getGeneratedAt(),
    count: items.length,
    items,
  }
}

export function createItemResponse(item) {
  return {
    generatedAt: getGeneratedAt(),
    item,
  }
}