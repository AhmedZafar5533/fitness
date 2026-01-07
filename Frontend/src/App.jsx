import "nprogress/nprogress.css";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useEffect, useRef } from "react";

import MealTrackingForm from "./pages/meal/mealForm";
import FitnessChatbot from "./pages/meal/chatbot";
import FitnessAuthForm from "./pages/meal/login";
import ProfilePage from "./pages/meal/ProfilePage";
import MealUploadPage from "./pages/meal/mealUploadPage";
import ProfileForm from "./pages/meal/ProfileForm";
import ModernDashboard from "./pages/meal/ModernDashboard";
import ResetPasswordPage from "./pages/meal/PasswordReset";

import MainLayout from "./Layouts/MainLayout";
import { useAuthStore } from "./store/authStore";

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

/**
 * Protected Route Component
 * Handles Authentication check AND Profile Completion check
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();
  const toastShownRef = useRef(false);

  if (isLoading) return <LoadingScreen />;

  // 1. Check Authentication
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Check Profile Completion
  // If profile is NOT done, and user is trying to access any page OTHER than /profile/info
  if (user && !user.profileDone && location.pathname !== "/profile/info") {
    // Prevent toast duplication on re-renders
    if (!toastShownRef.current) {
      toast.warning(
        "Please complete your profile details to access the full site."
      );
      toastShownRef.current = true;
    }
    return <Navigate to="/profile/info" replace />;
  }

  // Reset toast ref if valid navigation
  toastShownRef.current = false;

  return children;
};

const App = () => {
  const { isAuthenticated, isLoading, chechAuthentication, user } =
    useAuthStore();

  useEffect(() => {
    chechAuthentication();
  }, [chechAuthentication]);

  // Determine where to redirect logged-in users who try to access the login page
  const getHomeRedirect = () => {
    if (user && !user.profileDone) {
      return "/profile/info";
    }
    return "/home";
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <Routes>
        {/* === PUBLIC ROUTES === */}

        {/* Login Page: If logged in, redirect based on profile status */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getHomeRedirect()} replace />
            ) : (
              <FitnessAuthForm />
            )
          }
        />

        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* === PROTECTED ROUTES === */}

        {/* 1. Profile Completion Route (Protected by Auth, but not by profileDone tag) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile/info" element={<ProfileForm />} />
        </Route>

        {/* 2. Main App Routes (Protected by Auth AND enforced profileDone check) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<ModernDashboard />} />
          <Route path="/meals" element={<MealUploadPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/form" element={<MealTrackingForm />} />
        </Route>

        {/* Chatbot Route */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <FitnessChatbot />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
