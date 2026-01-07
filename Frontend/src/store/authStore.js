import { create } from "zustand";
import axios from "axios";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  chechAuthentication: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/auth/check-auth`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        console.log("User is authenticated:", response.data.data);
        set({
          isAuthenticated: true,
          user: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      set({ isAuthenticated: false, user: null, isLoading: false });
      throw error;
    }
  },

  sendRegisterRequest: async (userData) => {
    try {
      console.log("Sending registration data:", userData);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      if (response.status === 201) {
        toast.success("Account created successfully!");
        return true;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response.error ||
          "Registration failed"
      );
      console.error("Registration error:", error);
      throw error;
    }
  },

  sendLoginRequest: async (user) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, user, {
        withCredentials: true,
      });

      if (response.status === 200) {
        toast.success("Login successful!");
        set({ isAuthenticated: true, user: response.data.user });
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      console.error("Login error:", error);
      throw error;
    }
  },

  sendLogoutRequest: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/logout`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        set({ isAuthenticated: false, user: null });
        toast.success("Logout successful!");
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      console.error("Logout error:", error);
      throw error;
    }
  },

  // ---- Forgot Password Actions ----

  sendForgotPasswordRequest: async ({ email }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      if (response.status === 200) {
        toast.success("Reset link sent to your email!");
        return true;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  sendResetPasswordRequest: async (token, newPassword) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/reset-password/${token}`,
        { newPassword }
      );

      if (response.status === 200) {
        toast.success("Password reset successfully!");
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      console.error("Reset password error:", error);
      throw error;
    }
  },
}));
