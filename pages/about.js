import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { getSiteContent } from '../lib/contentApi'
import styles from '../styles/listing.module.css'

const architecture = [
  {
    title: 'Markets as core records',
    text: 'Each market has a formal question, current pricing state, settlement rule, and linked evidence trail.',
  },
  {
    title: 'Signals as linked evidence',
    text: 'A single signal can map to multiple markets, which keeps source relationships explicit instead of duplicating commentary.',
  },
  {
    title: 'Data layer ready for live feeds',
    text: 'The current file-based model keeps the page system clean and can be replaced by a CMS, database, or market feed without changing the interface model.',
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
        <title>Methodology | Predict.info</title>
        <meta
          name="description"
          content="Methodology, market structure, and evidence standards for Predict.info."
        />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <p className={styles.eyebrow}>Methodology</p>
            <h1>Market structure, evidence standards, and resolution logic.</h1>
            <p className={styles.heroText}>
              Users should be able to inspect the question, resolution rule, linked evidence, and source quality behind every active market.
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
              <p className={styles.sectionLabel}>Data operations</p>
              <h2>Content, signals, and markets are structured for live integration.</h2>
            </div>
            <p>
              The current page model supports a live editorial backend or market feed across <Link href="/markets">Markets</Link> and <Link href="/news">News</Link> without changing the user-facing structure.
            </p>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}