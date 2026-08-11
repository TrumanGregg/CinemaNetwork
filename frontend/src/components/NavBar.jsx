import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function NavBar() {
  const { user, login, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">REELIST</NavLink>

        {user ? (
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              Discover
            </NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => (isActive ? "active" : "")}>
              Watchlist
            </NavLink>
            <NavLink to="/social" className={({ isActive }) => (isActive ? "active" : "")}>
              Friends
            </NavLink>
            <NavLink to="/recommendations" className={({ isActive }) => (isActive ? "active" : "")}>
              For You
            </NavLink>
            <button className="btn" onClick={logout}>Sign out</button>
          </nav>
        ) : (
          <button className="btn btn-solid" onClick={login}>Sign in with Google</button>
        )}
      </div>
    </header>
  );
}
