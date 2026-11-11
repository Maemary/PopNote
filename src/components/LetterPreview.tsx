import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { letterSourceFor, resolveList } from '../lists'
import { getLetterPage, type MediaItem } from '../tmdb'
import TwoRowGrid from './TwoRowGrid'

type LetterPreviewProps = {
  listId: string
  title?: string
  letter: string
}

type Loaded = {
  key: string
  items: MediaItem[]
  error: string | null
}

// Two rows of titles starting with a letter, with "See more" to the full numbered list
function LetterPreview({ listId, title, letter }: LetterPreviewProps) {
  const list = resolveList(listId)
  const key = `${listId}#${letter}`
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!list) return
    let ignore = false

    getLetterPage(letterSourceFor(list), letter, 1)
      .then(({ items }) => {
        if (!ignore) setLoaded({ key, items, error: null })
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Something went wrong'
          setLoaded({ key, items: [], error: message })
        }
      })

    return () => {
      ignore = true
    }
  }, [list, letter, key])

  if (!list) return null
  const ready = loaded?.key === key
  const label = letter === '#' ? 'starting with a number or symbol' : `starting with “${letter}”`

  return (
    <section className="browse-row">
      <div className="browse-row-head">
        <h2>
          {title ?? list.title} <span className="heading-sub">{label}</span>
        </h2>
        <Link to={`/list/${listId}?letter=${encodeURIComponent(letter)}`} className="see-more">
          See more →
        </Link>
      </div>

      {!ready ? (
        <p className="meta">Finding titles...</p>
      ) : loaded.error ? (
        <p className="meta">Error: {loaded.error}</p>
      ) : loaded.items.length === 0 ? (
        <p className="meta">Nothing on the first page for this letter. Try “See more”.</p>
      ) : (
        <TwoRowGrid items={loaded.items} />
      )}
    </section>
  )
}

export default LetterPreview
