// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { authClient } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { userId, email }
  const [loading, setLoading] = useState(true);

  // On first load, if token exists, try /auth/me
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    authClient
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function register(email, password) {
    const res = await authClient.post("/register", { email, password });
    const { token, userId, email: userEmail } = res.data;
    localStorage.setItem("authToken", token);
    setUser({ userId, email: userEmail });
    return res.data;
  }

  async function login(email, password) {
    const res = await authClient.post("/login", { email, password });
    const { token, userId, email: userEmail } = res.data;
    localStorage.setItem("authToken", token);
    setUser({ userId, email: userEmail });
    return res.data;
  }


  useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    setLoading(false);
    return;
  }

  authClient
    .get("/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setUser(res.data);
    })
    .catch(() => {
      localStorage.removeItem("authToken");
      setUser(null);
    })
    .finally(() => setLoading(false));
  }, []);
  
  function logout() {
    localStorage.removeItem("authToken");
    setUser(null);
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
