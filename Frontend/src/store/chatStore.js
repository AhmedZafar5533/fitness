import { create } from "zustand";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getErrorMessage = (error, fallback) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message && error.message !== "Failed to fetch") return error.message;
  return fallback;
};

export const useChatStore = create((set, get) => ({
  messages: [],
  chatHistory: [],
  currentChatId: null,
  currentChatTitle: "",
  isLoading: false,
  error: null,

  setMessages: (messagesOrUpdater) => {
    if (typeof messagesOrUpdater === "function") {
      set((state) => ({ messages: messagesOrUpdater(state.messages) }));
    } else {
      set({ messages: messagesOrUpdater });
    }
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  updateLastMessage: (content) => {
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        };
      }
      return { messages };
    });
  },

  setCurrentChatId: (chatId) => {
    set({ currentChatId: chatId });
  },

  setCurrentChatTitle: (title) => {
    set({ currentChatTitle: title });
  },

  loadChat: async (chatId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/chat/${chatId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load chat`);
      }

      const data = await response.json();

      const messages = data.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      }));

      set({
        messages,
        currentChatId: chatId,
        currentChatTitle: data[0]?.chatTitle || "Chat",
        isLoading: false,
      });

      return messages;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to load chat");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  getChatHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/chat/history`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch chat history");
      }

      const data = await response.json();
      set({ chatHistory: data, isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to fetch chat history");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  deleteChat: async (chatId) => {
    try {
      const response = await fetch(`${API_URL}/chat/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete chat");
      }

      set((state) => ({
        chatHistory: state.chatHistory.filter((chat) => chat._id !== chatId),
      }));

      if (get().currentChatId === chatId) {
        get().clearCurrentChat();
      }

      toast.success("Chat deleted successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to delete chat");
      toast.error(errorMessage);
      return false;
    }
  },

  renameChat: async (chatId, newTitle) => {
    try {
      const response = await fetch(`${API_URL}/chat/${chatId}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to rename chat");
      }

      set((state) => ({
        chatHistory: state.chatHistory.map((chat) =>
          chat._id === chatId ? { ...chat, title: newTitle } : chat
        ),
        currentChatTitle:
          state.currentChatId === chatId ? newTitle : state.currentChatTitle,
      }));

      toast.success("Chat renamed successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to rename chat");
      toast.error(errorMessage);
      return false;
    }
  },

  sendMessage: async (content, chatId = null) => {
    const userMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(`${API_URL}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: content,
          chatId: chatId || get().currentChatId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        currentChatId: data.chatId || state.currentChatId,
        currentChatTitle: data.chatTitle || state.currentChatTitle,
        isLoading: false,
      }));

      return data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to send message");
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  clearCurrentChat: () => {
    set({
      messages: [],
      currentChatId: null,
      currentChatTitle: "",
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  setIsLoading: (isLoading) => set({ isLoading }),

  resetStore: () =>
    set({
      messages: [],
      chatHistory: [],
      currentChatId: null,
      currentChatTitle: "",
      isLoading: false,
      error: null,
    }),
}));