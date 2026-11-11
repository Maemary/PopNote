const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'
const TOKEN = import.meta.env.VITE_TMDB_TOKEN

// ---------- Types ----------

export type Movie = {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
  genre_ids?: number[]
  original_language?: string
  original_title?: string
}

export type TvShow = {
  id: number
  name: string
  overview: string
  poster_path: string | null
  first_air_date: string
  vote_average: number
  genre_ids?: number[]
  original_language?: string
}

type ListResponse<T> = {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export type Genre = {
  id: number
  name: string
}

export type Video = {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export type CastMember = {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export type WatchProvider = {
  provider_id: number
  provider_name: string
  logo_path: string | null
}

export type CountryProviders = {
  link: string
  flatrate?: WatchProvider[]
  free?: WatchProvider[]
  ads?: WatchProvider[]
  rent?: WatchProvider[]
  buy?: WatchProvider[]
}

export type MovieDetails = Movie & {
  backdrop_path: string | null
  runtime: number | null
  tagline: string
  genres: Genre[]
  videos: { results: Video[] }
  credits: { cast: CastMember[] }
  'watch/providers': { results: Record<string, CountryProviders | undefined> }
}

export type Season = {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date: string | null
  poster_path: string | null
}

export type TvDetails = TvShow & {
  backdrop_path: string | null
  tagline: string
  status: string
  last_air_date: string | null
  number_of_seasons: number
  genres: Genre[]
  seasons: Season[]
  videos: { results: Video[] }
  credits: { cast: CastMember[] }
  'watch/providers': { results: Record<string, CountryProviders | undefined> }
}

// One shape for every card, whether it's a movie or a show
export type MediaItem = {
  mediaType: 'movie' | 'tv'
  id: number
  title: string
  posterPath: string | null
  date: string
  rating: number
  overview: string
  genreIds: number[]
}

export type Category = 'all' | 'movie' | 'tv' | 'anime' | 'animation'

export const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  movie: 'Movies',
  tv: 'TV Shows',
  anime: 'Anime',
  animation: 'Animation',
}

export function isCategory(value: string | null): value is Category {
  return value !== null && value in CATEGORY_LABELS
}

// TMDB's genre lists (they almost never change, so they live here)
export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
]

export const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
]

export function genreNames(mediaType: 'movie' | 'tv', ids: number[]): string[] {
  const list = mediaType === 'tv' ? TV_GENRES : MOVIE_GENRES
  return ids
    .map((id) => list.find((genre) => genre.id === id)?.name)
    .filter((name): name is string => name !== undefined)
}

// ---------- Converters ----------

function movieToItem(movie: Movie): MediaItem {
  return {
    mediaType: 'movie',
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    date: movie.release_date,
    rating: movie.vote_average,
    overview: movie.overview,
    genreIds: movie.genre_ids ?? [],
  }
}

function showToItem(show: TvShow): MediaItem {
  return {
    mediaType: 'tv',
    id: show.id,
    title: show.name,
    posterPath: show.poster_path,
    date: show.first_air_date,
    rating: show.vote_average,
    overview: show.overview,
    genreIds: show.genre_ids ?? [],
  }
}

const ANIMATION_GENRE = 16

function isAnimated(item: Movie | TvShow): boolean {
  return (item.genre_ids ?? []).includes(ANIMATION_GENRE)
}

function isAnime(item: Movie | TvShow): boolean {
  return isAnimated(item) && item.original_language === 'ja'
}

function isWesternAnimation(item: Movie | TvShow): boolean {
  return isAnimated(item) && item.original_language !== 'ja'
}

// ---------- Requests ----------

