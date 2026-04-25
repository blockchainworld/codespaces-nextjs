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
        <div className={styles.headerUtility}>
          <Link className={styles.utilityLink} href="/about">
            How it works
          </Link>
          <Link className={styles.utilityGhost} href="/markets">
            Log in
          </Link>
          <Link className={styles.utilityPrimary} href="/markets">
            Sign Up
          </Link>
          <button className={styles.menuButton} type="button" aria-label="Open navigation menu">
            <span />
            <span />
            <span />
          </button>
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