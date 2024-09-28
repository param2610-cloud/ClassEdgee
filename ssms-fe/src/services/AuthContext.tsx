import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the shape of your user object
interface User {
  id: string;
  username: string;
  // Add other user properties as needed
}

// Define the shape of your context
interface AuthContextType {
  user: User | null;
  logout: () => void;
  // Add other functions like login if needed
}

// Create the context with a default value matching AuthContextType
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      validateToken(token);
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/validate-token', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
    }
  };

  // Provide a value that matches AuthContextType
  const contextValue: AuthContextType = {
    user,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};