async function tmdbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`)
  }

  const data: T = await res.json()
  return data
}

async function listMovies(path: string): Promise<MediaItem[]> {
  const data = await tmdbFetch<ListResponse<Movie>>(path)
  return data.results.map(movieToItem)
}

async function listShows(path: string): Promise<MediaItem[]> {
  const data = await tmdbFetch<ListResponse<TvShow>>(path)
  return data.results.map(showToItem)
}

export type ListPage = {
  items: MediaItem[]
  totalPages: number
}

// Fetch one page of any TMDB list (trending, popular, discover...)
export async function getListPage(
  mediaType: 'movie' | 'tv',
  path: string,
  page: number,
): Promise<ListPage> {
  const url = `${path}${path.includes('?') ? '&' : '?'}page=${page}`
  if (mediaType === 'movie') {
    const data = await tmdbFetch<ListResponse<Movie>>(url)
    return { items: data.results.map(movieToItem), totalPages: Math.min(data.total_pages, 500) }
  }
  const data = await tmdbFetch<ListResponse<TvShow>>(url)
  return { items: data.results.map(showToItem), totalPages: Math.min(data.total_pages, 500) }
}

export function getMovieDetails(id: string): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(
    `/movie/${id}?append_to_response=videos,credits,watch/providers`,
  )
}

export function getTvDetails(id: string): Promise<TvDetails> {
  return tmdbFetch<TvDetails>(
    `/tv/${id}?append_to_response=videos,credits,watch/providers`,
  )
}

// ---------- Search ----------

type MultiResult =
  | (Movie & { media_type: 'movie' })
  | (TvShow & { media_type: 'tv' })
  | { media_type: 'person'; id: number }

export async function searchTitles(
  query: string,
  category: Category,
): Promise<MediaItem[]> {
  const params = new URLSearchParams({ query, include_adult: 'false' }).toString()

  if (category === 'movie') {
    return listMovies(`/search/movie?${params}`)
  }

  if (category === 'tv') {
    return listShows(`/search/tv?${params}`)
  }

  if (category === 'anime' || category === 'animation') {
    const keep = category === 'anime' ? isAnime : isWesternAnimation
    const [shows, movies] = await Promise.all([
      tmdbFetch<ListResponse<TvShow>>(`/search/tv?${params}`),
      tmdbFetch<ListResponse<Movie>>(`/search/movie?${params}`),
    ])
    return [
      ...shows.results.filter(keep).map(showToItem),
      ...movies.results.filter(keep).map(movieToItem),
    ]
  }

  const data = await tmdbFetch<ListResponse<MultiResult>>(`/search/multi?${params}`)
  const items: MediaItem[] = []
  for (const result of data.results) {
    if (result.media_type === 'movie') items.push(movieToItem(result))
    else if (result.media_type === 'tv') items.push(showToItem(result))
  }
  return items
}

// ---------- A–Z browsing ----------

export const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

export type LetterSource = {
  mediaType: 'movie' | 'tv'
  filters: string
}

const MAX_PAGE = 500 // TMDB won't return pages past 500
const TV_PAGES_PER_LETTER_PAGE = 10

// 'A'–'Z' for Latin letters, '#' for numbers and symbols, '~' for other alphabets
export function letterOf(title: string): string {
  const first = title.trim().normalize('NFD').charAt(0).toUpperCase()
  if (first >= 'A' && first <= 'Z') return first
  if (/\p{L}/u.test(first)) return '~'
  return '#'
}

// Puts '#' first, then A–Z, then other alphabets, matching TMDB's title order
function letterRank(letter: string): number {
  if (letter === '#') return 0
  if (letter === '~') return 27
  return letter.charCodeAt(0) - 64
}

function alphabeticalMovies(filters: string, page: number) {
  const prefix = filters ? `${filters}&` : ''
  return tmdbFetch<ListResponse<Movie>>(
    `/discover/movie?${prefix}sort_by=title.asc&page=${page}`,
  )
}

// Remembers where each letter starts and ends, so changing page is quick
const movieLetterRanges = new Map<string, { start: number; end: number }>()

// Movies can be sorted by title, so we find the letter's pages with two
// binary searches (about 18 requests instead of hundreds)
async function movieLetterRange(filters: string, letter: string) {
  const cacheKey = `${filters}#${letter}`
  const cached = movieLetterRanges.get(cacheKey)
  if (cached) return cached

  const first = await alphabeticalMovies(filters, 1)
  const lastPage = Math.min(first.total_pages, MAX_PAGE)
  const target = letterRank(letter)

  const firstRank = async (page: number) => {
    const data = page === 1 ? first : await alphabeticalMovies(filters, page)
    const item = data.results[0]
    return item ? letterRank(letterOf(item.title)) : 99
  }
  const lastRank = async (page: number) => {
    const data = page === 1 ? first : await alphabeticalMovies(filters, page)
    const item = data.results[data.results.length - 1]
    return item ? letterRank(letterOf(item.title)) : 99
  }

  // First page whose last title is at or after the letter
  let low = 1
  let high = lastPage
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if ((await lastRank(middle)) >= target) high = middle
    else low = middle + 1
  }
  const start = low

  // Last page whose first title is at or before the letter
  low = start
  high = lastPage
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if ((await firstRank(middle)) <= target) low = middle
    else high = middle - 1
  }
  const range = { start, end: Math.max(start, low) }

  movieLetterRanges.set(cacheKey, range)
  return range
}

