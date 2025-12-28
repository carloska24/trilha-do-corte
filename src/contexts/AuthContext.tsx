import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientProfile, BarberProfile } from '../types';

type UserType = 'client' | 'barber' | null;

interface AuthContextType {
  userType: UserType;
  currentUser: ClientProfile | BarberProfile | null;
  login: (type: 'client' | 'barber', profile: ClientProfile | BarberProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<UserType>(() => {
    const saved = localStorage.getItem('userType');
    return (saved as UserType) || null;
  });

  const [currentUser, setCurrentUser] = useState<ClientProfile | BarberProfile | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (userType) {
      localStorage.setItem('userType', userType);
    } else {
      localStorage.removeItem('userType');
    }
  }, [userType]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = (type: 'client' | 'barber', profile: ClientProfile | BarberProfile) => {
    setUserType(type);
    setCurrentUser(profile);
  };

  const logout = () => {
    setUserType(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userType,
        currentUser,
        login,
        logout,
        isAuthenticated: !!userType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
