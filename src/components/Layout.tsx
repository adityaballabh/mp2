import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
}

function Layout() {
  return (
    <>
      <header className={styles.header}>
        <span className={styles.brand}>Top Rated</span>
        <nav className={styles.nav}>
          <NavLink to="/" end className={navClass}>
            List
          </NavLink>
          <NavLink to="/gallery" className={navClass}>
            Gallery
          </NavLink>
        </nav>
      </header>
      <Outlet />
      <footer className={styles.footer}>
        Movie data and images from TMDB. This product uses the TMDB API but is
        not endorsed or certified by TMDB.
      </footer>
    </>
  )
}

export default Layout
