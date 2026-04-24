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
            <div className={styles.heroStats}>
              <div>
                <span className={styles.statLabel}>Desk</span>
                <strong>{story.desk}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Published</span>
                <strong>{story.publishedAt}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Impact</span>
                <strong>{story.impact}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Signal score</span>
                <strong>{story.signalScore}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Update lag</span>
                <strong>{story.updateLag}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Related markets</span>
                <strong>{relatedMarkets.length}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Source quality</span>
                <strong>{story.sourceQuality}</strong>
              </div>
            </div>
            <div className={styles.topRuleBar}>
              <div>
                <span className={styles.ruleLabel}>Signal summary</span>
                <p>{story.summary}</p>
              </div>
              <div className={styles.ruleMeta}>
                <span>{generatedAt.slice(11, 16)} UTC sync</span>
                <span>{story.source}</span>
              </div>
            </div>
          </section>

          <section className={styles.mainGrid}>
            <div className={styles.primaryColumn}>
              <section className={styles.tradingCard}>
                <div className={styles.tradingHeader}>
                  <div>
                    <p className={styles.sectionLabel}>Signal classification</p>
                    <h2>{story.impact} impact</h2>
                  </div>
                  <span className={styles.qualityBadge}>{story.sourceQuality}</span>
                </div>

                <div className={styles.terminalStats}>
                  <div>
                    <span>Update lag</span>
                    <strong>{story.updateLag}</strong>
                  </div>
                  <div>
                    <span>Last sync</span>
                    <strong>{generatedAt.slice(11, 16)} UTC</strong>
                  </div>
                </div>
              </section>

              <section className={styles.detailCard}>
                <p className={styles.sectionLabel}>Story analysis</p>
                <div className={styles.proseBlock}>
                  {story.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className={styles.detailCard}>
                <p className={styles.sectionLabel}>Why it matters</p>
                <div className={styles.bulletList}>
                  {story.takeaways.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </section>

              <section className={styles.detailCard}>
                <p className={styles.sectionLabel}>Key evidence</p>
                <div className={styles.bulletList}>
                  {story.keyEvidence.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.sidebarColumn}>
              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Signal panel</p>
                <div className={styles.sidebarStats}>
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
                </div>
              </section>

              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Moves these forecasts</p>
                <div className={styles.relatedList}>
                  {relatedMarkets.map((market) => (
                    <article className={styles.relatedItem} key={market.slug}>
                      <span>{market.category}</span>
                      <h3>{market.title}</h3>
                      <p>{market.description}</p>
                      <div className={styles.relatedMarketMeta}>
                        <strong>{market.probability}%</strong>
                        <span>{market.move}</span>
                      </div>
                      <Link className={styles.inlineLink} href={`/markets/${market.slug}`}>
                        Open market
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}