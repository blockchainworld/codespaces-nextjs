import Head from 'next/head'
import Link from 'next/link'
import ProbabilityChart from '../../components/ProbabilityChart'
import SiteLayout from '../../components/SiteLayout'
import {
  getMarketBySlug,
  getMarketSlugs,
  getNewsForMarket,
  getSiteContent,
} from '../../lib/contentApi'
import styles from '../../styles/detail.module.css'

export async function getStaticPaths() {
  const marketSlugs = await getMarketSlugs()

  return {
    paths: marketSlugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const [site, market, relatedNews] = await Promise.all([
    getSiteContent(),
    getMarketBySlug(params.slug),
    getNewsForMarket(params.slug),
  ])

  return {
    props: {
      site,
      market,
      relatedNews,
    },
  }
}

export default function MarketDetailPage({ site, market, relatedNews }) {
  const noProbability = 100 - market.probability

  return (
    <>
      <Head>
        <title>{market.title} | Predict.info</title>
        <meta name="description" content={market.description} />
      </Head>

      <SiteLayout site={site}>
        <main className={styles.pageShell}>
          <section className={styles.heroCard}>
            <div className={styles.heroTopline}>
              <div className={styles.heroMetaCluster}>
                <p className={styles.eyebrow}>{market.category}</p>
                <span className={styles.headerStatusPill}>{market.status}</span>
              </div>
              <Link className={styles.backLink} href="/markets">
                Back to all markets
              </Link>
            </div>
            <h1>{market.title}</h1>
            <div className={styles.heroStats}>
              <div>
                <span className={styles.statLabel}>Yes</span>
                <strong>{market.probability}%</strong>
              </div>
              <div>
                <span className={styles.statLabel}>No</span>
                <strong>{noProbability}%</strong>
              </div>
              <div>
                <span className={styles.statLabel}>24h move</span>
                <strong>{market.move}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Resolves</span>
                <strong>{market.resolutionDate}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Volume</span>
                <strong>{market.volumeLabel}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Depth</span>
                <strong>{market.liquidityLabel}</strong>
              </div>
              <div>
                <span className={styles.statLabel}>Source quality</span>
                <strong>{market.sourceQuality}</strong>
              </div>
            </div>
            <div className={styles.topRuleBar}>
              <div>
                <span className={styles.ruleLabel}>Settlement rule</span>
                <p>{market.settlementRule}</p>
              </div>
              <div className={styles.ruleMeta}>
                <span>{market.conviction} conviction</span>
                <span>{market.participantsLabel}</span>
              </div>
            </div>
          </section>

          <section className={styles.mainGrid}>
            <div className={styles.primaryColumn}>
              <section className={styles.tradingCard}>
                <div className={styles.tradingHeader}>
                  <div>
                    <p className={styles.sectionLabel}>Price ladder</p>
                    <h2>Yes / No</h2>
                  </div>
                  <span className={styles.qualityBadge}>{market.conviction} conviction</span>
                </div>

                <div className={styles.sideBySideGrid}>
                  <article className={styles.sidePanel}>
                    <span className={styles.sideLabel}>Yes</span>
                    <strong>{market.probability}%</strong>
                    <p>{market.yesLabel}</p>
                    <div className={styles.depthList}>
                      {market.orderBook.yes.map((level) => (
                        <div className={styles.depthRow} key={`${market.slug}-yes-${level.price}`}>
                          <span>{Math.round(level.price * 100)}c</span>
                          <strong>{level.size}</strong>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className={styles.sidePanelMuted}>
                    <span className={styles.sideLabel}>No</span>
                    <strong>{noProbability}%</strong>
                    <p>{market.noLabel}</p>
                    <div className={styles.depthList}>
                      {market.orderBook.no.map((level) => (
                        <div className={styles.depthRow} key={`${market.slug}-no-${level.price}`}>
                          <span>{Math.round(level.price * 100)}c</span>
                          <strong>{level.size}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <div className={styles.terminalStats}>
                  <div>
                    <span>Depth</span>
                    <strong>{market.liquidityLabel}</strong>
                  </div>
                  <div>
                    <span>24h volume</span>
                    <strong>{market.volumeLabel}</strong>
                  </div>
                  <div>
                    <span>Participants</span>
                    <strong>{market.participantsLabel}</strong>
                  </div>
                </div>
              </section>

              <ProbabilityChart points={market.curve} />

              <section className={styles.detailCard}>
                <p className={styles.sectionLabel}>Current thesis</p>
                <h2>{market.thesis}</h2>
                <div className={styles.bulletList}>
                  {market.keyDrivers.map((driver) => (
                    <p key={driver}>{driver}</p>
                  ))}
                </div>
              </section>

              <section className={styles.detailCard}>
                <p className={styles.sectionLabel}>Evidence timeline</p>
                <div className={styles.timelineList}>
                  {market.timeline.map((item) => (
                    <article className={styles.timelineItem} key={`${item.date}-${item.title}`}>
                      <span>{item.date}</span>
                      <div>
                        <div className={styles.timelineMetaRow}>
                          <strong className={styles.timelineImpact}>{item.impact} impact</strong>
                          <em className={styles.timelineSourceQuality}>{item.sourceQuality}</em>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                        {item.relatedNewsSlug ? (
                          <Link className={styles.inlineLink} href={`/news/${item.relatedNewsSlug}`}>
                            Read linked news input
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.sidebarColumn}>
              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Market stats</p>
                <div className={styles.sidebarStats}>
                  <div>
                    <span>Conviction</span>
                    <strong>{market.conviction}</strong>
                  </div>
                  <div>
                    <span>Source quality</span>
                    <strong>{market.sourceQuality}</strong>
                  </div>
                  <div>
                    <span>Participants</span>
                    <strong>{market.participantsLabel}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{market.status}</strong>
                  </div>
                </div>
              </section>

              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Tags</p>
                <div className={styles.tagRow}>
                  {market.tags.map((tag) => (
                    <span className={styles.tag} key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Related news</p>
                <div className={styles.relatedList}>
                  {relatedNews.map((story) => (
                    <article className={styles.relatedItem} key={story.slug}>
                      <span>{story.source}</span>
                      <h3>{story.headline}</h3>
                      <p>{story.summary}</p>
                      <Link className={styles.inlineLink} href={`/news/${story.slug}`}>
                        Open story
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}