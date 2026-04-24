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

export default function NewsDesk({ newsStories }) {
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

  return (
    <section className={styles.explorerShell}>
      <div className={styles.explorerToolbar}>
        <div className={styles.categoryTabs}>
          {desks.map((desk) => (
            <button
              className={activeDesk === desk ? styles.tabActive : styles.tabButton}
              key={desk}
              onClick={() => setActiveDesk(desk)}
              type="button"
            >
              {desk}
            </button>
          ))}
        </div>

        <div className={styles.controlsRow}>
          <label className={styles.searchField}>
            <span>Search</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="inflation, tariffs, AI supply"
              type="search"
              value={query}
            />
          </label>

          <label className={styles.selectField}>
            <span>Sort</span>
            <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
              <option value="latest">Latest signal</option>
              <option value="impact">Highest impact</option>
              <option value="score">Highest signal score</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.resultsSummary}>
        <strong>{filteredStories.length}</strong>
        <span>signals in view</span>
      </div>

      <section className={styles.newsTerminalList}>
        {filteredStories.map((story) => (
          <article className={styles.newsTerminalCard} key={story.slug}>
            <div className={styles.marketHeader}>
              <div className={styles.marketHeaderGroup}>
                <p className={styles.sectionLabel}>{story.desk}</p>
                <span className={styles.statusPill}>{story.urgency}</span>
              </div>
              <span className={styles.move}>{story.updateLag}</span>
            </div>
            <div className={styles.newsTerminalBody}>
              <div>
                <h2>{story.headline}</h2>
                <p>{story.summary}</p>
              </div>
              <div className={styles.signalScoreBox}>
                <span>Signal score</span>
                <strong>{story.signalScore}</strong>
              </div>
            </div>
            <div className={styles.newsMetaGrid}>
              <div>
                <span>Source</span>
                <strong>{story.source}</strong>
              </div>
              <div>
                <span>Impact</span>
                <strong>{story.impact}</strong>
              </div>
              <div>
                <span>Quality</span>
                <strong>{story.sourceQuality}</strong>
              </div>
              <div>
                <span>Published</span>
                <strong>{story.publishedAt}</strong>
              </div>
            </div>
            <Link className={styles.inlineLink} href={`/news/${story.slug}`}>
              Open signal detail
            </Link>
          </article>
        ))}
      </section>
    </section>
  )
}