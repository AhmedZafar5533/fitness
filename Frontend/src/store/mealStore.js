import { create } from "zustand";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const useMealStore = create((set, get) => ({
  // State
  meals: [],
  recommendedMeals: [],
  upcomingMeals: [],
  mealData: null,
  stats: null,
  isLoading: false,
  error: null,

  // ============= MEAL PREDICTION (Image Upload) =============
  
  // POST /meals - Upload image and get prediction
  sendMealData: async (formData) => {
    try {
      set({ isLoading: true, error: null });
      console.log("Sending meal data to backend");
      
      const response = await api.post("/meals", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      set({ mealData: response.data.data, isLoading: false });

      // Update localStorage
      localStorage.removeItem("mealData");
      localStorage.setItem("mealData", JSON.stringify(response.data.data));

      console.log("Meal data sent successfully:", response.data);
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error sending meal data", 
        isLoading: false 
      });
      console.error("Error sending meal data:", error);
      throw error;
    }
  },

  // ============= MEAL LOGGING =============

  // POST /meals/log - Log a meal (eaten)
  logMeal: async (mealData) => {
    try {
      set({ isLoading: true, error: null });
      console.log("Logging meal:", mealData);
      
      const response = await api.post("/meals/log", mealData);
      
      set((state) => ({
        meals: [response.data.meal, ...state.meals],
        stats: response.data.stats,
        isLoading: false,
      }));

      // Clear mealData from localStorage after logging
      localStorage.removeItem("mealData");
      set({ mealData: null });

      toast.success("Meal logged successfully!");
      return response.data.meal;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to log meal", 
        isLoading: false 
      });
      toast.error("Failed to log meal.");
      console.error("Error logging meal:", error);
      throw error;
    }
  },

  // POST /meals/save - Save a meal (alternative to log)
  saveMeal: async (mealData) => {
    try {
      set({ isLoading: true, error: null });
      console.log("Saving meal data:", mealData);
      
      const response = await api.post("/meals/save", mealData);
      
      set((state) => ({
        meals: [response.data.meal, ...state.meals],
        stats: response.data.stats,
        isLoading: false,
      }));

      toast.success("Meal saved successfully!");
      return response.data.meal;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to save meal", 
        isLoading: false 
      });
      toast.error("Failed to save meal.");
      console.error("Error saving meal:", error);
      throw error;
    }
  },

  // GET /meals/meals - Get today's eaten meals
  getMeals: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get("/meals/meals");
      console.log("Fetched meals:", response.data.data);
      
      set({ meals: response.data.data || [], isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch meals", 
        isLoading: false 
      });
      toast.error("Failed to fetch meals.");
      console.error("Error fetching meals:", error);
      return [];
    }
  },

  // DELETE /meals/:mealId - Delete a meal
  deleteMeal: async (mealId) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.delete(`/meals/${mealId}`);
      
      set((state) => ({
        meals: state.meals.filter((meal) => meal._id !== mealId),
        isLoading: false,
      }));

      // Refresh stats after deletion
      get().getStats();
      
      toast.success("Meal deleted successfully.");
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to delete meal", 
        isLoading: false 
      });
      toast.error("Failed to delete meal.");
      console.error("Error deleting meal:", error);
      return false;
    }
  },

  // ============= RECOMMENDATIONS =============

  // GET /meals/recommendations - Get recommended meals
  getRecommendedMeals: async (limit = 50, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get("/meals/recommendations", {
        params: { limit, page },
      });
      console.log("Fetched recommended meals:", response.data.data);
      
      set({ recommendedMeals: response.data.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch recommendations",
        isLoading: false,
      });
      console.error("Error fetching recommendations:", error);
      return { data: [], pagination: null };
    }
  },

  // DELETE /meals/recommendations/:mealId - Delete a recommendation
  deleteRecommendedMeal: async (mealId) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.delete(`/meals/recommendations/${mealId}`);

      set((state) => ({
        recommendedMeals: state.recommendedMeals.filter((meal) => meal._id !== mealId),
        isLoading: false,
      }));

      toast.success("Recommendation deleted successfully.");
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete recommendation",
        isLoading: false,
      });
      toast.error("Failed to delete recommendation.");
      return false;
    }
  },
