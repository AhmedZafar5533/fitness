// pages/MealHistory.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subWeeks,
  addWeeks,
  isSameDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Droplets,
  Beef,
  Wheat,
  Cookie,
  Clock,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Calendar,
  Loader2,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMealStore } from "../../store/mealStore";

// ============= UTILITY FUNCTION =============
const roundNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return 0;
  return Math.round(num);
};

// ============= UTILITY COMPONENTS =============

const MacroCard = ({ icon: Icon, label, value, unit = "g", color, bg, subtitle }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`${bg} rounded-2xl p-4 sm:p-5 flex flex-col items-start gap-2 sm:gap-3 transition-all cursor-default`}
  >
    <div className={`p-2 sm:p-2.5 rounded-xl bg-white/80 backdrop-blur shadow-sm ${color}`}>
      <Icon size={18} className="sm:w-5 sm:h-5" />
    </div>
    <div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? roundNumber(value).toLocaleString() : value}
        <span className="text-xs sm:text-sm font-medium text-gray-500 ml-0.5">{unit}</span>
      </p>
      <p className={`text-xs sm:text-sm font-medium ${color}`}>{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

const MiniStatCard = ({ label, value, unit, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
    <div className="flex items-center justify-between mb-1">
      <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-semibold">
        {label}
      </p>
      {Icon && <Icon className={`w-3.5 h-3.5 ${color}`} />}
    </div>
    <p className="text-lg sm:text-2xl font-bold text-gray-900">
      {roundNumber(value)}
      <span className="text-xs sm:text-sm text-gray-400 ml-0.5">{unit}</span>
    </p>
  </div>
);

const ProgressBar = ({ value, max, color = "bg-emerald-500", showLabel = true }) => {
  const roundedValue = roundNumber(value);
  const roundedMax = roundNumber(max);
  const percentage = roundedMax > 0 ? Math.min((roundedValue / roundedMax) * 100, 100) : 0;
  
  return (
    <div className="w-full">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{roundedValue}</span>
          <span className="text-xs text-gray-400">{roundedMax}</span>
        </div>
      )}
    </div>
  );
};

const MealTypeIcon = ({ type, className = "w-5 h-5" }) => {
  const icons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie,
  };
  const Icon = icons[type?.toLowerCase()] || Utensils;
  return <Icon className={className} />;
};

const MealTypeStyles = {
  breakfast: { 
    bg: "bg-amber-50", 
    color: "text-amber-600", 
    ring: "ring-amber-200",
    gradient: "from-amber-500 to-orange-500"
  },
  lunch: { 
    bg: "bg-sky-50", 
    color: "text-sky-600", 
    ring: "ring-sky-200",
    gradient: "from-sky-500 to-blue-500"
  },
  dinner: { 
    bg: "bg-violet-50", 
    color: "text-violet-600", 
    ring: "ring-violet-200",
    gradient: "from-violet-500 to-purple-500"
  },
  snack: { 
    bg: "bg-rose-50", 
    color: "text-rose-600", 
    ring: "ring-rose-200",
    gradient: "from-rose-500 to-pink-500"
  },
};

