import { backdropUrl, getMovie, posterUrl } from '../api/tmdb'
import type { BackdropSize, PosterSize } from '../api/tmdb'
import type { Movie } from '../types/movie'

// The detail hero's image sizes. The preloaders below request these exact
// URLs, so the hero finds them already in the browser cache.
export const HERO_BACKDROP_SIZE: BackdropSize = 'w1280'
export const HERO_POSTER_SIZE: PosterSize = 'w500'

// Held so each URL is requested once and the Image isn't collected mid-load
const preloaded = new Map<string, HTMLImageElement>()

function preloadImage(url: string) {
  if (preloaded.has(url)) return
  const image = new Image()
  image.src = url
  preloaded.set(url, image)
}

type HeroImages = Pick<Movie, 'backdrop_path' | 'poster_path'>

export function preloadHeroImages(movie: HeroImages) {
  if (movie.backdrop_path) {
    preloadImage(backdropUrl(movie.backdrop_path, HERO_BACKDROP_SIZE))
  }
  if (movie.poster_path) {
    preloadImage(posterUrl(movie.poster_path, HERO_POSTER_SIZE))
  }
}

// Warms the details cache. Failures are ignored: the detail page retries.
export function prefetchMovie(id: number) {
  getMovie(id).catch(() => {})
}

// Runs an action once an element has stayed on screen for DWELL_MS, so
// scrolling quickly past rows doesn't fire a request for each one. One
// observer is shared by every row and card.
const DWELL_MS = 150
const actions = new Map<Element, () => void>()
const timers = new Map<Element, number>()
let observer: IntersectionObserver | null = null

function clearTimer(element: Element) {
  window.clearTimeout(timers.get(element))
  timers.delete(element)
}

function stopWatching(element: Element) {
  clearTimer(element)
  actions.delete(element)
  observer?.unobserve(element)
}

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) {
        clearTimer(target)
      } else if (!timers.has(target)) {
        const timer = window.setTimeout(() => {
          const action = actions.get(target)
          stopWatching(target) // once is enough
          action?.()
        }, DWELL_MS)
        timers.set(target, timer)
      }
    }
  })
  return observer
}

// Returns a cleanup that stops watching the element
export function onDwell(element: Element, action: () => void): () => void {
  actions.set(element, action)
  getObserver().observe(element)
  return () => stopWatching(element)
}
