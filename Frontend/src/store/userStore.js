import { create } from "zustand";
import axios from "axios";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

export const useUserStore = create((set) => ({
  profile: null,
  getUserProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        withCredentials: true,
      });
      console.log( response.data.data);
      set({ profile: response.data.data });
      return true;
    } catch (error) {
      toast.error("Failed to fetch user profile.");
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },
  editProfile: async (data) => {
    try {
      const response = await axios.patch(`${API_URL}/profile`, data, {
        withCredentials: true,
      });
      console.log( response.data.data);
      set({ profile: response.data.data });
      return true;
    } catch (error) {
      toast.error("Failed to update user profile.");
      console.error("Error updating user profile:", error);
      throw error;
    }
  }
}));
