import Head from 'next/head'
import NewsDesk from '../../components/NewsDesk'
import SiteLayout from '../../components/SiteLayout'
import { getGeneratedAt, getNewsStories, getSiteContent } from '../../lib/contentApi'
import styles from '../../styles/listing.module.css'

export async function getStaticProps() {
  const [site, newsStories] = await Promise.all([getSiteContent(), getNewsStories()])

  return {
    props: {
      generatedAt: getGeneratedAt(),
      site,
      newsStories,
    },
    revalidate: 300,
  }
}

export default function NewsPage({ site, newsStories, generatedAt }) {
  return (
    <>
      <Head>
        <title>News | Predict.info</title>
        <meta
          name="description"
          content="Source-level signals and reporting mapped directly to active markets."
        />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <p className={styles.eyebrow}>Signals desk</p>
            <h1>High-signal reporting mapped directly to market repricing.</h1>
            <p className={styles.heroText}>
              Review source, urgency, impact, and quality before following a signal into the market.
            </p>
            <div className={styles.heroMetadataRow}>
              <div className={styles.heroMetadataCard}>
                <span>Signals tracked</span>
                <strong>{newsStories.length}</strong>
              </div>
              <div className={styles.heroMetadataCard}>
                <span>Latest sync</span>
                <strong>{generatedAt.slice(11, 16)} UTC</strong>
              </div>
              <div className={styles.heroMetadataCard}>
                <span>Refresh cadence</span>
                <strong>5 min refresh</strong>
              </div>
            </div>
          </section>

          <NewsDesk newsStories={newsStories} />
        </main>
      </SiteLayout>
    </>
  )
}