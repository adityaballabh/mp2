import type { SortKey, SortOrder } from '../utils/movieQuery'
import SortMenu from './SortMenu'
import styles from './ListControls.module.css'

const ORDER_NAMES: Record<SortOrder, string> = {
  asc: 'ascending',
  desc: 'descending',
}

interface ListControlsProps {
  query: string
  sortKey: SortKey
  order: SortOrder
  onQueryChange: (query: string) => void
  onSortKeyChange: (key: SortKey) => void
  onOrderChange: (order: SortOrder) => void
}

function ListControls({
  query,
  sortKey,
  order,
  onQueryChange,
  onSortKeyChange,
  onOrderChange,
}: ListControlsProps) {
  const nextOrder = order === 'asc' ? 'desc' : 'asc'

  return (
    <div className={styles.controls}>
      <span className={styles.searchWrap}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          className={styles.search}
          type="search"
          placeholder="Search titles"
          aria-label="Search titles"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </span>
      <SortMenu value={sortKey} onChange={onSortKeyChange} />
      <button
        className={styles.order}
        type="button"
        onClick={() => onOrderChange(nextOrder)}
        aria-label={`Sorted ${ORDER_NAMES[order]}. Switch to ${ORDER_NAMES[nextOrder]}`}
      >
        {order === 'asc' ? '↑ Ascending' : '↓ Descending'}
      </button>
    </div>
  )
}

export default ListControls
