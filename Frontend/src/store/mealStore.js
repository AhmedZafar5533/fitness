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

export const useMealStore = create((set, get) => ({
  meals: [],
  recommendedMeals: [],
  upcomingMeals: [],
  mealData: null,
  stats: null,
  isLoading: false,
  error: null,
  mealHistory: {
    meals: [],
    dailyStats: {},
    weeklyStats: null,
  },
  historyLoading: false,

  sendMealData: async (formData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post("/meals", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      set({ mealData: response.data.data, isLoading: false });

      localStorage.removeItem("mealData");
      localStorage.setItem("mealData", JSON.stringify(response.data.data));

      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to analyze meal image");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  logMeal: async (mealData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post("/meals/log", mealData);

      set((state) => ({
        meals: [response.data.meal, ...state.meals],
        stats: response.data.stats,
        isLoading: false,
      }));

      localStorage.removeItem("mealData");
      set({ mealData: null });

      toast.success("Meal logged successfully!");
      return response.data.meal;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to log meal");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  saveMeal: async (mealData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post("/meals/save", mealData);

      set((state) => ({
        meals: [response.data.meal, ...state.meals],
        stats: response.data.stats,
        isLoading: false,
      }));

      toast.success("Meal saved successfully!");
      return response.data.meal;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to save meal");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  getMeals: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get("/meals/meals");

      set({ meals: response.data.data || [], isLoading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to fetch meals");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  deleteMeal: async (mealId) => {
    try {
      set({ isLoading: true, error: null });

      await api.delete(`/meals/${mealId}`);

      set((state) => ({
        meals: state.meals.filter((meal) => meal._id !== mealId),
        isLoading: false,
      }));

      get().getStats();

      toast.success("Meal deleted successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to delete meal");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  getRecommendedMeals: async (limit = 50, page = 1) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get("/meals/recommendations", {
        params: { limit, page },
      });

      set({ recommendedMeals: response.data.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to fetch recommendations");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { data: [], pagination: null };
    }
  },

  deleteRecommendedMeal: async (mealId) => {
    try {
      set({ isLoading: true, error: null });

      await api.delete(`/meals/recommendations/${mealId}`);

      set((state) => ({
        recommendedMeals: state.recommendedMeals.filter((meal) => meal._id !== mealId),
        isLoading: false,
      }));

      toast.success("Recommendation removed successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to delete recommendation");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  rescheduleUpcomingMeal: async (mealId, newScheduledTime) => {
    try {
      set({ isLoading: true, error: null });

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
      const errorMessage = getErrorMessage(error, "Failed to reschedule meal");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  eatRecommendedMeal: async (mealId, time = null) => {
    try {
      set({ isLoading: true, error: null });

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

      toast.success("Meal added to upcoming!");
      return eatenMeal;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to schedule meal");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  getUpcomingMeals: async (limit = 50, page = 1) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get("/meals/upcoming", {
        params: { limit, page },
      });

      set({ upcomingMeals: response.data.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to fetch upcoming meals");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { data: [], pagination: null };
    }
  },

  deleteUpcomingMeal: async (mealId) => {
    try {
      set({ isLoading: true, error: null });

      await api.delete(`/meals/upcoming/${mealId}`);

      set((state) => ({
        upcomingMeals: state.upcomingMeals.filter((meal) => meal._id !== mealId),
        isLoading: false,
      }));

      toast.success("Upcoming meal removed successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to delete upcoming meal");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

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
      const errorMessage = getErrorMessage(error, "Failed to mark meal as eaten");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

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

      toast.success("Meal skipped!");
      return response.data.meal;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to skip meal");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  getMealsByStatus: async (status, limit = 50, page = 1) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get(`/meals/status/${status}`, {
        params: { limit, page },
      });

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, `Failed to fetch ${status} meals`);
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { data: [], pagination: null };
    }
  },

  getStats: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get("/meals/stats");

      set({ stats: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });

      if (error.response?.status === 404) {
        set({ stats: null });
        return null;
      }

      const errorMessage = getErrorMessage(error, "Failed to fetch nutrition stats");
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  },

  getMealHistory: async (startDate, endDate) => {
    try {
      set({ historyLoading: true, error: null });

      const response = await api.get("/meals/history", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      set((state) => ({
        mealHistory: {
          ...state.mealHistory,
          meals: response.data.data.meals,
          dailyStats: response.data.data.dailyStats,
        },
        historyLoading: false,
      }));

      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to fetch meal history");
      set({ error: errorMessage, historyLoading: false });
      toast.error(errorMessage);
      return { meals: [], dailyStats: {} };
    }
  },

  getWeeklyStats: async (startDate, endDate) => {
    try {
      set({ historyLoading: true, error: null });

      const response = await api.get("/meals/history/stats", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      set((state) => ({
        mealHistory: {
          ...state.mealHistory,
          weeklyStats: response.data.data,
        },
        historyLoading: false,
      }));

      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to fetch weekly stats");
      set({ error: errorMessage, historyLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  fetchMealHistoryData: async (startDate, endDate) => {
    try {
      set({ historyLoading: true, error: null });

      const [historyResponse, statsResponse] = await Promise.all([
        api.get("/meals/history", {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }),
        api.get("/meals/history/stats", {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }),
      ]);

      const historyData = historyResponse.data.data;
      const statsData = statsResponse.data.data;

      set({
        mealHistory: {
          meals: historyData.meals,
          dailyStats: historyData.dailyStats,
          weeklyStats: statsData,
        },
        historyLoading: false,
      });

      return {
        meals: historyData.meals,
        dailyStats: historyData.dailyStats,
        weeklyStats: statsData,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to fetch meal history");
      set({ error: errorMessage, historyLoading: false });
      toast.error(errorMessage);
      return { meals: [], dailyStats: {}, weeklyStats: null };
    }
  },

  clearMealHistory: () => {
    set({
      mealHistory: {
        meals: [],
        dailyStats: {},
        weeklyStats: null,
      },
    });
  },

  saveGoal: async (goalData) => {
    try {
      set({ isLoading: true, error: null });

      await api.post("/meals/goals", goalData);

      await get().getStats();

      set({ isLoading: false });
      toast.success("Goal saved successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to save goal");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  addWaterOrCalories: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post("/meals/add", data);

      set({ stats: response.data.stats, isLoading: false });

      const message =
        data.type === "water"
          ? "Water intake updated!"
          : "Calories added successfully!";
      toast.success(message);

      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        data.type === "water" ? "Failed to update water intake" : "Failed to add calories"
      );
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  fetchMealData: async () => {
    try {
      set({ isLoading: true });

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
      toast.error("Failed to load saved meal data");
      return null;
    }
  },

  clearMealData: () => {
    localStorage.removeItem("mealData");
    set({ mealData: null });
  },

  clearError: () => set({ error: null }),

  resetStore: () =>
    set({
      meals: [],
      recommendedMeals: [],
      upcomingMeals: [],
      mealData: null,
      stats: null,
      isLoading: false,
      error: null,
      mealHistory: {
        meals: [],
        dailyStats: {},
        weeklyStats: null,
      },
      historyLoading: false,
    }),
}));