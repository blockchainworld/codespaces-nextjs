import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../../components/SiteLayout'
import {
  getGeneratedAt,
  getMarketsForNews,
  getNewsBySlug,
  getNewsSlugs,
  getSiteContent,
} from '../../lib/contentApi'
import styles from '../../styles/detail.module.css'

export async function getStaticPaths() {
  const newsSlugs = await getNewsSlugs()

  return {
    paths: newsSlugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const [site, story, relatedMarkets] = await Promise.all([
    getSiteContent(),
    getNewsBySlug(params.slug),
    getMarketsForNews(params.slug),
  ])

  return {
    props: {
      generatedAt: getGeneratedAt(),
      site,
      story,
      relatedMarkets,
    },
    revalidate: 300,
  }
}

export default function NewsDetailPage({ site, story, relatedMarkets, generatedAt }) {
  const leadMarket = relatedMarkets[0]

  return (
    <>
      <Head>
        <title>{story.headline} | Predict.info</title>
        <meta name="description" content={story.summary} />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <div className={styles.heroTopline}>
              <div className={styles.heroMetaCluster}>
                <p className={styles.eyebrow}>{story.source}</p>
                <span className={styles.headerStatusPill}>{story.urgency}</span>
              </div>
              <Link className={styles.backLink} href="/news">
                Back to all news
              </Link>
            </div>
            <h1>{story.headline}</h1>
            <div className={styles.signalQuoteStrip}>
              <div className={styles.signalQuoteCard}>
                <span className={styles.statLabel}>Score</span>
                <strong>{story.signalScore}</strong>
              </div>
              <div className={styles.signalQuoteCard}>
                <span className={styles.statLabel}>Impact</span>
                <strong>{story.impact}</strong>
              </div>
              <div className={styles.signalQuoteCard}>
                <span className={styles.statLabel}>Lag</span>
                <strong>{story.updateLag}</strong>
              </div>
              <div className={styles.signalQuoteCard}>
                <span className={styles.statLabel}>Desk</span>
                <strong>{story.desk}</strong>
              </div>
              <div className={styles.signalQuoteCard}>
                <span className={styles.statLabel}>Markets</span>
                <strong>{relatedMarkets.length}</strong>
              </div>
            </div>
            <div className={styles.topRuleBar}>
              <div>
                <span className={styles.ruleLabel}>Signal summary</span>
                <p className={styles.ruleText}>{story.summary}</p>
              </div>
              <div className={styles.ruleMeta}>
                <span>{generatedAt.slice(11, 16)} UTC sync</span>
                <span>{story.source}</span>
              </div>
            </div>

            <div className={styles.marketNarrativeStrip}>
              <div>
                <span>Primary route</span>
                <strong>{leadMarket ? leadMarket.title : 'Awaiting linked market'}</strong>
              </div>
              <div>
                <span>Evidence quality</span>
                <strong>{story.sourceQuality}</strong>
              </div>
              <div>
                <span>Market reach</span>
                <strong>{relatedMarkets.length} linked contracts</strong>
              </div>
            </div>
          </section>

          <section className={styles.mainGrid}>
            <div className={styles.primaryColumn}>
              <section className={styles.tradingCard}>
                <div className={styles.tradingHeader}>
                  <div>
                    <p className={styles.sectionLabel}>Signal terminal</p>
                    <h2>What changed and where it flows</h2>
                  </div>
                  <span className={styles.qualityBadge}>{story.sourceQuality}</span>
                </div>

                <div className={styles.signalTerminalGrid}>
                  <article className={styles.signalPrimaryCard}>
                    <span className={styles.sideLabel}>Primary classification</span>
                    <strong>{story.impact} impact</strong>
                    <p>{story.summary}</p>
                  </article>

                  <article className={styles.signalSecondaryCard}>
                    <div className={styles.signalPanelMeta}>
                      <div>
                        <span>Urgency</span>
                        <strong>{story.urgency}</strong>
                      </div>
                      <div>
                        <span>Source</span>
                        <strong>{story.source}</strong>
                      </div>
                      <div>
                        <span>Published</span>
                        <strong>{story.publishedAt}</strong>
                      </div>
                      <div>
                        <span>Sync</span>
                        <strong>{generatedAt.slice(11, 16)} UTC</strong>
                      </div>
                    </div>
                  </article>
                </div>

                <div className={styles.signalInterpretationGrid}>
                  <div className={styles.signalInterpretationCard}>
                    <p className={styles.sectionLabel}>Market implications</p>
                    <div className={styles.bulletList}>
                      {story.takeaways.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>

                  <div className={styles.signalInterpretationCard}>
                    <p className={styles.sectionLabel}>Key evidence</p>
                    <div className={styles.bulletList}>
                      {story.keyEvidence.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.detailCard}>
                <div className={styles.detailSectionHeader}>
                  <div>
                    <p className={styles.sectionLabel}>Signal readout</p>
                    <h2>Why this input matters for pricing</h2>
                  </div>
                  <span className={styles.qualityBadge}>{story.impact}</span>
                </div>
                <div className={styles.proseBlock}>
                  {story.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className={styles.detailCard}>
                <div className={styles.detailSectionHeader}>
                  <div>
                    <p className={styles.sectionLabel}>Contract routing</p>
                    <h2>Markets currently repricing on this signal</h2>
                  </div>
                  <Link className={styles.inlineLink} href="/markets">
                    Open market board
                  </Link>
                </div>

                <div className={styles.signalRouteGrid}>
                  {relatedMarkets.map((market) => (
                    <article className={styles.signalRouteCard} key={market.slug}>
                      <div className={styles.signalCardTopline}>
                        <span>{market.category}</span>
                        <strong>{market.probability}%</strong>
                      </div>
                      <h3>{market.title}</h3>
                      <p>{market.description}</p>
                      <div className={styles.signalTerminalMeta}>
                        <span>{market.move}</span>
                        <span>{market.volumeLabel}</span>
                        <span>{market.resolutionDate}</span>
                      </div>
                      <Link className={styles.inlineLink} href={`/markets/${market.slug}`}>
                        Open market
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.sidebarColumn}>
              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Signal panel</p>
                <div className={styles.sidebarStatsCompact}>
                  <div>
                    <span>Source</span>
                    <strong>{story.source}</strong>
                  </div>
                  <div>
                    <span>Quality</span>
                    <strong>{story.sourceQuality}</strong>
                  </div>
                  <div>
                    <span>Impact</span>
                    <strong>{story.impact}</strong>
                  </div>
                  <div>
                    <span>Urgency</span>
                    <strong>{story.urgency}</strong>
                  </div>
                  <div>
                    <span>Desk</span>
                    <strong>{story.desk}</strong>
                  </div>
                </div>
              </section>
            </aside>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}