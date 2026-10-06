import clsx from 'clsx'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { isDetailNavState } from '../utils/detailNav'
import styles from './Layout.module.css'

// TMDB's short logo, required by their terms
const TMDB_LOGO =
  'https://www.themoviedb.org/assets/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg'

function Layout() {
  const location = useLocation()
  const cameFrom = isDetailNavState(location.state)
    ? location.state.backLabel
    : null

  // Highlight the current view, or the view a detail page was opened from
  function ariaCurrentFor(
    path: string,
    label: string,
  ): 'page' | 'true' | undefined {
    if (location.pathname === path) return 'page'
    if (cameFrom === label) return 'true'
    return undefined
  }

  function navLink(path: string, label: string) {
    const ariaCurrent = ariaCurrentFor(path, label)
    return (
      <Link
        to={path}
        className={clsx(styles.navLink, ariaCurrent && styles.active)}
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
