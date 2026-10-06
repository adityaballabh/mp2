import { backdropUrl, posterUrl } from '../api/tmdb'

// Preloads and the hero share these so preloaded URLs hit the browser cache
export function heroBackdropUrl(path: string): string {
  return backdropUrl(path, 'w1280')
}

export function heroPosterUrl(path: string): string {
  return posterUrl(path, 'w500')
}