const MacroPill = ({ icon: Icon, value, unit = "g", color, label }) => (
  <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur px-2.5 sm:px-3 py-1.5 rounded-full shadow-sm">
    <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${color}`} />
    <span className="text-xs sm:text-sm font-semibold text-gray-700">
      {roundNumber(value)}{unit}
    </span>
    {label && (
      <span className="text-xs text-gray-400 hidden sm:inline">{label}</span>
    )}
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12 sm:py-16 bg-gray-50 rounded-[2rem]"
  >
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
    </div>
    <p className="text-gray-900 font-semibold text-lg">{title}</p>
    <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
  </motion.div>
);

// ============= DAY SELECTOR COMPONENT =============

const DayButton = ({ day, isSelected, isTodayDate, isFuture, dayStats, mealCount, onClick }) => {
  return (
    <motion.button
      whileHover={!isFuture ? { scale: 1.05, y: -2 } : {}}
      whileTap={!isFuture ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={isFuture}
      className={`relative p-2 sm:p-4 rounded-xl sm:rounded-2xl transition-all min-w-0 ${
        isFuture
          ? "bg-gray-100 cursor-not-allowed opacity-40"
          : isSelected
          ? "bg-gray-900 text-white shadow-xl"
          : isTodayDate
          ? "bg-white ring-2 ring-gray-900 shadow-md"
          : "bg-white hover:shadow-lg"
      }`}
    >
      <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${
        isSelected ? "text-gray-400" : "text-gray-400"
      }`}>
        {format(day, "EEE")}
      </p>
      <p className={`text-lg sm:text-2xl font-bold ${
        isSelected ? "text-white" : "text-gray-900"
      }`}>
        {format(day, "d")}
      </p>
      
      {/* Meal indicators */}
      {!isFuture && mealCount > 0 && (
        <div className="flex justify-center gap-0.5 mt-1 sm:mt-2">
          {Array.from({ length: Math.min(mealCount, 4) }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                isSelected ? "bg-white/60" : "bg-emerald-400"
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Calories badge */}
      {!isFuture && dayStats && (
        <p className={`text-[10px] sm:text-xs mt-1 font-medium ${
          isSelected ? "text-gray-300" : "text-gray-400"
        }`}>
          {roundNumber(dayStats.calories)}
        </p>
      )}
    </motion.button>
  );
};

// ============= MEAL CARD COMPONENT =============

const MealCard = ({ meal, index }) => {
  const style = MealTypeStyles[meal.mealType?.toLowerCase()] || MealTypeStyles.snack;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`${style.bg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all shadow-sm hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm ${style.color} flex-shrink-0`}>
            <MealTypeIcon type={meal.mealType} className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 text-base sm:text-lg truncate">
              {meal.mealName}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-500">
                  {format(new Date(meal.time), "h:mm a")}
                </span>
              </div>
              <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold capitalize ${style.bg} ${style.color} ring-1 ${style.ring}`}>
                {meal.mealType}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {roundNumber(meal.calories)}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">kcal</p>
        </div>
      </div>

      {/* Macro Pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 pt-4 border-t border-white/60">
        <MacroPill icon={Beef} value={meal.protein_g} color="text-emerald-600" />
        <MacroPill icon={Wheat} value={meal.carbs_g} color="text-blue-600" />
        <MacroPill icon={Droplets} value={meal.fat_g} color="text-amber-500" />
        {roundNumber(meal.fiber_g) > 0 && (
          <MacroPill icon={Zap} value={meal.fiber_g} color="text-green-600" />
        )}
      </div>
    </motion.div>
  );
};

// ============= MACRO BREAKDOWN COMPONENT =============

const MacroBreakdown = ({ stats }) => {
  if (!stats) return null;

  const proteinG = roundNumber(stats.protein_g);
  const carbsG = roundNumber(stats.carbs_g);
  const fatG = roundNumber(stats.fat_g);
  const fiberG = roundNumber(stats.fiber_g);
  const sugarG = roundNumber(stats.sugar_g);
  const sodiumMg = roundNumber(stats.sodium_mg);

  const totalMacroCalories = 
    (proteinG * 4) + (carbsG * 4) + (fatG * 9);
  
  const proteinPercent = totalMacroCalories > 0 
    ? Math.round((proteinG * 4 / totalMacroCalories) * 100) : 0;
  const carbsPercent = totalMacroCalories > 0 
    ? Math.round((carbsG * 4 / totalMacroCalories) * 100) : 0;
  const fatPercent = totalMacroCalories > 0 
    ? Math.round((fatG * 9 / totalMacroCalories) * 100) : 0;

  const macros = [
    { 
      label: "Protein", 
      value: proteinG, 
      percent: proteinPercent, 
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      calories: roundNumber(proteinG * 4) 
    },
    { 
      label: "Carbs", 
      value: carbsG, 
      percent: carbsPercent, 
      color: "bg-blue-500",
      textColor: "text-blue-600",
      calories: roundNumber(carbsG * 4) 
    },
    { 
      label: "Fat", 
      value: fatG, 
      percent: fatPercent, 
      color: "bg-amber-500",
      textColor: "text-amber-600",
      calories: roundNumber(fatG * 9) 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Macro Breakdown</h3>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
          <BarChart3 className="w-4 h-4" />
          <span>{roundNumber(totalMacroCalories)} kcal from macros</span>
        </div>
      </div>

      {/* Stacked Bar */}
      <div className="flex h-4 sm:h-5 rounded-full overflow-hidden bg-gray-200 mb-4 sm:mb-6">
        {macros.map((macro, i) => (
          <motion.div
            key={macro.label}
            initial={{ width: 0 }}
            animate={{ width: `${macro.percent}%` }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`${macro.color} first:rounded-l-full last:rounded-r-full`}
          />
        ))}
      </div>

      {/* Macro Details */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {macros.map((macro) => (
          <div 
            key={macro.label}
            className="bg-white rounded-xl p-3 sm:p-4 text-center"
          >
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${macro.color} mx-auto mb-2`} />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              {macro.value}<span className="text-xs sm:text-sm text-gray-400">g</span>
            </p>
            <p className={`text-xs sm:text-sm font-medium ${macro.textColor}`}>
              {macro.label}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              {macro.percent}% • {macro.calories} kcal
            </p>
          </div>
        ))}
      </div>

      {/* Additional Micros */}
      {(fiberG > 0 || sugarG > 0 || sodiumMg > 0) && (
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-3">Additional Nutrients</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {fiberG > 0 && (
              <div className="bg-white px-3 sm:px-4 py-2 rounded-xl">
                <span className="text-xs text-gray-400">Fiber</span>
                <p className="font-bold text-gray-900">{fiberG}g</p>
              </div>
            )}
            {sugarG > 0 && (
              <div className="bg-white px-3 sm:px-4 py-2 rounded-xl">
                <span className="text-xs text-gray-400">Sugar</span>
                <p className="font-bold text-gray-900">{sugarG}g</p>
              </div>
            )}
            {sodiumMg > 0 && (
              <div className="bg-white px-3 sm:px-4 py-2 rounded-xl">
                <span className="text-xs text-gray-400">Sodium</span>
                <p className="font-bold text-gray-900">{sodiumMg}mg</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ============= DAILY BREAKDOWN CHART =============

const DailyBreakdownChart = ({ weekDays, dailyStats, mealsByDay }) => {
  const maxCalories = useMemo(() => {
    let max = 2000;
    weekDays.forEach(day => {
      const dateKey = format(day, "yyyy-MM-dd");
      const stats = dailyStats[dateKey];
      if (stats && stats.calories > max) {
        max = stats.calories;
      }
    });
    return roundNumber(max);
  }, [weekDays, dailyStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Daily Overview</h3>
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-500 hidden sm:inline">Protein</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-500 hidden sm:inline">Carbs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-500 hidden sm:inline">Fat</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const stats = dailyStats[dateKey];
          const meals = mealsByDay[dateKey] || [];
          const isFuture = day > new Date();

          if (isFuture) return null;

          const calories = roundNumber(stats?.calories || 0);
          const caloriePercent = stats 
            ? Math.min((calories / maxCalories) * 100, 100) 
            : 0;
          
          const proteinG = roundNumber(stats?.protein_g || 0);
          const carbsG = roundNumber(stats?.carbs_g || 0);
          const fatG = roundNumber(stats?.fat_g || 0);
          const totalMacroG = proteinG + carbsG + fatG;
          
          const proteinWidth = totalMacroG > 0 
            ? (proteinG / totalMacroG) * 100 : 0;
          const carbsWidth = totalMacroG > 0 
            ? (carbsG / totalMacroG) * 100 : 0;
          const fatWidth = totalMacroG > 0 
            ? (fatG / totalMacroG) * 100 : 0;

          return (
            <div key={dateKey} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-sm font-semibold ${
                    isToday(day) ? "text-gray-900" : "text-gray-600"
                  }`}>
                    {format(day, "EEE")}
                  </span>
                  {isToday(day) && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-900 text-white rounded-full font-medium">
                      Today
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="text-gray-400">{meals.length} meals</span>
                  <span className="font-semibold text-gray-900">
                    {calories} kcal
                  </span>
                </div>
              </div>

              {/* Calorie bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${caloriePercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                />
              </div>

              {/* Macro distribution bar */}
              {stats && totalMacroG > 0 && (
                <div className="flex h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 transition-all" 
                    style={{ width: `${proteinWidth}%` }} 
                  />
                  <div 
                    className="bg-blue-500 transition-all" 
                    style={{ width: `${carbsWidth}%` }} 
                  />
                  <div 
                    className="bg-amber-500 transition-all" 
                    style={{ width: `${fatWidth}%` }} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ============= MAIN COMPONENT =============

const MealHistory = () => {
  const [selectedWeekStart, setSelectedWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [selectedDay, setSelectedDay] = useState(null);

  const { 
    mealHistory, 
    historyLoading, 
    fetchMealHistoryData,
    error 
  } = useMealStore();

  const { meals = [], dailyStats = {}, weeklyStats } = mealHistory || {};

  // Fetch data when week changes
  useEffect(() => {
    const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 0 });
    fetchMealHistoryData(selectedWeekStart, weekEnd);
  }, [selectedWeekStart, fetchMealHistoryData]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: selectedWeekStart,
      end: endOfWeek(selectedWeekStart, { weekStartsOn: 0 }),
    });
  }, [selectedWeekStart]);

  // Get meals grouped by day
  const mealsByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      grouped[dateKey] = meals
        .filter((meal) => isSameDay(new Date(meal.time), day))
        .sort((a, b) => new Date(a.time) - new Date(b.time));
    });
    return grouped;
  }, [meals, weekDays]);

  // Calculate display stats from real data
  const displayStats = useMemo(() => {
    if (weeklyStats) {
      return {
        totalCalories: roundNumber(weeklyStats.totalCalories || 0),
        totalProtein: roundNumber(weeklyStats.totalProtein || 0),
        totalCarbs: roundNumber(weeklyStats.totalCarbs || 0),
        totalFat: roundNumber(weeklyStats.totalFat || 0),
        totalMeals: roundNumber(weeklyStats.totalMeals || 0),
        avgCalories: roundNumber(weeklyStats.avgCalories || 0),
        daysTracked: roundNumber(weeklyStats.daysTracked || 0),
      };
    }
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalMeals: 0,
      avgCalories: 0,
      daysTracked: 0,
    };
  }, [weeklyStats]);

  const goToPreviousWeek = useCallback(() => {
    setSelectedWeekStart(subWeeks(selectedWeekStart, 1));
    setSelectedDay(null);
  }, [selectedWeekStart]);

  const goToNextWeek = useCallback(() => {
    const nextWeek = addWeeks(selectedWeekStart, 1);
    if (nextWeek <= new Date()) {
      setSelectedWeekStart(nextWeek);
      setSelectedDay(null);
    }
  }, [selectedWeekStart]);

  const goToCurrentWeek = useCallback(() => {
    setSelectedWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
    setSelectedDay(null);
  }, []);

  const isCurrentWeek = isSameDay(
    selectedWeekStart, 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  const displayedDay = selectedDay || weekDays.find(d => isToday(d)) || weekDays[weekDays.length - 1];
  const displayedDateKey = format(displayedDay, "yyyy-MM-dd");
  const displayedMeals = mealsByDay[displayedDateKey] || [];
  const displayedStats = dailyStats[displayedDateKey];

  // Loading state
  if (historyLoading && meals.length === 0) {
    return (
      <div className="w-full bg-white min-h-screen font-sans flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Loading your meal history...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen font-sans text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 pb-32 sm:pb-36">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-10"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-1 sm:mb-2">
                Meal History
              </h1>
              <p className="text-gray-500 text-sm sm:text-lg">
                Track your nutrition journey
              </p>
            </div>
            {historyLoading && (
              <div className="p-2 bg-gray-100 rounded-full">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Week Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 mb-6 sm:mb-8"
        >
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={goToPreviousWeek}
              disabled={historyLoading}
              className="p-2.5 sm:p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
                <span className="text-sm sm:text-lg font-bold text-gray-900 text-center">
                  {format(selectedWeekStart, "MMM d")} – {format(endOfWeek(selectedWeekStart, { weekStartsOn: 0 }), "MMM d")}
                </span>
              </div>
              {!isCurrentWeek && (
                <button
                  onClick={goToCurrentWeek}
                  className="px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all active:scale-95"
                >
                  Today
                </button>
              )}
            </div>

            <button
              onClick={goToNextWeek}
              disabled={isCurrentWeek || historyLoading}
              className={`p-2.5 sm:p-3 rounded-xl transition-all ${
                isCurrentWeek
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-white shadow-sm hover:shadow-md active:scale-95"
              }`}
            >
              <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isCurrentWeek ? "text-gray-300" : "text-gray-700"
              }`} />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayStats = dailyStats[dateKey];
              const dayMeals = mealsByDay[dateKey] || [];
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isTodayDate = isToday(day);
              const isFuture = day > new Date();

              return (
                <DayButton
                  key={dateKey}
                  day={day}
                  isSelected={isSelected}
                  isTodayDate={isTodayDate}
                  isFuture={isFuture}
                  dayStats={dayStats}
                  mealCount={dayMeals.length}
                  onClick={() => !isFuture && setSelectedDay(isSelected ? null : day)}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Weekly Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Weekly Summary</h2>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>{displayStats.daysTracked} days tracked</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 sm:p-5"
            >
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 shadow-sm text-orange-500 w-fit mb-2 sm:mb-3">
                <Flame size={18} className="sm:w-5 sm:h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {displayStats.totalCalories.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm font-medium text-orange-600">Total Calories</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                ~{displayStats.avgCalories}/day
              </p>
            </motion.div>

            <MacroCard
              icon={Beef}
              label="Protein"
              value={displayStats.totalProtein}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <MacroCard
              icon={Wheat}
              label="Carbs"
              value={displayStats.totalCarbs}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <MacroCard
              icon={Droplets}
              label="Fat"
              value={displayStats.totalFat}
              color="text-amber-500"
              bg="bg-amber-50"
            />
          </div>
        </motion.div>

        {/* Daily Breakdown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 sm:mb-8"
        >
          <DailyBreakdownChart 
            weekDays={weekDays}
            dailyStats={dailyStats}
            mealsByDay={mealsByDay}
          />
        </motion.div>

        {/* Day Detail Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {selectedDay ? format(selectedDay, "EEEE, MMMM d") : "Select a Day"}
              </h2>
              <p className="text-sm text-gray-500">
                {displayedMeals.length} meals logged
              </p>
            </div>
            {displayedStats && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full w-fit">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-gray-900">{roundNumber(displayedStats.calories)}</span>
                <span className="text-gray-500 text-sm">kcal</span>
              </div>
            )}
          </div>

          {/* Daily Stats Grid */}
          {displayedStats && selectedDay && (
            <div className="bg-gray-50 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-white rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Calories
                    </p>
                    <Target className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {roundNumber(displayedStats.calories)}
                  </p>
                  <ProgressBar 
                    value={displayedStats.calories}
                    max={displayedStats.calorie_goal || 2000}
                    color="bg-gradient-to-r from-orange-400 to-red-500"
                  />
                </div>

                <MiniStatCard 
                  label="Protein" 
                  value={displayedStats.protein_g} 
                  unit="g"
                  icon={Beef}
                  color="text-emerald-500"
                />
                <MiniStatCard 
                  label="Carbs" 
                  value={displayedStats.carbs_g} 
                  unit="g"
                  icon={Wheat}
                  color="text-blue-500"
                />
                <MiniStatCard 
                  label="Fat" 
                  value={displayedStats.fat_g} 
                  unit="g"
                  icon={Droplets}
                  color="text-amber-500"
                />
              </div>
            </div>
          )}

          {/* Macro Breakdown */}
          {displayedStats && selectedDay && (
            <div className="mb-4 sm:mb-6">
              <MacroBreakdown stats={displayedStats} />
            </div>
          )}

          {/* Meals List */}
          <AnimatePresence mode="wait">
            {displayedMeals.length > 0 ? (
              <motion.div
                key={displayedDateKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  Meals
                </h3>
                {displayedMeals.map((meal, index) => (
                  <MealCard key={meal._id} meal={meal} index={index} />
                ))}
              </motion.div>
            ) : selectedDay ? (
              <EmptyState 
                icon={Utensils}
                title="No meals logged"
                subtitle="Start tracking your meals to see them here"
              />
            ) : (
              <EmptyState 
                icon={Calendar}
                title="Select a day"
                subtitle="Tap on a day above to view meal details"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
};

export default MealHistory;