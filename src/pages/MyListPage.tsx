import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import {
  STATUS_LABELS,
  watchList,
  type WatchStatus,
  type WatchlistItem,
} from '../watchlist'
import { AIRING_LABELS, getAiringStatuses, type AiringStatus } from '../tmdb'
import { MyListCard, MyListRow } from '../components/MyListItems'
import { downloadAsDocument, downloadAsNotes, downloadAsSpreadsheet } from '../exportList'
import NavDropdown from '../components/NavDropdown'

type TypeFilter = 'all' | 'movie' | 'tv'
type ProgressFilter = WatchStatus | 'all'
type AiringFilter = AiringStatus | 'all'
type Sort = 'recent' | 'oldest-saved' | 'az' | 'za' | 'year-new' | 'year-old'
type View = 'grid' | 'list'

type Loaded = {
  uid: string
  items: WatchlistItem[]
  error: string | null
}

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recent', label: 'Recently saved' },
  { value: 'oldest-saved', label: 'First saved' },
  { value: 'az', label: 'Title A → Z' },
  { value: 'za', label: 'Title Z → A' },
  { value: 'year-new', label: 'Newest release' },
  { value: 'year-old', label: 'Oldest release' },
]

const VIEW_KEY = 'popnote-mylist-view'

function readSavedView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

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

type FilterOption<T extends string> = {
  value: T
  label: string
  count: number
}

type FilterSelectProps<T extends string> = {
  label: string
  value: T
  options: FilterOption<T>[]
  onChange: (value: T) => void
}

// A labelled dropdown like "Sort by", showing how many titles each choice has
function FilterSelect<T extends string>({ label, value, options, onChange }: FilterSelectProps<T>) {
  return (
    <label className={value === options[0].value ? 'sort-control' : 'sort-control filter-on'}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  )
}

