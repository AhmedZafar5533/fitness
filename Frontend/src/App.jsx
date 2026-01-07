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

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();
  const toastShownRef = useRef(false);

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user && !user.profileDone && location.pathname !== "/profile/info") {
    if (!toastShownRef.current) {
      toast.warning(
        "Please complete your profile details to access the full site."
      );
      toastShownRef.current = true;
    }
    return <Navigate to="/profile/info" replace />;
  }

  if (user && user.profileDone && location.pathname === "/profile/info") {
    return <Navigate to="/home" replace />;
  }

  toastShownRef.current = false;

  return children;
};

const App = () => {
  const { isAuthenticated, isLoading, chechAuthentication, user } =
    useAuthStore();

  useEffect(() => {
    chechAuthentication();
  }, [chechAuthentication]);

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

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile/info" element={<ProfileForm />} />
          <Route path="/home" element={<ModernDashboard />} />
          <Route path="/meals" element={<MealUploadPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/form" element={<MealTrackingForm />} />
        </Route>

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <FitnessChatbot />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;