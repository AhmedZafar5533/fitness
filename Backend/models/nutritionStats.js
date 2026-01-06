const mongoose = require("mongoose");

const nutritionStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meal",
      },
    ],
    water_ml: {
      type: Number,
      default: 0,
    },
    water_goal_ml: {
      type: Number,
      default: 2000,
    },
    calorie_goal: {
      type: Number,
      default: 2000,
    },

    calories: {
      type: Number,
      default: 0,
    },
    fat_g: {
      type: Number,
      default: 0,
    },
    protein_g: {
      type: Number,
      default: 0,
    },
    carbs_g: {
      type: Number,
      default: 0,
    },
    fiber_g: {
      type: Number,
      default: 0,
    },
    sugar_g: {
      type: Number,
      default: 0,
    },
    sodium_mg: {
      type: Number,
      default: 0,
    },
    breakFastCalories: {
      type: Number,
      default: 0,
    },
    lunchCalories: {
      type: Number,
      default: 0,
    },
    dinnerCalories: {
      type: Number,
      default: 0,
    },
    snackCalories: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);
nutritionStatsSchema.index({ userId: 1, createdAt: -1 });
const NutritionStats = mongoose.model("NutritionStats", nutritionStatsSchema);

module.exports = NutritionStats;
