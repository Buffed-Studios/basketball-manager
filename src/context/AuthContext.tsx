import { createContext, useContext, useState, type ReactNode } from 'react';
import { getStoredToken, clearToken } from '../services/authService';

const ACTIVE_SCENARIO_KEY = 'bm_active_scenario';

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getStoredToken() !== null);

  function signIn() {
    setIsAuthenticated(true);
  }

  function signOut() {
    clearToken();
    sessionStorage.removeItem(ACTIVE_SCENARIO_KEY);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
