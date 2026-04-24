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

  return (
    <div className={styles.siteFrame}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark} aria-hidden="true" />
          {site.brand}
        </Link>
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
        <div className={styles.headerActions}>
          <span className={styles.metaPill}>Live</span>
          <Link className={styles.headerCta} href="/markets">
            Browse forecasts
          </Link>
        </div>
      </header>

      {children}

      <footer className={styles.footer}>
        <div>
          <p className={styles.footerLabel}>{site.brand}</p>
          <p className={styles.footerText}>{site.footerNote}</p>
        </div>
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