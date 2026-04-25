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
          <NewsDesk generatedAt={generatedAt} newsStories={newsStories} />
        </main>
      </SiteLayout>
    </>
  )
}