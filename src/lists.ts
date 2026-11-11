// Every list of titles the site can show, in one place.
// Browse pages show the first two rows of each list,
// and "See more" opens /list/<id> with sorting, A–Z and numbered pages.

import type { LetterSource } from './tmdb'

export type ListDefinition = {
  title: string
  mediaType: 'movie' | 'tv'
  // What the list shows by default
  path: string
  // The same list as TMDB "discover" filters, used for sorting and A–Z
  filters: string
  // Leaves out obscure titles with almost no votes when sorting
  minVotes: number
}

const ANIME_KEYWORD = 210024
const NOT_DRAMA = '16,10764,10767,10763,10766' // animation, reality, talk, news, soap

function discover(mediaType: 'movie' | 'tv', filters: string, minVotes = 0): string {
  const votes = minVotes > 0 ? `&vote_count.gte=${minVotes}` : ''
  return `/discover/${mediaType}?${filters}&sort_by=popularity.desc${votes}`
}

function worldSeries(title: string, filters: string, minVotes: number): ListDefinition {
  const all = `${filters}&without_genres=${NOT_DRAMA}`
  return { title, mediaType: 'tv', filters: all, minVotes, path: discover('tv', all, minVotes) }
}

function worldMovies(title: string, filters: string, minVotes: number): ListDefinition {
  const all = `${filters}&without_genres=16`
  return { title, mediaType: 'movie', filters: all, minVotes, path: discover('movie', all, minVotes) }
}

export const LISTS = {
  'trending-movies': { title: 'Trending movies', mediaType: 'movie', path: '/trending/movie/week', filters: '', minVotes: 500 },
  'popular-movies': { title: 'Popular movies', mediaType: 'movie', path: '/movie/popular', filters: '', minVotes: 500 },
  'top-movies': { title: 'All-time top rated movies', mediaType: 'movie', path: '/movie/top_rated', filters: '', minVotes: 500 },

  'trending-tv': { title: 'Trending TV shows', mediaType: 'tv', path: '/trending/tv/week', filters: '', minVotes: 50 },
  'popular-tv': { title: 'Popular TV shows', mediaType: 'tv', path: '/tv/popular', filters: '', minVotes: 50 },
  'top-tv': { title: 'All-time top rated TV shows', mediaType: 'tv', path: '/tv/top_rated', filters: '', minVotes: 50 },

  'anime-series': {
    title: 'Popular anime series',
    mediaType: 'tv',
    filters: 'with_genres=16&with_origin_country=JP',
    minVotes: 10,
    path: discover('tv', 'with_genres=16&with_origin_country=JP'),
  },
  'anime-movies': {
    title: 'Anime movies',
    mediaType: 'movie',
    filters: 'with_genres=16&with_original_language=ja',
    minVotes: 10,
    path: discover('movie', 'with_genres=16&with_original_language=ja'),
  },

  'animation-movies': {
    title: 'Animated movies',
    mediaType: 'movie',
    filters: `with_genres=16&without_keywords=${ANIME_KEYWORD}`,
    minVotes: 30,
    path: discover('movie', `with_genres=16&without_keywords=${ANIME_KEYWORD}`),
  },
  'animation-series': {
    title: 'Animated series',
    mediaType: 'tv',
    filters: `with_genres=16&without_keywords=${ANIME_KEYWORD}`,
    minVotes: 10,
    path: discover('tv', `with_genres=16&without_keywords=${ANIME_KEYWORD}`),
  },


  'ng-series': worldSeries('Nollywood series', 'with_origin_country=NG', 0),
  'ng-movies': worldMovies('Nollywood movies', 'with_origin_country=NG', 1),
  'in-series': worldSeries('Indian series', 'with_origin_country=IN&with_original_language=hi', 5),
  'in-movies': worldMovies('Bollywood movies', 'with_origin_country=IN&with_original_language=hi', 20),
  'kr-series': worldSeries('K-dramas', 'with_origin_country=KR', 20),
  'kr-movies': worldMovies('Korean movies', 'with_origin_country=KR', 20),
  'jp-series': worldSeries('J-dramas', 'with_origin_country=JP', 20),
  'jp-movies': worldMovies('Japanese movies', 'with_origin_country=JP', 20),
  'cn-series': worldSeries('C-dramas', 'with_origin_country=CN|TW|HK', 20),
  'cn-movies': worldMovies('Chinese movies', 'with_origin_country=CN|TW|HK', 20),
  'th-series': worldSeries('Thai dramas', 'with_origin_country=TH', 5),
  'th-movies': worldMovies('Thai movies', 'with_origin_country=TH', 10),
} satisfies Record<string, ListDefinition>

