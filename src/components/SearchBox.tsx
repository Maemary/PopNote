import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router'
import {
  CATEGORY_LABELS,
  posterUrl,
  searchTitles,
  type Category,
  type MediaItem,
} from '../tmdb'

type SearchBoxProps = {
  defaultCategory: Category
}

type Suggestions = {
  key: string
  items: MediaItem[]
}

const MAX_SUGGESTIONS = 6
const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function SearchBox({ defaultCategory }: SearchBoxProps) {
  const navigate = useNavigate()
  const areaRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>(defaultCategory)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)

  const trimmed = query.trim()
  const key = `${category}:${trimmed}`
  const ready = trimmed.length >= 2

  // Fetch suggestions 300ms after the person stops typing
  useEffect(() => {
    if (!ready) return
    let ignore = false

    const timer = setTimeout(() => {
      searchTitles(trimmed, category)
        .then((items) => {
          if (!ignore) setSuggestions({ key, items: items.slice(0, MAX_SUGGESTIONS) })
        })
        .catch(() => {
          if (!ignore) setSuggestions({ key, items: [] })
        })
    }, 300)

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [ready, trimmed, category, key])

  // Clicking anywhere outside the search closes it
  useEffect(() => {
    if (!expanded) return

    function handleClick(event: MouseEvent) {
      if (!areaRef.current?.contains(event.target as Node)) setExpanded(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [expanded])

  const items = suggestions?.key === key ? suggestions.items : null
  const showList = open && ready

  function close() {
    setExpanded(false)
    setOpen(false)
    setActiveIndex(-1)
  }

  function goToResults() {
    if (!trimmed) return
    close()
    navigate(`/search?q=${encodeURIComponent(trimmed)}&type=${category}`)
  }

  function goToItem(item: MediaItem) {
    close()
    setQuery('')
    navigate(`/${item.mediaType}/${item.id}`)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (items && activeIndex >= 0 && activeIndex < items.length) {
      goToItem(items[activeIndex])
    } else {
      goToResults()
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (showList) setOpen(false)
      else close()
      return
    }

    if (!items || items.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (i + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1))
    }
  }

  return (
    <div className="search-area" ref={areaRef}>
      <button
        type="button"
        className="search-toggle"
        aria-label="Search"
        aria-expanded={expanded}
        onClick={() => setExpanded(true)}
      >
        <SearchIcon />
      </button>

      {expanded && (
        <form className="search-box" onSubmit={handleSubmit} role="search">
          <button type="submit" className="search-submit" aria-label="Search">
            <SearchIcon />
          </button>

          <input
            type="search"
            autoFocus
            placeholder={
              category === 'all'
                ? 'Search movies, shows, anime...'
                : `Search ${CATEGORY_LABELS[category].toLowerCase()}...`
            }
            aria-label="Search"
            role="combobox"
            aria-expanded={showList}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
            }
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
              setActiveIndex(-1)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />

          <select
            aria-label="Search in"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value as Category)
              setActiveIndex(-1)
            }}
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="search-close"
            aria-label="Close search"
            onClick={close}
          >
            ×
          </button>

          {showList && (
            <ul id="search-suggestions" className="suggestions" role="listbox">
              {items === null && <li className="suggestion-status">Searching...</li>}

              {items?.length === 0 && (
                <li className="suggestion-status">
                  No matches in {CATEGORY_LABELS[category]}
                </li>
              )}

              {items?.map((item, index) => {
                const thumb = posterUrl(item.posterPath, 'w92')
                return (
                  <li
                    key={`${item.mediaType}-${item.id}`}
                    id={`suggestion-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={index === activeIndex ? 'suggestion active' : 'suggestion'}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => goToItem(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    {thumb ? <img src={thumb} alt="" /> : <span className="suggestion-thumb" />}
                    <span className="suggestion-text">
                      <strong>{item.title}</strong>
                      <span>
                        {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                        {item.date ? ` · ${item.date.slice(0, 4)}` : ''}
                      </span>
                    </span>
                  </li>
                )
              })}

              {items && items.length > 0 && (
                <li
                  className="suggestion-all"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={goToResults}
                >
                  See all results for “{trimmed}”
                </li>
              )}
            </ul>
          )}
        </form>
      )}
    </div>
  )
}

export default SearchBox
