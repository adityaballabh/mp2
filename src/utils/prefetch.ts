import { getMovie } from '../api/tmdb'
import type { Movie } from '../types/movie'
import { heroBackdropUrl, heroPosterUrl } from './heroImages'

// Keep each Image so its URL is requested once and it isn't collected mid-load
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
    preloadImage(heroBackdropUrl(movie.backdrop_path))
  }
  if (movie.poster_path) {
    preloadImage(heroPosterUrl(movie.poster_path))
  }
}

// Ignore failures since the detail page retries
export function prefetchMovie(id: number) {
  getMovie(id).catch(() => {})
}

export function prefetchMovieAndHeroImages(id: number) {
  getMovie(id)
    .then(preloadHeroImages)
    .catch(() => {})
}

// Act only once an element stays on screen, so fast scrolling skips past rows
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
          stopWatching(target)
          action?.()
        }, DWELL_MS)
        timers.set(target, timer)
      }
    }
  })
  return observer
}

export function onDwell(element: Element, action: () => void): () => void {
  actions.set(element, action)
  getObserver().observe(element)
  return () => stopWatching(element)
}
