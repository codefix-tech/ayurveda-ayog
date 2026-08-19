import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Re-fetch user on initial load if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            // Token might be invalid or expired
            logout();
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, phone, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const loginWithOtp = async (email, otp) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose: 'login' }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Email OTP verification failed');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
    }
    return data;
  };

  const registerWithOtp = async (email, otp, name, phone) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, name, phone, purpose: 'register' }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Email OTP registration failed');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithOtp,
        registerWithOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
