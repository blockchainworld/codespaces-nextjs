import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { getSiteContent } from '../lib/contentApi'
import styles from '../styles/listing.module.css'

const architecture = [
  {
    title: 'Markets as primary objects',
    text: 'Each forecast is a first-class page with a clear question, current probability, linked evidence, and settlement rules.',
  },
  {
    title: 'News as evidence, not decoration',
    text: 'News items are stored as separate objects so one story can influence multiple forecasts without duplicating logic.',
  },
  {
    title: 'Simple static foundation',
    text: 'This prototype uses shared content modules and static generation so the information architecture is clear before introducing live data.',
  },
]

export async function getStaticProps() {
  const site = await getSiteContent()

  return {
    props: {
      site,
      principles: site.principles,
    },
  }
}

export default function AboutPage({ site, principles }) {
  return (
    <>
      <Head>
        <title>About | Predict.info</title>
        <meta
          name="description"
          content="Predict.info is a news-driven forecasting product concept built around transparent market framing and linked evidence."
        />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <p className={styles.eyebrow}>About the product</p>
            <h1>Designed to make forecasting legible.</h1>
            <p className={styles.heroText}>
              Predict.info is not meant to feel like a generic market terminal or a casino skin. The product logic is simple: every forecast should explain what the question is, why the probability moved, and which reporting triggered the change.
            </p>
          </section>

          <section className={styles.twoColumnSection}>
            <div className={styles.sectionCard}>
              <p className={styles.sectionLabel}>Principles</p>
              <div className={styles.stackList}>
                {principles.map((item) => (
                  <article className={styles.featureCard} key={item}>
                    <h2>{item}</h2>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.sectionCard}>
              <p className={styles.sectionLabel}>Architecture</p>
              <div className={styles.stackList}>
                {architecture.map((item) => (
                  <article className={styles.featureCard} key={item.title}>
                    <h2>{item.title}</h2>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.bannerCard}>
            <div>
              <p className={styles.sectionLabel}>Next steps</p>
              <h2>The current codebase is ready for real data sources.</h2>
            </div>
            <p>
              The next clean upgrade is to replace the shared content module with a CMS or market feed while preserving the same page model. Start with <Link href="/markets">Markets</Link> and <Link href="/news">News</Link> before layering on auth, search, and live pricing.
            </p>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}