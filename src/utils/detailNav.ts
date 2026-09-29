// Carried in router location state when opening a movie, so the detail
// page's previous/next buttons walk the exact list the user clicked from
// (with its search, sort and filters) and "Back" returns to it.
export interface DetailNavState {
  ids: number[] // movie ids in the order they were shown
  backTo: string // path + query of the list or gallery
  backLabel: string // e.g. "List"
}

// Location state is untyped (and survives reloads), so check its shape
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
