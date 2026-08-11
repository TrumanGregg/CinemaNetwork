import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user, login } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <h1 style={{ color: "var(--color-marquee)", fontSize: "3rem", marginBottom: 12 }}>REELIST</h1>
        <p style={{ marginBottom: 24 }}>Track what you watch. See what your friends are watching.</p>
        <button className="btn btn-solid" onClick={login}>Sign in with Google</button>
      </div>
    </div>
  );
}
