import {
  clearWalletCookies,
  createSessionCookie,
  normalizeWalletAddress,
  readNonceCookie,
  verifyWalletSignature,
} from '../../../lib/walletAuth'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const address = normalizeWalletAddress(req.body?.address || '')
    const signature = req.body?.signature || ''
    const chainId = req.body?.chainId || ''
    const nonceSession = readNonceCookie(req)

    if (!nonceSession || nonceSession.address !== address) {
      res.status(401).json({ error: 'Sign-in challenge expired' })
      return
    }

    if (!verifyWalletSignature({ address, nonce: nonceSession.nonce, signature })) {
      res.status(401).json({ error: 'Wallet signature is invalid' })
      return
    }

    res.setHeader('Set-Cookie', [createSessionCookie(address, chainId), clearWalletCookies()[0]])
    res.status(200).json({ address, authenticated: true, chainId })
  } catch {
    res.status(400).json({ error: 'Wallet verification failed' })
  }
}