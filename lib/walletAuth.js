import crypto from 'crypto'
import { getAddress, verifyMessage } from 'ethers'

const NONCE_COOKIE = 'predictinfo_wallet_nonce'
const SESSION_COOKIE = 'predictinfo_wallet_session'
const FIVE_MINUTES = 60 * 5
const SEVEN_DAYS = 60 * 60 * 24 * 7

function getAuthSecret() {
  return process.env.PREDICTINFO_AUTH_SECRET || 'predictinfo-dev-wallet-secret'
}

function signValue(value) {
  return crypto.createHmac('sha256', getAuthSecret()).update(value).digest('base64url')
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
}

function createSignedToken(payload) {
  const encodedPayload = encodePayload(payload)
  const signature = signValue(encodedPayload)

  return `${encodedPayload}.${signature}`
}

function verifySignedToken(token) {
  if (!token) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signValue(encodedPayload)
  const expectedBuffer = Buffer.from(expectedSignature)
  const actualBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null
  }

  try {
    return decodePayload(encodedPayload)
  } catch {
    return null
  }
}

function createCookie(name, value, options = {}) {
  const segments = [`${name}=${value}`]

  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${options.maxAge}`)
  }

  segments.push(`Path=${options.path || '/'}`)
  segments.push(`SameSite=${options.sameSite || 'Lax'}`)

  if (options.httpOnly !== false) {
    segments.push('HttpOnly')
  }

  if (options.secure || process.env.NODE_ENV === 'production') {
    segments.push('Secure')
  }

  return segments.join('; ')
}

export function parseCookies(req) {
  const header = req.headers.cookie || ''

  return header.split(';').reduce((cookies, entry) => {
    const [rawName, ...rawValue] = entry.trim().split('=')

    if (!rawName) {
      return cookies
    }

    cookies[rawName] = rawValue.join('=')
    return cookies
  }, {})
}

export function normalizeWalletAddress(address) {
  return getAddress(address)
}

export function buildWalletMessage(address, nonce) {
  return [`Sign in to Predict.info`, `Address: ${address}`, `Nonce: ${nonce}`].join('\n')
}

export function createNonceCookie(address) {
  const payload = {
    purpose: 'nonce',
    address,
    nonce: crypto.randomBytes(16).toString('hex'),
    expiresAt: Date.now() + FIVE_MINUTES * 1000,
  }

  return {
    cookie: createCookie(NONCE_COOKIE, createSignedToken(payload), { maxAge: FIVE_MINUTES }),
    payload,
  }
}

export function readNonceCookie(req) {
  const cookies = parseCookies(req)
  const payload = verifySignedToken(cookies[NONCE_COOKIE])

  if (!payload || payload.purpose !== 'nonce' || payload.expiresAt < Date.now()) {
    return null
  }

  return payload
}

export function createSessionCookie(address, chainId = '') {
  const payload = {
    purpose: 'session',
    address,
    chainId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SEVEN_DAYS * 1000,
  }

  return createCookie(SESSION_COOKIE, createSignedToken(payload), { maxAge: SEVEN_DAYS })
}

export function readSessionCookie(req) {
  const cookies = parseCookies(req)
  const payload = verifySignedToken(cookies[SESSION_COOKIE])

  if (!payload || payload.purpose !== 'session' || payload.expiresAt < Date.now()) {
    return null
  }

  return payload
}

export function clearWalletCookies() {
  return [
    createCookie(NONCE_COOKIE, '', { maxAge: 0 }),
    createCookie(SESSION_COOKIE, '', { maxAge: 0 }),
  ]
}

export function verifyWalletSignature({ address, nonce, signature }) {
  const message = buildWalletMessage(address, nonce)
  const recoveredAddress = getAddress(verifyMessage(message, signature))

  return recoveredAddress === address
}