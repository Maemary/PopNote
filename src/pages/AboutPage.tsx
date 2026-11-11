import { Link } from 'react-router'
import { useAuth } from '../auth/useAuth'

function AboutPage() {
  const { user } = useAuth()

  return (
    <main className="page about-page">
      <img src="/favicon.svg" alt="" width="64" height="64" />
      <h1>What is Popnote?</h1>

      <p className="about-lead">
        Popnote is a bookmark list for things you want to watch: movies, TV series,
        anime and animation. It is <strong>not</strong> a streaming site.
      </p>

      <section>
        <h2>What Popnote does</h2>
        <ul>
          <li>Lets you save titles you hear about, before you forget them.</li>
          <li>
            Asks <em>why</em> you want to watch each one: who recommended it, where
            you saw it, and what mood it fits. Months later, you'll still remember
            why it's on your list.
          </li>
          <li>Shows trailers, cast and details so you can decide what to watch next.</li>
          <li>
            Shows which legal services carry each title in Nigeria, such as Netflix
            or Prime Video.
          </li>
        </ul>
      </section>

      <section>
        <h2>What Popnote doesn't do</h2>
        <ul>
          <li>We don't host, upload or stream any films, series or anime.</li>
          <li>We don't link to pirated or unofficial copies.</li>
          <li>
            Trailers play from the official YouTube videos. Everything else you watch
            on the services listed under “Where to watch”.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where the information comes from</h2>
        <p>
          Titles, posters, cast and descriptions come from{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="text-link">
            The Movie Database (TMDB)
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
          Streaming availability comes from JustWatch.
        </p>
      </section>

      <div className="about-actions">
        {user ? (
          <Link to="/my-list" className="btn btn-primary">
            Go to My List
          </Link>
        ) : (
          <>
            <Link to="/signup" className="btn btn-primary">
              Create a free account
            </Link>
            <Link to="/" className="btn btn-ghost">
              Browse titles
            </Link>
          </>
        )}
      </div>
    </main>
  )
}

export default AboutPage