export type ListId = keyof typeof LISTS

export function isListId(value: string | undefined): value is ListId {
  return value !== undefined && value in LISTS
}

// ---------- Genres (one list for movies and TV together) ----------

export type GenreDefinition = {
  name: string
  // TMDB filters for each side; missing means TMDB has no such genre for it
  movie?: string
  tv?: string
}

export const GENRES = {
  action: { name: 'Action', movie: 'with_genres=28', tv: 'with_genres=10759' },
  adventure: { name: 'Adventure', movie: 'with_genres=12', tv: 'with_genres=10759' },
  animation: { name: 'Animation', movie: 'with_genres=16', tv: 'with_genres=16' },
  comedy: { name: 'Comedy', movie: 'with_genres=35', tv: 'with_genres=35' },
  crime: { name: 'Crime', movie: 'with_genres=80', tv: 'with_genres=80' },
  documentary: { name: 'Documentary', movie: 'with_genres=99', tv: 'with_genres=99' },
  drama: { name: 'Drama', movie: 'with_genres=18', tv: 'with_genres=18' },
  family: { name: 'Family', movie: 'with_genres=10751', tv: 'with_genres=10751' },
  fantasy: { name: 'Fantasy', movie: 'with_genres=14', tv: 'with_genres=10765' },
  history: { name: 'History', movie: 'with_genres=36' },
  horror: { name: 'Horror', movie: 'with_genres=27', tv: 'with_keywords=315058' },
  kids: { name: 'Kids', tv: 'with_genres=10762' },
  music: { name: 'Music', movie: 'with_genres=10402' },
  mystery: { name: 'Mystery', movie: 'with_genres=9648', tv: 'with_genres=9648' },
  reality: { name: 'Reality', tv: 'with_genres=10764' },
  romance: { name: 'Romance', movie: 'with_genres=10749', tv: 'with_keywords=9840' },
  'science-fiction': { name: 'Science Fiction', movie: 'with_genres=878', tv: 'with_genres=10765' },
  thriller: { name: 'Thriller', movie: 'with_genres=53', tv: 'with_keywords=316362' },
  war: { name: 'War', movie: 'with_genres=10752', tv: 'with_genres=10768' },
  western: { name: 'Western', movie: 'with_genres=37', tv: 'with_genres=37' },
} satisfies Record<string, GenreDefinition>

export type GenreSlug = keyof typeof GENRES

export function isGenreSlug(value: string | undefined): value is GenreSlug {
  return value !== undefined && value in GENRES
}

// "genre-horror-movie" → the Horror movies list
function genreList(id: string): ListDefinition | null {
  const match = /^genre-(.+)-(movie|tv)$/.exec(id)
  if (!match || !isGenreSlug(match[1])) return null

  const genre: GenreDefinition = GENRES[match[1]]
  const mediaType = match[2] as 'movie' | 'tv'
  const filters = genre[mediaType]
  if (!filters) return null

  // Fewer votes needed for small genres like BL/GL
  // Tag-based genres are smaller, so they need fewer votes to show up
  const small = filters.startsWith('with_keywords')
  const minVotes = small ? 5 : mediaType === 'movie' ? 300 : 30

  return {
    title: `${genre.name} ${mediaType === 'movie' ? 'movies' : 'TV shows'}`,
    mediaType,
    filters,
    minVotes,
    path: `/discover/${mediaType}?${filters}&sort_by=popularity.desc`,
  }
}

