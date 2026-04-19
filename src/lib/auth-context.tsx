import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import * as api from './api';
import type { UserResponse } from './api';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  register: (data: { username: string; email: string; full_name: string; hospital: string; password: string }) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount if JWT exists in localStorage
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then(setUser)
        .catch(() => api.clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const me = await api.login(username, password);
      setUser(me);
      return null; // No error
    } catch (err) {
      return err instanceof Error ? err.message : 'Login failed';
    }
  }, []);

  const register = useCallback(async (data: { username: string; email: string; full_name: string; hospital: string; password: string }): Promise<string | null> => {
    try {
      await api.register(data);
      // Auto-login after successful registration
      const me = await api.login(data.username, data.password);
      setUser(me);
      return null; // no error
    } catch (err) {
      return err instanceof Error ? err.message : 'Registration failed';
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
