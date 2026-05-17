import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSession, saveSession, clearSession } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  // Load persisted session on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSession();
      if (!cancelled) {
        setSession(s);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (role, userId, username) => {
    const s = { role, userId, username, isLoggedIn: true };
    await saveSession(s);
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
