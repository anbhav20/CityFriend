import { createContext, useCallback, useEffect, useState } from "react";
import { handleLogin, handleLogout, handleRegister, handleMe } from "./services/auth.api";
import { disconnectSocket } from "../messages/hooks/useSocket"; //  so we can disconnect on logout
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const data = await handleMe();
        if (data?.user) setUser(data.user);
      } catch {
        // 401 from /me is expected when not logged in — stay silent
      } finally {
        setAuthReady(true);
      }
    };
    restoreUser();
  }, []);

  const Login = useCallback(async (identifier, password) => {
    const data = await handleLogin(identifier, password);
    if (data?.user) setUser(data.user);
    return data;
  }, []);

  const Register = useCallback(async (username, email, password) => {
    const data = await handleRegister(username, email, password);
    if (data?.user) setUser(data.user);
    return data;
  }, []);

  const LogOut = useCallback(async () => {
    const data = await handleLogout();
    setUser(null);
    return data;
  }, []);

  const refreshUser = useCallback(async () => {
     disconnectSocket();
    const data = await handleMe();
    if (data?.user) setUser(data.user);
    return data?.user ?? null;
  }, []);

  if (!authReady) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, Login, Register, LogOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};