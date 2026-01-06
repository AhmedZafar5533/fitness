const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
  },
  { timestamps: true }
);

ChatSchema.index({ userId: 1, createdAt: -1 });

const chat = mongoose.model("Chat", ChatSchema);

module.exports = chat;
