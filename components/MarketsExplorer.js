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

  const spotlightMarkets = filteredMarkets.slice(0, 3)
  const topMovers = [...filteredMarkets].sort(sortOptions.movers).slice(0, 3)
  const highProbabilityMarkets = [...filteredMarkets].sort(sortOptions.probability).slice(0, 3)
  const closingSoonMarkets = [...filteredMarkets]
    .sort((left, right) => new Date(left.resolutionDate) - new Date(right.resolutionDate))
    .slice(0, 3)

  return (
    <section className={styles.explorerShell}>
      <div className={styles.marketToolbarShell}>
        <div className={styles.marketToolbarLabelRow}>
          <div>
            <p className={styles.sectionLabel}>Markets</p>
            <h1 className={styles.marketToolbarTitle}>All markets</h1>
          </div>
          <div className={styles.marketInlineStats}>
            <span>{filteredMarkets.length} markets</span>
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

      <section className={styles.marketScanGrid}>
        <article className={styles.marketScanCard}>
          <div className={styles.marketScanHeader}>
            <p className={styles.sectionLabel}>Cross-market scan</p>
            <span className={styles.marketScanLabel}>Largest move</span>
          </div>
          <div className={styles.marketScanList}>
            {topMovers.map((market) => (
              <Link className={styles.marketScanRow} href={`/markets/${market.slug}`} key={`move-${market.slug}`}>
                <div>
                  <span>{market.category}</span>
                  <strong>{market.title}</strong>
                </div>
                <em className={getMovePoints(market.move) >= 0 ? styles.marketMoveUp : styles.marketMoveDown}>{market.move}</em>
              </Link>
            ))}
          </div>
        </article>

        <article className={styles.marketScanCard}>
          <div className={styles.marketScanHeader}>
            <p className={styles.sectionLabel}>Cross-market scan</p>
            <span className={styles.marketScanLabel}>Highest yes</span>
          </div>
          <div className={styles.marketScanList}>
            {highProbabilityMarkets.map((market) => (
              <Link className={styles.marketScanRow} href={`/markets/${market.slug}`} key={`prob-${market.slug}`}>
                <div>
                  <span>{market.category}</span>
                  <strong>{market.title}</strong>
                </div>
                <em>{market.probability}% yes</em>
              </Link>
            ))}
          </div>
        </article>

        <article className={styles.marketScanCard}>
          <div className={styles.marketScanHeader}>
            <p className={styles.sectionLabel}>Cross-market scan</p>
            <span className={styles.marketScanLabel}>Closing soon</span>
          </div>
          <div className={styles.marketScanList}>
            {closingSoonMarkets.map((market) => (
              <Link className={styles.marketScanRow} href={`/markets/${market.slug}`} key={`close-${market.slug}`}>
                <div>
                  <span>{market.category}</span>
                  <strong>{market.title}</strong>
                </div>
                <em>{market.resolutionDate}</em>
              </Link>
            ))}
          </div>
        </article>
      </section>

      {spotlightMarkets.length ? (
        <div className={styles.marketSpotlightGrid}>
          {spotlightMarkets.map((market) => {
            const noPrice = 100 - market.probability
            const moveTone = getMovePoints(market.move) >= 0 ? styles.marketMoveUp : styles.marketMoveDown

            return (
              <article className={styles.marketSpotlightCard} key={`spotlight-${market.slug}`}>
                <div className={styles.marketSpotlightTopline}>
                  <div className={styles.marketIdentityTopline}>
                    <span className={styles.sectionLabel}>{market.category}</span>
                    <span className={styles.marketConviction}>{market.conviction}</span>
                    {market.liveMetadata?.overlaid ? <span className={styles.marketLiveBadge}>Live</span> : null}
                  </div>
                  <span className={styles.statusPill}>{market.status}</span>
                </div>

                <div className={styles.marketIdentityMain}>
                  {market.liveMetadata?.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className={styles.marketIdentityIconLarge} src={market.liveMetadata.icon} />
                  ) : (
                    <span className={styles.marketIdentityFallbackLarge}>{market.category.slice(0, 1)}</span>
                  )}

                  <div className={styles.marketSpotlightBody}>
                    <Link className={styles.marketQuestionLink} href={`/markets/${market.slug}`}>
                      {market.title}
                    </Link>
                    <p>{market.description}</p>
                  </div>
                </div>

                <div className={styles.marketOutcomeBoard}>
                  <div className={styles.marketOutcomeBuyYes}>
                    <span>Yes</span>
                    <strong>{market.probability}c</strong>
                  </div>
                  <div className={styles.marketOutcomeBuyNo}>
                    <span>No</span>
                    <strong>{noPrice}c</strong>
                  </div>
                </div>

                <div className={styles.marketSpotlightMeta}>
                  <span className={moveTone}>{market.move}</span>
                  <span>{market.volumeLabel}</span>
                  <span>{market.participantsLabel}</span>
                  <span>{market.resolutionDate}</span>
                </div>

                <div className={styles.marketSignalRow}>
                  <span>Signal quality</span>
                  <strong>{market.sourceQuality}</strong>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      <div className={styles.marketBoardGrid}>
        {filteredMarkets.map((market) => {
          const negativePrice = 100 - market.probability
          const moveTone = getMovePoints(market.move) >= 0 ? styles.marketMoveUp : styles.marketMoveDown

          return (
            <article className={styles.marketEventCard} key={market.slug}>
              <div className={styles.marketSpotlightTopline}>
                <div className={styles.marketIdentityTopline}>
                  <span className={styles.sectionLabel}>{market.category}</span>
                  {market.liveMetadata?.overlaid ? <span className={styles.marketLiveBadge}>Live</span> : null}
                </div>
                <span className={styles.marketConviction}>{market.conviction}</span>
              </div>

              <div className={styles.marketIdentityMain}>
                {market.liveMetadata?.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className={styles.marketIdentityIcon} src={market.liveMetadata.icon} />
                ) : (
                  <span className={styles.marketIdentityFallback}>{market.category.slice(0, 1)}</span>
                )}

                <div className={styles.marketIdentityCell}>
                  <Link className={styles.marketQuestionLink} href={`/markets/${market.slug}`}>
                    {market.title}
                  </Link>
                  <p>{market.tags.join(' / ')}</p>
                </div>
              </div>

              <div className={styles.marketOutcomeBoardCompact}>
                <div className={styles.marketOutcomeBuyYes}>
                  <span>Yes</span>
                  <strong>{market.probability}c</strong>
                </div>
                <div className={styles.marketOutcomeBuyNo}>
                  <span>No</span>
                  <strong>{negativePrice}c</strong>
                </div>
              </div>

              <div className={styles.marketEventMetaGrid}>
                <div>
                  <span>Move</span>
                  <strong className={moveTone}>{market.move}</strong>
                </div>
                <div>
                  <span>Volume</span>
                  <strong>{market.volumeLabel}</strong>
                </div>
                <div>
                  <span>Depth</span>
                  <strong>{market.liquidityLabel}</strong>
                </div>
              </div>

              <div className={styles.marketSignalRow}>
                <span>Signal quality</span>
                <strong>{market.sourceQuality}</strong>
              </div>

              <div className={styles.marketEventFooter}>
                <span>{market.participantsLabel}</span>
                <span>{market.resolutionDate}</span>
                <span className={styles.statusPill}>{market.status}</span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}