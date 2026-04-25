import { buildWalletMessage, createNonceCookie, normalizeWalletAddress } from '../../../lib/walletAuth'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const address = normalizeWalletAddress(req.body?.address || '')
    const { cookie, payload } = createNonceCookie(address)

    res.setHeader('Set-Cookie', cookie)
    res.status(200).json({ message: buildWalletMessage(address, payload.nonce), nonce: payload.nonce })
  } catch {
    res.status(400).json({ error: 'Invalid wallet address' })
  }
}