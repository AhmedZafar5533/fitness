require("dotenv").config();

const express = require("express");
const Chat = require("../models/chat");
const Message = require("../models/message");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const { buildNutritionContext } = require("../contextGeneration");

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

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });

  try {
    let chat;
    let isNewChat = false;
    const nutritionContext = await buildNutritionContext(req.user._id);

    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      chat = await Chat.create({ userId: req.user._id });
      isNewChat = true;
    }

    res.write(
      `data: ${JSON.stringify({
        type: "init",
        chatId: chat._id,
        isNewChat,
      })}\n\n`
    );

    await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: "user",
      content: prompt,
    });

    const messageCount = await Message.countDocuments({ chatId: chat._id });
    const isFirstAssistantReply = messageCount === 1;

    let previousSummaries = "";
    if (!isFirstAssistantReply) {
      const assistantMessages = await Message.find({
        chatId: chat._id,
        role: "assistant",
      }).sort({ createdAt: 1 });

      previousSummaries = assistantMessages
        .map((msg, idx) => `Summary ${idx + 1}: ${msg.summary || msg.content}`)
        .join("\n");
    }

    // Meal schema reference for AI
    const mealSchemaReference = `
MEAL RECOMMENDATION SCHEMA:
When suggesting meals, ALWAYS use this exact structure for each meal:
{
  "mealType": "breakfast" | "lunch" | "dinner" | "snack",
  "mealName": "string (required, descriptive name)",
  "calories": number (positive),
  "fat_g": number (positive, grams),
  "protein_g": number (positive, grams),
  "carbs_g": number (positive, grams),
  "fiber_g": number (positive, grams),
  "sugar_g": number (positive, grams),
  "sodium_mg": number (positive, milligrams)
}
`;

    const systemPrompt = isFirstAssistantReply
      ? `You are NutriGenie, a personalized AI nutrition assistant.
You are provided with a NUTRITION CONTEXT generated from the user's profile, meals, and daily stats.
Use this context to give accurate, personalized, and actionable advice.

${mealSchemaReference}

STRICT OUTPUT RULES:
- Respond ONLY with a single valid JSON object
- Do NOT include backticks, markdown code blocks, explanations, or extra text
- The JSON MUST follow this format exactly:

{
  "title": "string (short, meaningful heading for the response)",
  "response": "string (detailed answer in Markdown format)",
  "summary": "string (1-2 sentence concise summary for memory)",
  "recommendations": [
    {
      "mealType": "breakfast" | "lunch" | "dinner" | "snack",
      "mealName": "string",
      "calories": number,
      "fat_g": number,
      "protein_g": number,
      "carbs_g": number,
      "fiber_g": number,
      "sugar_g": number,
      "sodium_mg": number
    }
  ]
}

FIELD GUIDELINES:
- "title": Short, meaningful heading for the response
- "response": Detailed answer for the user (Markdown format)
- "summary": 1–2 sentence concise factual summary for long-term memory
- "recommendations": Array of meal objects (can be empty [] if no meal suggestions needed)

RECOMMENDATION RULES:
- Include "recommendations" array ONLY when suggesting specific meals/foods
- Each meal MUST have ALL nutritional fields with realistic estimated values
- "mealType" MUST be one of: "breakfast", "lunch", "dinner", "snack"
- "mealName" should be descriptive (e.g., "Grilled Chicken Salad with Quinoa")
- All nutritional values must be positive numbers (no negatives)
- Provide accurate nutritional estimates based on standard serving sizes
- If no meal recommendations are needed, use an empty array: "recommendations": []

BEHAVIOR RULES:
- Respect the user's diet type and allergies
- Base insights strictly on the provided nutrition context
- If trends or deficiencies are visible, mention them
- Avoid generic advice
- Tailor recommendations to user's caloric and macro goals

NUTRITION CONTEXT:
${nutritionContext}`
      : `You are NutriGenie, a personalized AI nutrition assistant.
You are continuing an ongoing conversation and are provided with:
- NUTRITION CONTEXT
- SUMMARIES OF PREVIOUS ASSISTANT MESSAGES

Use these to maintain personalization, continuity, and refer to past advice.

${mealSchemaReference}

PREVIOUS CONVERSATION SUMMARIES:
${previousSummaries}

STRICT OUTPUT RULES:
- Respond ONLY with a single valid JSON object
- Do NOT include backticks, markdown code blocks, explanations, or extra text
- The JSON MUST follow this format exactly:

{
  "response": "string (helpful, concise answer in Markdown)",
  "summary": "string (1-2 sentence distilled memory for future context)",
  "recommendations": [
    {
      "mealType": "breakfast" | "lunch" | "dinner" | "snack",
      "mealName": "string",
      "calories": number,
      "fat_g": number,
      "protein_g": number,
      "carbs_g": number,
      "fiber_g": number,
      "sugar_g": number,
      "sodium_mg": number
    }
  ]
}

FIELD GUIDELINES:
- "response": Helpful, concise answer in Markdown
- "summary": 1–2 sentence distilled memory of this reply for future context
- "recommendations": Array of meal objects (can be empty [] if no suggestions)

RECOMMENDATION RULES:
- Include "recommendations" array ONLY when suggesting specific meals/foods
- Each meal MUST have ALL nutritional fields with realistic estimated values
- "mealType" MUST be one of: "breakfast", "lunch", "dinner", "snack"
- "mealName" should be descriptive (e.g., "Greek Yogurt Parfait with Berries")
- All nutritional values must be positive numbers
- Provide accurate nutritional estimates based on standard serving sizes
- If no meal recommendations are needed, use an empty array: "recommendations": []

BEHAVIOR RULES:
- Stay consistent with previous advice
- Reference past meals or patterns when relevant
- Do NOT repeat the full nutrition context unless needed
- Tailor recommendations to user's dietary preferences and restrictions

NUTRITION CONTEXT:
${nutritionContext}`;

    const contents = `${systemPrompt}\n\nUser: ${prompt}`;

    if (isFirstAssistantReply) {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      let parsed;
      try {
        const cleanText = result.text
          .replace(/```json?/gi, "")
          .replace(/```/g, "")
          .trim();
        const match = cleanText.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : JSON.parse(cleanText);
      } catch (err) {
        parsed = {
          title: "New Chat",
          response: result.text,
          summary: result.text.slice(0, 150),
          recommendations: [],
        };
      }

      chat.title = parsed.title || "New Chat";
      await chat.save();

      await Message.create({
        chatId: chat._id,
        role: "assistant",
        content: parsed.response || result.text,
        summary: parsed.summary || parsed.response?.slice(0, 150),
        recommendations: parsed.recommendations || [],
      });

      res.write(
        `data: ${JSON.stringify({ type: "title", title: chat.title })}\n\n`
      );
      res.write(
        `data: ${JSON.stringify({
          type: "text",
          text: parsed.response,
          recommendations: parsed.recommendations || [],
        })}\n\n`
      );
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      return res.end();
    }

    // Streaming for follow-up messages
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

    // Parse the full response for summary and recommendations
    let parsedSummary = fullResponse.slice(0, 150);
    let recommendations = [];

    try {
      const cleanText = fullResponse
        .replace(/```json?/gi, "")
        .replace(/```/g, "")
        .trim();
      const match = cleanText.match(/\{[\s\S]*\}/);
      const parsedJSON = match ? JSON.parse(match[0]) : JSON.parse(cleanText);

      parsedSummary = parsedJSON.summary || parsedSummary;
      recommendations = parsedJSON.recommendations || [];

      // Validate recommendations against schema
      recommendations = recommendations
        .filter(
          (rec) =>
            rec.mealName &&
            ["breakfast", "lunch", "dinner", "snack"].includes(rec.mealType) &&
            typeof rec.calories === "number" &&
            rec.calories >= 0
        )
        .map((rec) => ({
          mealType: rec.mealType,
          mealName: rec.mealName,
          calories: Math.max(0, rec.calories || 0),
          fat_g: Math.max(0, rec.fat_g || 0),
          protein_g: Math.max(0, rec.protein_g || 0),
          carbs_g: Math.max(0, rec.carbs_g || 0),
          fiber_g: Math.max(0, rec.fiber_g || 0),
          sugar_g: Math.max(0, rec.sugar_g || 0),
          sodium_mg: Math.max(0, rec.sodium_mg || 0),
        }));
    } catch {}

    await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: fullResponse,
      summary: parsedSummary,
      recommendations: recommendations,
    });

    // Send recommendations at the end
    if (recommendations.length > 0) {
      res.write(
        `data: ${JSON.stringify({
          type: "recommendations",
          recommendations,
        })}\n\n`
      );
    }

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
