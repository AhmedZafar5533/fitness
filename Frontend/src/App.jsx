import "nprogress/nprogress.css";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";

import MealTrackingForm from "./pages/meal/mealForm";
import FitnessChatbot from "./pages/meal/chatbot";
import FitnessAuthForm from "./pages/meal/login";
import ProfilePage from "./pages/meal/ProfilePage";
import MealUploadPage from "./pages/meal/mealUploadPage";
import ProfileForm from "./pages/meal/ProfileForm";
import ModernDashboard from "./pages/meal/ModernDashboard";

import MainLayout from "./Layouts/MainLayout";
import ProtectedRoute from "./components/protectedRoute";
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

const App = () => {
  const { isAuthenticated, isLoading, chechAuthentication } = useAuthStore();

  useEffect(() => {
    chechAuthentication();
  }, [chechAuthentication]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <Routes>
        {/* LOGIN
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <FitnessAuthForm />
            )
          }
        />

        {/* PROTECTED ROUTES */}
        {/* <Route element={<ProtectedRoute />}> */} */
        <Route element={<MainLayout />}>
          <Route path="/home" element={<ModernDashboard />} />
          <Route path="/meals" element={<MealUploadPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/form" element={<MealTrackingForm />} />
        </Route>
        <Route path="/" element={<FitnessAuthForm />} />
        <Route path="/chat" element={<FitnessChatbot />} />
        {/* </Route> */}
        {/* PROFILE COMPLETION (should also be protected!) */}
        {/* <Route element={<ProtectedRoute skipProfileCheck />}> */}
        <Route element={<MainLayout />}>
          <Route path="/profile/info" element={<ProfileForm />} />
        </Route>
        {/* </Route> */}
        {/* CHAT (protect if needed) */}
        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
