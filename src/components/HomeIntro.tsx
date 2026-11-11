import { Link } from 'react-router'
import { useAuth } from '../auth/useAuth'

function HomeIntro() {
  const { user } = useAuth()

  return (
    <section className="home-intro">
      <div>
        <h1>
          Save what you want to watch, <span className="highlight">and why.</span>
        </h1>
        <p>
          Popnote is your watchlist for movies, series and anime. Save anything in
          one click, and add a quick note on why if you like, so your list still
          makes sense months later.
        </p>
        <p className="home-intro-note">
          🍿 Heads up: Popnote is a bookmarking site, not a streaming site. We don't
          host or play any films. Each title shows where it's legally available.{' '}
          <Link to="/about" className="text-link">
            Learn more
          </Link>
        </p>
      </div>

      <div className="home-intro-actions">
        {user ? (
          <Link to="/my-list" className="btn btn-primary">
            Open My List
          </Link>
        ) : (
          <>
            <Link to="/signup" className="btn btn-primary">
              Start your list, it's free
            </Link>
            <Link to="/login" className="btn btn-ghost">
              Sign in
            </Link>
          </>
        )}
      </div>
    </section>
  )
}

export default HomeIntro
