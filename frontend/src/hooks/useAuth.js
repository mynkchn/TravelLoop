import { useState, useEffect, useCallback } from 'react';
import { auth, user } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await auth.login(email, password);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      name: data.name,
      email: data.email,
      is_admin: data.is_admin,
    }));
    setUser({ id: data.user_id, name: data.name, email: data.email, is_admin: data.is_admin });
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await auth.signup(name, email, password);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      name: data.name,
      email: data.email,
      is_admin: data.is_admin,
    }));
    setUser({ id: data.user_id, name: data.name, email: data.email, is_admin: data.is_admin });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const updated = await user.update(data);
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  return { user, loading, login, signup, logout, updateUser };
}