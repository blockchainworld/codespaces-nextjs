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
    revalidate: 300,
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
          <MarketsExplorer markets={markets} />
        </main>
      </SiteLayout>
    </>
  )
}