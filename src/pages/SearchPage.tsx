import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  CATEGORY_LABELS,
  isCategory,
  searchTitles,
  type Category,
  type MediaItem,
} from '../tmdb'
import MediaGrid from '../components/MediaGrid'

type SearchResult = {
  key: string
  items: MediaItem[]
  error: string | null
}

function toCategory(value: string | null): Category {
  return isCategory(value) ? value : 'all'
}

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = toCategory(searchParams.get('type'))
  const key = `${category}:${query}`
  const [result, setResult] = useState<SearchResult | null>(null)

  useEffect(() => {
    if (!query) return
    let ignore = false

    searchTitles(query, category)
      .then((items) => {
        if (!ignore) setResult({ key, items, error: null })
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Something went wrong'
          setResult({ key, items: [], error: message })
        }
      })

    return () => {
      ignore = true
    }
  }, [query, category, key])

  if (!query) return <p className="page">Type something in the search bar.</p>
  if (result?.key !== key) return <p className="page">Searching...</p>
  if (result.error) return <p className="page">Error: {result.error}</p>

  return (
    <main className="page">
      <h1>
        Results for “{query}”
        {category !== 'all' && <span className="heading-sub"> in {CATEGORY_LABELS[category]}</span>}
      </h1>
      {result.items.length === 0 ? (
        <p className="meta">Nothing found. Try a different spelling or category.</p>
      ) : (
        <MediaGrid items={result.items} />
      )}
    </main>
  )
}

export default SearchPage
