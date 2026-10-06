// Lets the detail page step through and return to the list it was opened from
export interface DetailNavState {
  // In the order they were shown
  ids: number[]
  // Path and query of the list or gallery
  backTo: string
  backLabel: string
}

// Location state is untyped and survives reloads, so check its shape
export function isDetailNavState(value: unknown): value is DetailNavState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Record<string, unknown>
  return (
    Array.isArray(state.ids) &&
    state.ids.every((id) => typeof id === 'number') &&
    typeof state.backTo === 'string' &&
    typeof state.backLabel === 'string'
  )
}

export function detailPath(id: number): string {
  return `/movie/${id}`
}
