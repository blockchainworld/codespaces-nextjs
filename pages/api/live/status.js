import { getLiveProviderStatus } from '../../../lib/liveData'

export default async function handler(req, res) {
  res.status(200).json({
    generatedAt: new Date().toISOString(),
    ...getLiveProviderStatus(),
    rssFeeds: (process.env.PREDICTINFO_RSS_FEEDS || '')
      .split(',')
      .map((feed) => feed.trim())
      .filter(Boolean),
  })
}