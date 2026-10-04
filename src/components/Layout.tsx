import { Link, Outlet, useLocation } from 'react-router-dom'
import { isDetailNavState } from '../utils/detailNav'
import styles from './Layout.module.css'

// TMDB's official short logo, from their logos & attribution page. Their
// terms require it, kept less prominent than the Cineview wordmark.
const TMDB_LOGO =
  'https://www.themoviedb.org/assets/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg'

function Layout() {
  // On a detail page, keep the view it was opened from highlighted, using
  // the same label as its Back link. Opened straight from a URL there's no
  // such view, so nothing is highlighted.
  const location = useLocation()
  const cameFrom = isDetailNavState(location.state)
    ? location.state.backLabel
    : null

  // aria-current matches the highlight, so it isn't conveyed by looks
  // alone: "page" on the view itself, "true" for the view a detail page
  // was opened from (it's the current section, not the current page)
  function current(path: string, label: string): 'page' | 'true' | undefined {
    if (location.pathname === path) return 'page'
    if (cameFrom === label) return 'true'
    return undefined
  }

  function navLink(path: string, label: string) {
    const ariaCurrent = current(path, label)
    return (
      <Link
        to={path}
        className={
          ariaCurrent ? `${styles.navLink} ${styles.active}` : styles.navLink
        }
        aria-current={ariaCurrent}
      >
        {label}
      </Link>
    )
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand}>
            Cineview
          </Link>
          <nav className={styles.nav} aria-label="Views">
            {navLink('/', 'List')}
            {navLink('/gallery', 'Gallery')}
          </nav>
        </div>
      </header>
      <div className={styles.content}>
        <Outlet />
      </div>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <a
            className={styles.tmdb}
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={TMDB_LOGO} alt="TMDB" width={92} height={12} />
          </a>
          {/* Wording required by TMDB's terms of use */}
          <p className={styles.notice}>
            This website uses TMDB and the TMDB APIs but is not endorsed,
            certified, or otherwise approved by TMDB.
          </p>
        </div>
      </footer>
    </>
  )
}

export default Layout
