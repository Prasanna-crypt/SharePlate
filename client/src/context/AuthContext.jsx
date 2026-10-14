import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.get('/auth/me').then(r => { setUser(r.data); setLoading(false); })
        .catch(() => { localStorage.removeItem('token'); setToken(null); setUser(null); setLoading(false); });
    } else { setLoading(false); }
  }, [token]);

  const login = async (email, password) => {
    const r = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', r.data.token); setToken(r.data.token); setUser(r.data.user);
    return r.data.user;
  };

  const register = async (data) => {
    const r = await API.post('/auth/register', data);
    localStorage.setItem('token', r.data.token); setToken(r.data.token); setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => { localStorage.removeItem('token'); setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};
