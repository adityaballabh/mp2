import clsx from 'clsx'
import { useId } from 'react'
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
  const filterLabelId = useId()
  const matchLabelId = useId()

  // Three rows for GalleryView to lay out
  return (
    <>
      <div className={styles.header}>
        <span id={filterLabelId} className={styles.label}>
          Genres
        </span>
      </div>
      <div
        className={styles.filter}
        role="group"
        aria-labelledby={filterLabelId}
      >
        {genres.map((genre) => {
          const isSelected = selected.includes(genre.id)
          return (
            <button
              key={genre.id}
              type="button"
              className={clsx(styles.chip, isSelected && styles.selected)}
              aria-pressed={isSelected}
              onClick={() => onToggle(genre.id)}
            >
              {genre.name}
            </button>
          )
        })}
      </div>
      <div className={styles.match}>
        <span id={matchLabelId} className={styles.label}>
          Match
        </span>
        <div
          className={styles.segmented}
          role="group"
          aria-labelledby={matchLabelId}
        >
          {MATCH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={clsx(
                styles.segment,
                option.value === match && styles.segmentActive,
              )}
              aria-pressed={option.value === match}
              onClick={() => onMatchChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {/* Hidden instead of removed so nothing shifts */}
        <button
          type="button"
          className={clsx(styles.clear, selected.length === 0 && styles.hidden)}
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </>
  )
}

export default GenreFilter
