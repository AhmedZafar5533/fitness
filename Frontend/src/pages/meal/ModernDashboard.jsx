import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Flame,
  Target,
  ArrowUpRight,
  Bell,
  Search,
  Plus,
  Calendar,
  Award,
  Activity,
  Clock,
  ChevronRight,
  Download,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
  BarChart3,
  Apple,
  Utensils,
  Dumbbell,
  Sun,
  Droplet,
  MessageCircle,
  Edit3,
  Save,
  Trash2,
  TrendingDown,
  Coffee,
  PieChart,
  Salad,
  UtensilsCrossed,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Link } from "react-router-dom";
import { useMealStore } from "../../store/mealStore";

const EmptyStateCard = ({
  icon: Icon,
  title,
  message,
  actionText,
  actionLink,
  small = false,
}) => (
  <div
    className={`flex flex-col items-center justify-center ${
      small ? "py-6" : "py-12"
    } text-center`}
  >
    <div
      className={`${
        small ? "w-12 h-12" : "w-16 h-16"
      } bg-purple-50 rounded-full flex items-center justify-center mb-3`}
    >
      <Icon className={`${small ? "w-6 h-6" : "w-8 h-8"} text-purple-400`} />
    </div>
    <h4
      className={`${
        small ? "text-sm" : "text-lg"
      } font-semibold text-gray-700 mb-1`}
    >
      {title}
    </h4>
    <p
      className={`${small ? "text-xs" : "text-sm"} text-gray-500 mb-3 max-w-xs`}
    >
      {message}
    </p>
    {actionText && actionLink && (
      <Link
        to={actionLink}
        className={`inline-flex items-center gap-2 ${
          small ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm"
        } bg-purple-100 text-purple-600 rounded-xl font-semibold hover:bg-purple-200 transition-colors`}
      >
        <Plus className="w-4 h-4" />
        {actionText}
      </Link>
    )}
  </div>
);

const LoadingSkeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  mealName,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Meal?</h3>

          <p className="text-gray-600 mb-2">
            Are you sure you want to delete this meal?
          </p>

          {mealName && (
            <p className="text-sm font-semibold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg mb-4">
              "{mealName}"
            </p>
          )}

          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. All nutritional data associated with
            this meal will be removed from your daily stats.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default function ModernDashboard() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(1000);
  const [editingWaterGoal, setEditingWaterGoal] = useState(false);
  const [tempWaterGoal, setTempWaterGoal] = useState(1000);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(2000);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [macros, setMacros] = useState([
    { name: "Protein", value: 0, unit: "g", color: "#F97316" },
    { name: "Fat", value: 0, unit: "g", color: "#EF4444" },
    { name: "Carbs", value: 0, unit: "g", color: "#8B5CF6" },
    { name: "Fiber", value: 0, unit: "g", color: "#06B6D4" },
    { name: "Sugar", value: 0, unit: "g", color: "#EC4899" },
    { name: "Sodium", value: 0, unit: "mg", color: "#6B7280" },
  ]);

  const [historyMeals, setHistoryMeals] = useState([
    { name: "Breakfast", current: 0, icon: "🍳" },
    { name: "Lunch", current: 0, icon: "🍜" },
    { name: "Dinner", current: 0, icon: "🍽️" },
    { name: "Snack", current: 0, icon: "🍪" },
  ]);

  const {
    saveGoal: setGoal,
    getStats,
    stats,
    meals,
    getMeals,
    deleteMeal,
    addWaterOrCalories,
  } = useMealStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await getStats();
        await getMeals();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (stats) {
      const hasMealData =
        stats.calories > 0 ||
        stats.protein_g > 0 ||
        stats.fat_g > 0 ||
        stats.carbs_g > 0;

      setHasData(hasMealData);

      setCurrentCalories(stats.calories || 0);
      setDailyGoal(stats.calorie_goal || 2000);
      setTempGoal(stats.calorie_goal || 2000);

      setWaterIntake(stats.water_ml || 0);
      setWaterGoal(stats.water_goal_ml || 1000);
      setTempWaterGoal(stats.water_goal_ml || 1000);

      setMacros([
        {
          name: "Protein",
          value: stats.protein_g || 0,
          unit: "g",
          color: "#F97316",
        },
        { name: "Fat", value: stats.fat_g || 0, unit: "g", color: "#EF4444" },
        {
          name: "Carbs",
          value: stats.carbs_g || 0,
          unit: "g",
          color: "#8B5CF6",
        },
        {
          name: "Fiber",
          value: stats.fiber_g || 0,
          unit: "g",
          color: "#06B6D4",
        },
        {
          name: "Sugar",
          value: stats.sugar_g || 0,
          unit: "g",
          color: "#EC4899",
        },
        {
          name: "Sodium",
          value: stats.sodium_mg || 0,
          unit: "mg",
          color: "#6B7280",
        },
      ]);

      setHistoryMeals([
        {
          name: "Breakfast",
          current: stats.breakFastCalories || 0,
          icon: "🍳",
        },
        { name: "Lunch", current: stats.lunchCalories || 0, icon: "🍜" },
        { name: "Dinner", current: stats.dinnerCalories || 0, icon: "🍽️" },
        { name: "Snack", current: stats.snackCalories || 0, icon: "🍪" },
      ]);
    }
  }, [stats]);

  const formatDate = () => {
    const today = new Date();
    const options = {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return today.toLocaleDateString("en-US", options);
  };

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: "🍳",
      lunch: "🍜",
      dinner: "🍽️",
      snack: "🍪",
    };
    return icons[mealType?.toLowerCase()] || "🍴";
  };

  const getMealTypeColor = (mealType) => {
    const colors = {
      breakfast: "bg-yellow-50 border-yellow-200",
      lunch: "bg-orange-50 border-orange-200",
      dinner: "bg-purple-50 border-purple-200",
      snack: "bg-pink-50 border-pink-200",
    };
    return colors[mealType?.toLowerCase()] || "bg-gray-50 border-gray-200";
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const overviewData = [
    { day: "Mon", kcal: 0 },
    { day: "Tue", kcal: 0 },
    { day: "Wed", kcal: 0 },
    { day: "Thu", kcal: 0 },
    { day: "Fri", kcal: 0 },
    { day: "Sat", kcal: 0 },
    { day: "Sun", kcal: hasData ? currentCalories : 0 },
  ];

  const sidebarItems = [
    { icon: Home, label: "dashboard", active: true },
    { icon: Utensils, label: "form" },
    { icon: MessageCircle, label: "chat" },
    { icon: Activity, label: "Help & Information" },
    { icon: Settings, label: "Setting" },
  ];

  const addWater = async (amount) => {
    const newIntake = waterIntake + amount;
    console.log(waterIntake, amount, newIntake);
    setWaterIntake(newIntake);
    if (newIntake) {
      console.log("we in");
      await addWaterOrCalories({
        type: "water",
        quantity: amount,
      });
    }
  };

  const resetWater = async () => {
    setWaterIntake(0);
    if (waterIntake > 0) {
      await addWaterOrCalories({
        type: "water",
        quantity: 0,
      });
    }
  };

  const saveGoalHandler = async () => {
    const success = await setGoal({ goal: tempGoal, type: "calorie" });
    if (success) {
      setDailyGoal(tempGoal);
      setEditingGoal(false);
    }
  };

  const saveWaterGoal = async () => {
    setWaterGoal(tempWaterGoal);
    await setGoal({ goal: tempWaterGoal, type: "water" });
    setEditingWaterGoal(false);
  };

  const addCalories = async (amount) => {
    const success = await addWaterOrCalories({
      type: "calories",
      quantity: amount,
    });
    if (success) setCurrentCalories((prev) => prev + amount);
  };

  const openDeleteModal = (meal) => {
    setMealToDelete(meal);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setMealToDelete(null);
  };

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;

    setIsDeleting(true);
    try {
      if (deleteMeal) {
        await deleteMeal(mealToDelete._id);
        console.log("Deleted meal with ID:", mealToDelete._id);
        await getStats();
        await getMeals();
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const totalMealCalories = historyMeals.reduce(
    (acc, meal) => acc + meal.current,
    0
  );

  const getTodaysMeals = () => {
    if (!meals || !Array.isArray(meals)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return meals.filter((meal) => {
      const mealDate = new Date(meal.createdAt);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === today.getTime();
    });
  };

  const todaysMeals = getTodaysMeals();

  const hasMacroData = macros.some((macro) => macro.value > 0);

  const hasMealHistoryData = historyMeals.some((meal) => meal.current > 0);

  const hasChartData = overviewData.some((d) => d.kcal > 0);

  return (
    <div className="min-h-screen bg-[#FFF5F5]">
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteMeal}
        mealName={mealToDelete?.name || mealToDelete?.mealName}
        isDeleting={isDeleting}
      />

      <div>
        <main className="p-6 space-y-6">
          {!isLoading && !hasData && todaysMeals.length === 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome to Your Nutrition Dashboard! 🎉
                  </h2>
                  <p className="text-purple-100 max-w-lg">
                    Start tracking your meals to see your nutrition stats,
                    calorie intake, and progress towards your health goals.
                  </p>
                </div>
                <Link
                  to="/form"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Log Your First Meal
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-50 rounded-xl">
                  <Sun className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">29°C</div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Hot weather, stay hydrated!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {formatDate()}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Track your progress
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {editingWaterGoal ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="number"
                        value={tempWaterGoal}
                        onChange={(e) =>
                          setTempWaterGoal(parseInt(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 border border-blue-300 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="Goal (ml)"
                      />
                      <button
                        onClick={saveWaterGoal}
                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">
                      {waterIntake} / {waterGoal} ml
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">Water Intake</p>
                    {!editingWaterGoal && (
                      <button
                        onClick={() => {
                          setEditingWaterGoal(true);
                          setTempWaterGoal(waterGoal);
                        }}
                        className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Droplet className="w-6 h-6 text-blue-500" />
                </div>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%`,
                  }}
                ></div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addWater(100)}
                  className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  +100ml
                </button>
                <button
                  onClick={() => addWater(250)}
                  className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  +250ml
                </button>
                <button
                  onClick={resetWater}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {todaysMeals.length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Meals logged today
                  </p>
                  {todaysMeals.length === 0 && (
                    <Link
                      to="/form"
                      className="text-xs text-purple-600 hover:underline mt-1 inline-block"
                    >
                      Add your first meal →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">
                  Today Mission
                </h3>
                {editingGoal ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempGoal}
                      onChange={(e) =>
                        setTempGoal(parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                    />
                    <button
                      onClick={saveGoalHandler}
                      className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingGoal(true);
                      setTempGoal(dailyGoal);
                    }}
                    className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-48 h-48 rounded-full border-4 border-purple-100 animate-pulse"></div>
                  <LoadingSkeleton className="w-24 h-6 mt-4" />
                </div>
              ) : currentCalories === 0 && !hasData ? (
                <div className="relative flex flex-col items-center justify-center mb-8">
                  <svg className="w-80 h-80" viewBox="0 0 320 320">
                    <circle
                      cx="160"
                      cy="160"
                      r="140"
                      fill="none"
                      stroke="#F3E8FF"
                      strokeWidth="4"
                    />
                    <circle
                      cx="160"
                      cy="160"
                      r="120"
                      fill="none"
                      stroke="#E9D5FF"
                      strokeWidth="4"
                    />
                    <circle
                      cx="160"
                      cy="160"
                      r="100"
                      fill="none"
                      stroke="#DDD6FE"
                      strokeWidth="4"
                    />
                    <circle
                      cx="160"
                      cy="160"
                      r="80"
                      fill="none"
                      stroke="#C4B5FD"
                      strokeWidth="4"
                    />
                    <circle
                      cx="160"
                      cy="160"
                      r="140"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                      strokeDasharray="880 880"
                      strokeLinecap="round"
                      transform="rotate(-90 160 160)"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                      <Utensils className="w-7 h-7 text-purple-400" />
                    </div>
                    <div className="text-lg font-semibold text-gray-600 mb-1">
                      No meals yet
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      Goal: {dailyGoal} kcal
                    </div>
                    <Link
                      to="/form"
                      className="flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Meal
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative flex items-center justify-center mb-8">
                    <svg className="w-80 h-80" viewBox="0 0 320 320">
                      <circle
                        cx="160"
                        cy="160"
                        r="140"
                        fill="none"
                        stroke="#F3E8FF"
                        strokeWidth="4"
                      />
                      <circle
                        cx="160"
                        cy="160"
                        r="120"
                        fill="none"
                        stroke="#E9D5FF"
                        strokeWidth="4"
                      />
                      <circle
                        cx="160"
                        cy="160"
                        r="100"
                        fill="none"
                        stroke="#DDD6FE"
                        strokeWidth="4"
                      />
                      <circle
                        cx="160"
                        cy="160"
                        r="80"
                        fill="none"
                        stroke="#C4B5FD"
                        strokeWidth="4"
                      />

                      <circle
                        cx="160"
                        cy="160"
                        r="140"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="10"
                        strokeDasharray={`${Math.min(
                          (currentCalories / dailyGoal) * 880,
                          880
                        )} 880`}
                        strokeLinecap="round"
                        transform="rotate(-90 160 160)"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#A855F7" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Flame className="w-10 h-10 text-orange-500 mb-2" />
                      <div className="text-4xl font-bold text-gray-900">
                        {currentCalories}/{dailyGoal}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">kcal</div>
                      <div className="text-xs text-gray-500 font-medium">
                        {Math.round((currentCalories / dailyGoal) * 100)}% of
                        goal
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Today's Nutrition
                </h3>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <LoadingSkeleton className="w-20 h-4" />
                        <LoadingSkeleton className="w-16 h-4" />
                      </div>
                    ))}
                  </div>
                ) : !hasMacroData ? (
                  <div className="py-8 text-center">
                    <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PieChart className="w-7 h-7 text-orange-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      No nutrition data
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Log meals to track your macros
                    </p>
                    <Link
                      to="/form"
                      className="inline-flex items-center gap-1 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Meal
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {macros.map((macro, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: macro.color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-600">
                            {macro.name}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {typeof macro.value === "number"
                            ? macro.value.toFixed(1)
                            : macro.value}{" "}
                          {macro.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {hasMacroData && (
                  <button className="w-full mt-6 py-2.5 text-purple-600 text-sm font-semibold hover:bg-purple-50 rounded-xl transition-colors">
                    View Detailed Report
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Today's Meals
                </h3>
                <div className="text-sm text-gray-600">
                  Total:{" "}
                  <span className="font-bold text-gray-900">
                    {currentCalories} kcal
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <LoadingSkeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <LoadingSkeleton className="w-full h-2 mb-2" />
                        <LoadingSkeleton className="w-3/4 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !hasMealHistoryData ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UtensilsCrossed className="w-7 h-7 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    No meals logged
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Track breakfast, lunch, dinner & snacks
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-2xl mb-4">
                    <span>🍳</span>
                    <span>🍜</span>
                    <span>🍽️</span>
                    <span>🍪</span>
                  </div>
                  <Link
                    to="/form"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Log Your Meal
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {historyMeals.map((meal, index) => {
                    const percentage =
                      currentCalories > 0
                        ? Math.round((meal.current / currentCalories) * 100)
                        : 0;

                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="text-3xl">{meal.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {meal.name}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {meal.current} kcal
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  dailyGoal > 0
                                    ? Math.min(
                                        (meal.current / dailyGoal) * 100,
                                        100
                                      )
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {percentage}% of today's intake
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Today's Meal History
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {todaysMeals.length} meal
                    {todaysMeals.length !== 1 ? "s" : ""} logged today
                  </p>
                </div>
                <Link
                  to="/form"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Meal
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <LoadingSkeleton className="w-14 h-14 rounded-lg" />
                        <div className="flex-1">
                          <LoadingSkeleton className="w-3/4 h-4 mb-2" />
                          <LoadingSkeleton className="w-1/2 h-3" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <LoadingSkeleton className="h-12 rounded-lg" />
                        <LoadingSkeleton className="h-12 rounded-lg" />
                        <LoadingSkeleton className="h-12 rounded-lg" />
                        <LoadingSkeleton className="h-12 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : todaysMeals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    No meals logged today
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Start tracking your nutrition by adding your first meal
                  </p>
                  <Link
                    to="/form"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-600 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Meal
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todaysMeals.map((meal) => (
                    <div
                      key={meal._id}
                      className={`relative flex flex-col p-4 rounded-xl border group hover:shadow-md transition-all ${getMealTypeColor(
                        meal.mealType
                      )}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/70 flex-shrink-0">
                          {meal.imagePath || meal.imageUrl ? (
                            <img
                              src={meal.imagePath || meal.imageUrl}
                              alt={meal.name || "Meal"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              {getMealIcon(meal.mealType)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-8">
                          {" "}
                          {/* Added pr-8 for delete button space */}
                          <h4 className="font-semibold text-gray-900 truncate">
                            {meal.name || meal.mealName || "Unnamed Meal"}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">
                            {meal.mealType || "Meal"} •{" "}
                            {formatTime(meal.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/60 rounded-lg px-2 py-1.5">
                          <span className="text-gray-500">Calories</span>
                          <p className="font-bold text-gray-900">
                            {meal.calories || 0} kcal
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg px-2 py-1.5">
                          <span className="text-gray-500">Protein</span>
                          <p className="font-bold text-gray-900">
                            {meal.protein_g?.toFixed(1) || 0}g
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg px-2 py-1.5">
                          <span className="text-gray-500">Carbs</span>
                          <p className="font-bold text-gray-900">
                            {meal.carbs_g?.toFixed(1) || 0}g
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-lg px-2 py-1.5">
                          <span className="text-gray-500">Fat</span>
                          <p className="font-bold text-gray-900">
                            {meal.fat_g?.toFixed(1) || 0}g
                          </p>
                        </div>
                      </div>

                      {meal.serving_size && (
                        <div className="mt-2 text-xs text-gray-500">
                          Serving: {meal.serving_size}
                        </div>
                      )}

                      {/* Delete button - Always visible on mobile, hover on desktop */}
                      <button
                        onClick={() => openDeleteModal(meal)}
                        className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-lg 
                 opacity-100 md:opacity-0 md:group-hover:opacity-100 
                 transition-all duration-200 hover:bg-red-200 active:bg-red-300 
                 active:scale-95 touch-manipulation"
                        aria-label={`Delete ${
                          meal.name || meal.mealName || "meal"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Weekly Overview
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentCalories}{" "}
                  <span className="text-sm font-normal text-gray-600">
                    Today's kcal
                  </span>
                </p>
              </div>

              {isLoading ? (
                <div className="h-48 flex items-end justify-between gap-2 px-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <LoadingSkeleton
                        className={`w-full rounded-t-lg`}
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      />
                      <LoadingSkeleton className="w-8 h-3" />
                    </div>
                  ))}
                </div>
              ) : !hasChartData ? (
                <div className="h-48 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                    <BarChart3 className="w-7 h-7 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    No weekly data
                  </h4>
                  <p className="text-xs text-gray-500 text-center max-w-xs">
                    Start logging meals to see your weekly calorie trends
                  </p>
                </div>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewData}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      />
                      <YAxis hide />
                      <Bar dataKey="kcal" radius={[8, 8, 0, 0]}>
                        {overviewData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.kcal > 0 ? "#8B5CF6" : "#E9D5FF"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
