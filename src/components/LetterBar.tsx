import { Link, useSearchParams } from 'react-router'
import { LETTERS } from '../tmdb'

type LetterBarProps = {
  active: string | null
}

function LetterBar({ active }: LetterBarProps) {
  const [searchParams] = useSearchParams()

  // Keep other settings in the URL (like ?country=kr) when picking a letter
  function linkFor(letter: string | null) {
    const params = new URLSearchParams(searchParams)
    if (letter) params.set('letter', letter)
    else params.delete('letter')
    // A new letter starts from page 1, and letters replace any sort
    params.delete('page')
    params.delete('sort')
    return `?${params.toString()}`
  }

  return (
    <nav className="letter-bar" aria-label="Browse by first letter">
      <Link to={linkFor(null)} className={active === null ? 'letter-all active' : 'letter-all'}>
        All
      </Link>
      {LETTERS.map((letter) => (
        <Link
          key={letter}
          to={linkFor(letter)}
          className={letter === active ? 'active' : undefined}
          aria-current={letter === active ? 'page' : undefined}
        >
          {letter}
        </Link>
      ))}
    </nav>
  )
}

export default LetterBar
