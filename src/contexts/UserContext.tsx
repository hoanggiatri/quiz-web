import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

// UserContext interface - simplified version of AuthUser
interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  studentId?: string;
  class?: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userId: string | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync user data from AuthContext
  useEffect(() => {
    setIsLoading(authLoading);

    if (isAuthenticated && authUser) {
      // Convert AuthUser to UserContext User format
      const userData: User = {
        id: authUser.id,
        name: authUser.name || authUser.username || 'User',
        email: authUser.email,
        username: authUser.username,
        role: authUser.role as 'student' | 'teacher' | 'admin',
        studentId: authUser.studentId,
        class: authUser.class,
        avatar: authUser.avatar
      };

      setUser(userData);
    } else {
      setUser(null);
    }
  }, [authUser, isAuthenticated, authLoading]);

  const userId = user?.id || null;

  const value: UserContextType = {
    user,
    setUser,
    userId,
    isLoading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
