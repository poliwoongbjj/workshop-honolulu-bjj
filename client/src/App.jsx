import React from "react";
import TailwindTest from "./TailwindTest";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./components/Layout/MainLayout";
import AdminLayout from "./components/Layout/AdminLayout";

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  // Protected route wrapper for members
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
  };

  // Protected route wrapper for admins
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role !== "admin") return <Navigate to="/" />;
    return children;
  };
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}></Route>
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}></Route>
    </Routes>
  );
}

export default App;
