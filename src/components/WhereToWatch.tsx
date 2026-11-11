import { logoUrl, type CountryProviders } from '../tmdb'

type WhereToWatchProps = {
  providers: CountryProviders | undefined
}

const GROUPS = [
  { key: 'flatrate', label: 'Stream' },
  { key: 'free', label: 'Free' },
  { key: 'ads', label: 'Free with ads' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
] as const

function WhereToWatch({ providers }: WhereToWatchProps) {
  return (
    <section>
      <h2>Where to watch in Nigeria</h2>

      {!providers ? (
        <p className="meta">Not available to stream in Nigeria right now.</p>
      ) : (
        <>
          {GROUPS.map(({ key, label }) => {
            const list = providers[key]
            if (!list || list.length === 0) return null

            return (
              <div key={key} className="provider-group">
                <h3>{label}</h3>
                <ul className="provider-list">
                  {list.map((p) => {
                    const logo = logoUrl(p.logo_path)
                    return (
                      <li key={p.provider_id}>
                        {logo && <img src={logo} alt="" />}
                        <span>{p.provider_name}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          <a
            className="provider-link"
            href={providers.link}
            target="_blank"
            rel="noreferrer"
          >
            See all options →
          </a>
        </>
      )}

      <p className="attribution">Streaming data from JustWatch</p>
    </section>
  )
}

export default WhereToWatch