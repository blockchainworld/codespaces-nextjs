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
              <p className={styles.eyebrow}>Predict.info</p>
              <h1>Forecast the next move before the headline becomes consensus.</h1>
              <p className={styles.heroText}>
                A news-driven prediction platform for people who want more than a price chart. Follow live probabilities, inspect the evidence behind each move, and understand which headlines are actually changing the odds.
              </p>
              <div className={styles.ctaRow}>
                <Link className={styles.primaryCta} href="/markets">
                  Explore live markets
                </Link>
                <Link className={styles.secondaryCta} href="/news">
                  Review the news layer
                </Link>
              </div>
            </div>

            <aside className={styles.heroPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelLabel}>Signal board</span>
                <span className={styles.panelMeta}>Updated from live news inputs</span>
              </div>
              <div className={styles.signalCard}>
                <p className={styles.signalCategory}>Breaking thesis</p>
                <h2>Election volatility is being repriced around policy details, not polling noise.</h2>
                <p>
                  The strongest moves come from specific, verifiable developments: official statements, filings, earnings calls, and agency releases.
                </p>
              </div>
              <div className={styles.metricRow}>
                {siteMetrics.map((metric) => (
                  <div key={metric.label}>
                    <span className={styles.metricLabel}>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionIntro}>
              <p className={styles.sectionLabel}>Live markets</p>
              <h2>Built around decisions, not distractions.</h2>
              <p>
                Each market compresses a noisy stream of news into one answerable question with a visible reasoning trail.
              </p>
            </div>
            <div className={styles.marketGrid}>
              {markets.map((market) => (
                <article className={styles.marketCard} key={market.slug}>
                  <div className={styles.marketTopline}>
                    <p>{market.title}</p>
                    <span>{market.move}</span>
                  </div>
                  <div className={styles.marketProbability}>{market.probability}%</div>
                  <p className={styles.marketDescription}>{market.description}</p>
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
                <p className={styles.sectionLabel}>Newsroom inputs</p>
                <h2>News is the interface.</h2>
              </div>
              <div className={styles.feedList}>
                {newsStories.map((item) => (
                  <article className={styles.feedItem} key={item.slug}>
                    <p className={styles.feedSource}>{item.source}</p>
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
                <p className={styles.sectionLabel}>Product logic</p>
                <h2>A cleaner architecture for forecasting.</h2>
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
                <p className={styles.routeLabel}>Explore the full structure</p>
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
              <p className={styles.sectionLabel}>Why this direction</p>
              <h2>More Financial Times than casino. More evidence than hype.</h2>
            </div>
            <p className={styles.bottomText}>
              Predict.info should feel credible on first contact: editorial hierarchy, clear market framing, and visible links between information and probability.
            </p>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}

export default Home
