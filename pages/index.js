import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { getHomepageContent } from '../lib/contentApi'
import { sortMarketsByActivity } from '../lib/marketRank'
import styles from '../styles/home.module.css'

const topicTabs = ['Trending', 'Breaking', 'New', 'Politics', 'Sports', 'Crypto', 'Tech', 'Economy', 'More']

export async function getStaticProps() {
  const { site, markets, newsStories } = await getHomepageContent()

  return {
    props: {
      site,
      markets,
      newsStories,
    },
    revalidate: 300,
  }
}

function Home({ site, markets, newsStories }) {
  const rankedMarkets = sortMarketsByActivity(markets)
  const featuredMarket = rankedMarkets[0]
  const breakingStories = newsStories.slice(0, 3)
  const marketMapStories = newsStories.slice(0, 4)
  const marketTabs = Array.from(
    new Set(['All', ...rankedMarkets.map((market) => market.category), ...rankedMarkets.flatMap((market) => market.tags)])
  ).slice(0, 10)
  const signalMap = breakingStories.map((story) => ({
    story,
    relatedMarkets: rankedMarkets.filter((market) => story.relatedMarketSlugs?.includes(market.slug)).slice(0, 2),
  }))
  const marketMap = marketMapStories.map((story) => ({
    story,
    relatedMarkets: rankedMarkets.filter((market) => story.relatedMarketSlugs?.includes(market.slug)).slice(0, 3),
  }))

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
          <section className={styles.commandDeck}>
            <article className={styles.commandDeckLead}>
              <p className={styles.eyebrow}>Market map</p>
              <h1>{featuredMarket.title}</h1>
              <p className={styles.commandDeckText}>
                Every forecast starts with a clear contract, explicit resolution, and linked evidence trail. The core
                product is not news or content in isolation. It is probability formation under changing information.
              </p>
              <div className={styles.commandDeckMeta}>
                <div>
                  <span>Resolution</span>
                  <strong>{featuredMarket.resolutionDate}</strong>
                </div>
                <div>
                  <span>Rule</span>
                  <strong>{featuredMarket.settlementRule}</strong>
                </div>
              </div>
            </article>

            <article className={styles.signalRouterCard}>
              <div className={styles.signalRouterHeader}>
                <p className={styles.eyebrow}>Signal routing</p>
                <Link className={styles.inlineLink} href="/news">
                  Open signal desk
                </Link>
              </div>

              <div className={styles.signalRouterList}>
                {signalMap.map(({ story, relatedMarkets }) => (
                  <div className={styles.signalRouterRow} key={story.slug}>
                    <div className={styles.signalRouterStory}>
                      <Link className={styles.signalRouterHeadline} href={`/news/${story.slug}`}>
                        {story.headline}
                      </Link>
                      <div className={styles.signalRouterMeta}>
                        <span>{story.sourceQuality}</span>
                        <span>Score {story.signalScore}</span>
                        <span>{story.updateLag}</span>
                      </div>
                    </div>

                    <div className={styles.signalRouterMarkets}>
                      {relatedMarkets.map((market) => (
                        <Link className={styles.signalRouterMarketLink} href={`/markets/${market.slug}`} key={market.slug}>
                          <span>{market.category}</span>
                          <strong>{market.title}</strong>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <nav className={styles.topicBar} aria-label="Market topic filters">
            {topicTabs.map((topic, index) => (
              <Link className={index === 0 ? styles.topicTabActive : styles.topicTab} href="/markets" key={topic}>
                {topic}
              </Link>
            ))}
          </nav>

          <section className={styles.marketMapSection}>
            <div className={styles.marketMapHeader}>
              <div>
                <p className={styles.eyebrow}>Signal market map</p>
                <h2>Which inputs are repricing which contracts</h2>
              </div>
              <Link className={styles.inlineLink} href="/news">
                Open signal desk
              </Link>
            </div>

            <div className={styles.marketMapGrid}>
              {marketMap.map(({ story, relatedMarkets }) => (
                <article className={styles.marketMapRow} key={story.slug}>
                  <div className={styles.marketMapStory}>
                    <div className={styles.marketMapStoryMeta}>
                      <span>{story.source}</span>
                      <span>{story.impact}</span>
                      <span>Score {story.signalScore}</span>
                    </div>
                    <Link className={styles.marketMapHeadline} href={`/news/${story.slug}`}>
                      {story.headline}
                    </Link>
                  </div>

                  <div className={styles.marketMapContracts}>
                    {relatedMarkets.map((market) => (
                      <Link className={styles.marketMapContract} href={`/markets/${market.slug}`} key={market.slug}>
                        <span>{market.category}</span>
                        <strong>{market.title}</strong>
                        <em>
                          {market.probability}% / {market.move}
                        </em>
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.spotlightStrip}>
            <div className={styles.spotlightCluster}>
              <span className={styles.spotlightPill}>Featured</span>
              {featuredMarket.tags.slice(0, 2).map((tag) => (
                <span className={styles.spotlightChip} key={tag}>
                  {tag}
                </span>
              ))}
              <span className={styles.spotlightChip}>{featuredMarket.category}</span>
            </div>
            <Link className={styles.spotlightAction} href="/markets">
              Explore all
            </Link>
          </section>

          <section className={styles.newsTicker}>
            <span className={styles.tickerLabel}>Breaking</span>
            <div className={styles.tickerTrack}>
              {breakingStories.map((story) => (
                <Link className={styles.tickerLink} href={`/news/${story.slug}`} key={story.slug}>
                  {story.headline}
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.marketDeck}>
            <div className={styles.deckHeader}>
              <h2>All markets</h2>
              <div className={styles.deckActions}>
                  {featuredMarket.liveMetadata?.overlaid ? (
                    <span className={styles.deckLiveFlag}>Live from {featuredMarket.liveMetadata.source}</span>
                  ) : null}
              </div>
            </div>

            <div className={styles.marketTabRow}>
              {marketTabs.map((tab, index) => (
                <Link className={index === 0 ? styles.marketFilterActive : styles.marketFilter} href="/markets" key={tab}>
                  {tab}
                </Link>
              ))}
            </div>

            <div className={styles.marketCardGrid}>
              {rankedMarkets.map((market) => (
                <article className={styles.marketCard} key={market.slug}>
                  <div className={styles.marketCardTopline}>
                    <div className={styles.marketCardIdentity}>
                      {market.liveMetadata?.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className={styles.marketCardIcon} src={market.liveMetadata.icon} />
                      ) : (
                        <span className={styles.marketCardFallback}>{market.category.slice(0, 1)}</span>
                      )}
                      <span className={styles.marketCardCategory}>
                        {market.liveMetadata?.overlaid ? `${market.category} / live` : market.category}
                      </span>
                    </div>
                    {market.liveMetadata?.overlaid ? <span className={styles.marketCardLive}>Live</span> : null}
                  </div>
                  <Link className={styles.marketCardQuestion} href={`/markets/${market.slug}`}>
                    {market.title}
                  </Link>
                  <div className={styles.marketCardDateRow}>
                    <span>{market.resolutionDate}</span>
                    <strong>{market.probability}%</strong>
                  </div>
                  <div className={styles.marketOutcomeGrid}>
                    <button className={styles.marketOutcomeYes} type="button">
                      Yes {market.probability}c
                    </button>
                    <button className={styles.marketOutcomeNo} type="button">
                      No {100 - market.probability}c
                    </button>
                  </div>
                  <div className={styles.marketCardMeta}>
                    <span>{market.volumeLabel}</span>
                    <span>{market.move}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}

export default Home
