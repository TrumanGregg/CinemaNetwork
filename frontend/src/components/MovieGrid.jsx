import MovieCard from "./MovieCard.jsx";

export default function MovieGrid({ movies, emptyMessage = "Nothing here yet.", ...cardProps }) {
  if (!movies || movies.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id || movie.itemId || movie.movieId} movie={movie} {...cardProps} />
      ))}
    </div>
  );
}
