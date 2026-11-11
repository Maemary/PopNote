import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import {
  STATUS_LABELS,
  watchList,
  type WatchStatus,
  type WatchlistItem,
} from '../watchlist'
import MediaCard from '../components/MediaCard'
import { downloadListAsCsv } from '../exportList'

type TypeFilter = 'all' | 'movie' | 'tv'
type StatusFilter = WatchStatus | 'all'
type Sort = 'recent' | 'oldest-saved' | 'az' | 'za' | 'year-new' | 'year-old'

type Loaded = {
  uid: string
  items: WatchlistItem[]
  error: string | null
}

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'Series' },
]

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Any status' },
  { value: 'want', label: STATUS_LABELS.want },
  { value: 'watching', label: STATUS_LABELS.watching },
  { value: 'watched', label: STATUS_LABELS.watched },
]

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recent', label: 'Recently saved' },
  { value: 'oldest-saved', label: 'First saved' },
  { value: 'az', label: 'Title A → Z' },
  { value: 'za', label: 'Title Z → A' },
  { value: 'year-new', label: 'Newest release' },
  { value: 'year-old', label: 'Oldest release' },
]

function savedTime(item: WatchlistItem): number {
  return item.createdAt ? item.createdAt.toMillis() : Date.now()
}

function sortItems(items: WatchlistItem[], sort: Sort): WatchlistItem[] {
  const copy = [...items]
  switch (sort) {
    case 'recent':
      return copy.sort((a, b) => savedTime(b) - savedTime(a))
    case 'oldest-saved':
      return copy.sort((a, b) => savedTime(a) - savedTime(b))
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'za':
      return copy.sort((a, b) => b.title.localeCompare(a.title))
    case 'year-new':
      return copy.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    case 'year-old':
      return copy.sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))
  }
}

function MyListPage() {
  const { user, loading } = useAuth()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [type, setType] = useState<TypeFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<Sort>('recent')

  useEffect(() => {
    if (!user) return
    const uid = user.uid

    return watchList(
      uid,
      (items) => setLoaded({ uid, items, error: null }),
      (error) => setLoaded({ uid, items: [], error: error.message }),
    )
  }, [user])

  if (loading) return <p className="page">Loading...</p>
  if (!user) return <Navigate to="/login" replace />
  if (loaded?.uid !== user.uid) return <p className="page">Loading your list...</p>
  if (loaded.error) return <p className="page">Error: {loaded.error}</p>

  const all = loaded.items
  const ofType = type === 'all' ? all : all.filter((item) => item.mediaType === type)
  const shown = sortItems(
    status === 'all' ? ofType : ofType.filter((item) => item.status === status),
    sort,
  )

  // How many titles each choice would show, given the other filter
  const typeCount = (value: TypeFilter) =>
    all.filter(
      (item) =>
        (value === 'all' || item.mediaType === value) &&
        (status === 'all' || item.status === status),
    ).length
  const statusCount = (value: StatusFilter) =>
    ofType.filter((item) => value === 'all' || item.status === value).length

  return (
    <main className="page">
      <div className="mylist-head">
        <h1>My List</h1>
        {all.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => downloadListAsCsv(all)}
          >
            ⬇ Download my list
          </button>
        )}
      </div>

      {all.length > 0 && (
        <div className="mylist-filters">
          <div className="filter-tabs" role="group" aria-label="Type">
            {TYPE_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={type === value}
                className={type === value ? 'tag tag-on' : 'tag'}
                onClick={() => setType(value)}
              >
                {label} <span className="tag-count">{typeCount(value)}</span>
              </button>
            ))}
          </div>

          <div className="filter-tabs" role="group" aria-label="Status">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={status === value}
                className={status === value ? 'tag tag-on' : 'tag'}
                onClick={() => setStatus(value)}
              >
                {label} <span className="tag-count">{statusCount(value)}</span>
              </button>
            ))}
          </div>

          <label className="sort-control">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
              {SORTS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {all.length === 0 ? (
        <p className="meta">
          Nothing saved yet. Find something on the <Link to="/">home page</Link>{' '}
          and press “Save to My List”.
        </p>
      ) : shown.length === 0 ? (
        <p className="meta">Nothing matches these filters.</p>
      ) : (
        <div className="movie-grid">
          {shown.map((item) => (
            <MediaCard
              key={`${item.mediaType}-${item.tmdbId}`}
              to={`/${item.mediaType}/${item.tmdbId}`}
              title={item.title}
              posterPath={item.posterPath}
              date={item.date}
              note={item.reason}
            />
          ))}
        </div>
      )}
    </main>
  )
}

export default MyListPage
