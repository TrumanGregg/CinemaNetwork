import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function SocialPage() {
  const [feed, setFeed] = useState([]);
  const [friendId, setFriendId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSocialFeed();
      setFeed(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddFriend(e) {
    e.preventDefault();
    if (!friendId.trim()) return;
    try {
      await api.requestFriend(friendId.trim());
      setNotice("Friend request sent.");
      setFriendId("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Friend Activity</h1>
      </div>

      <form className="search-bar" onSubmit={handleAddFriend}>
        <input
          placeholder="Friend's user ID"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />
        <button className="btn btn-solid" type="submit">Add Friend</button>
      </form>

      {notice && <div className="error-banner" style={{ borderColor: "var(--color-marquee)", color: "var(--color-marquee)" }}>{notice}</div>}
      {loading && <div className="loading-strip" />}
      {error && <div className="error-banner">{error}</div>}

      {!loading && feed.length === 0 && (
        <div className="empty-state">No recent activity from friends in the last 7 days.</div>
      )}

      {feed.map((item) => (
        <div className="feed-item" key={item.activityId}>
          <div className="who">{item.userId}</div>
          <div>
            Rated <strong>{item.movieTitle || `Movie #${item.movieId}`}</strong> {item.rating}/5
            {item.comment ? ` — "${item.comment}"` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
