import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@empresa.com',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'funcionario',
    setor_id: '1',
    active: true,
    created_at: '2024-01-02T00:00:00Z'
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false
  });

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === '123456') {
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false
      });
      return { success: true, user };
    }
    
    setAuthState(prev => ({ ...prev, loading: false }));
    return { success: false };
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};