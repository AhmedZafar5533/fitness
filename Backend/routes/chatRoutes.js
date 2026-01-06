require("dotenv").config();

const express = require("express");
const Chat = require("../models/chat");
const Message = require("../models/message");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

// Initialize AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Middleware to ensure authentication
const ensureAuthenticated = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ error: "Unauthorized" });
};

router.post("/stream-sse", ensureAuthenticated, async (req, res) => {
  const { prompt, chatId } = req.body;

  // SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });

  try {
    // 1️⃣ Load or create chat
    let chat;
    let isNewChat = false;

    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      chat = await Chat.create({ userId: req.user._id });
      isNewChat = true;
    }

    // 2️⃣ Send chatId immediately (so frontend can update state)
    res.write(
      `data: ${JSON.stringify({
        type: "init",
        chatId: chat._id,
        isNewChat,
      })}\n\n`
    );

    // 3️⃣ Save user message
    await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: "user",
      content: prompt,
    });

    // 4️⃣ Check if this is the first assistant reply
    const messageCount = await Message.countDocuments({ chatId: chat._id });
    const isFirstAssistantReply = messageCount === 1;

    // 5️⃣ System prompt
    const systemPrompt = isFirstAssistantReply
      ? `You are NutriGenie. Respond ONLY with a single JSON object in this format: {"title": string, "response": string}. Do NOT include any backticks, explanations, or extra text. The "response" field can contain Markdown.`
      : `You are NutriGenie. Respond in MARKDOWN only.`;

    const contents = `${systemPrompt}\n\nUser: ${prompt}`;

    // 6️⃣ First message (non-streamed for title extraction)
    if (isFirstAssistantReply) {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      let parsed;
      try {
        const cleanText = result.text.replace(/```/g, "").trim();
        const match = cleanText.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : JSON.parse(cleanText);
      } catch (err) {
        console.warn("Failed to parse JSON from AI. Storing raw text.", err);
        parsed = {
          title: "New Chat",
          response: result.text,
        };
      }

      // Save title in chat
      chat.title = parsed.title || "New Chat";
      await chat.save();

      // Save assistant response
      await Message.create({
        chatId: chat._id,
        role: "assistant",
        content: parsed.response || result.text,
      });

      // Send title update and response
      res.write(
        `data: ${JSON.stringify({ type: "title", title: chat.title })}\n\n`
      );
      res.write(
        `data: ${JSON.stringify({ type: "text", text: parsed.response })}\n\n`
      );
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      return res.end();
    }

    // 7️⃣ Streamed responses for subsequent messages
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const text = typeof chunk.text === "function" ? chunk.text() : chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: "text", text })}\n\n`);
      }
    }

    // Save assistant response
    await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    res.write(
      `data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`
    );
    res.end();
  }
});

// ... rest of your routes remain the same
router.get("/history", ensureAuthenticated, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("_id title createdAt");
    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load chats" });
  }
});

router.get("/:chatId", ensureAuthenticated, async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Message.find({ chatId }).sort({ createdAt: 1 });
    if (!chat.length) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load chat" });
  }
});

module.exports = router;
