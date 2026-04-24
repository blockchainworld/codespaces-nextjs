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
      <div className={styles.signalToolbarShell}>
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

          <div className={styles.signalSummary}>
            <strong>{filteredStories.length}</strong>
            <span>signals</span>
          </div>
        </div>

        <div className={styles.signalControlsRow}>
          <label className={styles.signalSearchField}>
            <span>Search signals</span>
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

      <section className={styles.signalFeedShell}>
        <div className={styles.signalFeedHeader}>
          <span>Signal</span>
          <span>Desk</span>
          <span>Score</span>
          <span>Impact</span>
          <span>Lag</span>
          <span>Source</span>
        </div>

        <div className={styles.signalFeedBody}>
          {desks.map((desk) => (
            desk
          ))}
        </div>

        {filteredStories.map((story) => (
          <article className={styles.signalFeedRow} key={story.slug}>
            <div className={styles.signalIdentityCell}>
              <div className={styles.signalIdentityTopline}>
                <span className={styles.statusPill}>{story.urgency}</span>
                <span className={styles.signalQuality}>{story.sourceQuality}</span>
              </div>
              <Link className={styles.signalHeadlineLink} href={`/news/${story.slug}`}>
                {story.headline}
              </Link>
              <p>{story.summary}</p>
            </div>

            <div className={styles.signalMetaCell}>{story.desk}</div>
            <div className={styles.signalScoreCell}>{story.signalScore}</div>
            <div className={styles.signalMetaCell}>{story.impact}</div>
            <div className={styles.signalMetaCell}>{story.updateLag}</div>
            <div className={styles.signalMetaCell}>{story.source}</div>
          </article>
        ))}
      </section>
    </section>
  )
}