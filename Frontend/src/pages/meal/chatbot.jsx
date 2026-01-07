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

// Simplified Meal Recommendation Card Component
const MealRecommendationCard = ({
  recommendation,
  onAddToLog,
  onSave,
  isAdding,
  isSaving,
  index,
}) => {
  const config =
    mealTypeConfig[recommendation.mealType] || mealTypeConfig.snack;
  const MealIcon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <MealIcon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              {config.label}
            </span>
            <h4 className="font-medium text-gray-900 truncate text-sm">
              {recommendation.mealName}
            </h4>
          </div>
        </div>

        <button
          onClick={() => onSave(recommendation, index)}
          disabled={isSaving}
          className={`p-1.5 rounded-md transition-colors ${
            isSaving
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-300 hover:text-purple-600"
          }`}
          title="Save for later"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nutrition - Simple Row */}
      <div className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg mb-4">
        <div className="text-center">
          <span className="text-sm font-semibold text-gray-900">
            {recommendation.calories}
          </span>
          <span className="text-[10px] text-gray-400 block">kcal</span>
        </div>
        <div className="w-px h-6 bg-gray-200" />
        <div className="text-center">
          <span className="text-sm font-semibold text-gray-900">
            {recommendation.protein_g}g
          </span>
          <span className="text-[10px] text-gray-400 block">protein</span>
        </div>
        <div className="w-px h-6 bg-gray-200" />
        <div className="text-center">
          <span className="text-sm font-semibold text-gray-900">
            {recommendation.carbs_g}g
          </span>
          <span className="text-[10px] text-gray-400 block">carbs</span>
        </div>
        <div className="w-px h-6 bg-gray-200" />
        <div className="text-center">
          <span className="text-sm font-semibold text-gray-900">
            {recommendation.fat_g}g
          </span>
          <span className="text-[10px] text-gray-400 block">fat</span>
        </div>
      </div>

      {/* Additional Nutrients - Minimal */}
      {(recommendation.fiber_g ||
        recommendation.sugar_g ||
        recommendation.sodium_mg) && (
        <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4">
          {recommendation.fiber_g && (
            <span>Fiber: {recommendation.fiber_g}g</span>
          )}
          {recommendation.sugar_g && (
            <span>Sugar: {recommendation.sugar_g}g</span>
          )}
          {recommendation.sodium_mg && (
            <span>Sodium: {recommendation.sodium_mg}mg</span>
          )}
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => onAddToLog(recommendation, index)}
        disabled={isAdding}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
          isAdding
            ? "bg-gray-100 text-gray-400"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        {isAdding ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Log</span>
          </>
        )}
      </button>
    </div>
  );
};

