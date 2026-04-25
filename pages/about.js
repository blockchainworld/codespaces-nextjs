import Head from 'next/head'
import SiteLayout from '../components/SiteLayout'
import { getSiteContent } from '../lib/contentApi'
import styles from '../styles/listing.module.css'

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
          <section className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Methodology</p>
            <div className={styles.stackList}>
              {principles.map((item) => (
                <article className={styles.featureCard} key={item}>
                  <h2>{item}</h2>
                </article>
              ))}
            </div>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}