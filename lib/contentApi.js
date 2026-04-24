import { readFile } from 'fs/promises'
import path from 'path'

const dataDirectory = path.join(process.cwd(), 'data')

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
  return readJsonFile('markets.json')
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
  return readJsonFile('news.json')
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