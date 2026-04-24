import { useMemo, useState } from 'react'
import Link from 'next/link'
import styles from '../styles/listing.module.css'

const sortOptions = {
  probability: (left, right) => right.probability - left.probability,
  movers: (left, right) => parseMove(right.move) - parseMove(left.move),
  conviction: (left, right) => convictionRank(right.conviction) - convictionRank(left.conviction),
}

function parseMove(move) {
  const normalized = Number.parseInt(move, 10)
  return Number.isNaN(normalized) ? 0 : normalized
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
  const [sortBy, setSortBy] = useState('probability')
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
      <div className={styles.explorerToolbar}>
        <div className={styles.categoryTabs}>
          {categories.map((category) => (
            <button
              className={activeCategory === category ? styles.tabActive : styles.tabButton}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.controlsRow}>
          <label className={styles.searchField}>
            <span>Search</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Fed, AI, oil, election"
              type="search"
              value={query}
            />
          </label>

          <label className={styles.selectField}>
            <span>Sort</span>
            <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
              <option value="probability">Highest probability</option>
              <option value="movers">Largest move</option>
              <option value="conviction">Strongest conviction</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.resultsSummary}>
        <strong>{filteredMarkets.length}</strong>
        <span>markets in view</span>
      </div>

      <div className={styles.cardGrid}>
        {filteredMarkets.map((market) => (
          <article className={styles.marketCard} key={market.slug}>
            <div className={styles.marketHeader}>
              <div className={styles.marketHeaderGroup}>
                <p className={styles.sectionLabel}>{market.category}</p>
                <span className={styles.statusPill}>{market.status}</span>
              </div>
              <span className={styles.move}>{market.move}</span>
            </div>
            <h2>{market.title}</h2>
            <div className={styles.probabilityRow}>
              <div className={styles.probability}>{market.probability}%</div>
              <div className={styles.convictionBlock}>
                <span>Conviction</span>
                <strong>{market.conviction}</strong>
              </div>
            </div>
            <div className={styles.trackBar}>
              <span style={{ width: `${market.probability}%` }} />
            </div>
            <p>{market.description}</p>
            <div className={styles.statsGrid}>
              <div>
                <span>Depth</span>
                <strong>{market.liquidityLabel}</strong>
              </div>
              <div>
                <span>Volume</span>
                <strong>{market.volumeLabel}</strong>
              </div>
            </div>
            <div className={styles.tagRow}>
              {market.tags.map((tag) => (
                <span className={styles.tag} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <Link className={styles.inlineLink} href={`/markets/${market.slug}`}>
              Open market detail
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}