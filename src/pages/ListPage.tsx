import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  SORT_LABELS,
  isSortKey,
  letterSourceFor,
  resolveList,
  sortOptionsFor,
  sortedPath,
  type SortKey,
} from '../lists'
import {
  LETTERS,
  getAlphabeticalPage,
  getLetterPage,
  getListPage,
  type MediaItem,
} from '../tmdb'
import MediaGrid from '../components/MediaGrid'
import Pagination from '../components/Pagination'
import LetterBar from '../components/LetterBar'

type Loaded = {
  key: string
  items: MediaItem[]
  totalPages: number
  error: string | null
}

function ListPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const list = resolveList(id)

  const page = Math.max(1, Math.min(500, Number(searchParams.get('page')) || 1))
  const letterParam = searchParams.get('letter')
  const letter = letterParam && LETTERS.includes(letterParam) ? letterParam : null
  const sortParam = searchParams.get('sort')
  const sort: SortKey =
    list && isSortKey(sortParam) && sortOptionsFor(list).includes(sortParam) ? sortParam : 'default'

  const key = `${id}:${page}:${letter ?? ''}:${sort}`
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!list) return
    let ignore = false
    window.scrollTo({ top: 0 })

    const request = letter
      ? getLetterPage(letterSourceFor(list), letter, page)
      : list.mediaType === 'movie' && (sort === 'az' || sort === 'za')
        ? getAlphabeticalPage(letterSourceFor(list).filters, sort, page)
        : getListPage(list.mediaType, sortedPath(list, sort), page)

    request
      .then(({ items, totalPages }) => {
        if (!ignore) setLoaded({ key, items, totalPages, error: null })
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Something went wrong'
          setLoaded({ key, items: [], totalPages: 1, error: message })
        }
      })

    return () => {
      ignore = true
    }
  }, [list, page, letter, sort, key])

  if (!list) {
    return (
      <main className="page">
        <p>
          That list doesn’t exist. <Link to="/" className="text-link">Go home</Link>
        </p>
      </main>
    )
  }

  function changeSort(value: SortKey) {
    // Picking a sort starts again from page 1 and clears the letter
    navigate(value === 'default' ? '?' : `?sort=${value}`)
  }

  const ready = loaded?.key === key
  const letterLabel =
    letter === '#' ? 'starting with a number or symbol' : letter ? `starting with “${letter}”` : null

  return (
    <main className="page">
      <h1>
        {list.title}
        {letterLabel && <span className="heading-sub"> {letterLabel}</span>}
      </h1>

      <div className="list-toolbar">
        <label className="sort-control">
          <span>Sort by</span>
          <select
            value={letter ? 'letter' : sort}
            onChange={(event) => changeSort(event.target.value as SortKey)}
          >
            {letter && <option value="letter">Letter {letter}</option>}
            {sortOptionsFor(list).map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        {ready && loaded.totalPages > 1 && (
          <span className="meta">
            Page {page} of {loaded.totalPages}
          </span>
        )}
      </div>

      <LetterBar active={letter} />

      {!ready ? (
        <p className="meta">Loading...</p>
      ) : loaded.error ? (
        <p className="meta">Error: {loaded.error}</p>
      ) : (
        <>
          {loaded.items.length === 0 ? (
            <p className="meta">
              No titles on this page{letter ? ' for this letter' : ''}. Try the next page.
            </p>
          ) : (
            <MediaGrid items={loaded.items} />
          )}
          <Pagination page={page} totalPages={loaded.totalPages} />
        </>
      )}
    </main>
  )
}

export default ListPage
