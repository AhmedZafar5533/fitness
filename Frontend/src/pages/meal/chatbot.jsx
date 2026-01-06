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
} from "lucide-react";

import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";

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

  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Ref to track accumulated content during streaming
  const accumulatedContentRef = useRef("");

  // Handle back navigation
  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home or dashboard if no history
      navigate("/");
    }
  };

  // Auto-scroll
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

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

  // Send Message with streaming - FIXED VERSION
  const handleSend = async (textOverride) => {
    const promptText = textOverride || input;
    if (!promptText.trim() || isStreaming) return;

    // Clear input and set states
    setInput("");
    setIsStreaming(true);
    setChatOpen(true);

    // Reset accumulated content
    accumulatedContentRef.current = "";

    // Create new messages
    const userMessage = {
      role: "user",
      content: promptText,
      timestamp: new Date(),
    };
    const assistantMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    // Get current messages and append new ones
    // This ensures we keep existing messages and add to them
    const currentMessages = useChatStore.getState().messages;
    const newMessages = [...currentMessages, userMessage, assistantMessage];
    setMessages(newMessages);

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

          // Handle [DONE] signal
          if (payload === "[DONE]") {
            // Refresh chat history to show new/updated chat in sidebar
            await getChatHistory();
            continue;
          }

          try {
            const data = JSON.parse(payload);

            // Handle different message types

            // Type-based handling (if using new backend format)
            if (data.type) {
              switch (data.type) {
                case "init":
                  // Update chatId silently - NO loading from server
                  if (data.chatId) {
                    setCurrentChatId(data.chatId);
                    // Update URL without navigation/reload
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
                  break;

                case "done":
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
              // Legacy format handling (for backward compatibility)

              // Handle chatId - just update state, don't load from server
              if (data.chatId) {
                setCurrentChatId(data.chatId);
                // Update URL without navigation
                window.history.replaceState(null, "", `/chat/${data.chatId}`);
              }

              // Handle title
              if (data.title) {
                setCurrentChatTitle(data.title);
              }

              // Handle text content
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

              // Handle error
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
            // Skip non-JSON lines silently
            if (payload && payload !== "") {
              console.warn("Failed to parse SSE data:", payload, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);

      // Update the assistant message with error
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

  // Load chat from history (explicitly from sidebar click)
  const loadChat = async (chatId) => {
    // Don't reload if it's the same chat
    if (chatId === currentChatId) {
      setSidebarOpen(false);
      return;
    }

    setChatLoading(true);
    setChatOpen(true);
    setSidebarOpen(false);

    try {
      await loadChatFromStore(chatId);

      // Find the chat title from history
      const chatInfo = chatHistory.find((c) => (c._id || c.id) === chatId);
      if (chatInfo?.title) {
        setCurrentChatTitle(chatInfo.title);
      }

      // // Update URL
      // window.history.replaceState(null, "", `/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to load chat:", error);
    } finally {
      setChatLoading(false);
    }
  };

  // Start new chat
  const startNewChat = () => {
    // Clear current chat state
    clearCurrentChat();

    // Reset UI states
    setChatOpen(false);
    setSidebarOpen(false);

    // Reset accumulated content
    accumulatedContentRef.current = "";

    // Update URL
    window.history.replaceState(null, "", "/chat");
  };

  // Popular questions
  const popularQuestions = [
    "What are the best foods for energy?",
    "How much protein do I need daily?",
    "Healthy breakfast ideas",
    "Foods to avoid for weight loss",
    "How to read nutrition labels",
    "Best supplements for beginners",
    "What should I eat before a workout?",
    "How can I reduce sugar intake?",
    "Mediterranean diet benefits",
    "High fiber foods list",
    "Healthy snack options",
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
              U
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
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
            </button>

            {/* Sidebar Toggle - Mobile Only */}
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
                {/* Hero Section */}
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

                {/* Popular Questions */}
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
            <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-6">
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
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