function MyListPage() {
  const { user, loading } = useAuth()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [airingById, setAiringById] = useState<Record<number, AiringStatus | null>>({})
  const [type, setType] = useState<TypeFilter>('all')
  const [progress, setProgress] = useState<ProgressFilter>('all')
  const [airing, setAiring] = useState<AiringFilter>('all')
  const [sort, setSort] = useState<Sort>('recent')
  const [view, setView] = useState<View>(readSavedView)

  useEffect(() => {
    if (!user) return
    const uid = user.uid

    return watchList(
      uid,
      (items) => setLoaded({ uid, items, error: null }),
      (error) => setLoaded({ uid, items: [], error: error.message }),
    )
  }, [user])

  // Look up whether each saved series is still airing (from TMDB)
  const showIds = (loaded?.items ?? [])
    .filter((item) => item.mediaType === 'tv')
    .map((item) => item.tmdbId)
  const showIdsKey = showIds.join(',')

  useEffect(() => {
    if (!showIdsKey) return
    let ignore = false
    getAiringStatuses(showIdsKey.split(',').map(Number)).then((statuses) => {
      if (!ignore) setAiringById(statuses)
    })
    return () => {
      ignore = true
    }
  }, [showIdsKey])

  function changeView(next: View) {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // Not important if the browser won't remember it
    }
  }

  if (loading) return <p className="page">Loading...</p>
  if (!user) return <Navigate to="/login" replace />
  if (loaded?.uid !== user.uid) return <p className="page">Loading your list...</p>
  if (loaded.error) return <p className="page">Error: {loaded.error}</p>

  const all = loaded.items
  const airingOf = (item: WatchlistItem) =>
    item.mediaType === 'tv' ? airingById[item.tmdbId] ?? null : null

  const matches = (
    item: WatchlistItem,
    t: TypeFilter = type,
    p: ProgressFilter = progress,
    a: AiringFilter = airing,
  ) =>
    (t === 'all' || item.mediaType === t) &&
    (p === 'all' || item.status === p) &&
    (a === 'all' || airingOf(item) === a)

  const shown = sortItems(all.filter((item) => matches(item)), sort)
  const countType = (t: TypeFilter) => all.filter((item) => matches(item, t)).length
  const countProgress = (p: ProgressFilter) =>
    all.filter((item) => matches(item, type, p)).length
  const countAiring = (a: AiringFilter) =>
    all.filter((item) => matches(item, type, progress, a)).length

  const movies = all.filter((item) => item.mediaType === 'movie').length
  const series = all.length - movies
  const watched = all.filter((item) => item.status === 'watched').length
  const filtersOn = type !== 'all' || progress !== 'all' || airing !== 'all'

  return (
    <main className="page mylist-page">
      <div className="ml-hero">
        <div>
          <h1>My List</h1>
          <p className="ml-hero-sub">
            Everything you’ve saved to watch, with your notes on why.
          </p>
        </div>
        {all.length > 0 && (
          <NavDropdown
            label="⬇ Download my list ▾"
            buttonClass="btn btn-ghost"
            panelClass="download-panel"
          >
            {(close) => (
              <div className="download-options">
                <button
                  type="button"
                  onClick={() => {
                    downloadAsNotes(all, airingOf)
                    close()
                  }}
                >
                  <strong>📝 Notes</strong>
                  <span>A simple text file you can open anywhere (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadAsDocument(all, airingOf)
                    close()
                  }}
                >
                  <strong>📄 Word document</strong>
                  <span>Opens in Word or Google Docs (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadAsSpreadsheet(all, airingOf)
                    close()
                  }}
                >
                  <strong>📊 Spreadsheet</strong>
                  <span>For Excel or Google Sheets (.csv)</span>
                </button>
              </div>
            )}
          </NavDropdown>
        )}
      </div>

      {all.length === 0 ? (
        <div className="ml-empty">
          <span aria-hidden="true">🍿</span>
          <h2>Your list is empty</h2>
          <p>
            Find something on the <Link to="/" className="text-link">home page</Link> and press the
            save button under its description.
          </p>
        </div>
      ) : (
        <>
          <div className="ml-stats">
            <div className="ml-stat">
              <strong>{all.length}</strong>
              <span>Saved</span>
            </div>
            <div className="ml-stat">
              <strong>{movies}</strong>
              <span>Movies</span>
            </div>
            <div className="ml-stat">
              <strong>{series}</strong>
              <span>Series</span>
            </div>
            <div className="ml-stat">
              <strong>{watched}</strong>
              <span>Watched</span>
            </div>
          </div>

          <div className="ml-panel">
            <div className="ml-toolbar">
              <FilterSelect
                label="Show"
                value={type}
                onChange={setType}
                options={[
                  { value: 'all', label: 'All', count: countType('all') },
                  { value: 'movie', label: 'Movies', count: countType('movie') },
                  { value: 'tv', label: 'Series', count: countType('tv') },
                ]}
              />

              <FilterSelect
                label="My progress"
                value={progress}
                onChange={setProgress}
                options={[
                  { value: 'all', label: 'Any', count: countProgress('all') },
                  ...(Object.keys(STATUS_LABELS) as WatchStatus[]).map((p) => ({
                    value: p,
                    label: STATUS_LABELS[p],
                    count: countProgress(p),
                  })),
                ]}
              />

              <FilterSelect
                label="Series status"
                value={airing}
                onChange={setAiring}
                options={[
                  { value: 'all', label: 'Any', count: countAiring('all') },
                  ...(Object.keys(AIRING_LABELS) as AiringStatus[]).map((a) => ({
                    value: a,
                    label: AIRING_LABELS[a],
                    count: countAiring(a),
                  })),
                ]}
              />

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

              {filtersOn && (
                <button
                  type="button"
                  className="ml-clear"
                  onClick={() => {
                    setType('all')
                    setProgress('all')
                    setAiring('all')
                  }}
                >
                  Clear filters
                </button>
              )}

              <div className="ml-view" role="group" aria-label="Layout">
                <button
                  type="button"
                  aria-pressed={view === 'grid'}
                  className={view === 'grid' ? 'on' : ''}
                  onClick={() => changeView('grid')}
                >
                  ▦ Grid
                </button>
                <button
                  type="button"
                  aria-pressed={view === 'list'}
                  className={view === 'list' ? 'on' : ''}
                  onClick={() => changeView('list')}
                >
                  ☰ List
                </button>
              </div>
            </div>
          </div>

          <p className="meta ml-count">
            Showing {shown.length} of {all.length}
          </p>

          {shown.length === 0 ? (
            <p className="meta">Nothing matches these filters.</p>
          ) : view === 'grid' ? (
            <div className="ml-grid">
              {shown.map((item) => (
                <MyListCard key={`${item.mediaType}-${item.tmdbId}`} item={item} airing={airingOf(item)} />
              ))}
            </div>
          ) : (
            <div className="ml-list">
              {shown.map((item) => (
                <MyListRow key={`${item.mediaType}-${item.tmdbId}`} item={item} airing={airingOf(item)} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default MyListPage