export type LetterPage = {
  items: MediaItem[]
  totalPages: number
}

// One numbered page of titles starting with a letter
export async function getLetterPage(
  source: LetterSource,
  letter: string,
  page: number,
): Promise<LetterPage> {
  if (source.mediaType === 'movie') {
    const { start, end } = await movieLetterRange(source.filters, letter)
    const totalPages = end - start + 1
    const data = await alphabeticalMovies(source.filters, start + Math.min(page, totalPages) - 1)
    return {
      items: data.results.filter((movie) => letterOf(movie.title) === letter).map(movieToItem),
      totalPages,
    }
  }

  // TV shows are sorted by their original-language name on TMDB, so instead
  // we look through the most popular shows and keep the matching English names
  const prefix = source.filters ? `${source.filters}&` : ''
  const firstTmdbPage = (page - 1) * TV_PAGES_PER_LETTER_PAGE + 1
  const pages = Array.from({ length: TV_PAGES_PER_LETTER_PAGE }, (_, i) => firstTmdbPage + i).filter(
    (p) => p <= MAX_PAGE,
  )
  const results = await Promise.all(
    pages.map((p) =>
      tmdbFetch<ListResponse<TvShow>>(`/discover/tv?${prefix}sort_by=popularity.desc&page=${p}`),
    ),
  )
  const tmdbTotal = Math.min(results[0]?.total_pages ?? 1, MAX_PAGE)
  return {
    items: results
      .flatMap((data) => data.results)
      .filter((show) => letterOf(show.name) === letter)
      .map(showToItem),
    totalPages: Math.max(1, Math.ceil(tmdbTotal / TV_PAGES_PER_LETTER_PAGE)),
  }
}

// ---------- Title A → Z and Z → A ----------

// TMDB sorts by the *original* title, so films with Korean, Japanese, etc.
// original titles all land at the very end. We find where the Latin-alphabet
// titles stop, then read pages forwards (A → Z) or backwards (Z → A).
const latinEndCache = new Map<string, number>()

// Plain A–Z, digits or symbols only: accented letters like 'É' also sort after Z
function hasLatinOriginal(movie: Movie): boolean {
  return /^[\x20-\x7E]/.test((movie.original_title ?? movie.title).trim())
}

async function lastLatinPage(filters: string): Promise<number> {
  const cached = latinEndCache.get(filters)
  if (cached) return cached

  const first = await alphabeticalMovies(filters, 1)
  let low = 1
  let high = Math.min(first.total_pages, MAX_PAGE)

  // Last page whose first film still has a Latin original title
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    const data = await alphabeticalMovies(filters, middle)
    const item = data.results[0]
    if (item && hasLatinOriginal(item)) low = middle
    else high = middle - 1
  }

  latinEndCache.set(filters, low)
  return low
}

export async function getAlphabeticalPage(
  filters: string,
  direction: 'az' | 'za',
  page: number,
): Promise<ListPage> {
  const totalPages = await lastLatinPage(filters)
  const safePage = Math.min(page, totalPages)
  const tmdbPage = direction === 'az' ? safePage : totalPages - safePage + 1

  const data = await alphabeticalMovies(filters, tmdbPage)
  const movies = data.results.filter(hasLatinOriginal)
  if (direction === 'za') movies.reverse()

  return { items: movies.map(movieToItem), totalPages }
}


// ---------- Image helpers ----------

export function posterUrl(
  path: string | null,
  size: 'w92' | 'w185' | 'w342' | 'w500' = 'w342',
): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null
}

export function backdropUrl(
  path: string | null,
  size: 'w780' | 'w1280' = 'w1280',
): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null
}

export function logoUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE_URL}/w92${path}` : null
}