// Simplified Recommendations Section Component
const RecommendationsSection = ({
  recommendations,
  onAddToLog,
  onSaveRecommendation,
  addingMealId,
  savingMealId,
  removedMeals,
}) => {
  // Filter out removed meals
  const visibleRecommendations = recommendations.filter(
    (rec, index) => !removedMeals.includes(`${rec.mealName}-${index}`)
  );

  if (!visibleRecommendations || visibleRecommendations.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            Recommended for You
          </h3>
          <p className="text-xs text-gray-500">
            {visibleRecommendations.length} meal{visibleRecommendations.length > 1 ? "s" : ""}{" "}
            based on your preferences
          </p>
        </div>
      </div>

      {/* Horizontal Scrollable Cards for mobile, Grid for larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => {
          const mealId = `${rec.mealName}-${index}`;
          // Skip removed meals
          if (removedMeals.includes(mealId)) return null;
          
          return (
            <MealRecommendationCard
              key={mealId}
              recommendation={rec}
              index={index}
              onAddToLog={onAddToLog}
              onSave={onSaveRecommendation}
              isAdding={addingMealId === mealId}
              isSaving={savingMealId === mealId}
            />
          );
        })}
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
  const MealIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add to Meal Log</h2>
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

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Meal Name Display */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <MealIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Meal</p>
              <p className="font-medium text-gray-900 truncate">{meal?.mealName}</p>
            </div>
          </div>

          {/* Meal Type Selector */}
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
                    <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-400"}`} />
                    <span className={`text-[11px] font-medium ${isSelected ? "text-white" : "text-gray-500"}`}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date/Time */}
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

          {/* Nutrition Summary */}
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

        {/* Footer */}
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

// Enhanced Markdown Components with more spacing
const MarkdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <div className="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
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
      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
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
    return <ul className="my-4 space-y-3 list-none">{children}</ul>;
  },
  ol({ children }) {
    return (
      <ol className="my-4 space-y-3 list-decimal list-inside">{children}</ol>
    );
  },
  li({ children, ordered }) {
    return (
      <li className="flex items-start gap-3 text-gray-700 leading-relaxed">
        {!ordered && (
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0" />
        )}
        <span>{children}</span>
      </li>
    );
  },
  h1({ children }) {
    return (
      <h1 className="text-2xl font-bold text-gray-800 mt-8 mb-4 pb-3 border-b border-gray-200">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="text-lg font-medium text-gray-800 mt-5 mb-3">
        {children}
      </h3>
    );
  },
  p({ children }) {
    return (
      <p className="text-gray-700 leading-relaxed my-4 text-[15px]">
        {children}
      </p>
    );
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-6 pl-4 border-l-4 border-purple-300 bg-purple-50/50 py-3 pr-4 rounded-r-lg italic text-gray-600">
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
    return <hr className="my-8 border-t border-gray-200" />;
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
  const [savingMealId, setSavingMealId] = useState(null);
  const [removedMeals, setRemovedMeals] = useState([]); // Track removed meals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealIndex, setSelectedMealIndex] = useState(null);
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

  // Handle adding meal to log - opens modal
  const handleAddToLog = (recommendation, index) => {
    setSelectedMeal(recommendation);
    setSelectedMealIndex(index);
    setShowAddModal(true);
  };

  // Confirm add meal to log
  const confirmAddMeal = async (mealData) => {
    setIsAddingMeal(true);
    const mealId = `${selectedMeal.mealName}-${selectedMealIndex}`;
    setAddingMealId(mealId);
    
    try {
      const response = await fetch("http://localhost:3000/api/meals/upcoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "upcoming",
          source: "chatbot",
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

      // Remove meal from chat after successful add
      setRemovedMeals((prev) => [...prev, mealId]);
      
      showToast(`${mealData.mealName} added to your meal log!`);
      setShowAddModal(false);
      setSelectedMeal(null);
      setSelectedMealIndex(null);
    } catch (error) {
      console.error("Error adding meal:", error);
      showToast("Failed to add meal. Please try again.");
    } finally {
      setIsAddingMeal(false);
      setAddingMealId(null);
    }
  };

  // Handle saving recommendation (bookmark)
  const handleSaveRecommendation = async (recommendation, index) => {
    const mealId = `${recommendation.mealName}-${index}`;
    setSavingMealId(mealId);
    
    try {
      const response = await fetch("http://localhost:3000/api/meals/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealName: recommendation.mealName,
          mealType: recommendation.mealType || "snack",
          calories: recommendation.calories,
          protein_g: recommendation.protein_g,
          carbs_g: recommendation.carbs_g,
          fat_g: recommendation.fat_g,
          fiber_g: recommendation.fiber_g,
          sugar_g: recommendation.sugar_g,
          sodium_mg: recommendation.sodium_mg,
          chatId: currentChatId,
          notes: "Saved from chat recommendation",
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to save recommendation");
      }

      // Remove meal from chat after successful save
      setRemovedMeals((prev) => [...prev, mealId]);
      
      showToast(`${recommendation.mealName} saved to recommendations!`);
    } catch (error) {
      console.error("Error saving recommendation:", error);
      showToast("Failed to save recommendation. Please try again.");
    } finally {
      setSavingMealId(null);
    }
  };

  // Parse recommendations from loaded messages
  const parseRecommendationsFromMessages = (loadedMessages) => {
    const recs = {};
    loadedMessages.forEach((msg, index) => {
      if (msg.role === "assistant") {
        // First check if recommendations are already attached to the message
        if (msg.recommendations && msg.recommendations.length > 0) {
          recs[index] = msg.recommendations;
        } else {
          // Try to parse from content
          const { recommendations } = parseMessageContent(msg.content);
          if (recommendations.length > 0) {
            recs[index] = recommendations;
          }
        }
      }
    });
    return recs;
  };

  // Send Message with streaming
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

                  if (data.recommendations && data.recommendations.length > 0) {
                    setMessageRecommendations((prev) => ({
                      ...prev,
                      [assistantMessageIndex]: data.recommendations,
                    }));
                  }
                  break;

                case "recommendations":
                  if (data.recommendations && data.recommendations.length > 0) {
                    setMessageRecommendations((prev) => ({
                      ...prev,
                      [assistantMessageIndex]: data.recommendations,
                    }));
                  }
                  break;

                case "done":
                  const finalContent = accumulatedContentRef.current;
                  const { text: parsedText, recommendations } =
                    parseMessageContent(finalContent);

                  if (recommendations.length > 0) {
                    setMessageRecommendations((prev) => ({
                      ...prev,
                      [assistantMessageIndex]: recommendations,
                    }));

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

  // Load chat from history - UPDATED to properly load recommendations
  const loadChat = async (chatId) => {
    if (chatId === currentChatId) {
      setSidebarOpen(false);
      return;
    }

    setChatLoading(true);
    setChatOpen(true);
    setSidebarOpen(false);
    setMessageRecommendations({});
    setRemovedMeals([]); // Reset removed meals when loading a new chat

    try {
      await loadChatFromStore(chatId);

      const chatInfo = chatHistory.find((c) => (c._id || c.id) === chatId);
      if (chatInfo?.title) {
        setCurrentChatTitle(chatInfo.title);
      }

      // Wait for messages to be loaded, then parse recommendations
      setTimeout(() => {
        const loadedMessages = useChatStore.getState().messages;
        const recs = parseRecommendationsFromMessages(loadedMessages);
        setMessageRecommendations(recs);
      }, 100);
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
    setRemovedMeals([]); // Reset removed meals for new chat
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

  // Get recommendations for a message
  const getRecommendationsForMessage = (msg, index) => {
    // First check messageRecommendations state
    if (messageRecommendations[index]?.length > 0) {
      return messageRecommendations[index];
    }
    // Then check if recommendations are attached to the message itself
    if (msg.recommendations?.length > 0) {
      return msg.recommendations;
    }
    return [];
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
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
            setSelectedMealIndex(null);
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
                {user?.username || "User"}
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
            /* Chat Messages - MORE SPACIOUS */
            <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-8">
              {messages.map((msg, i) => {
                const recommendations = getRecommendationsForMessage(msg, i);

                return (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    } animate-fadeIn`}
                  >
                    <div
                      className={`flex gap-4 w-full ${
                        msg.role === "user"
                          ? "flex-row-reverse max-w-[85%] lg:max-w-[70%]"
                          : "max-w-full"
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

                      {/* Message Content */}
                      <div
                        className={`flex-1 ${
                          msg.role === "user" ? "order-first" : ""
                        }`}
                      >
                        {/* Message Bubble */}
                        <div
                          className={`px-6 py-5 rounded-2xl shadow-sm ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-md"
                              : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            msg.content ? (
                              <div className="prose prose-base max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed">
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
                            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                              {msg.content}
                            </p>
                          )}
                        </div>

                        {/* Recommendations Section - Only for assistant messages */}
                        {msg.role === "assistant" &&
                          recommendations.length > 0 && (
                            <RecommendationsSection
                              recommendations={recommendations}
                              onAddToLog={handleAddToLog}
                              onSaveRecommendation={handleSaveRecommendation}
                              addingMealId={addingMealId}
                              savingMealId={savingMealId}
                              removedMeals={removedMeals}
                            />
                          )}

                        {/* Timestamp */}
                        <p
                          className={`text-xs text-gray-400 mt-2 ${
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
                );
              })}
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

        .prose p {
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .prose ul,
        .prose ol {
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .prose h1,
        .prose h2,
        .prose h3 {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}