import { create } from "zustand";
import axios from "axios";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

export const useMealStore = create((set) => ({
  meals: [],
  mealData: null,
  stats: null,
  loading: false,

  saveGoal: async (goalData) => {
    try {
      const response = await axios.post(`${API_URL}/meals/goals`, goalData, {
        withCredentials: true,
      });
      if (response.status === 200) {
        toast.success(response.message || "Goal saved successfully.");
        return true;
      }
    } catch (error) {
      toast.error("Failed to save goal.");
      console.error("Error saving goal:", error);
      throw error;
    }
  },

  sendMealData: async (mealData) => {
    try {
      console.log("Sending meal data to backend:", mealData);
      const response = await axios.post(`${API_URL}/meals`, mealData, {
        withCredentials: true,
      });
      set({ mealData: response.data.data });

      if (localStorage.getItem("mealData")) {
        localStorage.removeItem("mealData");
      }
      localStorage.setItem("mealData", JSON.stringify(response.data.data));

      console.log("Meal data sent successfully:", response.data);
      return true;
    } catch (error) {
      console.error("Error sending meal data:", error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/meals/stats`, {
        withCredentials: true,
      });
      console.log("Fetched stats from backend:", response.data.data);
      set({ stats: response.data.data });
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return;
      } else {
        toast.error("Failed to fetch nutrition stats.");
      }
      console.error("Error fetching stats:", error);
      throw error;
    }
  },
  saveMeal: async (mealData) => {
    console.log("Saving meal data to backend:", mealData);
    try {
      const response = await axios.post(`${API_URL}/meals/save`, mealData, {
        withCredentials: true,
      });
      toast.success(response.message || "Meal saved successfully.");
      return true;
    } catch (error) {}
  },

  getMeals: async () => {
    try {
      const response = await axios.get(`${API_URL}/meals/meals`, {
        withCredentials: true,
      });
      console.log("Fetched meals from backend:", response.data.data);
      set({ meals: response.data.data });
      return true;
    } catch (error) {
      toast.error("Failed to fetch meals.");
      console.error("Error fetching meals:", error);
      throw error;
    }
  },
  fetchMealData: async () => {
    try {
      set({ loading: true });
      console.log("Fetching meal data from localStorage");
      const data = localStorage.getItem("mealData");
      console.log(data);
      if (data) {
        set({ mealData: JSON.parse(data) });
        return;
      }
    } catch (error) {
      toast.error("Failed to load meal data from local storage");
      console.error("Error fetching meal data:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