// Built genre lists are kept, so the same id always gives back the same object
const genreListCache = new Map<string, ListDefinition | null>()

// Works for both the fixed lists above and genre lists
export function resolveList(id: string | undefined): ListDefinition | null {
  if (!id) return null
  if (id in LISTS) return LISTS[id as ListId]
  if (!genreListCache.has(id)) genreListCache.set(id, genreList(id))
  return genreListCache.get(id) ?? null
}

export function genreListIds(slug: GenreSlug): string[] {
  const genre: GenreDefinition = GENRES[slug]
  const ids: string[] = []
  if (genre.movie) ids.push(`genre-${slug}-movie`)
  if (genre.tv) ids.push(`genre-${slug}-tv`)
  return ids
}

// ---------- Sorting ----------

export type SortKey = 'default' | 'popular' | 'rated' | 'newest' | 'oldest' | 'az' | 'za'

export const SORT_LABELS: Record<SortKey, string> = {
  default: 'Featured',
  popular: 'Most popular',
  rated: 'Highest rated',
  newest: 'Newest first',
  oldest: 'Oldest first',
  az: 'Title A → Z',
  za: 'Title Z → A',
}

// TMDB sorts TV shows by their original-language name, so A → Z only works for movies
export function sortOptionsFor(list: ListDefinition): SortKey[] {
  const all: SortKey[] = ['default', 'popular', 'rated', 'newest', 'oldest']
  return list.mediaType === 'movie' ? [...all, 'az', 'za'] : all
}

export function isSortKey(value: string | null): value is SortKey {
  return value !== null && value in SORT_LABELS
}

export function sortedPath(list: ListDefinition, sort: SortKey): string {
  if (sort === 'default') return list.path

  const base = `/discover/${list.mediaType}?${list.filters ? `${list.filters}&` : ''}`
  const votes = `vote_count.gte=${list.minVotes}`
  const date = list.mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'
  const title = list.mediaType === 'movie' ? 'title' : 'name'
  const today = new Date().toISOString().slice(0, 10)

  switch (sort) {
    case 'popular':
      return `${base}sort_by=popularity.desc&${votes}`
    case 'rated':
      return `${base}sort_by=vote_average.desc&vote_count.gte=${Math.max(list.minVotes, 5)}`
    case 'newest':
      return `${base}sort_by=${date}.desc&${date}.lte=${today}&${votes}`
    case 'oldest':
      return `${base}sort_by=${date}.asc&${votes}`
    case 'az':
      return `${base}sort_by=${title}.asc&${votes}`
    case 'za':
      return `${base}sort_by=${title}.desc&${votes}`
  }
}

// What the A–Z letters search for a list
export function letterSourceFor(list: ListDefinition): LetterSource {
  const votes = `vote_count.gte=${list.minVotes}`
  return {
    mediaType: list.mediaType,
    filters: list.filters ? `${list.filters}&${votes}` : votes,
  }
}

// ---------- World cinema ----------

export const WORLD_REGIONS = {
  ng: { label: 'Nollywood', series: 'ng-series', movies: 'ng-movies' },
  in: { label: 'Bollywood', series: 'in-series', movies: 'in-movies' },
  kr: { label: 'Korean', series: 'kr-series', movies: 'kr-movies' },
  jp: { label: 'Japanese', series: 'jp-series', movies: 'jp-movies' },
  cn: { label: 'Chinese', series: 'cn-series', movies: 'cn-movies' },
  th: { label: 'Thai', series: 'th-series', movies: 'th-movies' },
} satisfies Record<string, { label: string; series: ListId; movies: ListId }>

export type WorldRegion = keyof typeof WORLD_REGIONS

export function toWorldRegion(value: string | null): WorldRegion {
  return value !== null && value in WORLD_REGIONS ? (value as WorldRegion) : 'ng'
}

