import { readSessionCookie } from '../../../lib/walletAuth'

export default function handler(req, res) {
  const session = readSessionCookie(req)

  if (!session) {
    res.status(200).json({ authenticated: false })
    return
  }

  res.status(200).json({
    address: session.address,
    authenticated: true,
    chainId: session.chainId || '',
  })
}