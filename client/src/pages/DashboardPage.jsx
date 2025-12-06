// src/pages/DashboardPage.jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { shortenerClient } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState("");
  const [mode, setMode] = useState("standard");
  const [error, setError] = useState("");



  async function fetchMyUrls() {
    try {
      const res = await shortenerClient.get("/my-urls");
      setUrls(res.data.urls || []);
    } catch (err) {
      console.error("Failed to load URLs:", err.response?.data || err.message);
      setError("Failed to load URLs");
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchMyUrls();
  }, [user]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!longUrl.trim()) return;

    try {
      const res = await shortenerClient.post("/shorten", { longUrl, mode,});
      const newUrl = {
        shortCode: res.data.shortCode,
        shortUrl: res.data.shortUrl,
        longUrl,
        clickCount: 0,
        createdAt: new Date().toISOString(),
        linkType: res.data.linkType,
        expiryDate: res.data.expiryDate,
      };
      setUrls((prev) => [newUrl, ...prev]);
      setLongUrl("");
    } catch (err) {
      console.error("Create failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to create short URL");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

 if (!user) {
    return (
      <div className="page-center">
        <div className="card auth-card">
          <p>You are not logged in.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

// inside DashboardPage component, after the `if (!user)` guard

return (
  <div className="dashboard-page">
    <div className="dashboard-shell">
      {/* Hero header */}
      <div className="dashboard-header-card">
        <div>
          <div className="dashboard-title">ByteURL</div>
          <div className="dashboard-subtitle">
            Smart URL shortening with link types & expiry.
          </div>
        </div>
        <div>
          <span className="dashboard-user">Logged in as: {user.email}</span>
          <button className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Shorten bar */}
      <div className="card shorten-card">
        <h3>Create a new short URL</h3>
        <form
          onSubmit={handleCreate}
          style={{ marginTop: 8 }}
        >
          <div className="shorten-bar">
            <input
              className="shorten-input"
              type="text"
              placeholder="Paste a long URL here (https://...)"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
            <select
              className="shorten-select"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="7d">Expire in 7 days</option>
              <option value="30d">Expire in 30 days</option>
              <option value="one-time">One-time</option>
            </select>
            <button type="submit">Shorten</button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      {/* URLs table */}
      <div className="card">
        <h3>My URLs</h3>
        {urls.length === 0 && (
          <p className="muted">No URLs yet. Create your first short link!</p>
        )}
        {urls.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Short URL</th>
                <th>Long URL</th>
                <th>Type</th>
                <th>Expires</th>
                <th>Clicks</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((u, idx) => {
                const expiryText = u.expiryDate
                  ? new Date(u.expiryDate).toLocaleString()
                  : "—";

                const typeLabel =
                  u.linkType === "standard"
                    ? "Standard"
                    : u.linkType === "temporary"
                    ? "Temporary"
                    : "One-time";

                return (
                  <tr key={u.id || idx}>
                    <td>
                      <a href={u.shortUrl} target="_blank" rel="noreferrer">
                        {u.shortUrl}
                      </a>
                    </td>
                    <td
                      style={{
                        maxWidth: 260,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {u.longUrl}
                    </td>
                    <td>{typeLabel}</td>
                    <td>{expiryText}</td>
                    <td>{u.clickCount ?? 0}</td>
                    <td>{new Date(u.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);
}
