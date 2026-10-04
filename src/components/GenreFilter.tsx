import type { Genre } from '../types/movie'
import type { GenreMatch } from '../utils/movieQuery'
import styles from './GenreFilter.module.css'

interface GenreFilterProps {
  genres: Genre[]
  selected: number[]
  match: GenreMatch
  onToggle: (id: number) => void
  onClear: () => void
  onMatchChange: (match: GenreMatch) => void
}

const MATCH_OPTIONS: { value: GenreMatch; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'any', label: 'Any' },
]

function GenreFilter({
  genres,
  selected,
  match,
  onToggle,
  onClear,
  onMatchChange,
}: GenreFilterProps) {
  // Three rows that GalleryView lays out: the label, the chips, then the
  // All / Any switch with Clear
  return (
    <>
      <div className={styles.header}>
        <span id="genre-filter-label" className={styles.label}>
          Genres
        </span>
      </div>
      <div
        className={styles.filter}
        role="group"
        aria-labelledby="genre-filter-label"
      >
        {genres.map((genre) => {
          const isSelected = selected.includes(genre.id)
          return (
            <button
              key={genre.id}
              type="button"
              className={
                isSelected ? `${styles.chip} ${styles.selected}` : styles.chip
              }
              aria-pressed={isSelected}
              onClick={() => onToggle(genre.id)}
            >
              {genre.name}
            </button>
          )
        })}
      </div>
      <div className={styles.match}>
        <span id="genre-match-label" className={styles.label}>
          Match
        </span>
        <div
          className={styles.segmented}
          role="group"
          aria-labelledby="genre-match-label"
        >
          {MATCH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                option.value === match
                  ? `${styles.segment} ${styles.segmentActive}`
                  : styles.segment
              }
              aria-pressed={option.value === match}
              onClick={() => onMatchChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {/* Always rendered and only hidden, so it doesn't shift anything in
            and out. visibility: hidden also drops it from the tab order. */}
        <button
          type="button"
          className={
            selected.length > 0
              ? styles.clear
              : `${styles.clear} ${styles.hidden}`
          }
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </>
  )
}

export default GenreFilter
