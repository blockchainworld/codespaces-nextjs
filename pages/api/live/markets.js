import { createCollectionResponse } from '../../../lib/contentApi'
import { getLiveMarkets, getLiveProviderStatus } from '../../../lib/liveData'

export default async function handler(req, res) {
  try {
    const items = await getLiveMarkets()

    res.status(200).json({
      ...createCollectionResponse(items),
      provider: getLiveProviderStatus().marketProvider,
      liveMode: getLiveProviderStatus().liveMode,
    })
  } catch (error) {
    res.status(500).json({
      error: 'live_market_fetch_failed',
      message: error.message,
      provider: getLiveProviderStatus().marketProvider,
    })
  }
}