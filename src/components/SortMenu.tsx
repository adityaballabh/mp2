import clsx from 'clsx'
import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { SORT_OPTIONS } from '../utils/movieQuery'
import type { SortKey } from '../utils/movieQuery'
import styles from './SortMenu.module.css'

interface SortMenuProps {
  value: SortKey
  onChange: (key: SortKey) => void
}

// Custom listbox to match the other controls, with select-only combobox keys
function SortMenu({ value, onChange }: SortMenuProps) {
  const id = useId()
  const labelId = `${id}-label`
  const listId = `${id}-list`
  const optionId = (index: number) => `${id}-option-${index}`

  const selectedIndex = SORT_OPTIONS.findIndex((option) => option.key === value)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(selectedIndex)

  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  function openMenu() {
    setActiveIndex(selectedIndex)
    setOpen(true)
  }

  function close(returnFocus: boolean) {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  function choose(index: number) {
    onChange(SORT_OPTIONS[index].key)
    close(true)
  }

  // Focus the list once it's open, so arrow keys reach it
  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [open])

  function handleButtonKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu()
    }
  }

  function handleListKey(event: KeyboardEvent<HTMLUListElement>) {
    const last = SORT_OPTIONS.length - 1
    switch (event.key) {
      case 'ArrowDown':
        setActiveIndex((index) => Math.min(index + 1, last))
        break
      case 'ArrowUp':
        setActiveIndex((index) => Math.max(index - 1, 0))
        break
      case 'Home':
        setActiveIndex(0)
        break
      case 'End':
        setActiveIndex(last)
        break
      case 'Enter':
      case ' ':
        choose(activeIndex)
        break
      case 'Escape':
        close(true)
        break
      case 'Tab':
        // Return before preventDefault so Tab still moves focus
        setOpen(false)
        return
      default:
        return
    }
    event.preventDefault()
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <span id={labelId} className={styles.label}>
        Sort by
      </span>
      <div className={styles.anchor}>
        <button
          ref={buttonRef}
          type="button"
          className={clsx(styles.button, open && styles.open)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={`${labelId} ${id}-value`}
          onClick={() => (open ? close(false) : openMenu())}
          onKeyDown={handleButtonKey}
        >
          <span id={`${id}-value`}>{SORT_OPTIONS[selectedIndex].label}</span>
          <svg
            className={styles.chevron}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {open && (
          <ul
            ref={listRef}
            id={listId}
            className={styles.list}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={labelId}
            aria-activedescendant={optionId(activeIndex)}
            onKeyDown={handleListKey}
          >
            {SORT_OPTIONS.map((option, index) => {
              const selected = index === selectedIndex
              return (
                <li
                  key={option.key}
                  id={optionId(index)}
                  className={clsx(
                    styles.option,
                    index === activeIndex && styles.active,
                  )}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => choose(index)}
                >
                  {option.label}
                  {/* Hidden instead of removed so every row is as wide */}
                  <svg
                    className={clsx(styles.check, !selected && styles.hidden)}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SortMenu
