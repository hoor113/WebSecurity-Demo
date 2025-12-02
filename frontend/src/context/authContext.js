import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCsrfToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Lấy user từ localStorage nếu có
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Khi setUser, đồng thời lưu vào localStorage
  const setUser = (user) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('csrfToken', getCsrfToken());
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('csrfToken');
    }
  };

  const value = {
    user,
    loading,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
