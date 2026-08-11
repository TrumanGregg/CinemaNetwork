import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import MovieGrid from "../components/MovieGrid.jsx";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadPopular() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPopular();
      setMovies(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPopular();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return loadPopular();
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchMovies(query);
      setMovies(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(movie) {
    try {
      await api.addToWatchlist(movie.id, "Plan to Watch");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Discover</h1>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-solid" type="submit">Search</button>
      </form>

      {loading && <div className="loading-strip" />}
      {error && <div className="error-banner">{error}</div>}

      <MovieGrid movies={movies} onAdd={handleAdd} emptyMessage="No movies found. Try another search." />
    </div>
  );
}
