import { getMarketBySlug } from '../../../lib/contentApi'

export default async function handler(req, res) {
  const market = await getMarketBySlug(req.query.slug)

  if (!market) {
    res.status(404).json({ message: 'Market not found' })
    return
  }

  res.status(200).json(market)
}