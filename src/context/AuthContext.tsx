import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'traveller' | 'admin';
  avatar?: string;
  phone?: string;
  country?: string;
  emergencyContact?: string;
  travelPreferences?: string;
  dietaryRequirements?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: (role: 'traveller' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aetheria_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('aetheria_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login request failed. Please check credentials.',
      };
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        localStorage.setItem('aetheria_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Email might already exist.',
      };
    }
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } catch {
      // Ignored
    }
    localStorage.removeItem('aetheria_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    }
  };

  const loginAsDemo = async (role: 'traveller' | 'admin') => {
    if (role === 'admin') {
      await login('admin@aetheria.travel', 'admin123');
    } else {
      await login('traveller@aetheria.travel', 'traveller123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
