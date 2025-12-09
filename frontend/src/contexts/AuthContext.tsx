"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        // Decode JWT to get user info (simplified)
        const token = authService.getAccessToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id: payload.userId || payload.sub,
              email: payload.email,
            });
          } catch (error) {
            authService.clearTokens();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const tokens = await authService.login(email, password);
    authService.saveTokens(tokens);
    
    // Decode JWT to get user info
    const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
    setUser({
      id: payload.userId || payload.sub,
      email: payload.email || email,
    });
    
    router.push('/dashboard');
  };

  const register = async (email: string, password: string) => {
    const tokens = await authService.register(email, password);
    authService.saveTokens(tokens);
    
    // Decode JWT to get user info
    const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
    setUser({
      id: payload.userId || payload.sub,
      email: payload.email || email,
    });
    
    router.push('/dashboard');
  };

  const logout = () => {
    authService.clearTokens();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
