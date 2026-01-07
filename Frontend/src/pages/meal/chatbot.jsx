import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Send,
  Plus,
  Menu,
  Search,
  Apple,
  Clock,
  X,
  Sparkles,
  Heart,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  MessageSquare,
  Loader2,
  Bot,
  User,
  Settings,
  Activity,
  BookOpen,
  TrendingUp,
  Utensils,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Check,
  Bookmark,
  BookmarkCheck,
  Eye,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Salad,
  Cookie,
  Coffee,
  AlertCircle,
} from "lucide-react";

import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";

// Meal type icons and colors
const mealTypeConfig = {
  breakfast: {
    icon: Coffee,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    label: "Breakfast",
  },
  lunch: {
    icon: Salad,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    label: "Lunch",
  },
  dinner: {
    icon: Utensils,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    label: "Dinner",
  },
  snack: {
    icon: Cookie,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
    label: "Snack",
  },
};

// Nutrition Badge Component
const NutritionBadge = ({ icon: Icon, label, value, unit, color }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50">
    <Icon className={`w-3.5 h-3.5 ${color}`} />
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs font-semibold text-gray-700">
      {value}
      {unit}
    </span>
  </div>
);

// Meal Recommendation Card Component
const MealRecommendationCard = ({
  recommendation,
  onAddToLog,
  onSave,
  onViewDetails,
  isAdding,
  isSaved,
}) => {
  const [expanded, setExpanded] = useState(false);
  const config =
    mealTypeConfig[recommendation.mealType] || mealTypeConfig.snack;
  const MealIcon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${config.borderColor} ${config.bgColor} transition-all duration-300 hover:shadow-lg`}
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Meal Type Icon */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg flex-shrink-0`}
            >
              <MealIcon className="w-6 h-6 text-white" />
            </div>

            {/* Meal Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
                >
                  {config.label}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 leading-tight">
                {recommendation.mealName}
              </h4>
            </div>
          </div>

          {/* Calories Badge */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-100">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-gray-800">
                {recommendation.calories}
              </span>
              <span className="text-xs text-gray-500">kcal</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2 mt-4">
          <NutritionBadge
            icon={Beef}
            label="Protein"
            value={recommendation.protein_g}
            unit="g"
            color="text-red-500"
          />
          <NutritionBadge
            icon={Wheat}
            label="Carbs"
            value={recommendation.carbs_g}
            unit="g"
            color="text-amber-500"
          />
          <NutritionBadge
            icon={Droplets}
            label="Fat"
            value={recommendation.fat_g}
            unit="g"
            color="text-blue-500"
          />
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show more details
            </>
          )}
        </button>

        {/* Expanded Nutrition Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200/50 animate-fadeIn">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Full Nutrition Information
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">
                  {recommendation.calories}
                </p>
                <p className="text-xs text-gray-500">Calories</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <Beef className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">
                  {recommendation.protein_g}g
                </p>
                <p className="text-xs text-gray-500">Protein</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">
                  {recommendation.carbs_g}g
                </p>
                <p className="text-xs text-gray-500">Carbs</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">
                  {recommendation.fat_g}g
                </p>
                <p className="text-xs text-gray-500">Fat</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-sm font-bold text-gray-800">
                  {recommendation.fiber_g}g
                </p>
                <p className="text-xs text-gray-500">Fiber</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-sm font-bold text-gray-800">
                  {recommendation.sugar_g}g
                </p>
                <p className="text-xs text-gray-500">Sugar</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-sm font-bold text-gray-800">
                  {recommendation.sodium_mg}mg
                </p>
                <p className="text-xs text-gray-500">Sodium</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 p-4 pt-0">
        <button
          onClick={() => onAddToLog(recommendation)}
          disabled={isAdding}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            isAdding
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
          }`}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Add to Meal Log
            </>
          )}
        </button>

        <button
          onClick={() => onSave(recommendation)}
          className={`p-2.5 rounded-xl border transition-all duration-200 ${
            isSaved
              ? "bg-purple-100 border-purple-300 text-purple-600"
              : "bg-white border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
          }`}
          title={isSaved ? "Saved" : "Save for later"}
        >
          {isSaved ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

// Recommendations Section Component
const RecommendationsSection = ({
  recommendations,
  onAddToLog,
  onSaveRecommendation,
  addingMealId,
  savedMeals,
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Meal Recommendations</h3>
          <p className="text-xs text-gray-500">
            {recommendations.length} personalized suggestion
            {recommendations.length > 1 ? "s" : ""} for you
          </p>
        </div>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendations.map((rec, index) => (
          <MealRecommendationCard
            key={`${rec.mealName}-${index}`}
            recommendation={rec}
            onAddToLog={onAddToLog}
            onSave={onSaveRecommendation}
            isAdding={addingMealId === `${rec.mealName}-${index}`}
            isSaved={savedMeals.includes(`${rec.mealName}-${index}`)}
          />
        ))}
      </div>
    </div>
  );
};

// Success Toast Component
const SuccessToast = ({ message, onClose }) => (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
    <div className="flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/30">
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
        <Check className="w-4 h-4" />
      </div>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-white/20 rounded-lg p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Add Meal Modal Component
const AddMealModal = ({ meal, onClose, onConfirm, isLoading }) => {
  const [mealType, setMealType] = useState(meal?.mealType || "lunch");
  const [mealTime, setMealTime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const config = mealTypeConfig[mealType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${config.color} p-6 text-white relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add to Meal Log</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/80 text-sm">
              Confirm the details before adding this meal
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Name
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="font-medium text-gray-800">{meal?.mealName}</p>
            </div>
          </div>

          {/* Meal Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(mealTypeConfig).map(([type, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      mealType === type
                        ? `${cfg.borderColor} ${cfg.bgColor}`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            />
          </div>

          {/* Nutrition Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Nutrition Summary
            </h4>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-orange-600">
                  {meal?.calories}
                </p>
                <p className="text-xs text-gray-500">Calories</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">
                  {meal?.protein_g}g
                </p>
                <p className="text-xs text-gray-500">Protein</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">
                  {meal?.carbs_g}g
                </p>
                <p className="text-xs text-gray-500">Carbs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">
                  {meal?.fat_g}g
                </p>
                <p className="text-xs text-gray-500">Fat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
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
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm & Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
    <span className="text-sm text-gray-500 ml-2">
      Nutrition Genie is thinking...
    </span>
  </div>
);

// Skeleton Loader for Sidebar
const SidebarSkeleton = () => (
  <div className="space-y-3 p-4 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// Chat Loading Skeleton
const ChatLoadingSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6 p-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex gap-3 max-w-[70%] ${
            i % 2 === 0 ? "flex-row-reverse" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Suggestion Chip
const SuggestionChip = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2.5 bg-white/60 backdrop-blur-sm rounded-full border border-purple-200 text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 flex items-center gap-2 group"
  >
    <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
    {text}
  </button>
);

// Enhanced Markdown Components
const MarkdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <div className="my-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600 border-b">
          {match[1].toUpperCase()}
        </div>
        <SyntaxHighlighter
          style={oneLight}
          language={match[1]}
          PreTag="div"
          className="!m-0 !bg-gray-50"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code
        className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  table({ children }) {
    return (
      <div className="my-4 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return (
      <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
        {children}
      </thead>
    );
  },
  th({ children }) {
    return (
      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
        {children}
      </td>
    );
  },
  tr({ children, ...props }) {
    return (
      <tr className="hover:bg-gray-50 transition-colors" {...props}>
        {children}
      </tr>
    );
  },
  ul({ children }) {
    return <ul className="my-3 space-y-2 list-none">{children}</ul>;
  },
  ol({ children }) {
    return (
      <ol className="my-3 space-y-2 list-decimal list-inside">{children}</ol>
    );
  },
  li({ children, ordered }) {
    return (
      <li className="flex items-start gap-2 text-gray-700">
        {!ordered && (
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0" />
        )}
        <span>{children}</span>
      </li>
    );
  },
  h1({ children }) {
    return (
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-4 pb-2 border-b border-gray-200">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="text-xl font-semibold text-gray-800 mt-5 mb-3 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">
        {children}
      </h3>
    );
  },
  p({ children }) {
    return <p className="text-gray-700 leading-relaxed my-2">{children}</p>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-4 pl-4 border-l-4 border-purple-300 bg-purple-50/50 py-2 pr-4 rounded-r-lg italic text-gray-600">
        {children}
      </blockquote>
    );
  },
  a({ children, href }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 hover:text-purple-800 underline decoration-purple-300 hover:decoration-purple-500 transition-colors"
      >
        {children}
      </a>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold text-gray-800">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-gray-600">{children}</em>;
  },
  hr() {
    return <hr className="my-6 border-t border-gray-200" />;
  },
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

// Helper to parse response content and extract recommendations
const parseMessageContent = (content) => {
  if (!content) return { text: "", recommendations: [] };

  try {
    // Try to parse as JSON first
    const cleanText = content
      .replace(/```json?/gi, "")
      .replace(/```/g, "")
      .trim();
    const match = cleanText.match(/\{[\s\S]*\}/);

    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        text: parsed.response || content,
        recommendations: parsed.recommendations || [],
      };
    }
  } catch (e) {
    // Not JSON, return as plain text
  }

  return { text: content, recommendations: [] };
};

export default function NutriGenieChat() {
  const navigate = useNavigate();

  // Get store state and actions
  const {
    getChatHistory,
    chatHistory,
    loadChat: loadChatFromStore,
    messages,
    setMessages,
    currentChatId,
    setCurrentChatId,
    currentChatTitle,
    setCurrentChatTitle,
    clearCurrentChat,
    addMessage,
    updateLastMessage,
    isLoading: storeLoading,
    setIsLoading,
  } = useChatStore();

  const { user } = useAuthStore();

  // Local UI State
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Recommendation handling state
  const [addingMealId, setAddingMealId] = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [toast, setToast] = useState(null);

  // Recommendations stored per message
  const [messageRecommendations, setMessageRecommendations] = useState({});

  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const accumulatedContentRef = useRef("");

  // Handle back navigation
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Auto-scroll
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, messageRecommendations]);

  // Focus input on chat open
  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatOpen]);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        await getChatHistory();
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setSidebarLoading(false);
      }
    };
    fetchHistory();
  }, [getChatHistory]);

  // Show toast helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Handle adding meal to log
  const handleAddToLog = (recommendation) => {
    setSelectedMeal(recommendation);
    setShowAddModal(true);
  };

  // Confirm add meal to log
  const confirmAddMeal = async (mealData) => {
    setIsAddingMeal(true);
    try {
      const response = await fetch("http://localhost:3000/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: mealData.mealType,
          mealName: mealData.mealName,
          time: mealData.time,
          calories: mealData.calories,
          fat_g: mealData.fat_g,
          protein_g: mealData.protein_g,
          carbs_g: mealData.carbs_g,
          fiber_g: mealData.fiber_g,
          sugar_g: mealData.sugar_g,
          sodium_mg: mealData.sodium_mg,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to add meal");
      }

      showToast(`${mealData.mealName} added to your meal log!`);
      setShowAddModal(false);
      setSelectedMeal(null);
    } catch (error) {
      console.error("Error adding meal:", error);
      showToast("Failed to add meal. Please try again.");
    } finally {
      setIsAddingMeal(false);
    }
  };

  // Handle saving recommendation
  const handleSaveRecommendation = (recommendation, index) => {
    const mealId = `${recommendation.mealName}-${index}`;
    if (savedMeals.includes(mealId)) {
      setSavedMeals((prev) => prev.filter((id) => id !== mealId));
      showToast("Removed from saved meals");
    } else {
      setSavedMeals((prev) => [...prev, mealId]);
      showToast("Saved for later!");
    }
  };

  // Send Message with streaming - Updated to handle recommendations
  const handleSend = async (textOverride) => {
    const promptText = textOverride || input;
    if (!promptText.trim() || isStreaming) return;

    setInput("");
    setIsStreaming(true);
    setChatOpen(true);
    accumulatedContentRef.current = "";

    const userMessage = {
      role: "user",
      content: promptText,
      timestamp: new Date(),
    };
    const assistantMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      recommendations: [],
    };

    const currentMessages = useChatStore.getState().messages;
    const newMessages = [...currentMessages, userMessage, assistantMessage];
    setMessages(newMessages);

    // Track the message index for recommendations
    const assistantMessageIndex = newMessages.length - 1;

    try {
      const response = await fetch(
        "http://localhost:3000/api/chat/stream-sse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptText,
            chatId: currentChatId,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const payload = line.replace("data:", "").trim();

          if (payload === "[DONE]") {
            await getChatHistory();
            continue;
          }

          try {
            const data = JSON.parse(payload);

            if (data.type) {
              switch (data.type) {
                case "init":
                  if (data.chatId) {
                    setCurrentChatId(data.chatId);
                    if (data.isNewChat) {
                      window.history.replaceState(
                        null,
                        "",
                        `/chat/${data.chatId}`
                      );
                    }
                  }
                  break;

                case "title":
                  if (data.title) {
                    setCurrentChatTitle(data.title);
                  }
                  break;

                case "text":
                  if (data.text) {
                    accumulatedContentRef.current += data.text;
                    const newContent = accumulatedContentRef.current;

                    setMessages((prev) => {
                      const updated = [...prev];
                      const lastIndex = updated.length - 1;
                      if (
                        lastIndex >= 0 &&
                        updated[lastIndex]?.role === "assistant"
                      ) {
                        updated[lastIndex] = {
                          ...updated[lastIndex],
                          content: newContent,
                        };
                      }
                      return updated;
                    });
                  }

                  // Handle inline recommendations from first message
                  if (data.recommendations && data.recommendations.length > 0) {
                    setMessageRecommendations((prev) => ({
                      ...prev,
                      [assistantMessageIndex]: data.recommendations,
                    }));
                  }
                  break;

                case "recommendations":
                  // Handle separate recommendations event
                  if (data.recommendations && data.recommendations.length > 0) {
                    setMessageRecommendations((prev) => ({
                      ...prev,
                      [assistantMessageIndex]: data.recommendations,
                    }));
                  }
                  break;

                case "done":
                  // Try to parse final content for recommendations
                  const finalContent = accumulatedContentRef.current;
                  const { text: parsedText, recommendations } =
                    parseMessageContent(finalContent);

                  if (recommendations.length > 0) {
                    setMessageRecommendations((prev) => ({
                      ...prev,
                      [assistantMessageIndex]: recommendations,
                    }));

                    // Update message with clean text
                    setMessages((prev) => {
                      const updated = [...prev];
                      const lastIndex = updated.length - 1;
                      if (
                        lastIndex >= 0 &&
                        updated[lastIndex]?.role === "assistant"
                      ) {
                        updated[lastIndex] = {
                          ...updated[lastIndex],
                          content: parsedText,
                          recommendations: recommendations,
                        };
                      }
                      return updated;
                    });
                  }

                  await getChatHistory();
                  break;

                case "error":
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    if (
                      lastIndex >= 0 &&
                      updated[lastIndex]?.role === "assistant"
                    ) {
                      updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: `⚠️ Error: ${data.error}`,
                      };
                    }
                    return updated;
                  });
                  break;

                default:
                  console.warn("Unknown message type:", data.type);
              }
            } else {
              // Legacy format handling
              if (data.chatId) {
                setCurrentChatId(data.chatId);
                window.history.replaceState(null, "", `/chat/${data.chatId}`);
              }

              if (data.title) {
                setCurrentChatTitle(data.title);
              }

              if (data.text) {
                accumulatedContentRef.current += data.text;
                const newContent = accumulatedContentRef.current;

                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (
                    lastIndex >= 0 &&
                    updated[lastIndex]?.role === "assistant"
                  ) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: newContent,
                    };
                  }
                  return updated;
                });
              }

              if (data.recommendations) {
                setMessageRecommendations((prev) => ({
                  ...prev,
                  [assistantMessageIndex]: data.recommendations,
                }));
              }

              if (data.error) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (
                    lastIndex >= 0 &&
                    updated[lastIndex]?.role === "assistant"
                  ) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: `⚠️ Error: ${data.error}`,
                    };
                  }
                  return updated;
                });
              }
            }
          } catch (parseError) {
            if (payload && payload !== "") {
              console.warn("Failed to parse SSE data:", payload, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex]?.role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content:
              "⚠️ Sorry, there was an error connecting to the server. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
      accumulatedContentRef.current = "";
    }
  };

  // Load chat from history
  const loadChat = async (chatId) => {
    if (chatId === currentChatId) {
      setSidebarOpen(false);
      return;
    }

    setChatLoading(true);
    setChatOpen(true);
    setSidebarOpen(false);
    setMessageRecommendations({}); // Clear recommendations when loading new chat

    try {
      await loadChatFromStore(chatId);

      const chatInfo = chatHistory.find((c) => (c._id || c.id) === chatId);
      if (chatInfo?.title) {
        setCurrentChatTitle(chatInfo.title);
      }

      // Load recommendations from messages if they exist
      const loadedMessages = useChatStore.getState().messages;
      const recs = {};
      loadedMessages.forEach((msg, index) => {
        if (msg.recommendations && msg.recommendations.length > 0) {
          recs[index] = msg.recommendations;
        }
      });
      setMessageRecommendations(recs);
    } catch (error) {
      console.error("Failed to load chat:", error);
    } finally {
      setChatLoading(false);
    }
  };

  // Start new chat
  const startNewChat = () => {
    clearCurrentChat();
    setChatOpen(false);
    setSidebarOpen(false);
    accumulatedContentRef.current = "";
    setMessageRecommendations({});
    window.history.replaceState(null, "", "/chat");
  };

  // Popular questions
  const popularQuestions = [
    "What are the best foods for energy?",
    "How much protein do I need daily?",
    "Suggest a healthy breakfast",
    "Foods to avoid for weight loss",
    "High fiber meal ideas",
    "Best supplements for beginners",
    "What should I eat before a workout?",
    "Suggest low-carb dinner options",
    "Mediterranean diet benefits",
    "Quick healthy snack ideas",
    "Healthy lunch under 500 calories",
    "How to meal prep for the week?",
  ];

  // Filter chat history based on search
  const filteredHistory = (chatHistory || []).filter((h) =>
    h.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Toast Notification */}
      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}

      {/* Add Meal Modal */}
      {showAddModal && selectedMeal && (
        <AddMealModal
          meal={selectedMeal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMeal(null);
          }}
          onConfirm={confirmAddMeal}
          isLoading={isAddingMeal}
        />
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-30 transform transition-all duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-80 h-full bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-2xl flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Apple className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                Nutrition Genie
              </h2>
              <p className="text-xs text-gray-500">AI Nutrition Assistant</p>
            </div>
            <button
              className="ml-auto lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            New Conversation
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Conversations
          </h3>

          {sidebarLoading ? (
            <SidebarSkeleton />
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Start a new conversation to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredHistory.map((chat) => (
                <button
                  key={chat._id || chat.id}
                  onClick={() => loadChat(chat._id || chat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-left ${
                    currentChatId === (chat._id || chat.id)
                      ? "bg-purple-100 border border-purple-200"
                      : "hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      currentChatId === (chat._id || chat.id)
                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                        : "bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200"
                    }`}
                  >
                    <MessageSquare
                      className={`w-4 h-4 ${
                        currentChatId === (chat._id || chat.id)
                          ? "text-white"
                          : "text-purple-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate transition-colors ${
                        currentChatId === (chat._id || chat.id)
                          ? "text-purple-700"
                          : "text-gray-700 group-hover:text-purple-700"
                      }`}
                    >
                      {chat.title || "Untitled Chat"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(chat.createdAt || chat.date)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {user?.data?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.data?.username || "User"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white/60 backdrop-blur-lg border-b border-white/50">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-2">
              {chatOpen && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <h1 className="font-semibold text-gray-800">
                  {currentChatTitle || "Nutrition Genie"}
                </h1>
                {chatOpen && (
                  <p className="text-xs text-gray-500">
                    AI-powered nutrition advice
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {chatOpen && (
              <button
                onClick={startNewChat}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {chatLoading ? (
            <ChatLoadingSkeleton />
          ) : !chatOpen ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="text-center mb-10">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Nutrition Genie
                    </span>
                  </h1>
                  <p className="text-gray-500 text-lg max-w-md mx-auto">
                    Your AI-powered nutrition companion for personalized meal
                    plans, calorie tracking, and healthy living.
                  </p>
                </div>

                <div className="w-full max-w-3xl">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
                    Popular Questions
                  </h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {popularQuestions.map((question, i) => (
                      <SuggestionChip
                        key={i}
                        text={question}
                        onClick={() => handleSend(question)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-full mx-auto px-4 lg:px-6 py-6 space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] lg:max-w-[75%] ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-purple-600 to-pink-600"
                          : "bg-gradient-to-br from-emerald-500 to-teal-600"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative group ${
                        msg.role === "user" ? "order-first" : ""
                      }`}
                    >
                      <div
                        className={`px-5 py-4 rounded-2xl shadow-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          msg.content ? (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <TypingIndicator />
                          )
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {/* Recommendations Section - Only for assistant messages */}
                      {msg.role === "assistant" &&
                        messageRecommendations[i] &&
                        messageRecommendations[i].length > 0 && (
                          <RecommendationsSection
                            recommendations={messageRecommendations[i]}
                            onAddToLog={handleAddToLog}
                            onSaveRecommendation={(rec) =>
                              handleSaveRecommendation(
                                rec,
                                messageRecommendations[i].indexOf(rec)
                              )
                            }
                            addingMealId={addingMealId}
                            savedMeals={savedMeals}
                          />
                        )}

                      {/* Also check msg.recommendations for loaded chats */}
                      {msg.role === "assistant" &&
                        msg.recommendations &&
                        msg.recommendations.length > 0 &&
                        !messageRecommendations[i] && (
                          <RecommendationsSection
                            recommendations={msg.recommendations}
                            onAddToLog={handleAddToLog}
                            onSaveRecommendation={(rec) =>
                              handleSaveRecommendation(
                                rec,
                                msg.recommendations.indexOf(rec)
                              )
                            }
                            addingMealId={addingMealId}
                            savedMeals={savedMeals}
                          />
                        )}

                      {/* Timestamp */}
                      <p
                        className={`text-xs text-gray-400 mt-1.5 ${
                          msg.role === "user" ? "text-right" : ""
                        }`}
                      >
                        {msg.role === "user" ? "You" : "Nutrition Genie"} •{" "}
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "now"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white/80 backdrop-blur-xl">
          <div className="px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 150) + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask about nutrition, meal plans, or health goals..."
                    rows={1}
                    disabled={isStreaming}
                    className="w-full px-5 py-4 pr-12 rounded-2xl bg-gray-50 border border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none resize-none transition-all text-gray-700 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: "56px", maxHeight: "150px" }}
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                    {input.length > 0 && <span>{input.length}/2000</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleSend()}
                  disabled={isStreaming || !input.trim()}
                  className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${
                    isStreaming || !input.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
                  }`}
                >
                  {isStreaming ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-3">
                Nutrition Genie provides general nutrition information. Consult
                a healthcare professional for medical advice.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Prose customizations */
        .prose table {
          margin: 0;
        }

        .prose pre {
          margin: 0;
          padding: 0;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
