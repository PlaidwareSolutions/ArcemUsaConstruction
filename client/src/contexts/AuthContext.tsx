import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface AuthUser {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => false,
  logout: async () => {},
  checkAuth: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const userData = await apiRequest<AuthUser>({
        url: '/api/user',
        method: 'GET',
        on401: 'returnNull',
        // Suppress console logs for authentication check
        suppressLogs: true
      });
      
      if (userData) {
        setUser(userData);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      // Don't log auth check errors to console when the user is not logged in
      // as this is an expected state and not an actual error
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiRequest<AuthUser>({
        url: '/api/login',
        method: 'POST',
        body: { username, password }
      });
      
      if (response) {
        setUser(response);
        // Invalidate any user-related queries
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // First set user to null to immediately update UI
      setUser(null);
      
      // Clear any authenticated queries
      queryClient.clear();
      
      // Call the logout API - use parseResponse: false since it returns text/plain "OK"
      await apiRequest({
        url: '/api/logout',
        method: 'POST',
        parseResponse: false, // Don't try to parse the response as JSON
        suppressLogs: true    // Suppress any errors
      });
      
      // Add a small delay to ensure the logout API call completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force a complete page reload to reset all application state
      window.location.href = '/';
      
      return; // Early return as page will reload
    } catch (error) {
      // We should never get here with suppressLogs, but just in case
      // Even if there's an error, set user to null
      setUser(null);
      
      // Force a complete page reload anyway to clean up state
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}