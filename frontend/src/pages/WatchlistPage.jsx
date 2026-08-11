import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import MovieGrid from "../components/MovieGrid.jsx";

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWatchlist();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(item, status) {
    try {
      await api.updateWatchlistItem(item.itemId, { status });
      setItems((prev) => prev.map((i) => (i.itemId === item.itemId ? { ...i, status } : i)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(item) {
    try {
      await api.removeFromWatchlist(item.itemId);
      setItems((prev) => prev.filter((i) => i.itemId !== item.itemId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Watchlist</h1>
      </div>

      {loading && <div className="loading-strip" />}
      {error && <div className="error-banner">{error}</div>}

      <MovieGrid
        movies={items}
        onStatusChange={handleStatusChange}
        onRemove={handleRemove}
        emptyMessage="Your watchlist is empty. Add movies from Discover."
      />
    </div>
  );
}
