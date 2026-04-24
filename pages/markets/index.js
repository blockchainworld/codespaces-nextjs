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
  const categoryCount = new Set(markets.map((market) => market.category)).size

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
          <section className={styles.marketHeroShell}>
            <div>
              <p className={styles.eyebrow}>Markets</p>
              <h1 className={styles.marketHeroTitle}>Live contracts priced for fast comparison.</h1>
            </div>
            <div className={styles.marketHeroStats}>
              <div>
                <span>Active</span>
                <strong>{markets.length}</strong>
              </div>
              <div>
                <span>Categories</span>
                <strong>{categoryCount}</strong>
              </div>
            </div>
          </section>

          <MarketsExplorer markets={markets} />
        </main>
      </SiteLayout>
    </>
  )
}