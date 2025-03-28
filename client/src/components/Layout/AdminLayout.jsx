import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-blue-800 text-white transition-all duration-300 ease-in-out`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-700">
          {isSidebarOpen ? (
            <Link to="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
          ) : (
            <Link to="/admin" className="text-xl font-bold">
              AP
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-blue-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>
        <nav className="mt-5 px-2">
          <Link
            to="/admin"
            className={`flex items-center px-4 py-2 rounded-md mb-2 ${
              isActivePath("/admin")
                ? "bg-blue-700 text-white"
                : "text-blue-200 hover:bg-blue-700"
            }`}
          >
            <svg
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link
            to="/admin/techniques"
            className={`flex items-center px-4 py-2 rounded-md mb-2 ${
              location.pathname.includes("/admin/techniques")
                ? "bg-blue-700 text-white"
                : "text-blue-200 hover:bg-blue-700"
            }`}
          >
            <svg
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            {isSidebarOpen && <span>Techniques</span>}
          </Link>
          <Link
            to="/admin/categories"
            className={`flex items-center px-4 py-2 rounded-md mb-2 ${
              isActivePath("/admin/categories")
                ? "bg-blue-700 text-white"
                : "text-blue-200 hover:bg-blue-700"
            }`}
          >
            <svg
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {isSidebarOpen && <span>Categories</span>}
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center px-4 py-2 rounded-md mb-2 ${
              isActivePath("/admin/users")
                ? "bg-blue-700 text-white"
                : "text-blue-200 hover:bg-blue-700"
            }`}
          >
            <svg
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {isSidebarOpen && <span>Users</span>}
          </Link>
          <div className="border-t border-blue-700 my-4"></div>
          <Link
            to="/"
            className="flex items-center px-4 py-2 rounded-md mb-2 text-blue-200 hover:bg-blue-700"
          >
            <svg
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {isSidebarOpen && <span>Back to Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 rounded-md mb-2 text-blue-200 hover:bg-blue-700 w-full text-left"
          >
            <svg
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2v10h10V5H4zm4.293 2.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L9.586 10 8.293 8.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow">
          <div className="h-16 flex items-center justify-between px-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              {location.pathname === "/admin"
                ? "Dashboard"
                : location.pathname.includes("/admin/techniques")
                ? "Techniques Management"
                : location.pathname.includes("/admin/categories")
                ? "Categories Management"
                : location.pathname.includes("/admin/users")
                ? "User Management"
                : "Admin Panel"}
            </h1>
            <div className="flex items-center">
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  {user?.profilePicture ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {user?.firstName?.charAt(0) || ""}
                      {user?.lastName?.charAt(0) || ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
