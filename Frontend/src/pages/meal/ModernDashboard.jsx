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
  Check,
  Loader2,
  Sparkles,
  Timer,
  CheckCircle2,
  Star,
  SkipForward,
  RefreshCw,
  MoreHorizontal,
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

// Meal Type Configuration
const mealTypeConfig = {
  breakfast: {
    label: "Breakfast",
    icon: Coffee,
    color: "yellow",
    emoji: "🍳",
    bgClass: "bg-yellow-50",
    borderClass: "border-yellow-200",
    textClass: "text-yellow-600",
  },
  lunch: {
    label: "Lunch",
    icon: Sun,
    color: "orange",
    emoji: "🍜",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
    textClass: "text-orange-600",
  },
  dinner: {
    label: "Dinner",
    icon: Utensils,
    color: "purple",
    emoji: "🍽️",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
    textClass: "text-purple-600",
  },
  snack: {
    label: "Snack",
    icon: Apple,
    color: "pink",
    emoji: "🍪",
    bgClass: "bg-pink-50",
    borderClass: "border-pink-200",
    textClass: "text-pink-600",
  },
};

// Get meal icon based on meal type or name
const getMealIcon = (mealType, mealName = "") => {
  const type = mealType?.toLowerCase();

  // First check if we have a config for this type
  if (mealTypeConfig[type]) {
    return mealTypeConfig[type].emoji;
  }

  // Fallback based on meal name keywords
  const nameLower = mealName.toLowerCase();

  if (
    nameLower.includes("salad") ||
    nameLower.includes("vegetable") ||
    nameLower.includes("veg")
  ) {
    return "🥗";
  }
  if (
    nameLower.includes("chicken") ||
    nameLower.includes("meat") ||
    nameLower.includes("beef")
  ) {
    return "🍗";
  }
  if (
    nameLower.includes("fish") ||
    nameLower.includes("salmon") ||
    nameLower.includes("seafood")
  ) {
    return "🐟";
  }
  if (
    nameLower.includes("pasta") ||
    nameLower.includes("noodle") ||
    nameLower.includes("spaghetti")
  ) {
    return "🍝";
  }
  if (
    nameLower.includes("rice") ||
    nameLower.includes("bowl") ||
    nameLower.includes("grain")
  ) {
    return "🍚";
  }
  if (
    nameLower.includes("sandwich") ||
    nameLower.includes("wrap") ||
    nameLower.includes("burger")
  ) {
    return "🥪";
  }
  if (
    nameLower.includes("soup") ||
    nameLower.includes("stew") ||
    nameLower.includes("broth")
  ) {
    return "🍲";
  }
  if (
    nameLower.includes("pizza") ||
    nameLower.includes("flatbread") ||
    nameLower.includes("pie")
  ) {
    return "🍕";
  }
  if (
    nameLower.includes("egg") ||
    nameLower.includes("omelette") ||
    nameLower.includes("omelet")
  ) {
    return "🍳";
  }
  if (
    nameLower.includes("smoothie") ||
    nameLower.includes("shake") ||
    nameLower.includes("drink")
  ) {
    return "🥤";
  }
  if (
    nameLower.includes("oat") ||
    nameLower.includes("cereal") ||
    nameLower.includes("granola")
  ) {
    return "🥣";
  }
  if (
    nameLower.includes("fruit") ||
    nameLower.includes("apple") ||
    nameLower.includes("banana")
  ) {
    return "🍎";
  }
  if (
    nameLower.includes("yogurt") ||
    nameLower.includes("parfait") ||
    nameLower.includes("dairy")
  ) {
    return "🍨";
  }
  if (
    nameLower.includes("toast") ||
    nameLower.includes("bread") ||
    nameLower.includes("bagel")
  ) {
    return "🍞";
  }
  if (
    nameLower.includes("coffee") ||
    nameLower.includes("latte") ||
    nameLower.includes("espresso")
  ) {
    return "☕";
  }
  if (
    nameLower.includes("tea") ||
    nameLower.includes("matcha") ||
    nameLower.includes("chai")
  ) {
    return "🍵";
  }
  if (
    nameLower.includes("stir fry") ||
    nameLower.includes("wok") ||
    nameLower.includes("asian")
  ) {
    return "🥘";
  }
  if (
    nameLower.includes("taco") ||
    nameLower.includes("burrito") ||
    nameLower.includes("mexican")
  ) {
    return "🌮";
  }
  if (
    nameLower.includes("sushi") ||
    nameLower.includes("japanese") ||
    nameLower.includes("roll")
  ) {
    return "🍣";
  }
  if (
    nameLower.includes("curry") ||
    nameLower.includes("indian") ||
    nameLower.includes("spicy")
  ) {
    return "🍛";
  }

  // Default fallback
  return "🍴";
};

