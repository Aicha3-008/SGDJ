import { createContext, useCallback, useMemo, useState } from "react";
import * as authService from "../api/authService";
import { clearSession, getStoredUser, getToken, setSession } from "./tokenStorage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getToken());

  const login = useCallback(async (email, motDePasse) => {
    const data = await authService.login(email, motDePasse);
    setSession(data.token, data.utilisateur);
    setToken(data.token);
    setUser(data.utilisateur);
    return data.utilisateur;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // La deconnexion cote client doit reussir meme si l'appel serveur echoue.
    } finally {
      clearSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  const updateStoredUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    const currentToken = getToken();
    if (currentToken) {
      setSession(currentToken, updatedUser);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isAdmin: user?.role === "ADMIN",
      login,
      logout,
      updateStoredUser,
    }),
    [user, token, login, logout, updateStoredUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
