const express = require("express");
const { upload } = require("../config/multer");
const fs = require("fs");
const Meal = require("../models/meal");
const NutritionStats = require("../models/nutritionStats");
const router = express.Router();

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    console.log(req.body);

    // Read uploaded file and convert to base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    // Send image to your ML server
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ message: "Prediction failed", error: errorText });
    }

    const prediction = await response.json(); // predicted food key, e.g., "apple_pie"
    console.log("Prediction result:", prediction);

    // Read your nutrition database
    const nutritionData = JSON.parse(fs.readFileSync("food.json", "utf-8"));

    // Extract portion type from form
    const portionType = req.body.portionType || "per_serving"; // default

    // Get the food info from nutritionData
    let foodKey = prediction.predicted_class || ""; // e.g., "apple_pie"
    let foodInfo = nutritionData.foods[foodKey];

    if (!foodInfo) {
      return res.status(404).json({ message: "Food not found in database" });
    }

    // Clean food name for frontend (remove colons and extra whitespace)
    const cleanFoodName = foodInfo.name
      ? foodInfo.name.replace(/:/g, "").trim()
      : foodKey.replace(/_/g, " ").replace(/:/g, "").trim();

    // Extract nutrients for requested portion type
    const nutrients = foodInfo[portionType] || {};
    const imagePath = "http://localhost:3000/" + req.file.path;
    console.log("Image stored at:", imagePath);
    const data = {
      foodName: cleanFoodName,
      mealType: req.body.mealType || "Lunch",
      portionType,
      nutrients,
      prediction,
      imagePath,
    };
    console.log("Final meal data to send:", data);

    res.status(201).json({
      message: "Meal uploaded successfully",
      data,
      imagePath: req.file.path,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/goals", async (req, res) => {
  try {
    const userId = req.user._id;
    const { goal, type } = req.body;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let stats = await NutritionStats.findOne({
      userId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    if (!stats) {
      if (type === "water") {
        stats = await NutritionStats.create({
          userId,
          water_goal_ml: goal,
        });
      } else if (type === "calorie") {
        stats = await NutritionStats.create({
          userId,
          calorie_goal: goal,
        });
      } else {
        return res.status(400).json({ message: "Invalid goal type" });
      }
    }

    const existingStats = await NutritionStats.findOne({ userId });
    if (type === "water") {
      existingStats.water_goal_ml = goal;
    } else if (type === "calorie") {
      existingStats.calorie_goal = goal;
    }
    await existingStats.save();
    res.status(200).json({ message: "Goal set successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user._id;

    // Define start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find today's stats
    const stats = await NutritionStats.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!stats) {
      return res
        .status(404)
        .json({ message: "No nutrition stats found for today" });
    }

    res.status(200).json({ data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/meals", async (req, res) => {
  try {
    const userId = req.user._id;

    // Start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ createdAt: -1 });
    console.log("Fetched meals for user:", meals);

    res.status(200).json({ data: meals });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
});

router.post("/save", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealType } = req.body;
    console.log(req.body);

    const meal = await Meal.create({
      ...req.body,
      userId,
    });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let stats = await NutritionStats.findOne({
      userId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    const nutrients = req.body || {};

    const calories = Number(nutrients.calories) || 0;
    const protein = Number(nutrients.protein_g) || 0;
    const carbs = Number(nutrients.carbs_g) || 0;
    const fats = Number(nutrients.fat_g) || 0;
    const fiber = Number(nutrients.fiber_g) || 0;
    const sodium = Number(nutrients.sodium_mg) || 0;
    const sugar = Number(nutrients.sugar_g) || 0;

    if (stats) {
      stats.calories += calories;
      stats.protein_g += protein;
      stats.carbs_g += carbs;
      stats.fat_g += fats;
      stats.fiber_g += fiber;
      stats.sodium_mg += sodium;
      stats.sugar_g += sugar;
      stats.mealIds.push(meal._id);
      switch (mealType.toLowerCase()) {
        case "breakfast":
          stats.breakFastCalories += calories;
          break;
        case "lunch":
          stats.lunchCalories += calories;
          break;
        case "dinner":
          stats.dinnerCalories += calories;
          break;
        case "snack":
          stats.snackCalories += calories;
          break;
        default:
          break;
      }

      await stats.save();
    } else {
      const newStats = {
        userId,
        calories,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fats,
        fiber_g: fiber,
        sodium_mg: sodium,
        sugar_g: sugar,
        mealIds: [meal._id],
        breakFastCalories:
          mealType.toLowerCase() === "breakfast" ? calories : 0,
        lunchCalories: mealType.toLowerCase() === "lunch" ? calories : 0,
        dinnerCalories: mealType.toLowerCase() === "dinner" ? calories : 0,
        snackCalories: mealType.toLowerCase() === "snack" ? calories : 0,
      };
      stats = await NutritionStats.create(newStats);
    }

    res.status(201).json({
      message: "Meal saved and daily stats updated",
      meal,
      stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
