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
          content="Active prediction markets with linked evidence and explicit settlement rules."
        />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <p className={styles.eyebrow}>Markets desk</p>
            <h1>Active markets organized for fast scanning and direct comparison.</h1>
            <p className={styles.heroText}>
              Filter by desk, sort by movement or conviction, and open the full market record with rules and linked signals.
            </p>
          </section>

          <MarketsExplorer markets={markets} />
        </main>
      </SiteLayout>
    </>
  )
}