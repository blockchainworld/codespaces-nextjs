import { useMemo, useState } from 'react'
import Link from 'next/link'
import { compareMarketActivity, getMovePoints } from '../lib/marketRank'
import styles from '../styles/listing.module.css'

const sortOptions = {
  activity: compareMarketActivity,
  probability: (left, right) => right.probability - left.probability,
  movers: (left, right) => getMovePoints(right.move) - getMovePoints(left.move),
  conviction: (left, right) => convictionRank(right.conviction) - convictionRank(left.conviction),
}

function convictionRank(value) {
  if (value === 'High') {
    return 3
  }

  if (value === 'Medium') {
    return 2
  }

  return 1
}

export default function MarketsExplorer({ markets }) {
  const categories = ['All', ...new Set(markets.map((market) => market.category))]
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('activity')
  const [query, setQuery] = useState('')

  const filteredMarkets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return markets
      .filter((market) => {
        if (activeCategory !== 'All' && market.category !== activeCategory) {
          return false
        }

        if (!normalizedQuery) {
          return true
        }

        return [market.title, market.description, market.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort(sortOptions[sortBy])
  }, [activeCategory, markets, query, sortBy])

  return (
    <section className={styles.explorerShell}>
      <div className={styles.marketToolbarShell}>
        <div className={styles.marketToolbarLabelRow}>
          <div>
            <p className={styles.sectionLabel}>Markets</p>
            <h1 className={styles.marketToolbarTitle}>All markets</h1>
          </div>
          <div className={styles.marketInlineStats}>
            <span>{filteredMarkets.length} live</span>
            <span>{categories.length - 1} sectors</span>
          </div>
        </div>

        <div className={styles.marketToolbarTopline}>
          <div className={styles.categoryTabs}>
            {categories.map((category) => (
              <button
                className={activeCategory === category ? styles.marketTabActive : styles.marketTabButton}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.marketControlsRow}>
          <label className={styles.marketSearchField}>
            <span>Search</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Fed, AI, oil"
              type="search"
              value={query}
            />
          </label>

          <label className={styles.marketSelectField}>
            <span>Sort</span>
            <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
              <option value="activity">Most active</option>
              <option value="probability">Highest chance</option>
              <option value="movers">Largest move</option>
              <option value="conviction">Highest conviction</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.marketListShell}>
        <div className={styles.marketListHeader}>
          <span>Market</span>
          <span>Yes</span>
          <span>No</span>
          <span>Move</span>
          <span>Volume</span>
          <span>Depth</span>
          <span>Status</span>
        </div>

        {filteredMarkets.map((market) => {
          const negativePrice = 100 - market.probability
          const moveTone = getMovePoints(market.move) >= 0 ? styles.marketMoveUp : styles.marketMoveDown

          return (
            <article className={styles.marketListRow} key={market.slug}>
              <div className={styles.marketIdentityCell}>
                <div className={styles.marketIdentityTopline}>
                  <span className={styles.sectionLabel}>{market.category}</span>
                  <span className={styles.marketConviction}>{market.conviction}</span>
                  {market.liveMetadata?.overlaid ? <span className={styles.marketLiveBadge}>Live</span> : null}
                </div>
                <Link className={styles.marketQuestionLink} href={`/markets/${market.slug}`}>
                  {market.title}
                </Link>
                <p>{market.tags.join(' / ')}</p>
              </div>

              <div className={styles.marketPriceCell}>
                <span>Yes</span>
                <strong>{market.probability}c</strong>
              </div>

              <div className={styles.marketPriceCell}>
                <span>No</span>
                <strong>{negativePrice}c</strong>
              </div>

              <div className={`${styles.marketStatCell} ${moveTone}`}>{market.move}</div>
              <div className={styles.marketStatCell}>{market.volumeLabel}</div>
              <div className={styles.marketStatCell}>{market.liquidityLabel}</div>
              <div className={styles.marketStatusCell}>
                <span className={styles.statusPill}>{market.status}</span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}