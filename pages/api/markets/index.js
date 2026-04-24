import { getMarkets } from '../../../lib/contentApi'

export default async function handler(req, res) {
  const markets = await getMarkets()

  res.status(200).json(markets)
}