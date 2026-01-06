const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealName: {
      type: String,
      required: true,
    },

    time: {
      type: Date,
    },
    calories: {
      type: Number,
      min: [0, "Calories cannot be negative"],
    },
    fat_g: {
      type: Number,
      min: [0, "Fat cannot be negative"],
    },
    protein_g: {
      type: Number,
      min: [0, "Protein cannot be negative"],
    },
    carbs_g: {
      type: Number,
      min: [0, "Carbs cannot be negative"],
    },
    fiber_g: {
      type: Number,
      min: [0, "Fiber cannot be negative"],
    },
    sugar_g: {
      type: Number,
      min: [0, "Sugar cannot be negative"],
    },
    sodium_mg: {
      type: Number,
      min: [0, "Sodium cannot be negative"],
    },
    imagePath: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);
