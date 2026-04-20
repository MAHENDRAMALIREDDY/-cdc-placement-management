import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import API from '../api/axios';

interface AuthContextType {
  token: string | null;
  role: string | null;
  displayName: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [displayName, setDisplayName] = useState<string | null>(localStorage.getItem('displayName'));

  // Fetch display name whenever we have a token but no name yet
  useEffect(() => {
    if (token && !displayName) {
      API.get('/user/profile')
        .then(res => {
          const p = res.data;
          const name = p.firstName
            ? `${p.firstName}${p.lastName ? ' ' + p.lastName : ''}`
            : p.email;
          localStorage.setItem('displayName', name);
          setDisplayName(name);
        })
        .catch(() => {
          // If profile fetch fails (e.g. company role), fall back to email from token will be blank; that's fine
        });
    }
  }, [token, displayName]);

  const login = (newToken: string, newRole: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    // Clear old display name so it gets refreshed for the new user
    localStorage.removeItem('displayName');
    setDisplayName(null);
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('displayName');
    setToken(null);
    setRole(null);
    setDisplayName(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, displayName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
