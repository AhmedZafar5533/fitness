import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const ProtectedRoute = ({ skipProfileCheck = false }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();
  const toastShown = useRef(false);

  // Reset toast flag when location changes
  useEffect(() => {
    toastShown.current = false;
  }, [location.pathname]);

  // Still loading - don't redirect yet
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Skip profile check for profile completion page
  if (skipProfileCheck) {
    return <Outlet />;
  }

  // Logged in but profile NOT completed
  if (user && !user.profileDone) {
    if (!toastShown.current) {
      toast.warning("Please complete your profile before accessing the app", {
        duration: 4000,
      });
      toastShown.current = true;
    }
    return <Navigate to="/profile/info" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
