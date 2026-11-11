import { Link, useLocation, useSearchParams } from 'react-router'
import { WORLD_REGIONS, type WorldRegion } from '../lists'
import NavDropdown from './NavDropdown'

const REGIONS = Object.keys(WORLD_REGIONS) as WorldRegion[]

function WorldMenu() {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const isActive =
    pathname.startsWith('/world') || /^\/list\/(ng|in|kr|jp|cn|th)-/.test(pathname)
  const current = pathname.startsWith('/world') ? searchParams.get('country') ?? 'ng' : null

  return (
    <NavDropdown
      label={
        <>
          World Cinema <span aria-hidden="true">▾</span>
        </>
      }
      buttonClass={isActive ? 'nav-button nav-world active' : 'nav-button nav-world'}
      panelClass="world-panel"
    >
      {(close) => (
        <ul>
          {REGIONS.map((code) => (
            <li key={code}>
              <Link
                to={`/world?country=${code}`}
                onClick={close}
                className={code === current ? 'world-name current' : 'world-name'}
              >
                {WORLD_REGIONS[code].label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </NavDropdown>
  )
}

export default WorldMenu
