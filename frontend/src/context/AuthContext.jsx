import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('trade-knowledge-token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        window.localStorage.removeItem('trade-knowledge-token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, credentials) {
    const { data } = await api.post(path, credentials);
    window.localStorage.setItem('trade-knowledge-token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    window.localStorage.removeItem('trade-knowledge-token');
    setUser(null);
  }

  async function refreshUser() {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login: (credentials) => authenticate('/auth/login', credentials), register: (credentials) => authenticate('/auth/register', credentials), logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}