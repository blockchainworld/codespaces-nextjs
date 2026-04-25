import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { getHomepageContent } from '../lib/contentApi'
import styles from '../styles/home.module.css'

const topicTabs = ['Trending', 'Breaking', 'New', 'Politics', 'Sports', 'Crypto', 'Tech', 'Economy', 'More']

export async function getStaticProps() {
  const { site, markets, newsStories } = await getHomepageContent()

  return {
    props: {
      site,
      markets,
      newsStories,
      principles: site.principles,
    },
  }
}

function Home({ site, markets, newsStories, principles }) {
  const featuredMarket = markets[0]
  const breakingStories = newsStories.slice(0, 3)
  const hotTopics = [...markets]
    .sort((left, right) => Number.parseInt(right.move, 10) - Number.parseInt(left.move, 10))
    .slice(0, 5)
  const marketTabs = Array.from(
    new Set(['All', ...markets.map((market) => market.category), ...markets.flatMap((market) => market.tags)])
  ).slice(0, 10)

  return (
    <>
      <Head>
        <title>Predict.info | News-driven forecasting</title>
        <meta
          name="description"
          content="Prediction markets with linked evidence, source-level signals, and explicit market rules."
        />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <nav className={styles.topicBar} aria-label="Market topic filters">
            {topicTabs.map((topic, index) => (
              <Link className={index === 0 ? styles.topicTabActive : styles.topicTab} href="/markets" key={topic}>
                {topic}
              </Link>
            ))}
          </nav>

          <section className={styles.heroGrid}>
            <article className={styles.featureEventCard}>
              <div className={styles.featureEventTopline}>
                <div>
                  <p className={styles.eyebrow}>{featuredMarket.category}</p>
                  <h1>{featuredMarket.title}</h1>
                </div>
                <div className={styles.featureActions}>
                  <button className={styles.iconGhost} type="button" aria-label="Copy market link">
                    ↗
                  </button>
                  <button className={styles.iconGhost} type="button" aria-label="Save market">
                    ☆
                  </button>
                </div>
              </div>

              <div className={styles.featureMarketGrid}>
                {featuredMarket.timeline.map((item, index) => {
                  const isPrimary = index === featuredMarket.timeline.length - 1
                  const price = Math.max(1, Math.round(featuredMarket.curve[index] || featuredMarket.probability))
                  const noPrice = 100 - price

                  return (
                    <article className={styles.outcomeRow} key={`${item.date}-${item.title}`}>
                      <div className={styles.outcomeDateBlock}>
                        <strong>{item.date}</strong>
                        <span>{featuredMarket.orderBook.yes[index]?.size || featuredMarket.volumeLabel}</span>
                      </div>
                      <div className={styles.outcomeProbabilityBlock}>
                        <strong>{price}%</strong>
                        <span className={isPrimary ? styles.reviewState : styles.moveState}>
                          {isPrimary ? 'In review' : item.impact}
                        </span>
                      </div>
                      <button className={styles.buyYesRowButton} type="button">
                        Buy Yes {price}c
                      </button>
                      <button className={styles.buyNoRowButton} type="button">
                        Buy No {noPrice}c
                      </button>
                    </article>
                  )
                })}
              </div>

              <div className={styles.featureContextStrip}>
                <div className={styles.featureContextLead}>
                  <p>{featuredMarket.description}</p>
                  <div className={styles.featureSourceList}>
                    {breakingStories.slice(0, 2).map((story) => (
                      <div className={styles.featureSourceItem} key={story.slug}>
                        <span>{story.source}</span>
                        <p>{story.headline}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.featureChartShell}>
                  {featuredMarket.curve.map((point, index) => (
                    <span className={styles.chartBar} key={`${point}-${index}`} style={{ height: `${Math.max(point, 8)}%` }} />
                  ))}
                </div>
              </div>

              <div className={styles.featureFooter}>
                <span>{featuredMarket.volumeLabel}</span>
                <span>Ends {featuredMarket.resolutionDate}</span>
                <Link className={styles.inlineLink} href={`/markets/${featuredMarket.slug}`}>
                  Open market
                </Link>
              </div>
            </article>

            <aside className={styles.sideRail}>
              <section className={styles.sidePanel}>
                <div className={styles.sidePanelHeader}>
                  <h2>Breaking news</h2>
                  <span>›</span>
                </div>
                <div className={styles.sidePanelList}>
                  {breakingStories.map((story, index) => (
                    <article className={styles.breakingRow} key={story.slug}>
                      <span className={styles.ranking}>{index + 1}</span>
                      <div>
                        <Link className={styles.breakingLink} href={`/news/${story.slug}`}>
                          {story.headline}
                        </Link>
                      </div>
                      <div className={styles.breakingScore}>
                        <strong>{story.signalScore}%</strong>
                        <span>{story.impact}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.sidePanel}>
                <div className={styles.sidePanelHeader}>
                  <h2>Hot topics</h2>
                  <span>›</span>
                </div>
                <div className={styles.sidePanelList}>
                  {hotTopics.map((market, index) => (
                    <article className={styles.hotTopicRow} key={market.slug}>
                      <span className={styles.ranking}>{index + 1}</span>
                      <div>
                        <Link className={styles.hotTopicLink} href={`/markets/${market.slug}`}>
                          {market.tags[0] || market.category}
                        </Link>
                      </div>
                      <div className={styles.hotTopicMeta}>
                        <strong>{market.liquidityLabel.replace(' depth', '')}</strong>
                        <span>{market.move}</span>
                      </div>
                    </article>
                  ))}
                </div>
                <Link className={styles.exploreAllButton} href="/markets">
                  Explore all
                </Link>
              </section>
            </aside>
          </section>

          <section className={styles.marketDeck}>
            <div className={styles.deckHeader}>
              <h2>All markets</h2>
              <div className={styles.deckActions}>
                <button className={styles.iconGhost} type="button" aria-label="Search all markets">
                  ⌕
                </button>
                <button className={styles.iconGhost} type="button" aria-label="Filter markets">
                  ≡
                </button>
              </div>
            </div>

            <div className={styles.marketTabRow}>
              {marketTabs.map((tab, index) => (
                <Link className={index === 0 ? styles.marketFilterActive : styles.marketFilter} href="/markets" key={tab}>
                  {tab}
                </Link>
              ))}
            </div>

            <div className={styles.marketList}>
              {markets.map((market) => (
                <article className={styles.marketListRow} key={market.slug}>
                  <div className={styles.marketIdentity}>
                    <span>{market.category}</span>
                    <Link className={styles.marketQuestion} href={`/markets/${market.slug}`}>
                      {market.title}
                    </Link>
                  </div>
                  <div className={styles.marketListStats}>
                    <strong>{market.probability}%</strong>
                    <span>{market.move}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.advantageStrip}>
            {principles.map((principle, index) => (
              <article className={styles.advantageCard} key={principle}>
                <span>0{index + 1}</span>
                <p>{principle}</p>
              </article>
            ))}
          </section>
        </main>
      </SiteLayout>
    </>
  )
}

export default Home
