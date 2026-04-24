import { createItemResponse, getSiteContent } from '../../lib/contentApi'

export default async function handler(req, res) {
  const site = await getSiteContent()

  res.status(200).json(createItemResponse(site))
}