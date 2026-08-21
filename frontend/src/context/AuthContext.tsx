import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.js';
import { apiFetch } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (data: any) => Promise<boolean>;
  switchRole: (role: UserRole) => Promise<void>; 
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // Initial login as Customer for instant pleasant experience
    login('alex@foodgo.com', 'ROLE_CUSTOMER');
  }, []);

  const login = async (email?: string, role: UserRole = 'ROLE_CUSTOMER'): Promise<boolean> => {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data.user);
        setToken(data.data.token);
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data.user);
        setToken(data.data.token);
        setIsAuthModalOpen(false);
        return true;
      }
    } catch (err) {
      console.error('Register error:', err);
    }
    return false;
  };

  const switchRole = async (role: UserRole) => {
    // Switch to corresponding role user
    await login(undefined, role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        switchRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
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
