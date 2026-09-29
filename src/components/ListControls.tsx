import { SORT_OPTIONS, isSortKey } from '../utils/movieQuery'
import type { SortKey, SortOrder } from '../utils/movieQuery'
import styles from './ListControls.module.css'

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
      <input
        className={styles.search}
        type="search"
        placeholder="Search titles…"
        aria-label="Search titles"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <label className={styles.sortLabel}>
        Sort by
        <select
          className={styles.select}
          value={sortKey}
          onChange={(event) => {
            if (isSortKey(event.target.value)) onSortKeyChange(event.target.value)
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        className={styles.order}
        type="button"
        onClick={() => onOrderChange(nextOrder)}
        aria-label={`Sorted ${order === 'asc' ? 'ascending' : 'descending'}. Switch to ${nextOrder === 'asc' ? 'ascending' : 'descending'}`}
      >
        {order === 'asc' ? '↑ Ascending' : '↓ Descending'}
      </button>
    </div>
  )
}

export default ListControls
