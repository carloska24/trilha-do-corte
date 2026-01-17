import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientProfile, BarberProfile } from '../types';

type UserType = 'client' | 'barber' | null;

interface AuthContextType {
  userType: UserType;
  currentUser: ClientProfile | BarberProfile | null;
  login: (type: 'client' | 'barber', profile: ClientProfile | BarberProfile) => void;
  logout: () => void;
  updateProfile: (data: Partial<ClientProfile | BarberProfile>) => void;
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

  // REFRESH PROFILE ON MOUNT (To get publicId etc.)
  useEffect(() => {
    const refreshProfile = async () => {
      if (userType === 'client' && currentUser?.id) {
        try {
          // Dynamic import to avoid circular dep if api imports AuthContext (it doesn't, but safe)
          const { api } = await import('../services/api');
          const freshData = await api.getProfile(currentUser.id);
          if (freshData) {
            console.log('🔄 Profile Refreshed:', freshData.name);
            setCurrentUser(prev => ({ ...prev, ...freshData }) as ClientProfile);
          }
        } catch (err) {
          console.error('Failed to refresh profile:', err);
        }
      }
    };

    refreshProfile();
  }, [userType]); // Run once when userType is settled (from localstorage)

  const login = (type: 'client' | 'barber', profile: ClientProfile | BarberProfile) => {
    setUserType(type);
    setCurrentUser(profile);
  };

  const logout = () => {
    setUserType(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = (data: Partial<ClientProfile | BarberProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      // TS might complain about mixing types, but simpler merge is fine for now or explicit cast
      return { ...prev, ...data } as ClientProfile | BarberProfile;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        userType,
        currentUser,
        login,
        logout,
        updateProfile,
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
