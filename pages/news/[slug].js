import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../../components/SiteLayout'
import {
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
      site,
      story,
      relatedMarkets,
    },
  }
}

export default function NewsDetailPage({ site, story, relatedMarkets }) {
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
              <p className={styles.eyebrow}>{story.source}</p>
              <Link className={styles.backLink} href="/news">
                Back to all news
              </Link>
            </div>
            <h1>{story.headline}</h1>
            <p className={styles.heroText}>{story.summary}</p>
            <div className={styles.heroStats}>
              <div>
                <span className={styles.statLabel}>Published</span>
                <strong>{story.publishedAt}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Related markets</span>
                <strong>{relatedMarkets.length}</strong>
              </div>
            </div>
          </section>

          <section className={styles.mainGrid}>
            <div className={styles.primaryColumn}>
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
            </div>

            <aside className={styles.sidebarColumn}>
              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Moves these forecasts</p>
                <div className={styles.relatedList}>
                  {relatedMarkets.map((market) => (
                    <article className={styles.relatedItem} key={market.slug}>
                      <span>{market.category}</span>
                      <h3>{market.title}</h3>
                      <p>{market.description}</p>
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