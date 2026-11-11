import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { LETTERS, getListPage, type MediaItem } from '../tmdb'
import {
  GENRES,
  WORLD_REGIONS,
  genreListIds,
  resolveList,
  toWorldRegion,
  type GenreSlug,
  type WorldRegion,
} from '../lists'
import TwoRowGrid from '../components/TwoRowGrid'
import HomeIntro from '../components/HomeIntro'
import LetterBar from '../components/LetterBar'
import LetterPreview from '../components/LetterPreview'

export type Section = 'home' | 'movie' | 'tv' | 'anime' | 'animation' | 'world' | 'genre'

const ROWS: Record<'home' | 'movie' | 'tv' | 'anime' | 'animation', string[]> = {
  home: ['trending-movies', 'trending-tv', 'ng-movies', 'anime-series', 'animation-movies', 'kr-series'],
  movie: ['trending-movies', 'popular-movies', 'top-movies'],
  tv: ['trending-tv', 'popular-tv', 'top-tv'],
  anime: ['anime-series', 'anime-movies'],
  animation: ['animation-movies', 'animation-series'],
}

// Which lists the A–Z bar searches on each page
const LETTER_LISTS: Record<'home' | 'movie' | 'tv' | 'anime' | 'animation', string[]> = {
  home: [],
  movie: ['popular-movies'],
  tv: ['popular-tv'],
  anime: ['anime-series', 'anime-movies'],
  animation: ['animation-series', 'animation-movies'],
}

const HEADINGS: Record<Section, string | null> = {
  home: null,
  movie: 'Movies',
  tv: 'TV Shows',
  anime: 'Anime',
  animation: 'Animation',
  world: 'World Cinema',
  genre: null,
}

function rowsFor(section: Section, country: WorldRegion, genre?: GenreSlug): string[] {
  if (section === 'world') return [WORLD_REGIONS[country].series, WORLD_REGIONS[country].movies]
  if (section === 'genre') return genre ? genreListIds(genre) : []
  return ROWS[section]
}

function letterListsFor(section: Section, country: WorldRegion, genre?: GenreSlug): string[] {
  if (section === 'world' || section === 'genre') return rowsFor(section, country, genre)
  return LETTER_LISTS[section]
}

type Loaded = {
  key: string
  results: MediaItem[][]
  error: string | null
}

type BrowsePageProps = {
  section: Section
  genre?: GenreSlug
}

function BrowsePage({ section, genre }: BrowsePageProps) {
  const [searchParams] = useSearchParams()
  const country = toWorldRegion(searchParams.get('country'))
  const letterParam = searchParams.get('letter')
  const letter =
    section !== 'home' && letterParam && LETTERS.includes(letterParam) ? letterParam : null

  const rows = rowsFor(section, country, genre)
  const key = `${section}:${section === 'world' ? country : ''}:${genre ?? ''}`
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (letter) return
    let ignore = false

    Promise.all(
      rowsFor(section, country, genre).map((id) => {
        const list = resolveList(id)
        return list ? getListPage(list.mediaType, list.path, 1).then((page) => page.items) : []
      }),
    )
      .then((results) => {
        if (!ignore) setLoaded({ key, results, error: null })
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Something went wrong'
          setLoaded({ key, results: [], error: message })
        }
      })

    return () => {
      ignore = true
    }
  }, [section, country, genre, letter, key])

  const heading = section === 'genre' && genre ? GENRES[genre].name : HEADINGS[section]

  return (
    <main className="page">
      {section === 'home' && <HomeIntro />}
      {heading && <h1>{heading}</h1>}

      {section === 'world' && (
        <div className="country-tabs" role="tablist">
          {(Object.keys(WORLD_REGIONS) as WorldRegion[]).map((code) => (
            <Link
              key={code}
              to={`?country=${code}`}
              role="tab"
              aria-selected={code === country}
              className={code === country ? 'country-tab active' : 'country-tab'}
            >
              {WORLD_REGIONS[code].label}
            </Link>
          ))}
        </div>
      )}

      {section !== 'home' && <LetterBar active={letter} />}

      {letter ? (
        letterListsFor(section, country, genre).map((id) => (
          <LetterPreview
            key={id}
            listId={id}
            title={id === 'popular-movies' ? 'Movies' : id === 'popular-tv' ? 'TV shows' : undefined}
            letter={letter}
          />
        ))
      ) : loaded?.key !== key ? (
        <p className="meta">Loading...</p>
      ) : loaded.error ? (
        <p className="meta">Error: {loaded.error}</p>
      ) : (
        rows.map((id, index) => {
          const list = resolveList(id)
          if (!list) return null
          return (
            <section key={id} className="browse-row">
              <div className="browse-row-head">
                <h2>{list.title}</h2>
                <Link to={`/list/${id}`} className="see-more">
                  See more →
                </Link>
              </div>
              <TwoRowGrid items={loaded.results[index] ?? []} />
            </section>
          )
        })
      )}
    </main>
  )
}

export default BrowsePage
