function parseMovePoints(move) {
  const normalized = Number.parseInt(move, 10)
  return Number.isNaN(normalized) ? 0 : normalized
}

function parseCompactUsdLabel(label) {
  if (!label || typeof label !== 'string') {
    return 0
  }

  const match = label.replace(/,/g, '').match(/\$?([0-9]*\.?[0-9]+)\s*([kmb])?/i)

  if (!match) {
    return 0
  }

  const base = Number.parseFloat(match[1])

  if (!Number.isFinite(base)) {
    return 0
  }

  const suffix = (match[2] || '').toLowerCase()

  if (suffix === 'k') {
    return base * 1_000
  }

  if (suffix === 'm') {
    return base * 1_000_000
  }

  if (suffix === 'b') {
    return base * 1_000_000_000
  }

  return base
}

function marketActivityScore(market) {
  const liveBonus = market.liveMetadata?.overlaid ? 1_000_000_000 : 0
  const moveScore = Math.abs(parseMovePoints(market.move)) * 1_000_000
  const volumeScore = parseCompactUsdLabel(market.volumeLabel)
  const probabilityScore = market.probability || 0

  return liveBonus + moveScore + volumeScore + probabilityScore
}

export function compareMarketActivity(left, right) {
  return marketActivityScore(right) - marketActivityScore(left)
}

export function sortMarketsByActivity(markets) {
  return [...markets].sort(compareMarketActivity)
}

export function getMovePoints(move) {
  return parseMovePoints(move)
}