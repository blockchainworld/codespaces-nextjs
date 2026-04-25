import { createCollectionResponse } from '../../../lib/contentApi'
import { getLiveNews, getLiveProviderStatus } from '../../../lib/liveData'

export default async function handler(req, res) {
  try {
    const items = await getLiveNews()

    res.status(200).json({
      ...createCollectionResponse(items),
      provider: getLiveProviderStatus().newsProvider,
      liveMode: getLiveProviderStatus().liveMode,
    })
  } catch (error) {
    res.status(500).json({
      error: 'live_news_fetch_failed',
      message: error.message,
      provider: getLiveProviderStatus().newsProvider,
    })
  }
}