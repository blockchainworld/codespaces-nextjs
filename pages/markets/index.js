import Head from 'next/head'
import Link from 'next/link'
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
            <h1>Live questions built for evidence-led navigation.</h1>
            <p className={styles.heroText}>
              These markets are structured around answerable questions, visible repricing, and direct links back to the stories changing the odds.
            </p>
          </section>

          <section className={styles.cardGrid}>
            {markets.map((market) => (
              <article className={styles.marketCard} key={market.slug}>
                <div className={styles.marketHeader}>
                  <p className={styles.sectionLabel}>{market.category}</p>
                  <span className={styles.move}>{market.move}</span>
                </div>
                <h2>{market.title}</h2>
                <div className={styles.probability}>{market.probability}%</div>
                <p>{market.description}</p>
                <div className={styles.tagRow}>
                  {market.tags.map((tag) => (
                    <span className={styles.tag} key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <Link className={styles.inlineLink} href={`/markets/${market.slug}`}>
                  Open market detail
                </Link>
              </article>
            ))}
          </section>
        </main>
      </SiteLayout>
    </>
  )
}