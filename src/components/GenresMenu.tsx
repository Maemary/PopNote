import { Link, useLocation } from 'react-router'
import { GENRES, type GenreSlug } from '../lists'
import NavDropdown from './NavDropdown'

const SLUGS = Object.keys(GENRES) as GenreSlug[]

function GenresMenu() {
  const { pathname } = useLocation()
  const isActive = pathname.startsWith('/genre/') || pathname.startsWith('/list/genre-')
  const current = pathname.startsWith('/genre/') ? pathname.slice('/genre/'.length) : null

  return (
    <NavDropdown
      label={
        <>
          Genres <span aria-hidden="true">▾</span>
        </>
      }
      buttonClass={isActive ? 'nav-button nav-genres active' : 'nav-button nav-genres'}
      panelClass="genres-panel"
    >
      {(close) => (
        <ul className="genre-columns">
          {SLUGS.map((slug) => (
            <li key={slug}>
              <Link
                to={`/genre/${slug}`}
                onClick={close}
                className={slug === current ? 'current' : undefined}
              >
                {GENRES[slug].name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </NavDropdown>
  )
}

export default GenresMenu
