import { createItemResponse, getNewsBySlug } from '../../../lib/contentApi'

export default async function handler(req, res) {
  const story = await getNewsBySlug(req.query.slug)

  if (!story) {
    res.status(404).json({ message: 'Story not found' })
    return
  }

  res.status(200).json(createItemResponse(story))
}