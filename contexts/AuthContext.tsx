'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login, LoginResponse, logout } from '@/lib/api';

type User = LoginResponse['user'] & {
  token: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          setUser({ ...JSON.parse(userData), token });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      console.log('Attempting login with:', username);
      const data = await login(username, password);
      
      console.log('Login response data:', data);
      
      // Handle case where user_exams might be missing or empty
      const userData = {
        ...data.user,
        token: data.access_token,
        user_exams: data.user_exams || []
      };

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error response:', error?.response?.data);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.token) {
        await logout(user.token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
