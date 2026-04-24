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
  const featuredSignals = newsStories.slice(0, 3)
  const topMovers = [...markets]
    .sort((left, right) => Number.parseInt(right.move, 10) - Number.parseInt(left.move, 10))
    .slice(0, 3)

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
            <section className={styles.marketBoard}>
              <div className={styles.boardLeadBar}>
                <div>
                  <p className={styles.eyebrow}>Market overview</p>
                  <h1>Trade the questions moving now.</h1>
                </div>
                <div className={styles.boardActions}>
                  <Link className={styles.primaryCta} href="/markets">
                    All markets
                  </Link>
                  <Link className={styles.secondaryCta} href="/news">
                    Signal desk
                  </Link>
                </div>
              </div>

              <div className={styles.metricStrip}>
                {siteMetrics.map((metric) => (
                  <div className={styles.metaCard} key={metric.label}>
                    <span className={styles.metricLabel}>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>

              <div className={styles.marketTable}>
                <div className={styles.tableHeader}>
                  <span>Market</span>
                  <span>Chance</span>
                  <span>Move</span>
                  <span>Volume</span>
                  <span>Ends</span>
                </div>
                {markets.map((market) => {
                  const moveTone = market.move.startsWith('+') ? styles.positiveMove : styles.negativeMove

                  return (
                    <article className={styles.tableRow} key={market.slug}>
                      <div className={styles.tableMarket}>
                        <span className={styles.marketCategory}>{market.category}</span>
                        <Link className={styles.marketLink} href={`/markets/${market.slug}`}>
                          {market.title}
                        </Link>
                        <p>{market.liquidityLabel}</p>
                      </div>
                      <div className={styles.tableCellStrong}>{market.probability}%</div>
                      <div className={`${styles.tableCell} ${moveTone}`}>{market.move}</div>
                      <div className={styles.tableCell}>{market.volumeLabel}</div>
                      <div className={styles.tableCell}>{market.resolutionDate}</div>
                    </article>
                  )
                })}
              </div>
            </section>

            <aside className={styles.heroRail}>
              <article className={styles.featuredCard}>
                <div className={styles.featuredTopline}>
                  <span className={styles.panelLabel}>Lead market</span>
                  <span className={styles.panelMeta}>{featuredMarket.move}</span>
                </div>
                <h2>{featuredMarket.title}</h2>
                <div className={styles.featuredPriceGrid}>
                  <div className={styles.priceCard}>
                    <span>Yes</span>
                    <strong>{featuredMarket.probability}c</strong>
                  </div>
                  <div className={styles.priceCard}>
                    <span>No</span>
                    <strong>{100 - featuredMarket.probability}c</strong>
                  </div>
                </div>
                <p className={styles.featuredDescription}>{featuredMarket.description}</p>
                <div className={styles.probabilityTrack}>
                  <span style={{ width: `${featuredMarket.probability}%` }} />
                </div>
                <div className={styles.featuredMetaGrid}>
                  <div>
                    <span>Volume</span>
                    <strong>{featuredMarket.volumeLabel}</strong>
                  </div>
                  <div>
                    <span>Depth</span>
                    <strong>{featuredMarket.liquidityLabel}</strong>
                  </div>
                  <div>
                    <span>Traders</span>
                    <strong>{featuredMarket.participantsLabel}</strong>
                  </div>
                  <div>
                    <span>Ends</span>
                    <strong>{featuredMarket.resolutionDate}</strong>
                  </div>
                </div>
                <Link className={styles.inlineLink} href={`/markets/${featuredMarket.slug}`}>
                  Open market detail
                </Link>
              </article>

              <article className={styles.signalBoard}>
                <div className={styles.boardHeader}>
                  <div>
                    <span className={styles.panelLabel}>Signal feed</span>
                    <h2>News that changes price.</h2>
                  </div>
                  <Link className={styles.inlineLink} href="/news">
                    View all
                  </Link>
                </div>
                <div className={styles.signalList}>
                  {featuredSignals.map((story) => (
                    <article className={styles.signalItem} key={story.slug}>
                      <div className={styles.signalItemTopline}>
                        <span className={styles.signalCategory}>{story.desk}</span>
                        <strong>{story.signalScore}</strong>
                      </div>
                      <Link className={styles.signalHeadline} href={`/news/${story.slug}`}>
                        {story.headline}
                      </Link>
                      <div className={styles.signalMetaRow}>
                        <span>{story.source}</span>
                        <span>{story.updateLag}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            </aside>
          </section>

          <section className={styles.secondaryGrid}>
            <section className={styles.newsBoard}>
              <div className={styles.sectionIntro}>
                <p className={styles.sectionLabel}>Linked evidence</p>
                <h2>Signals tied directly to active markets.</h2>
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
                    <div className={styles.feedMetaRow}>
                      <span>{item.impact} impact</span>
                      <span>{item.updateLag}</span>
                    </div>
                    <Link className={styles.inlineLink} href={`/news/${item.slug}`}>
                      Open source detail
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <aside className={styles.insightBoard}>
              <div className={styles.sectionIntro}>
                <p className={styles.sectionLabel}>Market structure</p>
                <h2>Rules first. Narrative second.</h2>
              </div>
              <div className={styles.principlesList}>
                {principles.map((principle, index) => (
                  <div className={styles.principleItem} key={principle}>
                    <span>0{index + 1}</span>
                    <p>{principle}</p>
                  </div>
                ))}
              </div>
              <div className={styles.momentumBoard}>
                <div className={styles.boardHeader}>
                  <div>
                    <span className={styles.panelLabel}>Momentum</span>
                    <h2>Fastest repricing</h2>
                  </div>
                </div>
                <div className={styles.momentumList}>
                  {topMovers.map((market) => (
                    <article className={styles.momentumItem} key={market.slug}>
                      <div>
                        <span className={styles.marketCategory}>{market.category}</span>
                        <p>{market.title}</p>
                      </div>
                      <div className={styles.momentumStats}>
                        <strong>{market.probability}%</strong>
                        <span className={market.move.startsWith('+') ? styles.positiveMove : styles.negativeMove}>
                          {market.move}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}

export default Home
