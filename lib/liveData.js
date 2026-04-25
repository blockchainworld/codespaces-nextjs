function parseJsonish(value, fallback = []) {
  if (!value) {
    return fallback
  }

  if (Array.isArray(value)) {
    return value
  }

  if (typeof value !== 'string') {
    return fallback
  }

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function parseList(value, fallback = []) {
  if (!value) {
    return fallback
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toNumber(value, fallback = 0) {
  const normalized = Number.parseFloat(value)
  return Number.isFinite(normalized) ? normalized : fallback
}

function toSlug(value, fallback = 'untitled-market') {
  const normalized = (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return normalized || fallback
}

function formatUsdCompact(value, suffix = '') {
  const amount = toNumber(value)

  return `${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'USD',
  }).format(amount)}${suffix}`
}

function formatUtcDate(value) {
  if (!value) {
    return 'TBD'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'TBD'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatPublishedAt(value) {
  if (!value) {
    return 'Unknown'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function decodeXmlText(value) {
  return (value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim()
}

function extractXmlTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i'))
  return decodeXmlText(match?.[1] || '')
}

function extractXmlAttribute(block, tagName, attributeName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*${attributeName}="([^"]+)"[^>]*/?>`, 'i'))
  return decodeXmlText(match?.[1] || '')
}

function extractRssItems(xml) {
  return Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi), (match) => match[0])
}

function formatMove(value) {
  const points = Math.round(toNumber(value) * 100)

  if (!points) {
    return 'flat'
  }

  return `${points > 0 ? '+' : ''}${points} pts 24h`
}

function extractOutcomePrices(market) {
  const parsed = parseJsonish(market.outcomePrices)

  if (Array.isArray(parsed) && parsed.length >= 2) {
    return parsed.map((item) => toNumber(item))
  }

  const yesPrice = toNumber(market.yesPrice || market.bestBid || market.lastTradePrice)

  if (yesPrice > 0) {
    return [yesPrice, Math.max(0, 1 - yesPrice)]
  }

  return [0.5, 0.5]
}

function extractTags(market) {
  const tagObjects = Array.isArray(market.tags) ? market.tags : []
  const labels = tagObjects
    .map((tag) => tag?.label || tag?.name || tag?.slug)
    .filter(Boolean)

  if (labels.length) {
    return labels.slice(0, 3)
  }

  if (market.category) {
    return [market.category]
  }

  return ['Live market']
}

function normalizePolymarketMarket(market) {
  const [yesPrice, noPrice] = extractOutcomePrices(market)
  const probability = Math.round(yesPrice * 100)
  const tags = extractTags(market)
  const title = market.question || market.title || 'Untitled market'
  const slug = market.slug || toSlug(title)
  const volume = toNumber(market.volume || market.volumeNum || market.volume24hr)
  const liquidity = toNumber(market.liquidity || market.liquidityNum)
  const change24h = market.oneDayPriceChange ?? market.priceChange24h ?? market.oneDayPriceChangePercent

  return {
    source: 'polymarket',
    externalId: market.id || market.conditionId || slug,
    slug,
    icon: market.icon || market.image || null,
    image: market.image || market.icon || null,
    category: market.category || tags[0] || 'Live',
    status: market.closed ? 'Closed' : market.active === false ? 'Paused' : 'Active',
    conviction: 'Live',
    liquidityLabel: formatUsdCompact(liquidity, ' depth'),
    volumeLabel: formatUsdCompact(volume, ' volume'),
    participantsLabel: 'Live exchange flow',
    sourceQuality: 'Exchange market feed',
    yesLabel: 'Yes',
    noLabel: 'No',
    title,
    probability,
    move: formatMove(change24h),
    description: market.description || market.rules || 'Live market imported from Polymarket.',
    tags,
    resolutionDate: formatUtcDate(market.endDate || market.end_date_iso || market.gameStartTime),
    settlementRule: market.rules || market.description || 'See exchange market rules.',
    thesis: market.description || 'Live market feed.',
    keyDrivers: [],
    curve: [probability],
    orderBook: {
      yes: [{ price: yesPrice, size: formatUsdCompact(liquidity / 2 || 0) }],
      no: [{ price: noPrice, size: formatUsdCompact(liquidity / 2 || 0) }],
    },
    timeline: [],
    relatedNewsSlugs: [],
    url: market.url || `https://polymarket.com/event/${slug}`,
  }
}

function inferDesk(article) {
  const haystack = [article.title, article.description, article.source?.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/(fed|inflation|rates|jobs|gdp|cpi)/.test(haystack)) {
    return 'Macro'
  }

  if (/(ai|openai|chip|semiconductor|tech)/.test(haystack)) {
    return 'Technology'
  }

  if (/(election|tariff|policy|campaign|senate|house)/.test(haystack)) {
    return 'Politics'
  }

  if (/(oil|gas|energy|opec)/.test(haystack)) {
    return 'Energy'
  }

  return 'General'
}

function inferImpact(article) {
  const haystack = [article.title, article.description].filter(Boolean).join(' ').toLowerCase()

  if (/(break|surge|miss|cut|launch|spike|drops|jumps)/.test(haystack)) {
    return 'High'
  }

  if (/(signals|guidance|hints|expects|watch)/.test(haystack)) {
    return 'Medium'
  }

  return 'Low'
}

function inferSignalScore(article) {
  const score = 55 + (article.source?.name ? 10 : 0) + (article.description ? 10 : 0) + (article.urlToImage ? 5 : 0)
  return Math.min(score, 95)
}

function normalizeNewsApiArticle(article) {
  const headline = article.title || 'Untitled story'

  return {
    source: article.source?.name || 'NewsAPI',
    desk: inferDesk(article),
    urgency: 'Live',
    impact: inferImpact(article),
    sourceQuality: 'External news feed',
    updateLag: 'Live feed',
    signalScore: inferSignalScore(article),
    publishedAt: formatPublishedAt(article.publishedAt),
    headline,
    summary: article.description || 'Live headline imported from NewsAPI.',
    body: article.content ? [article.content] : [],
    takeaways: [],
    keyEvidence: [],
    relatedMarketSlugs: [],
    slug: toSlug(headline, `news-${Date.now()}`),
    url: article.url,
  }
}

function normalizeRssArticle(item, sourceTitle) {
  const headline = extractXmlTag(item, 'title') || 'Untitled story'
  const description = extractXmlTag(item, 'description')
  const link = extractXmlTag(item, 'link')
  const publishedAt = extractXmlTag(item, 'pubDate')
  const image = extractXmlAttribute(item, 'media:thumbnail', 'url') || extractXmlAttribute(item, 'enclosure', 'url')

  return normalizeNewsApiArticle({
    title: headline,
    description,
    url: link,
    publishedAt,
    urlToImage: image,
    source: { name: sourceTitle || 'RSS feed' },
  })
}

function dedupeLiveNews(items) {
  const seen = new Set()

  return items.filter((item) => {
    const key = `${item.url || ''}::${item.headline}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

async function fetchRssFeed(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; PredictInfoBot/1.0; +https://predict.info)',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`)
  }

  return response.text()
}

async function getRssNews() {
  const feedUrls = parseList(
    process.env.PREDICTINFO_RSS_FEEDS,
    ['https://feeds.bbci.co.uk/news/world/rss.xml', 'https://feeds.bbci.co.uk/news/business/rss.xml']
  )
  const limit = Number.parseInt(process.env.PREDICTINFO_RSS_LIMIT || '20', 10)

  const settled = await Promise.allSettled(feedUrls.map((url) => fetchRssFeed(url)))
  const items = settled.flatMap((result, index) => {
    if (result.status !== 'fulfilled') {
      return []
    }

    const xml = result.value
    const sourceTitle = extractXmlTag(xml, 'title') || feedUrls[index]
    return extractRssItems(xml).map((item) => normalizeRssArticle(item, sourceTitle))
  })

  return dedupeLiveNews(items).slice(0, limit)
}

async function getNewsApiNews() {
  const apiKey = process.env.NEWSAPI_KEY

  if (!apiKey) {
    throw new Error('NEWSAPI_KEY is required when newsapi is enabled')
  }

  const query = encodeURIComponent(process.env.PREDICTINFO_NEWS_QUERY || 'prediction markets OR fed OR inflation OR AI OR oil')
  const pageSize = process.env.PREDICTINFO_NEWS_LIMIT || '20'
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=${pageSize}`
  const response = await safeFetchJson(url, {
    headers: {
      'X-Api-Key': apiKey,
    },
  })

  if (!Array.isArray(response.articles)) {
    return []
  }

  return response.articles.map(normalizeNewsApiArticle)
}

async function safeFetchJson(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; PredictInfoBot/1.0; +https://predict.info)',
      'Accept-Language': 'en-US,en;q=0.9',
      ...(init?.headers || {}),
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`)
  }

  return response.json()
}

function isEnabled(value) {
  return value === '1' || value === 'true'
}

export function getLiveProviderStatus() {
  const marketProvider = process.env.PREDICTINFO_MARKET_PROVIDER || null
  const newsProvider = process.env.PREDICTINFO_NEWS_PROVIDER || null
  const newsProviders = parseList(newsProvider)

  return {
    marketProvider,
    newsProvider,
    newsProviders,
    marketEnabled: Boolean(marketProvider),
    newsEnabled: Boolean(newsProvider),
    liveMode: isEnabled(process.env.PREDICTINFO_ENABLE_LIVE_DATA || ''),
  }
}

export async function getLiveMarkets() {
  const { liveMode, marketProvider } = getLiveProviderStatus()

  if (!liveMode || !marketProvider) {
    return []
  }

  if (marketProvider !== 'polymarket') {
    throw new Error(`Unsupported market provider: ${marketProvider}`)
  }

  const apiBase = process.env.PREDICTINFO_POLYMARKET_API_BASE || 'https://gamma-api.polymarket.com'
  const limit = process.env.PREDICTINFO_POLYMARKET_LIMIT || '25'
  const url = `${apiBase}/markets?closed=false&limit=${limit}`
  const response = await safeFetchJson(url)

  if (!Array.isArray(response)) {
    return []
  }

  return response.map(normalizePolymarketMarket)
}

export async function getLiveNews() {
  const { liveMode, newsProviders } = getLiveProviderStatus()

  if (!liveMode || !newsProviders.length) {
    return []
  }

  const settled = await Promise.allSettled(
    newsProviders.map((provider) => {
      if (provider === 'rss') {
        return getRssNews()
      }

      if (provider === 'newsapi') {
        return getNewsApiNews()
      }

      throw new Error(`Unsupported news provider: ${provider}`)
    })
  )

  const errors = settled.filter((result) => result.status === 'rejected')
  const items = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))

  if (!items.length && errors.length) {
    throw errors[0].reason
  }

  return dedupeLiveNews(items)
}