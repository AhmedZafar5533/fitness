const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },

    weight: {
      type: Number, // kg
      required: true,
      min: 1,
    },

    height: {
      type: Number, // cm
      required: true,
      min: 30,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    dietType: {
      type: String,
      enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Pescatarian"],
      required: true,
    },

    dietaryRestrictions: [
      {
        type: String,
        enum: ["Gluten", "Lactose", "Peanuts", "Soy", "Shellfish"],
      },
    ],

    allergies: [
      {
        type: String,
        enum: ["Peanuts", "Seafood", "Eggs", "Dairy", "Soy"],
      },
    ],

    imageUrl: {
      type: String, // Cloudinary / S3 / local upload URL
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index
userProfileSchema.index({ userId: 1 });

module.exports = mongoose.model("UserProfile", userProfileSchema);
