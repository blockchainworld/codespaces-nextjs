import { createCollectionResponse, getNewsStories } from '../../../lib/contentApi'

export default async function handler(req, res) {
  const newsStories = await getNewsStories()

  res.status(200).json(createCollectionResponse(newsStories))
}