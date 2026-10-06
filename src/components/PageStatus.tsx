import type { ReactNode } from 'react'
import styles from '../styles/page.module.css'

function PageStatus({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <p className={styles.status}>{children}</p>
    </main>
  )
}

export default PageStatus
