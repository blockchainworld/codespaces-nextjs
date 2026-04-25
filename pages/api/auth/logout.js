import { clearWalletCookies } from '../../../lib/walletAuth'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  res.setHeader('Set-Cookie', clearWalletCookies())
  res.status(200).json({ authenticated: false })
}