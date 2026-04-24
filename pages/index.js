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

  return (
    <>
      <Head>
        <title>Predict.info | News-driven forecasting</title>
        <meta
          name="description"
          content="Predict.info turns breaking news into transparent, evidence-linked forecasts across macro, politics, technology, and energy."
        />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.heroBadgeRow}>
                <p className={styles.eyebrow}>Professional prediction intelligence</p>
                <span className={styles.liveBadge}>Live prototype</span>
              </div>
              <h1>Forecast the next move before the headline becomes the market.</h1>
              <p className={styles.heroText}>
                Predict.info combines live probability markets with a news-native research layer. Instead of showing a raw number in isolation, it shows what changed, why it changed, and which reporting source actually moved the forecast.
              </p>
              <div className={styles.ctaRow}>
                <Link className={styles.primaryCta} href="/markets">
                  Explore live markets
                </Link>
                <Link className={styles.secondaryCta} href="/news">
                  Inspect the news layer
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
            </div>

            <aside className={styles.heroPanel}>
              <div className={styles.boardHeader}>
                <div>
                  <span className={styles.panelLabel}>Market board</span>
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
              <p className={styles.sectionLabel}>Market coverage</p>
              <h2>Structured like a product, not a promo page.</h2>
              <p>
                Each market card is compact, legible, and tied to a resolution rule. The product should feel fast enough for daily use and credible enough for decision support.
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
                <p className={styles.sectionLabel}>Signal stream</p>
                <h2>News drives the repricing layer.</h2>
              </div>
              <div className={styles.feedList}>
                {newsStories.map((item) => (
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
                <p className={styles.sectionLabel}>Operating principles</p>
                <h2>The interface should make causality obvious.</h2>
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
                <p className={styles.routeLabel}>Explore the product surface</p>
                <div className={styles.routeLinks}>
                  <Link className={styles.routeLink} href="/markets">
                    Markets index
                  </Link>
                  <Link className={styles.routeLink} href="/news">
                    News index
                  </Link>
                  <Link className={styles.routeLink} href="/about">
                    About the product
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.bottomBanner}>
            <div>
              <p className={styles.sectionLabel}>Design direction</p>
              <h2>Closer to Polymarket in product rigor, stronger on news intelligence.</h2>
            </div>
            <p className={styles.bottomText}>
              The right benchmark is not a playful landing page. It is a credible market product with faster visual parsing, sharper card structure, and clearer cause-and-effect between reporting and probability.
            </p>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}

export default Home
