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
    revalidate: 300,
  }
}

export default function MarketDetailPage({ site, market, relatedNews }) {
  const noProbability = 100 - market.probability
  const moveTone = market.move.startsWith('+') ? styles.metricToneUp : styles.metricToneDown
  const quickBookRows = [
    {
      label: 'Market price',
      detail: market.volumeLabel,
      probability: market.probability,
      move: market.move,
      yesPrice: market.probability,
      noPrice: noProbability,
    },
    ...market.orderBook.yes.map((level, index) => {
      const yesPrice = Math.round(level.price * 100)

      return {
        label: `Offer ${index + 1}`,
        detail: level.size,
        probability: yesPrice,
        move: index === 0 ? market.move : `${yesPrice - market.probability > 0 ? '+' : ''}${yesPrice - market.probability} pts`,
        yesPrice,
        noPrice: 100 - yesPrice,
      }
    }),
  ].slice(0, 4)

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
            <div className={styles.marketHeaderMeta}>
              <span>{market.volumeLabel}</span>
              <span>{market.resolutionDate}</span>
              {market.liveMetadata?.overlaid ? <span>Live from {market.liveMetadata.source}</span> : null}
            </div>
          </section>

          <section className={styles.mainGrid}>
            <div className={styles.primaryColumn}>
              <section className={styles.eventSurface}>
                <div className={styles.eventSurfaceHeader}>
                  <div>
                    <p className={styles.sectionLabel}>Market</p>
                    <h2>{market.title}</h2>
                  </div>
                  <div className={styles.eventHeaderActions}>
                    <span className={styles.qualityBadge}>{market.conviction}</span>
                    <span className={styles.bookmarkGhost}>Save</span>
                  </div>
                </div>

                <div className={styles.eventQuestionMeta}>
                  <span>{market.category}</span>
                  <span>{market.sourceQuality}</span>
                  {market.liveMetadata?.overlaid ? <span>Live overlay active</span> : null}
                </div>

                <div className={styles.quickBookList}>
                  {quickBookRows.map((row) => (
                    <article className={styles.quickBookRow} key={row.label}>
                      <div className={styles.quickBookLabelBlock}>
                        <strong className={styles.quickBookLabel}>{row.label}</strong>
                        <span className={styles.quickBookDetail}>{row.detail}</span>
                      </div>
                      <div className={styles.quickBookProbability}>{row.probability}%</div>
                      <div className={`${styles.quickBookDelta} ${row.move.startsWith('+') ? styles.metricToneUp : styles.metricToneDown}`}>
                        {row.move}
                      </div>
                      <button className={styles.buyYesButton} type="button">
                        Buy Yes {row.yesPrice}c
                      </button>
                      <button className={styles.buyNoButton} type="button">
                        Buy No {row.noPrice}c
                      </button>
                    </article>
                  ))}
                </div>

                <div className={styles.eventFooterMeta}>
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
                  <div>
                    <span>Source quality</span>
                    <strong>{market.sourceQuality}</strong>
                  </div>
                </div>
              </section>

              <section className={styles.detailCard}>
                <div className={styles.sectionTabs}>
                  <span className={styles.sectionTabActive}>Rules</span>
                  <span className={styles.sectionTab}>Market Context</span>
                </div>
                <div className={styles.ruleBlock}>
                  <p className={styles.sectionLabel}>Rules</p>
                  <p className={styles.ruleBody}>{market.settlementRule}</p>
                </div>
                <div className={styles.contextBlock}>
                  <p className={styles.sectionLabel}>Market Context</p>
                  <h2>{market.thesis}</h2>
                </div>
                <div className={styles.bulletList}>
                  {market.keyDrivers.map((driver) => (
                    <p key={driver}>{driver}</p>
                  ))}
                </div>
              </section>

              <ProbabilityChart points={market.curve} />

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
              <section className={styles.tradeTicketCard}>
                <div className={styles.ticketHeader}>
                  <div>
                    <span className={styles.sectionLabel}>Trade ticket</span>
                    <h3>{market.timeline[market.timeline.length - 1]?.date || market.resolutionDate}</h3>
                  </div>
                  <span className={styles.ticketMode}>Market</span>
                </div>

                <div className={styles.ticketTabs}>
                  <button className={styles.ticketTabActive} type="button">
                    Buy
                  </button>
                  <button className={styles.ticketTab} type="button">
                    Sell
                  </button>
                </div>

                <div className={styles.ticketOutcomeSwitch}>
                  <button className={styles.ticketOutcomeYes} type="button">
                    Yes {market.probability}c
                  </button>
                  <button className={styles.ticketOutcomeNo} type="button">
                    No {noProbability}c
                  </button>
                </div>

                <div className={styles.ticketAmountBlock}>
                  <span>Amount</span>
                  <strong>$0</strong>
                </div>

                <div className={styles.ticketChipRow}>
                  {['+$1', '+$5', '+$10', '+$100', 'Max'].map((chip) => (
                    <button className={styles.ticketChip} key={chip} type="button">
                      {chip}
                    </button>
                  ))}
                </div>

                <button className={styles.tradeSubmitButton} type="button">
                  Trade
                </button>

                <p className={styles.ticketDisclaimer}>By trading, you agree to the Terms of Use.</p>
              </section>

              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Contract snapshot</p>
                <div className={styles.sidebarStatsCompact}>
                  <div>
                    <span>Conviction</span>
                    <strong>{market.conviction}</strong>
                  </div>
                  <div>
                    <span>Participants</span>
                    <strong>{market.participantsLabel}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{market.status}</strong>
                  </div>
                  <div>
                    <span>Tags</span>
                    <strong>{market.tags.join(', ')}</strong>
                  </div>
                </div>
                {market.liveMetadata?.url ? (
                  <a className={styles.inlineLink} href={market.liveMetadata.url} rel="noreferrer" target="_blank">
                    View source market
                  </a>
                ) : null}
              </section>

              <section className={styles.sidebarCard}>
                <p className={styles.sectionLabel}>Linked signals</p>
                <div className={styles.compactRelatedList}>
                  {relatedNews.map((story) => (
                    <article className={styles.signalCardCompact} key={story.slug}>
                      <div className={styles.signalCardTopline}>
                        <span>{story.source}</span>
                        <strong>{story.signalScore}</strong>
                      </div>
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