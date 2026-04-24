import Head from 'next/head'
import MarketsExplorer from '../../components/MarketsExplorer'
import SiteLayout from '../../components/SiteLayout'
import { getMarkets, getSiteContent } from '../../lib/contentApi'
import styles from '../../styles/listing.module.css'

export async function getStaticProps() {
  const [site, markets] = await Promise.all([getSiteContent(), getMarkets()])

  return {
    props: {
      site,
      markets,
    },
  }
}

export default function MarketsPage({ site, markets }) {
  return (
    <>
      <Head>
        <title>Markets | Predict.info</title>
        <meta
          name="description"
          content="Browse macro, technology, and energy forecasts with linked evidence and explicit settlement rules."
        />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <p className={styles.eyebrow}>Forecast library</p>
            <h1>Live questions organized for fast scanning and stronger judgment.</h1>
            <p className={styles.heroText}>
              Browse active markets by category, sort for what matters, and move from headline to probability to source trail without losing context.
            </p>
          </section>

          <MarketsExplorer markets={markets} />
        </main>
      </SiteLayout>
    </>
  )
}