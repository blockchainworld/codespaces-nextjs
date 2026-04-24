import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../../components/SiteLayout'
import { getNewsStories, getSiteContent } from '../../lib/contentApi'
import styles from '../../styles/listing.module.css'

export async function getStaticProps() {
  const [site, newsStories] = await Promise.all([getSiteContent(), getNewsStories()])

  return {
    props: {
      site,
      newsStories,
    },
  }
}

export default function NewsPage({ site, newsStories }) {
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
            <h1>Source reporting mapped directly to market repricing.</h1>
            <p className={styles.heroText}>
              The news layer is not a separate blog. It is the reasoning surface that explains why the probability changed.
            </p>
          </section>

          <section className={styles.newsList}>
            {newsStories.map((story) => (
              <article className={styles.newsCard} key={story.slug}>
                <div className={styles.marketHeader}>
                  <p className={styles.sectionLabel}>{story.source}</p>
                  <span className={styles.dateLabel}>{story.publishedAt}</span>
                </div>
                <h2>{story.headline}</h2>
                <p>{story.summary}</p>
                <Link className={styles.inlineLink} href={`/news/${story.slug}`}>
                  Open story detail
                </Link>
              </article>
            ))}
          </section>
        </main>
      </SiteLayout>
    </>
  )
}