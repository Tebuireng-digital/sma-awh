import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sma_awh_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sma_awh_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      client.get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('sma_awh_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await client.post('/auth/login', { username, password });
      const { token: authToken, user: userData } = response.data;
      
      localStorage.setItem('sma_awh_token', authToken);
      localStorage.setItem('sma_awh_user', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login gagal. Cek username dan password Anda.',
      };
    } finally {
      setLoading(false);
    }
  };

  const loginSiswa = async (nisn, password) => {
    setLoading(true);
    try {
      const response = await client.post('/auth/login-siswa', { nisn, password });
      const { token: authToken, user: userData } = response.data;
      
      localStorage.setItem('sma_awh_token', authToken);
      localStorage.setItem('sma_awh_user', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login siswa / wali murid gagal. Cek NISN/NIS dan kata sandi Anda.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('sma_awh_token');
      localStorage.removeItem('sma_awh_user');
      setUser(null);
      setToken(null);
    }
  };

  const userRoles = user?.roles && user?.roles.length > 0
    ? user.roles
    : (user?.role ? [user.role] : []);

  const hasRole = (roleToCheck) => userRoles.includes(roleToCheck);
  const hasAnyRole = (roleArray) => Array.isArray(roleArray) && roleArray.some(r => userRoles.includes(r));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginSiswa, logout, userRoles, hasRole, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
