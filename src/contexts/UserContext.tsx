import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userId: string | null;
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
  // Mock user data - trong thực tế sẽ lấy từ authentication
  const [user, setUser] = useState<User | null>({
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', // Mock userId từ API example
    name: 'Nguyễn Văn A',
    email: 'student@example.com',
    role: 'student'
  });

  const userId = user?.id || null;

  const value: UserContextType = {
    user,
    setUser,
    userId,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
