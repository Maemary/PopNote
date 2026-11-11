import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../auth/useAuth'
import { isCategory, type Category } from '../tmdb'
import SearchBox from './SearchBox'
import GenresMenu from './GenresMenu'
import WorldMenu from './WorldMenu'
import NavDropdown from './NavDropdown'
import { GENRES, WORLD_REGIONS, type GenreSlug, type WorldRegion } from '../lists'

function categoryFor(pathname: string, type: string | null): Category {
  if (pathname.startsWith('/movies')) return 'movie'
  if (pathname.startsWith('/tv-shows')) return 'tv'
  if (pathname.startsWith('/anime')) return 'anime'
  if (pathname.startsWith('/animation')) return 'animation'
  if (pathname.startsWith('/search') && isCategory(type)) return type
  return 'all'
}

const LINKS = [
  { to: '/', label: 'Home', className: 'nav-home' },
  { to: '/movies', label: 'Movies', className: 'nav-movies' },
  { to: '/tv-shows', label: 'TV Shows', className: 'nav-tv' },
  { to: '/anime', label: 'Anime', className: 'nav-anime' },
  { to: '/animation', label: 'Animation', className: 'nav-animation' },
]

function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuth()

  const category = categoryFor(pathname, searchParams.get('type'))

  async function handleSignOut() {
    await signOut(auth)
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <img src="/favicon.svg" alt="" width="30" height="30" />
          Popnote
        </Link>

        {/* Full nav on wide screens */}
        <nav className="main-nav" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={link.className}>
              {link.label}
            </NavLink>
          ))}
          <WorldMenu />
          <GenresMenu />
          {user && (
            <NavLink to="/my-list" className="nav-mylist">
              My List
            </NavLink>
          )}
        </nav>

        <SearchBox key={category} defaultCategory={category} />

        <div className="account">
          {loading ? null : user ? (
            <>
              <span className="account-email" title={user.email ?? ''}>
                {user.email}
              </span>
              <button type="button" className="btn btn-ghost" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* ☰ menu on smaller screens, so the header stays on one line */}
        <div className="menu-area">
          <NavDropdown
            label={<span aria-hidden="true">☰</span>}
            ariaLabel="Menu"
            buttonClass="menu-toggle"
            panelClass="menu-panel"
          >
            {(close) => (
              <nav aria-label="Menu">
                {LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={link.className}
                    onClick={close}
                  >
                    {link.label}
                  </NavLink>
                ))}
                <details className="menu-group nav-world">
                  <summary>World Cinema</summary>
                  <div className="menu-sublinks">
                    {(Object.keys(WORLD_REGIONS) as WorldRegion[]).map((code) => (
                      <Link key={code} to={`/world?country=${code}`} onClick={close}>
                        {WORLD_REGIONS[code].label}
                      </Link>
                    ))}
                  </div>
                </details>
                <details className="menu-group nav-genres">
                  <summary>Genres</summary>
                  <div className="menu-sublinks">
                    {(Object.keys(GENRES) as GenreSlug[]).map((slug) => (
                      <Link key={slug} to={`/genre/${slug}`} onClick={close}>
                        {GENRES[slug].name}
                      </Link>
                    ))}
                  </div>
                </details>
                {user && (
                  <NavLink to="/my-list" className="nav-mylist" onClick={close}>
                    My List
                  </NavLink>
                )}

                <div className="menu-account">
                  {user ? (
                    <>
                      <span className="menu-email">{user.email}</span>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          close()
                          void handleSignOut()
                        }}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="btn btn-ghost" onClick={close}>
                      Sign in
                    </Link>
                  )}
                </div>
              </nav>
            )}
          </NavDropdown>
        </div>
      </div>
    </header>
  )
}

export default Header
