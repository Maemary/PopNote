import { Link, useParams } from 'react-router'
import { isGenreSlug } from '../lists'
import BrowsePage from './BrowsePage'

function GenrePage() {
  const { slug } = useParams()

  if (!isGenreSlug(slug)) {
    return (
      <main className="page">
        <p>
          We don’t have that genre. <Link to="/" className="text-link">Go home</Link>
        </p>
      </main>
    )
  }

  return <BrowsePage key={slug} section="genre" genre={slug} />
}

export default GenrePage