// PATCH /meals/upcoming/:mealId/reschedule - Reschedule an upcoming meal
rescheduleUpcomingMeal: async (mealId, newScheduledTime) => {
  try {
    set({ isLoading: true, error: null });
    console.log("Rescheduling upcoming meal:", mealId, "to:", newScheduledTime);
    
    const response = await api.patch(`/meals/upcoming/${mealId}/reschedule`, {
      scheduledTime: newScheduledTime,
    });

    const rescheduledMeal = response.data.meal;

    set((state) => ({
      upcomingMeals: state.upcomingMeals.map((meal) =>
        meal._id === mealId 
          ? { ...meal, scheduledTime: newScheduledTime, ...rescheduledMeal } 
          : meal
      ),
      isLoading: false,
    }));

    toast.success("Meal rescheduled successfully!");
    return rescheduledMeal;
  } catch (error) {
    set({
      error: error.response?.data?.message || "Failed to reschedule meal",
      isLoading: false,
    });
    toast.error("Failed to reschedule meal.");
    console.error("Error rescheduling meal:", error);
    return null;
  }
},
  // PATCH /meals/recommendations/:mealId/eat - Mark recommendation as eaten
  eatRecommendedMeal: async (mealId, time = null) => {
    try {
      set({ isLoading: true, error: null });
      console.log("Marking recommendation as eaten... Meal ID:", mealId);
      const response = await api.patch(`/meals/${mealId._id}/convert-to-upcoming`, {
        time: time || new Date(),
      });

      const eatenMeal = response.data.meal;

      set((state) => ({
        recommendedMeals: state.recommendedMeals.filter((meal) => meal._id !== mealId._id),
        upcomingMeals: [eatenMeal, ...state.upcomingMeals],

        stats: response.data.stats,
        isLoading: false,
      }));

      toast.success("Meal marked as eaten!");
      return eatenMeal;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to mark meal as eaten",
        isLoading: false,
      });
      toast.error("Failed to mark meal as eaten.");
      return null;
    }
  },

  // ============= UPCOMING MEALS =============

  // GET /meals/upcoming - Get upcoming meals
  getUpcomingMeals: async (limit = 50, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      console.log("Fetching upcoming meals...");
      
      const response = await api.get("/meals/upcoming", {
        params: { limit, page },
      });
      console.log("Fetched upcoming meals:", response.data.data);
      
      set({ upcomingMeals: response.data.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch upcoming meals",
        isLoading: false,
      });
      console.error("Error fetching upcoming meals:", error);
      return { data: [], pagination: null };
    }
  },

  // DELETE /meals/upcoming/:mealId - Delete an upcoming meal
  deleteUpcomingMeal: async (mealId) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.delete(`/meals/upcoming/${mealId}`);

      set((state) => ({
        upcomingMeals: state.upcomingMeals.filter((meal) => meal._id !== mealId),
        isLoading: false,
      }));

      toast.success("Upcoming meal deleted successfully.");
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete upcoming meal",
        isLoading: false,
      });
      toast.error("Failed to delete upcoming meal.");
      return false;
    }
  },

  // PATCH /meals/upcoming/:mealId/eat - Mark upcoming meal as eaten
  eatUpcomingMeal: async (mealId, time = null) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.patch(`/meals/upcoming/${mealId}/eat`, {
        time: time || new Date(),
      });

      const eatenMeal = response.data.meal;

      set((state) => ({
        upcomingMeals: state.upcomingMeals.filter((meal) => meal._id !== mealId),
        meals: [eatenMeal, ...state.meals],
        stats: response.data.stats,
        isLoading: false,
      }));

      toast.success("Meal marked as eaten!");
      return eatenMeal;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to mark meal as eaten",
        isLoading: false,
      });
      toast.error("Failed to mark meal as eaten.");
      return null;
    }
  },

  // PATCH /meals/upcoming/:mealId/skip - Skip an upcoming meal
  skipUpcomingMeal: async (mealId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.patch(`/meals/upcoming/${mealId}/skip`);

      set((state) => ({
        upcomingMeals: state.upcomingMeals.map((meal) =>
          meal._id === mealId ? { ...meal, status: "skipped" } : meal
        ),
        isLoading: false,
      }));

      toast.success("Meal skipped.");
      return response.data.meal;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to skip meal",
        isLoading: false,
      });
      toast.error("Failed to skip meal.");
      return null;
    }
  },

  // ============= MEALS BY STATUS =============

  // GET /meals/status/:status - Get meals by status
  getMealsByStatus: async (status, limit = 50, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(`/meals/status/${status}`, {
        params: { limit, page },
      });
      
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || `Failed to fetch ${status} meals`,
        isLoading: false,
      });
      console.error(`Error fetching ${status} meals:`, error);
      return { data: [], pagination: null };
    }
  },

  // ============= NUTRITION STATS =============

  // GET /meals/stats - Get today's nutrition stats
  getStats: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get("/meals/stats");
      console.log("Fetched stats:", response.data.data);
      
      set({ stats: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      
      if (error.response?.status === 404) {
        // No stats for today yet - this is normal
        set({ stats: null });
        return null;
      }
      
      set({ error: error.response?.data?.message || "Failed to fetch stats" });
      toast.error("Failed to fetch nutrition stats.");
      console.error("Error fetching stats:", error);
      return null;
    }
  },

  // ============= GOALS =============

  // POST /meals/goals - Save a goal (water or calorie)
  saveGoal: async (goalData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.post("/meals/goals", goalData);
      
      // Refresh stats after setting goal
      await get().getStats();
      
      set({ isLoading: false });
      toast.success("Goal saved successfully!");
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to save goal", 
        isLoading: false 
      });
      toast.error("Failed to save goal.");
      console.error("Error saving goal:", error);
      return false;
    }
  },

  // ============= WATER & CALORIES QUICK ADD =============

  // POST /meals/add - Add water or calories
  addWaterOrCalories: async (data) => {
    try {
      set({ isLoading: true, error: null });
      console.log("Adding:", data);
      
      const response = await api.post("/meals/add", data);
      
      // Update stats with the new values
      set((state) => ({
        stats: response.data.stats,
        isLoading: false,
      }));
      
      const message = data.type === "water" 
        ? "Water intake added successfully!" 
        : "Calories added successfully!";
      toast.success(message);
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Failed to update", 
        isLoading: false 
      });
      toast.error("Failed to update.");
      console.error("Error updating:", error);
      return null;
    }
  },

  // ============= LOCAL STORAGE HELPERS =============

  // Fetch meal data from localStorage
  fetchMealData: async () => {
    try {
      set({ isLoading: true });
      console.log("Fetching meal data from localStorage");
      
      const data = localStorage.getItem("mealData");
      
      if (data) {
        const parsedData = JSON.parse(data);
        set({ mealData: parsedData, isLoading: false });
        return parsedData;
      }
      
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({ isLoading: false });
      toast.error("Failed to load meal data from local storage");
      console.error("Error fetching meal data:", error);
      return null;
    }
  },

  // Clear meal data from state and localStorage
  clearMealData: () => {
    localStorage.removeItem("mealData");
    set({ mealData: null });
  },

  // ============= UTILITY =============

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  resetStore: () => set({
    meals: [],
    recommendedMeals: [],
    upcomingMeals: [],
    mealData: null,
    stats: null,
    isLoading: false,
    error: null,
  }),
}));