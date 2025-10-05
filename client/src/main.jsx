import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/Dashboard";
import UserLogin from "./pages/User/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { UserProvider } from "./contexts/UserContext";
import "./index.css";
import "./components.css";

const router = createBrowserRouter(
  [
    // Public routes
    { path: "/login", element: <UserLogin /> },
    { path: "/admin/login", element: <AdminLogin /> },

    // Protected admin routes
    {
      path: "/admin",
      element: (
        <AdminProtectedRoute>
          <Dashboard />
        </AdminProtectedRoute>
      ),
    },

    // Main app routes
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
      ],
    },

    // Catch all other routes
    { path: "*", element: <Navigate to="/" replace /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    />
  </UserProvider>
);
