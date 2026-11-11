import { posterUrl, type CastMember } from '../tmdb'

type CastListProps = {
  cast: CastMember[]
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function CastList({ cast }: CastListProps) {
  if (cast.length === 0) return null

  return (
    <section>
      <h2>Cast</h2>
      <ul className="cast-list">
        {cast.map((person) => {
          const photo = posterUrl(person.profile_path, 'w185')
          return (
            <li key={person.id}>
              {photo ? (
                <img src={photo} alt="" loading="lazy" />
              ) : (
                <span className="cast-initials" aria-hidden="true">
                  {initials(person.name)}
                </span>
              )}
              <strong>{person.name}</strong>
              <span>{person.character}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default CastList
