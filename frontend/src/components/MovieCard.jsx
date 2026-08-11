const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

export default function MovieCard({ movie, statusLabel, onAdd, onStatusChange, onRemove }) {
  const title = movie.title || movie.movieTitle;
  const posterPath = movie.poster_path || movie.posterPath;
  const year = (movie.release_date || "").slice(0, 4);

  return (
    <div className="ticket-card">
      <div
        className="poster"
        style={posterPath ? { backgroundImage: `url(${POSTER_BASE}${posterPath})` } : undefined}
      />
      <div className="stub">
        <h3 title={title}>{title || "Untitled"}</h3>
        {year && <div className="meta">{year}</div>}
        {statusLabel && <span className="status-pill">{statusLabel}</span>}

        {onAdd && (
          <button className="btn" style={{ marginTop: 8, width: "100%" }} onClick={() => onAdd(movie)}>
            + Watchlist
          </button>
        )}

        {onStatusChange && (
          <select
            style={{ marginTop: 8 }}
            value={movie.status}
            onChange={(e) => onStatusChange(movie, e.target.value)}
          >
            <option>Plan to Watch</option>
            <option>Watching</option>
            <option>Watched</option>
            <option>Dropped</option>
          </select>
        )}

        {onRemove && (
          <button
            className="btn btn-danger"
            style={{ marginTop: 8, width: "100%" }}
            onClick={() => onRemove(movie)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
