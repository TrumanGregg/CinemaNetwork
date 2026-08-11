import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function RecommendationsPage() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getRecommendations();
        setRecs(data.recommendations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>For You</h1>
      </div>

      {loading && <div className="loading-strip" />}
      {error && <div className="error-banner">{error}</div>}

      {!loading && recs.length === 0 && (
        <div className="empty-state">
          Rate a few movies or add some to your watchlist to get personalized picks.
        </div>
      )}

      <div className="movie-grid">
        {recs.map((rec) => (
          <div className="ticket-card" key={rec.movieId}>
            <div className="poster" />
            <div className="stub">
              <h3>{rec.title}</h3>
              <div className="meta">{rec.reason}</div>
              <span className="status-pill">{Math.round(rec.matchScore * 100)}% match</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
