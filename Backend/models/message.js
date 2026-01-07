const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: null,
    },
    recommendations: {
      type: Array,
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
MessageSchema.index({ chatId: 1, createdAt: 1 });
module.exports = mongoose.model("Message", MessageSchema);
