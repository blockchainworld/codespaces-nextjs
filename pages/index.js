import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { getHomepageContent } from '../lib/contentApi'
import styles from '../styles/home.module.css'

export async function getStaticProps() {
  const { site, markets, newsStories } = await getHomepageContent()

  return {
    props: {
      site,
      markets,
      newsStories,
      principles: site.principles,
      siteMetrics: site.metrics,
    },
  }
}

function Home({ site, markets, newsStories, principles, siteMetrics }) {
  const featuredMarket = markets[0]
  const topSignals = newsStories.slice(0, 2)
  const topMovers = [...markets]
    .sort((left, right) => Number.parseInt(right.move, 10) - Number.parseInt(left.move, 10))
    .slice(0, 3)
  const featuredSignals = newsStories.slice(0, 3)

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
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Live forecasting terminal</p>
              <h1>Live markets with visible evidence.</h1>
              <p className={styles.heroText}>
                Track price, move size, resolution terms, and linked signals in one view.
              </p>
              <div className={styles.ctaRow}>
                <Link className={styles.primaryCta} href="/markets">
                  View markets
                </Link>
                <Link className={styles.secondaryCta} href="/news">
                  View signals
                </Link>
              </div>
              <div className={styles.heroMetaGrid}>
                {siteMetrics.map((metric) => (
                  <div className={styles.metaCard} key={metric.label}>
                    <span className={styles.metricLabel}>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.terminalStrip}>
                <div className={styles.terminalStripHeader}>
                  <span>Top movers</span>
                  <span>24h</span>
                </div>
                <div className={styles.terminalStripList}>
                  {topMovers.map((market) => (
                    <article className={styles.terminalStripRow} key={market.slug}>
                      <p>{market.title}</p>
                      <strong>{market.move}</strong>
                    </article>
                  ))}
                </div>
              </div>
              <div className={styles.heroSignalStrip}>
                {topSignals.map((story) => (
                  <article className={styles.signalStripItem} key={story.slug}>
                    <span>{story.desk}</span>
                    <p>{story.headline}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className={styles.heroPanel}>
              <div className={styles.boardHeader}>
                <div>
                  <span className={styles.panelLabel}>Lead market</span>
                  <h2>{featuredMarket.title}</h2>
                </div>
                <span className={styles.panelMeta}>{featuredMarket.move}</span>
              </div>
              <div className={styles.boardSpotlight}>
                <div>
                  <p className={styles.signalCategory}>{featuredMarket.category}</p>
                  <div className={styles.boardProbability}>{featuredMarket.probability}%</div>
                  <p className={styles.boardDescription}>{featuredMarket.description}</p>
                </div>
                <div className={styles.boardRange}>
                  <span>Probability depth</span>
                  <div className={styles.rangeTrack}>
                    <span style={{ width: `${featuredMarket.probability}%` }} />
                  </div>
                  <div className={styles.rangeScale}>
                    <strong>Yes {featuredMarket.probability}%</strong>
                    <span>No {100 - featuredMarket.probability}%</span>
                  </div>
                </div>
              </div>
              <div className={styles.boardList}>
                {markets.map((market) => (
                  <article className={styles.boardRow} key={market.slug}>
                    <div>
                      <p>{market.title}</p>
                      <span>{market.category}</span>
                    </div>
                    <div className={styles.boardStats}>
                      <strong>{market.probability}%</strong>
                      <span>{market.move}</span>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionIntro}>
              <p className={styles.sectionLabel}>Active markets</p>
              <h2>High-signal questions in live view.</h2>
              <p>
                Current probability, move magnitude, and resolution timing should be readable immediately.
              </p>
            </div>
            <div className={styles.marketGrid}>
              {markets.map((market) => (
                <article className={styles.marketCard} key={market.slug}>
                  <div className={styles.marketTopline}>
                    <span className={styles.marketCategory}>{market.category}</span>
                    <span>{market.move}</span>
                  </div>
                  <p className={styles.marketTitle}>{market.title}</p>
                  <div className={styles.marketProbability}>{market.probability}%</div>
                  <div className={styles.probabilityTrack}>
                    <span style={{ width: `${market.probability}%` }} />
                  </div>
                  <p className={styles.marketDescription}>{market.description}</p>
                  <div className={styles.marketMetaRow}>
                    <span>Resolves</span>
                    <strong>{market.resolutionDate}</strong>
                  </div>
                  <div className={styles.tagRow}>
                    {market.tags.map((tag) => (
                      <span className={styles.tag} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link className={styles.inlineLink} href={`/markets/${market.slug}`}>
                    Open forecast detail
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.storyGrid}>
            <div className={styles.newsroomColumn}>
              <div className={styles.sectionIntro}>
                <p className={styles.sectionLabel}>Latest signals</p>
                <h2>Source events moving active markets.</h2>
              </div>
              <div className={styles.feedList}>
                {featuredSignals.map((item) => (
                  <article className={styles.feedItem} key={item.slug}>
                    <div className={styles.feedTopline}>
                      <p className={styles.feedSource}>{item.source}</p>
                      <span className={styles.feedDate}>{item.publishedAt}</span>
                    </div>
                    <h3>{item.headline}</h3>
                    <p>{item.summary}</p>
                    <Link className={styles.inlineLink} href={`/news/${item.slug}`}>
                      Open source detail
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.explainerColumn}>
              <div className={styles.sectionIntro}>
                <p className={styles.sectionLabel}>Methodology</p>
                <h2>Rules, evidence, and market structure.</h2>
              </div>
              <div className={styles.principlesList}>
                {principles.map((principle, index) => (
                  <div className={styles.principleItem} key={principle}>
                    <span>0{index + 1}</span>
                    <p>{principle}</p>
                  </div>
                ))}
              </div>
              <div className={styles.routeCard}>
                <p className={styles.routeLabel}>Open key views</p>
                <div className={styles.routeLinks}>
                  <Link className={styles.routeLink} href="/markets">
                    Markets index
                  </Link>
                  <Link className={styles.routeLink} href="/news">
                    News index
                  </Link>
                  <Link className={styles.routeLink} href="/about">
                    Methodology
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}

export default Home
