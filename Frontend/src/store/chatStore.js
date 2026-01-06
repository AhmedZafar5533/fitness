import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  // State
  messages: [],
  chatHistory: [],
  currentChatId: null,
  currentChatTitle: "",
  isLoading: false,

  // Actions
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

  // ✅ New: Update chatId WITHOUT loading from server
  setCurrentChatId: (chatId) => {
    set({ currentChatId: chatId });
  },

  setCurrentChatTitle: (title) => {
    set({ currentChatTitle: title });
  },

  // ✅ Load chat from server (only called explicitly)
  loadChat: async (chatId) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`http://localhost:3000/api/chat/${chatId}`, {
        credentials: "include",
      });
      const data = await response.json();

      // Transform messages if needed
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
    } catch (error) {
      console.error("Failed to load chat:", error);
      set({ isLoading: false });
    }
  },

  // Get chat history
  getChatHistory: async () => {
    try {
      const response = await fetch("http://localhost:3000/api/chat/history", {
        credentials: "include",
      });
      const data = await response.json();
      console.log("Fetched chat history:", data);
      set({ chatHistory: data });
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  },

  // Clear current chat (for new conversation)
  clearCurrentChat: () => {
    set({
      messages: [],
      currentChatId: null,
      currentChatTitle: "",
    });
  },

  setIsLoading: (isLoading) => set({ isLoading }),
}));
