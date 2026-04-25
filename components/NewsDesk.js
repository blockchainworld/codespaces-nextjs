import { useMemo, useState } from 'react'
import Link from 'next/link'
import styles from '../styles/listing.module.css'

const sortOptions = {
  latest: (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt),
  impact: (left, right) => impactRank(right.impact) - impactRank(left.impact),
  score: (left, right) => right.signalScore - left.signalScore,
}

function impactRank(value) {
  if (value === 'High') {
    return 3
  }

  if (value === 'Medium') {
    return 2
  }

  return 1
}

export default function NewsDesk({ generatedAt, markets, newsStories }) {
  const desks = ['All', ...new Set(newsStories.map((story) => story.desk))]
  const [activeDesk, setActiveDesk] = useState('All')
  const [sortBy, setSortBy] = useState('latest')
  const [query, setQuery] = useState('')

  const filteredStories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return newsStories
      .filter((story) => {
        if (activeDesk !== 'All' && story.desk !== activeDesk) {
          return false
        }

        if (!normalizedQuery) {
          return true
        }

        return [story.headline, story.summary, story.source, story.desk]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort(sortOptions[sortBy])
  }, [activeDesk, newsStories, query, sortBy])

  const spotlightStories = filteredStories.slice(0, 3)

  function getRelatedMarkets(story) {
    return markets.filter((market) => story.relatedMarketSlugs?.includes(market.slug)).slice(0, 2)
  }

  return (
    <section className={styles.explorerShell}>
      <div className={styles.signalToolbarShell}>
        <div className={styles.signalToolbarLabelRow}>
          <div>
            <p className={styles.sectionLabel}>News</p>
            <h1 className={styles.signalToolbarTitle}>Signal desk</h1>
          </div>
          <div className={styles.signalInlineStats}>
            <span>{filteredStories.length} signals</span>
            <span>{generatedAt.slice(11, 16)} UTC</span>
          </div>
        </div>

        <div className={styles.signalToolbarTopline}>
          <div className={styles.categoryTabs}>
            {desks.map((desk) => (
              <button
                className={activeDesk === desk ? styles.signalTabActive : styles.signalTabButton}
                key={desk}
                onClick={() => setActiveDesk(desk)}
                type="button"
              >
                {desk}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.signalControlsRow}>
          <label className={styles.signalSearchField}>
            <span>Search</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="inflation, tariffs, AI supply"
              type="search"
              value={query}
            />
          </label>

          <label className={styles.signalSelectField}>
            <span>Sort</span>
            <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
              <option value="latest">Latest signal</option>
              <option value="impact">Highest impact</option>
              <option value="score">Highest signal score</option>
            </select>
          </label>
        </div>
      </div>

      {spotlightStories.length ? (
        <section className={styles.signalSpotlightGrid}>
          {spotlightStories.map((story) => {
            const relatedMarkets = getRelatedMarkets(story)

            return (
              <article className={styles.signalSpotlightCard} key={`spotlight-${story.slug}`}>
                <div className={styles.signalIdentityTopline}>
                  <span className={styles.statusPill}>{story.urgency}</span>
                  <span className={styles.signalQuality}>{story.sourceQuality}</span>
                </div>

                <Link className={styles.signalHeadlineLink} href={`/news/${story.slug}`}>
                  {story.headline}
                </Link>

                <p className={styles.signalSpotlightSummary}>{story.summary}</p>

                <div className={styles.signalOutcomeBoard}>
                  <div className={styles.signalScoreBlock}>
                    <span>Score</span>
                    <strong>{story.signalScore}</strong>
                  </div>
                  <div className={styles.signalScoreBlock}>
                    <span>Impact</span>
                    <strong>{story.impact}</strong>
                  </div>
                </div>

                <div className={styles.signalRouteMiniGrid}>
                  {relatedMarkets.map((market) => (
                    <Link className={styles.signalRouteMiniCard} href={`/markets/${market.slug}`} key={market.slug}>
                      <span>{market.category}</span>
                      <strong>{market.title}</strong>
                    </Link>
                  ))}
                </div>
              </article>
            )
          })}
        </section>
      ) : null}

      <section className={styles.signalBoardGrid}>
        {filteredStories.map((story) => {
          const relatedMarkets = getRelatedMarkets(story)

          return (
            <article className={styles.signalEventCard} key={story.slug}>
              <div className={styles.signalIdentityTopline}>
                <span className={styles.statusPill}>{story.urgency}</span>
                <span className={styles.signalQuality}>{story.sourceQuality}</span>
              </div>

              <div className={styles.signalIdentityCell}>
                <Link className={styles.signalHeadlineLink} href={`/news/${story.slug}`}>
                  {story.headline}
                </Link>
                <p>{story.summary}</p>
              </div>

              <div className={styles.signalEventMetaGrid}>
                <div>
                  <span>Desk</span>
                  <strong>{story.desk}</strong>
                </div>
                <div>
                  <span>Score</span>
                  <strong>{story.signalScore}</strong>
                </div>
                <div>
                  <span>Lag</span>
                  <strong>{story.updateLag}</strong>
                </div>
              </div>

              <div className={styles.signalRouteMiniGrid}>
                {relatedMarkets.map((market) => (
                  <Link className={styles.signalRouteMiniCard} href={`/markets/${market.slug}`} key={market.slug}>
                    <span>{market.category}</span>
                    <strong>{market.title}</strong>
                  </Link>
                ))}
              </div>

              <div className={styles.signalEventFooter}>
                <span>{story.source}</span>
                <span>{story.impact}</span>
                <span>{story.publishedAt}</span>
              </div>
            </article>
          )
        })}
      </section>
    </section>
  )
}