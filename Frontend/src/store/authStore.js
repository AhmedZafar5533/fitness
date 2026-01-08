import { create } from "zustand";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const getErrorMessage = (error, fallback) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
  );
};

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,

  setUser: (userData) => set({ user: userData }),

  chechAuthentication : async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/auth/check-auth");

      set({
        isAuthenticated: true,
        user: response.data.data,
        isLoading: false,
      });

      return true;
    } catch (error) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      const errorMessage = getErrorMessage(error, "Failed to verify authentication");
      set({ error: errorMessage });
      throw error;
    }
  },

  register: async (userData) => {
    set({ error: null });
    try {
      const response = await api.post("/auth/register", userData);

      if (response.status === 201) {
        toast.success("Account created successfully!");
        return true;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Registration failed");
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  login: async (credentials) => {
    set({ error: null });
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.status === 200) {
        set({ isAuthenticated: true, user: response.data.user });
        toast.success("Login successful!");
        return true;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Login failed");
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  logout: async () => {
    set({ error: null });
    try {
      const response = await api.get("/auth/logout");

      if (response.status === 200) {
        set({ isAuthenticated: false, user: null });
        toast.success("Logged out successfully!");
        return true;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Logout failed");
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  forgotPassword: async ({ email }) => {
    set({ error: null });
    try {
      const response = await api.post("/auth/forgot-password", { email });

      if (response.status === 200) {
        toast.success("Password reset link sent to your email!");
        return true;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to send reset email");
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ error: null });
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
      });

      if (response.status === 200) {
        toast.success("Password reset successfully!");
        return true;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to reset password");
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  resetStore: () =>
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    }),
}));