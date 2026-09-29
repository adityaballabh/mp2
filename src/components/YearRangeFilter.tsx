import { useState } from 'react'
import type { FocusEvent } from 'react'
import styles from './YearRangeFilter.module.css'

export interface YearRange {
  from: number
  to: number
}

interface YearRangeFilterProps {
  fromYear: number | null // null = open, shown as minYear
  toYear: number | null // null = open, shown as maxYear
  minYear: number
  maxYear: number
  // Only ever called with from <= to
  onChange: (range: YearRange) => void
}

// Digits only, at most 4, so the field can't hold anything but a year
function toYearInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4)
}

function isComplete(draft: string): boolean {
  return draft.length === 4
}

function isIncomplete(draft: string): boolean {
  return draft.length > 0 && draft.length < 4
}

// Put the caret after the year instead of wherever the click landed. Deferred
// so it runs after the browser has placed the caret for the click.
function moveCaretToEnd(event: FocusEvent<HTMLInputElement>) {
  const input = event.currentTarget
  setTimeout(() => {
    input.setSelectionRange(input.value.length, input.value.length)
  })
}

function YearRangeFilter({
  fromYear,
  toYear,
  minYear,
  maxYear,
  onChange,
}: YearRangeFilterProps) {
  const appliedFrom = fromYear ?? minYear
  const appliedTo = toYear ?? maxYear

  // What's in each box while typing. A box only counts once it holds a full
  // 4-digit year, and a range is only applied when from <= to, so the drafts
  // can differ from the applied range.
  const [fromDraft, setFromDraft] = useState(String(appliedFrom))
  const [toDraft, setToDraft] = useState(String(appliedTo))

  // Re-sync the boxes when the applied range changes from outside, e.g.
  // back/forward navigation changing the URL
  const appliedKey = `${appliedFrom}|${appliedTo}`
  const [synced, setSynced] = useState(appliedKey)
  if (synced !== appliedKey) {
    setSynced(appliedKey)
    setFromDraft(String(appliedFrom))
    setToDraft(String(appliedTo))
  }

  // The range the boxes describe. A box that's empty or half-typed keeps its
  // applied year.
  function rangeFor(from: string, to: string): YearRange {
    return {
      from: isComplete(from) ? Number(from) : appliedFrom,
      to: isComplete(to) ? Number(to) : appliedTo,
    }
  }

  function apply(from: string, to: string) {
    const range = rangeFor(from, to)
    if (range.from <= range.to) onChange(range)
  }

  // Leaving a box empty opens that end of the range again; leaving it
  // half-typed puts back its applied year. A reversed range stays in the
  // boxes, with its error, until the user fixes it.
  function handleFromBlur() {
    if (fromDraft === '') {
      setFromDraft(String(minYear))
      apply(String(minYear), toDraft)
    } else if (isIncomplete(fromDraft)) {
      setFromDraft(String(appliedFrom))
    }
  }

  function handleToBlur() {
    if (toDraft === '') {
      setToDraft(String(maxYear))
      apply(fromDraft, String(maxYear))
    } else if (isIncomplete(toDraft)) {
      setToDraft(String(appliedTo))
    }
  }

  const drafted = rangeFor(fromDraft, toDraft)
  const reversed = drafted.from > drafted.to
  const fromIncomplete = isIncomplete(fromDraft)
  const toIncomplete = isIncomplete(toDraft)

  let hint = ''
  if (fromIncomplete || toIncomplete) hint = 'Enter a 4-digit year'
  else if (reversed) hint = '“To” year must be the same as or after “From” year'

  return (
    <div className={styles.range}>
      <span id="year-range-label">Released</span>
      <div
        className={styles.fields}
        role="group"
        aria-labelledby="year-range-label"
      >
        <input
          className={styles.year}
          type="text"
          inputMode="numeric"
          aria-label="From year"
          value={fromDraft}
          aria-invalid={fromIncomplete || reversed}
          aria-describedby="year-range-hint"
          onFocus={moveCaretToEnd}
          onChange={(event) => {
            const draft = toYearInput(event.target.value)
            setFromDraft(draft)
            if (isComplete(draft)) apply(draft, toDraft)
          }}
          onBlur={handleFromBlur}
        />
        <span aria-hidden="true">–</span>
        <input
          className={styles.year}
          type="text"
          inputMode="numeric"
          aria-label="To year"
          value={toDraft}
          aria-invalid={toIncomplete || reversed}
          aria-describedby="year-range-hint"
          onFocus={moveCaretToEnd}
          onChange={(event) => {
            const draft = toYearInput(event.target.value)
            setToDraft(draft)
            if (isComplete(draft)) apply(fromDraft, draft)
          }}
          onBlur={handleToBlur}
        />
      </div>
      <span
        id="year-range-hint"
        className={styles.hint}
        role="alert"
        aria-live="polite"
      >
        {hint}
      </span>
    </div>
  )
}

export default YearRangeFilter
