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
  const highImpactCount = newsStories.filter((story) => story.impact === 'High').length

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
          <section className={styles.signalHeroShell}>
            <div>
              <p className={styles.eyebrow}>Signal feed</p>
              <h1 className={styles.signalHeroTitle}>Evidence that moves active contracts.</h1>
            </div>
            <div className={styles.signalHeroStats}>
              <div>
                <span>Signals</span>
                <strong>{newsStories.length}</strong>
              </div>
              <div>
                <span>High impact</span>
                <strong>{highImpactCount}</strong>
              </div>
              <div>
                <span>Sync</span>
                <strong>{generatedAt.slice(11, 16)} UTC</strong>
              </div>
            </div>
          </section>

          <NewsDesk newsStories={newsStories} />
        </main>
      </SiteLayout>
    </>
  )
}