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
  const latestTimelineItem = market.timeline[market.timeline.length - 1]
  const leadSignal = relatedNews[0]
  const chartLabels = market.curve.map((_, index) => market.timeline[index]?.date || `T${index + 1}`)
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
            <div className={styles.heroTitleRow}>
              {market.liveMetadata?.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className={styles.heroMarketIcon} src={market.liveMetadata.icon} />
              ) : (
                <span className={styles.heroMarketFallback}>{market.category.slice(0, 1)}</span>
              )}
              <h1>{market.title}</h1>
            </div>
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
                    <p className={styles.sectionLabel}>Price discovery</p>
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

                <div className={styles.terminalStatsCompact}>
                  <div>
                    <span>Probability</span>
                    <strong>{market.probability}% yes</strong>
                  </div>
                  <div>
                    <span>Move</span>
                    <strong className={moveTone}>{market.move}</strong>
                  </div>
                  <div>
                    <span>Resolution</span>
                    <strong>{market.resolutionDate}</strong>
                  </div>
                  <div>
                    <span>Participants</span>
                    <strong>{market.participantsLabel}</strong>
                  </div>
                </div>

                <div className={styles.marketNarrativeStrip}>
                  <div>
                    <span>Why now</span>
                    <strong>{market.thesis}</strong>
                  </div>
                  <div>
                    <span>Latest repricing</span>
                    <strong>{latestTimelineItem?.title || 'Awaiting next event'}</strong>
                  </div>
                  {leadSignal ? (
                    <div>
                      <span>Lead signal</span>
                      <strong>{leadSignal.headline}</strong>
                    </div>
                  ) : null}
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
                <div className={styles.detailSectionHeader}>
                  <div>
                    <p className={styles.sectionLabel}>Why this market moved</p>
                    <h2>{market.thesis}</h2>
                  </div>
                  <span className={styles.qualityBadge}>{market.sourceQuality}</span>
                </div>

                <div className={styles.whyNowGrid}>
                  <div className={styles.ruleBlock}>
                    <p className={styles.sectionLabel}>Settlement rule</p>
                    <p className={styles.ruleBody}>{market.settlementRule}</p>
                  </div>

                  <div className={styles.driverBlock}>
                    <p className={styles.sectionLabel}>Key drivers</p>
                    <div className={styles.bulletList}> 
                      {market.keyDrivers.map((driver) => (
                        <p key={driver}>{driver}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <ProbabilityChart labels={chartLabels} points={market.curve} />

              <section className={styles.detailCard}>
                <div className={styles.detailSectionHeader}>
                  <div>
                    <p className={styles.sectionLabel}>Signal map</p>
                    <h2>Information currently linked to this contract</h2>
                  </div>
                  <Link className={styles.inlineLink} href="/news">
                    Open all signals
                  </Link>
                </div>

                <div className={styles.signalTerminalGrid}>
                  {relatedNews.map((story) => (
                    <article className={styles.signalTerminalCard} key={story.slug}>
                      <div className={styles.signalCardTopline}>
                        <span>{story.source}</span>
                        <strong>{story.signalScore}</strong>
                      </div>
                      <h3>{story.headline}</h3>
                      <p>{story.summary}</p>
                      <div className={styles.signalTerminalMeta}>
                        <span>{story.sourceQuality}</span>
                        <span>{story.updateLag}</span>
                        <span>{story.publishedAt}</span>
                      </div>
                      <Link className={styles.inlineLink} href={`/news/${story.slug}`}>
                        Open story
                      </Link>
                    </article>
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
              <section className={styles.tradeTicketCard}>
                <div className={styles.ticketHeader}>
                  <div>
                    <span className={styles.sectionLabel}>Live quote</span>
                    <h3>{market.timeline[market.timeline.length - 1]?.date || market.resolutionDate}</h3>
                  </div>
                  <span className={styles.ticketMode}>{market.liveMetadata?.overlaid ? 'Overlay' : 'Editorial'}</span>
                </div>

                <div className={styles.ticketSummaryGrid}>
                  <div>
                    <span>24h move</span>
                    <strong>{market.move}</strong>
                  </div>
                  <div>
                    <span>Volume</span>
                    <strong>{market.volumeLabel}</strong>
                  </div>
                </div>

                <div className={styles.ticketOutcomeSwitch}>
                  <button className={styles.ticketOutcomeYes} type="button">
                    Yes {market.probability}c bid
                  </button>
                  <button className={styles.ticketOutcomeNo} type="button">
                    No {noProbability}c ask
                  </button>
                </div>

                <div className={styles.ticketAmountBlock}>
                  <span>Execution</span>
                  <strong>{market.liveMetadata?.url ? 'External' : 'Offline'}</strong>
                </div>

                {market.liveMetadata?.url ? (
                  <a className={styles.tradeSubmitButton} href={market.liveMetadata.url} rel="noreferrer" target="_blank">
                    Open source market
                  </a>
                ) : (
                  <div className={styles.ticketDisclaimer}>Live execution is not connected for this contract yet.</div>
                )}

                <p className={styles.ticketDisclaimer}>
                  {market.liveMetadata?.overlaid
                    ? 'Quotes are derived from the linked live market feed and refreshed through overlay updates.'
                    : 'This contract currently uses the editorial model and local pricing assumptions.'}
                </p>
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
            </aside>
          </section>
        </main>
      </SiteLayout>
    </>
  )
}