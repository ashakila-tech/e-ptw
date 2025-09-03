import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fakeWait = (ms = 500) => new Promise(r => setTimeout(r, ms));

  const signup = async ({ email, password }) => {
    setLoading(true); setError(null);
    await fakeWait();
    if (!email || !password) {
      setLoading(false);
      throw new Error("Email and password are required");
    }
    // In real life you'd POST to an API here.
    const newUser = { id: Date.now(), email };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    setLoading(false);
    return newUser;
  };

  const login = async ({ email, password }) => {
    setLoading(true); setError(null);
    await fakeWait();
    if (!email || !password) {
      setLoading(false);
      throw new Error("Email and password are required");
    }
    // Pretend the credentials are valid.
    const loggedInUser = { id: 1, email };
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setLoading(false);
    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = { user, loading, error, signup, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
