import Head from 'next/head'
import Link from 'next/link'
import ProbabilityChart from '../../components/ProbabilityChart'
import SiteLayout from '../../components/SiteLayout'
import {
  getMarketBySlug,
  getMarketSlugs,
  getNewsForMarket,
  getSiteContent,
} from '../../lib/contentApi'
import styles from '../../styles/detail.module.css'

export async function getStaticPaths() {
  const marketSlugs = await getMarketSlugs()

  return {
    paths: marketSlugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const [site, market, relatedNews] = await Promise.all([
    getSiteContent(),
    getMarketBySlug(params.slug),
    getNewsForMarket(params.slug),
  ])

  return {
    props: {
      site,
      market,
      relatedNews,
    },
  }
}

export default function MarketDetailPage({ site, market, relatedNews }) {
  return (
    <>
      <Head>
        <title>{market.title} | Predict.info</title>
        <meta name="description" content={market.description} />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <div className={styles.heroTopline}>
              <p className={styles.eyebrow}>{market.category}</p>
              <Link className={styles.backLink} href="/markets">
                Back to all markets
              </Link>
            </div>
            <h1>{market.title}</h1>
            <p className={styles.heroText}>{market.description}</p>
            <div className={styles.heroStats}>
              <div>
                <span className={styles.statLabel}>Current probability</span>
                <strong>{market.probability}%</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Recent move</span>
                <strong>{market.move}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Resolution date</span>
                <strong>{market.resolutionDate}</strong>
              </div>
            </div>
          </section>

          <section className={styles.mainGrid}>
            <div className={styles.primaryColumn}>
              <ProbabilityChart points={market.curve} />

              <section className={styles.detailCard}>
                <p className={styles.sectionLabel}>Current thesis</p>
                <h2>{market.thesis}</h2>
                <div className={styles.bulletList}>
                  {market.keyDrivers.map((driver) => (
                    <p key={driver}>{driver}</p>
                  ))}
                </div>
              </section>

              <section className={styles.detailCard}>
                <p className={styles.sectionLabel}>Evidence timeline</p>
                <div className={styles.timelineList}>
                  {market.timeline.map((item) => (
                    <article className={styles.timelineItem} key={`${item.date}-${item.title}`}>
                      <span>{item.date}</span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                        {item.relatedNewsSlug ? (
                          <Link className={styles.inlineLink} href={`/news/${item.relatedNewsSlug}`}>
                            Read linked news input
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.sidebarColumn}>
              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Settlement rule</p>
                <p>{market.settlementRule}</p>
              </section>

              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Tags</p>
                <div className={styles.tagRow}>
                  {market.tags.map((tag) => (
                    <span className={styles.tag} key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Related news</p>
                <div className={styles.relatedList}>
                  {relatedNews.map((story) => (
                    <article className={styles.relatedItem} key={story.slug}>
                      <span>{story.source}</span>
                      <h3>{story.headline}</h3>
                      <p>{story.summary}</p>
                      <Link className={styles.inlineLink} href={`/news/${story.slug}`}>
                        Open story
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