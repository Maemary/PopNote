import { Link } from 'react-router'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <strong>Popnote</strong>
        </div>

        <p className="footer-disclaimer">
          <strong>Popnote is a bookmarking site, not a streaming site.</strong> We
          don’t host, stream or link to copies of any film, series or anime. Popnote
          helps you save what you want to watch and remember why. To actually watch
          something, use the “Where to watch” section on its page to find the legal
          services that carry it.
        </p>

        <p className="footer-credits">
          Film and TV information and images come from{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
          Streaming availability data from JustWatch.
        </p>

        <nav className="footer-links" aria-label="Footer">
          <Link to="/about">About Popnote</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/tv-shows">TV Shows</Link>
          <Link to="/anime">Anime</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
