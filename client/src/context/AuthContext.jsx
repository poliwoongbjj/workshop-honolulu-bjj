import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.setToken(token);
          const response = await api.get("/auth/me");
          setUser(response.data);
        } catch (error) {
          console.error("Failed to load user:", error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/register", userData);
      const { token, ...user } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);

      // Set state
      setToken(token);
      setUser(user);
      api.setToken(token);

      return user;
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", credentials);
      const { token, ...user } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);

      // Set state
      setToken(token);
      setUser(user);
      api.setToken(token);

      return user;
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Reset state
    setToken(null);
    setUser(null);
    api.removeToken();
  };

  // Update user data
  const updateUserData = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
  };

  // Check if user has admin role
  const isAdmin = user?.role === "admin";

  // Check if user has active membership
  const hasMembership = user?.hasMembership === true;

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    isAdmin,
    hasMembership,
    register,
    login,
    logout,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
