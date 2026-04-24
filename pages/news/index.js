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
          content="Review the source reporting that moves forecast probabilities across Predict.info markets."
        />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <p className={styles.eyebrow}>Evidence stream</p>
            <h1>Signal intelligence mapped directly to market repricing.</h1>
            <p className={styles.heroText}>
              This is not a blog feed. It is the signal layer: sources, urgency, impact, and update quality presented in a way that helps you decide which inputs deserve immediate attention.
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
                <strong>5 min ISR</strong>
              </div>
            </div>
          </section>

          <NewsDesk newsStories={newsStories} />
        </main>
      </SiteLayout>
    </>
  )
}