import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/siteLayout.module.css'

function isActive(pathname, href) {
  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function SiteLayout({ children, site }) {
  const router = useRouter()
  const navigation = site.navigation || []
  const metrics = site.metrics || []

  return (
    <div className={styles.siteFrame}>
      <header className={styles.header}>
        <div className={styles.headerPrimary}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandMark} aria-hidden="true" />
            {site.brand}
          </Link>
          <Link className={styles.searchBar} href="/markets">
            <span className={styles.searchIcon} aria-hidden="true">
              ⌕
            </span>
            <span className={styles.searchPlaceholder}>Search markets, topics, signals...</span>
          </Link>
        </div>
      </header>

      <div className={styles.categoryBar}>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              className={isActive(router.pathname, item.href) ? styles.navLinkActive : styles.navLink}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <section className={styles.commandBar} aria-label="Platform status and routing">
        <div className={styles.commandBarMeta}>
          <span className={styles.commandBarLabel}>Platform state</span>
          {metrics.map((metric) => (
            <div className={styles.commandMetric} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>

        <div className={styles.commandBarActions}>
          <Link className={styles.commandActionPrimary} href="/markets">
            Open market board
          </Link>
          <Link className={styles.commandAction} href="/news">
            Open signal desk
          </Link>
        </div>
      </section>

      {children}

      <footer className={styles.footer}>
        <p className={styles.footerLabel}>{site.brand}</p>
        <div className={styles.footerLinks}>
          {navigation.map((item) => (
            <Link className={styles.footerLink} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  )
}