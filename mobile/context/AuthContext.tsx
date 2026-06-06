import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '@/lib/api';
import { User, LoginCredentials, RegisterData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<string | null>;
  register: (data: RegisterData) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from storage on mount
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Try to refresh user in the background
          try {
            const res = await api.getMe();
            if (res.success && res.data) {
              await AsyncStorage.setItem('user', JSON.stringify(res.data));
              setUser(res.data);
            }
          } catch (e) {
            // Token might be invalid/expired, logout
            console.log('Background auth verification failed:', e);
            await handleClearAuth();
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const handleClearAuth = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.error(e);
    }
    setToken(null);
    setUser(null);
  };

  const login = async (credentials: LoginCredentials): Promise<string | null> => {
    try {
      setIsLoading(true);
      const res = await api.login(credentials);
      if (res.success && res.data) {
        const { token: tokenVal, user: userVal } = res.data;
        await AsyncStorage.setItem('token', tokenVal);
        await AsyncStorage.setItem('user', JSON.stringify(userVal));
        setToken(tokenVal);
        setUser(userVal);
        return null;
      }
      return res.message || 'Gagal login';
    } catch (error: any) {
      console.log('Login error:', error);
      return error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan';
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<string | null> => {
    try {
      setIsLoading(true);
  
      const res = await api.register(data);
  
      if (res.success) {
        return null;
      }
  
      return res.message || 'Gagal mendaftar';
    } catch (error: any) {
      console.log('Register error:', error);
  
      return (
        error.response?.data?.message ||
        error.message ||
        'Terjadi kesalahan jaringan'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await handleClearAuth();
    setIsLoading(false);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        await AsyncStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
      }
    } catch (e) {
      console.error('Refresh user profile failed:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
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