// Empty State Card Component
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

// Loading Skeleton Component
const LoadingSkeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Delete Confirmation Modal
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  mealName,
  isDeleting,
  title = "Delete Meal?",
  message = "Are you sure you want to delete this meal?",
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

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

          <p className="text-gray-600 mb-2">{message}</p>

          {mealName && (
            <p className="text-sm font-semibold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg mb-4">
              "{mealName}"
            </p>
          )}

          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone.
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
                  <Loader2 className="w-4 h-4 animate-spin" />
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

// Add Meal Modal Component
const AddMealModal = ({ meal, onClose, onConfirm, isLoading }) => {
  const [mealType, setMealType] = useState(meal?.mealType || "lunch");
  const [mealTime, setMealTime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const config = mealTypeConfig[mealType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add to Meal Log
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Confirm details before adding
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-2xl shadow-sm">
              {meal?.image ||
                getMealIcon(meal?.mealType, meal?.mealName || "")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Meal
              </p>
              <p className="font-medium text-gray-900 truncate">
                {meal?.mealName}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(mealTypeConfig).map(([type, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = mealType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-gray-900 bg-gray-900"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-medium ${
                        isSelected ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:border-gray-400 focus:ring-0 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Nutrition
            </label>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <span className="text-base font-semibold text-gray-900">
                  {meal?.calories}
                </span>
                <span className="text-[10px] text-gray-400 block">kcal</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <span className="text-base font-semibold text-gray-900">
                  {meal?.protein_g}g
                </span>
                <span className="text-[10px] text-gray-400 block">protein</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <span className="text-base font-semibold text-gray-900">
                  {meal?.carbs_g}g
                </span>
                <span className="text-[10px] text-gray-400 block">carbs</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <span className="text-base font-semibold text-gray-900">
                  {meal?.fat_g}g
                </span>
                <span className="text-[10px] text-gray-400 block">fat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onConfirm({
                ...meal,
                mealType,
                time: new Date(mealTime),
              })
            }
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Add Meal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Upcoming Meal Action Menu
const UpcomingMealActionMenu = ({
  meal,
  onComplete,
  onSkip,
  onDelete,
  onReschedule,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[160px]">
            <button
              onClick={() => {
                onComplete(meal);
                setIsOpen(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Done
            </button>
            <button
              onClick={() => {
                onSkip(meal);
                setIsOpen(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip Meal
            </button>
            <button
              onClick={() => {
                onReschedule(meal);
                setIsOpen(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reschedule
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => {
                onDelete(meal);
                setIsOpen(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Reschedule Modal
const RescheduleModal = ({ meal, isOpen, onClose, onConfirm, isLoading }) => {
  const [newTime, setNewTime] = useState(
    meal?.scheduledTime
      ? new Date(meal.scheduledTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Reschedule Meal
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Choose a new time for this meal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-2xl shadow-sm">
              {meal?.image ||
                getMealIcon(meal?.mealType, meal?.mealName || "")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {meal?.mealName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {meal?.mealType}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              New Date & Time
            </label>
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:border-gray-400 focus:ring-0 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(meal._id, new Date(newTime))}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Reschedule</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ModernDashboard() {
  // UI States
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [editingWaterGoal, setEditingWaterGoal] = useState(false);
  const [tempWaterGoal, setTempWaterGoal] = useState(1000);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(2000);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [deleteModalType, setDeleteModalType] = useState("meal"); // 'meal', 'recommended', 'upcoming'
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Meal Modal States
  const [addMealModalOpen, setAddMealModalOpen] = useState(false);
  const [selectedRecommendedMeal, setSelectedRecommendedMeal] = useState(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  // Upcoming Meal States
  const [completingMealId, setCompletingMealId] = useState(null);
  const [skippingMealId, setSkippingMealId] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [mealToReschedule, setMealToReschedule] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Active tab for the combined section
  const [activeTab, setActiveTab] = useState("recommended");

  // Zustand Store
  const {
    saveGoal: setGoal,
    getStats,
    stats,
    meals,
    getMeals,
    deleteMeal,
    addWaterOrCalories,
    addMeal,
    // Recommended meals
    recommendedMeals,
    getRecommendedMeals,
    deleteRecommendedMeal,
    eatRecommendedMeal:addRecommendedMealToLog,
    // Upcoming meals
    upcomingMeals,
    getUpcomingMeals,
    eatUpcomingMeal:markUpcomingMealAsDone,
    skipUpcomingMeal,
    deleteUpcomingMeal,
    rescheduleUpcomingMeal,
    // Loading state
    isLoading: storeLoading,
    error,
    clearError,
  } = useMealStore();

  // Local derived states
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(1000);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

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

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          getStats(),
          getMeals(),
          getRecommendedMeals(),
          getUpcomingMeals(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update local state when stats change
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

  // Utility functions
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

  const getMealTypeColor = (mealType) => {
    const type = mealType?.toLowerCase();
    if (mealTypeConfig[type]) {
      return `${mealTypeConfig[type].bgClass} ${mealTypeConfig[type].borderClass}`;
    }
    return "bg-gray-50 border-gray-200";
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

  const formatScheduledTime = (date) => {
    const now = new Date();
    const scheduledDate = new Date(date);
    const diff = scheduledDate - now;

    if (diff < 0) {
      return "Overdue";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `In ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `In ${minutes}m`;
    } else {
      return "Now";
    }
  };

  // Weekly overview data
  const overviewData = [
    { day: "Mon", kcal: 0 },
    { day: "Tue", kcal: 0 },
    { day: "Wed", kcal: 0 },
    { day: "Thu", kcal: 0 },
    { day: "Fri", kcal: 0 },
    { day: "Sat", kcal: 0 },
    { day: "Sun", kcal: hasData ? currentCalories : 0 },
  ];

  // Water tracking handlers
  const addWater = async (amount) => {
    const newIntake = waterIntake + amount;
    setWaterIntake(newIntake);
    await addWaterOrCalories({ type: "water", quantity: amount });
  };

  const resetWater = async () => {
    setWaterIntake(0);
    if (waterIntake > 0) {
      await addWaterOrCalories({ type: "water", quantity: -waterIntake });
    }
  };

  // Goal handlers
  const saveGoalHandler = async () => {
    const success = await setGoal({ goal: tempGoal, type: "calorie" });
    if (success) {
      setDailyGoal(tempGoal);
      setEditingGoal(false);
    }
  };

  const saveWaterGoal = async () => {
    const success = await setGoal({ goal: tempWaterGoal, type: "water" });
    if (success) {
      setWaterGoal(tempWaterGoal);
      setEditingWaterGoal(false);
    }
  };

  // Delete handlers
  const openDeleteModal = (meal, type = "meal") => {
    setMealToDelete(meal);
    setDeleteModalType(type);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setMealToDelete(null);
    setDeleteModalType("meal");
  };

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;

    setIsDeleting(true);
    try {
      let success = false;

      switch (deleteModalType) {
        case "recommended":
          success = await deleteRecommendedMeal(mealToDelete._id);
          break;
        case "upcoming":
          success = await deleteUpcomingMeal(mealToDelete._id);
          break;
        default:
          success = await deleteMeal(mealToDelete._id);
          if (success) {
            await getStats();
          }
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Recommended meal handlers
  const handleRecommendedMealClick = (meal) => {
    setSelectedRecommendedMeal(meal);
    setAddMealModalOpen(true);
  };

  const handleAddMealConfirm = async (mealData) => {
    setIsAddingMeal(true);
    try {
      await addRecommendedMealToLog(mealData);
      setAddMealModalOpen(false);
      setSelectedRecommendedMeal(null);
    } catch (error) {
      console.error("Error adding meal:", error);
    } finally {
      setIsAddingMeal(false);
    }
  };

  // Upcoming meal handlers
  const handleMarkAsDone = async (upcomingMeal) => {
    setCompletingMealId(upcomingMeal._id);
    try {
      await markUpcomingMealAsDone(upcomingMeal._id);
    } catch (error) {
      console.error("Error completing meal:", error);
    } finally {
      setCompletingMealId(null);
    }
  };

  const handleSkipMeal = async (upcomingMeal) => {
    setSkippingMealId(upcomingMeal._id);
    try {
      await skipUpcomingMeal(upcomingMeal._id);
    } catch (error) {
      console.error("Error skipping meal:", error);
    } finally {
      setSkippingMealId(null);
    }
  };

  const handleReschedule = (meal) => {
    setMealToReschedule(meal);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleConfirm = async (mealId, newTime) => {
    setIsRescheduling(true);
    try {
      await rescheduleUpcomingMeal(mealId, newTime);
      setRescheduleModalOpen(false);
      setMealToReschedule(null);
    } catch (error) {
      console.error("Error rescheduling meal:", error);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Get today's meals
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

  // Filter upcoming meals (pending only, not skipped)
  const pendingUpcomingMeals = upcomingMeals.filter(
    (meal) => meal.status !== "skipped" && meal.status !== "completed"
  );

  const skippedUpcomingMeals = upcomingMeals.filter(
    (meal) => meal.status === "skipped"
  );

  const todaysMeals = getTodaysMeals();
  const hasMacroData = macros.some((macro) => macro.value > 0);
  const hasMealHistoryData = historyMeals.some((meal) => meal.current > 0);
  const hasChartData = overviewData.some((d) => d.kcal > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteMeal}
        mealName={mealToDelete?.name || mealToDelete?.mealName}
        isDeleting={isDeleting}
        title={
          deleteModalType === "upcoming"
            ? "Delete Scheduled Meal?"
            : deleteModalType === "recommended"
            ? "Remove Recommendation?"
            : "Delete Meal?"
        }
        message={
          deleteModalType === "upcoming"
            ? "Are you sure you want to delete this scheduled meal?"
            : deleteModalType === "recommended"
            ? "Are you sure you want to remove this recommendation?"
            : "Are you sure you want to delete this meal?"
        }
      />

      {/* Add Meal Modal */}
      {addMealModalOpen && selectedRecommendedMeal && (
        <AddMealModal
          meal={selectedRecommendedMeal}
          onClose={() => {
            setAddMealModalOpen(false);
            setSelectedRecommendedMeal(null);
          }}
          onConfirm={handleAddMealConfirm}
          isLoading={isAddingMeal}
        />
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        meal={mealToReschedule}
        isOpen={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setMealToReschedule(null);
        }}
        onConfirm={handleRescheduleConfirm}
        isLoading={isRescheduling}
      />

      <div>
        <main className="p-6 space-y-6">
          {/* Welcome Banner */}
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

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weather Card */}
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

            {/* Date Card */}
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

            {/* Water Intake Card */}
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

            {/* Meals Logged Card */}
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

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Today Mission - Calorie Circle */}
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
                  <svg className="w-64 h-64" viewBox="0 0 320 320">
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
                <div className="relative flex items-center justify-center mb-8">
                  <svg className="w-64 h-64" viewBox="0 0 320 320">
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
                    <div className="text-3xl font-bold text-gray-900">
                      {currentCalories}/{dailyGoal}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">kcal</div>
                    <div className="text-xs text-gray-500 font-medium">
                      {Math.round((currentCalories / dailyGoal) * 100)}% of goal
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Nutrition */}
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
              </div>
            </div>

            {/* Today's Meals Summary */}
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

          {/* Recommended & Upcoming Meals Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("recommended")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === "recommended"
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Recommended Meals
                {recommendedMeals.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
                    {recommendedMeals.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === "upcoming"
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Timer className="w-4 h-4" />
                Upcoming Meals
                {pendingUpcomingMeals.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
                    {pendingUpcomingMeals.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "recommended" ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Personalized meal suggestions based on your nutrition goals
                  </p>

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-gray-200"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <LoadingSkeleton className="w-12 h-12 rounded-xl" />
                            <div className="flex-1">
                              <LoadingSkeleton className="w-3/4 h-4 mb-2" />
                              <LoadingSkeleton className="w-1/2 h-3" />
                            </div>
                          </div>
                          <LoadingSkeleton className="w-full h-16 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : recommendedMeals.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No recommendations yet
                      </h4>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Keep logging your meals to get personalized
                        recommendations based on your nutrition goals and
                        preferences.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {recommendedMeals.map((meal) => (
                        <div
                          key={meal._id || meal.id}
                          className="group relative p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-white"
                        >
                          {/* Delete button for recommended meal */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(meal, "recommended");
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div
                            onClick={() => handleRecommendedMealClick(meal)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                {meal.image ||
                                  getMealIcon(
                                    meal.mealType,
                                    meal.mealName || ""
                                  )}
                              </div>
                              <div className="flex-1 min-w-0 pr-6">
                                <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                                  {meal.mealName || meal.name}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  {meal.description}
                                </p>
                              </div>
                            </div>

                            {meal.tags && meal.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {meal.tags.slice(0, 2).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div>
                                <div className="text-sm font-bold text-gray-900">
                                  {meal.calories}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  kcal
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-orange-600">
                                  {meal.protein_g}g
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  protein
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-purple-600">
                                  {meal.carbs_g}g
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  carbs
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-red-500">
                                  {meal.fat_g}g
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  fat
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 py-2 bg-purple-100 text-purple-600 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-4 h-4" />
                              Add to Log
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Your planned meals for today. Mark them as done when
                    completed.
                  </p>

                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200"
                        >
                          <LoadingSkeleton className="w-14 h-14 rounded-xl" />
                          <div className="flex-1">
                            <LoadingSkeleton className="w-1/2 h-4 mb-2" />
                            <LoadingSkeleton className="w-1/3 h-3" />
                          </div>
                          <LoadingSkeleton className="w-24 h-10 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : pendingUpcomingMeals.length === 0 &&
                    skippedUpcomingMeals.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No upcoming meals
                      </h4>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                        You haven't scheduled any meals yet. Plan your meals
                        ahead to stay on track with your nutrition goals.
                      </p>
                      <Link
                        to="/meal-planner"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-600 rounded-xl font-semibold hover:bg-purple-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Plan Meals
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Pending Meals */}
                      {pendingUpcomingMeals.length > 0 && (
                        <div className="space-y-3">
                          {pendingUpcomingMeals.map((meal) => {
                            const isOverdue =
                              new Date(meal.scheduledTime) < new Date();

                            return (
                              <div
                                key={meal._id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                                  isOverdue
                                    ? "bg-red-50 border-red-200"
                                    : getMealTypeColor(meal.mealType)
                                }`}
                              >
                                <div className="w-14 h-14 rounded-xl bg-white/70 flex items-center justify-center text-2xl shadow-sm">
                                  {meal.image ||
                                    getMealIcon(
                                      meal.mealType,
                                      meal.mealName || ""
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 truncate">
                                      {meal.mealName || meal.name}
                                    </h4>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                                        mealTypeConfig[
                                          meal.mealType?.toLowerCase()
                                        ]
                                          ? `${
                                              mealTypeConfig[
                                                meal.mealType.toLowerCase()
                                              ].bgClass
                                            } ${
                                              mealTypeConfig[
                                                meal.mealType.toLowerCase()
                                              ].textClass
                                            }`
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {meal.mealType}
                                    </span>
                                    {isOverdue && (
                                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                                        Overdue
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatScheduledTime(meal.scheduledTime)}
                                    </span>
                                    <span>{meal.calories} kcal</span>
                                    <span className="text-orange-600">
                                      {meal.protein_g}g protein
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleMarkAsDone(meal)}
                                    disabled={completingMealId === meal._id}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-100 text-green-700 rounded-xl font-semibold text-sm hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {completingMealId === meal._id ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Done
                                      </>
                                    )}
                                  </button>

                                  <UpcomingMealActionMenu
                                    meal={meal}
                                    onComplete={handleMarkAsDone}
                                    onSkip={handleSkipMeal}
                                    onDelete={(m) =>
                                      openDeleteModal(m, "upcoming")
                                    }
                                    onReschedule={handleReschedule}
                                    isLoading={
                                      completingMealId === meal._id ||
                                      skippingMealId === meal._id
                                    }
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Skipped Meals Section */}
                      {skippedUpcomingMeals.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                            <SkipForward className="w-4 h-4" />
                            Skipped Meals ({skippedUpcomingMeals.length})
                          </h4>
                          <div className="space-y-2">
                            {skippedUpcomingMeals.map((meal) => (
                              <div
                                key={meal._id}
                                className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-gray-50 opacity-60"
                              >
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl">
                                  {meal.image ||
                                    getMealIcon(
                                      meal.mealType,
                                      meal.mealName || ""
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-600 truncate line-through">
                                      {meal.mealName || meal.name}
                                    </h4>
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                                      Skipped
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    {meal.calories} kcal • Was scheduled for{" "}
                                    {formatTime(meal.scheduledTime)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleReschedule(meal)}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Reschedule"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      openDeleteModal(meal, "upcoming")
                                    }
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Today's Meal History & Weekly Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Today's Meal History */}
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
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-white/50">
                              {getMealIcon(
                                meal.mealType,
                                meal.name || meal.mealName || ""
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-8">
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

            {/* Weekly Overview */}
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
                        className="w-full rounded-t-lg"
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

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-lg font-bold text-green-600">
                      {dailyGoal > 0
                        ? Math.max(0, dailyGoal - currentCalories)
                        : 0}
                    </div>
                    <div className="text-xs text-gray-500">kcal remaining</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="text-lg font-bold text-purple-600">
                      {dailyGoal > 0
                        ? Math.round((currentCalories / dailyGoal) * 100)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-gray-500">of daily goal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/form"
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Plus className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Log Meal</div>
                  <div className="text-xs text-gray-500">Add new meal</div>
                </div>
              </Link>

              <Link
                to="/meal-planner"
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Plan Meals</div>
                  <div className="text-xs text-gray-500">Schedule ahead</div>
                </div>
              </Link>

              <Link
                to="/history"
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    View History
                  </div>
                  <div className="text-xs text-gray-500">Past meals</div>
                </div>
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
              >
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Settings className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Settings</div>
                  <div className="text-xs text-gray-500">Preferences</div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}