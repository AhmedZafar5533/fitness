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

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ message: "Prediction failed", error: errorText });
    }

    const prediction = await response.json();
    const nutritionData = JSON.parse(fs.readFileSync("food.json", "utf-8"));
    const portionType = req.body.portionType || "per_serving";

    let foodKey = prediction.predicted_class || "";
    let foodInfo = nutritionData.foods[foodKey];

    if (!foodInfo) {
      return res.status(404).json({ message: "Food not found in database" });
    }

    const cleanFoodName = foodInfo.name
      ? foodInfo.name.replace(/:/g, "").trim()
      : foodKey.replace(/_/g, " ").replace(/:/g, "").trim();

    const nutrients = foodInfo[portionType] || {};
    const imagePath = "http://localhost:3000/" + req.file.path;
    
    const data = {
      foodName: cleanFoodName,
      mealType: req.body.mealType || "Lunch",
      portionType,
      nutrients,
      prediction,
      imagePath,
    };

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

router.post("/log", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      mealName,
      mealType,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      sugar_g,
      sodium_mg,
      time,
      imagePath
    } = req.body;

    const mealDate = time ? new Date(time) : new Date();

    const newMeal = await Meal.create({
      userId,
      mealName,
      mealType,
      status: "eaten",
      calories: Number(calories) || 0,
      protein_g: Number(protein_g) || 0,
      carbs_g: Number(carbs_g) || 0,
      fat_g: Number(fat_g) || 0,
      fiber_g: Number(fiber_g) || 0,
      sugar_g: Number(sugar_g) || 0,
      sodium_mg: Number(sodium_mg) || 0,
      time: mealDate,
      consumedAt: mealDate,
      imagePath,
      createdAt: mealDate,
    });

    const startOfDay = new Date(mealDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(mealDate);
    endOfDay.setHours(23, 59, 59, 999);

    let stats = await NutritionStats.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const mealCals = Number(calories) || 0;
    const add = (a, b) => (Number(a) || 0) + (Number(b) || 0);

    if (stats) {
      stats.calories = add(stats.calories, calories);
      stats.protein_g = add(stats.protein_g, protein_g);
      stats.carbs_g = add(stats.carbs_g, carbs_g);
      stats.fat_g = add(stats.fat_g, fat_g);
      stats.fiber_g = add(stats.fiber_g, fiber_g);
      stats.sodium_mg = add(stats.sodium_mg, sodium_mg);
      stats.sugar_g = add(stats.sugar_g, sugar_g);
      stats.mealIds.push(newMeal._id);

      const type = mealType ? mealType.toLowerCase() : "snack";
      if (type === "breakfast") stats.breakFastCalories = add(stats.breakFastCalories, mealCals);
      else if (type === "lunch") stats.lunchCalories = add(stats.lunchCalories, mealCals);
      else if (type === "dinner") stats.dinnerCalories = add(stats.dinnerCalories, mealCals);
      else stats.snackCalories = add(stats.snackCalories, mealCals);

      await stats.save();
    } else {
      const type = mealType ? mealType.toLowerCase() : "snack";
      stats = await NutritionStats.create({
        userId,
        calories: mealCals,
        protein_g: Number(protein_g) || 0,
        carbs_g: Number(carbs_g) || 0,
        fat_g: Number(fat_g) || 0,
        fiber_g: Number(fiber_g) || 0,
        sodium_mg: Number(sodium_mg) || 0,
        sugar_g: Number(sugar_g) || 0,
        mealIds: [newMeal._id],
        breakFastCalories: type === "breakfast" ? mealCals : 0,
        lunchCalories: type === "lunch" ? mealCals : 0,
        dinnerCalories: type === "dinner" ? mealCals : 0,
        snackCalories: type !== "breakfast" && type !== "lunch" && type !== "dinner" ? mealCals : 0,
        createdAt: mealDate,
      });
    }

    res.status(201).json({ message: "Meal logged successfully", meal: newMeal, stats });
  } catch (error) {
    console.error("Error logging meal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



router.get("/recommendations", async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const recommendations = await Meal.find({ userId, status: "recommended" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    console.log(recommendations);
    const total = await Meal.countDocuments({ userId, status: "recommended" });

    res.status(200).json({
      message: "Recommendations fetched successfully",
      data: recommendations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/upcoming", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      mealName,
      mealType,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      sugar_g,
      sodium_mg,
      imagePath,
      notes,
    } = req.body;

    const upcomingMeal = await Meal.create({
      userId,
      mealName,
      mealType,
      status: "upcoming",
      calories: Number(calories) || 0,
      protein_g: Number(protein_g) || 0,
      carbs_g: Number(carbs_g) || 0,
      fat_g: Number(fat_g) || 0,
      fiber_g: Number(fiber_g) || 0,
      sugar_g: Number(sugar_g) || 0,
      sodium_mg: Number(sodium_mg) || 0,
      imagePath,
      notes,
    });

    res.status(201).json({ message: "Upcoming meal scheduled successfully", meal: upcomingMeal });
  } catch (error) {
    console.error("Error creating upcoming meal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const upcomingMeals = await Meal.find({ userId, status: "upcoming" })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    console.log(upcomingMeals);
    const total = await Meal.countDocuments({ userId, status: "upcoming" });

    res.status(200).json({
      message: "Upcoming meals fetched successfully",
      data: upcomingMeals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});router.post("/recommendations", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      mealName,
      mealType,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      sugar_g,
      sodium_mg,
      imagePath,
      chatId,
      notes,
    } = req.body;

    const recommendedMeal = await Meal.create({
      userId,
      mealName,
      mealType,
      status: "recommended",
      calories: Number(calories) || 0,
      protein_g: Number(protein_g) || 0,
      carbs_g: Number(carbs_g) || 0,
      fat_g: Number(fat_g) || 0,
      fiber_g: Number(fiber_g) || 0,
      sugar_g: Number(sugar_g) || 0,
      sodium_mg: Number(sodium_mg) || 0,
      imagePath,
      chatId,
      notes,
    });

    res.status(201).json({ message: "Meal recommendation saved successfully", meal: recommendedMeal });
  } catch (error) {
    console.error("Error saving recommendation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// PATCH /meals/upcoming/:mealId/reschedule - Reschedule an upcoming meal
router.patch("/upcoming/:mealId/reschedule", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealId } = req.params;
    const { scheduledTime, mealType, notes } = req.body;

    // Validation
    if (!scheduledTime) {
      return res.status(400).json({ message: "Scheduled time is required" });
    }

    const newScheduledTime = new Date(scheduledTime);

    // Validate that the date is valid
    if (isNaN(newScheduledTime.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Optional: Validate that the new time is in the future
    // Remove this check if you want to allow past dates for some reason
    if (newScheduledTime <= new Date()) {
      return res.status(400).json({ message: "Scheduled time must be in the future" });
    }

    // Find the meal
    const meal = await Meal.findOne({ _id: mealId, userId });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    // Check if meal is upcoming
    if (meal.status !== "upcoming") {
      return res.status(400).json({ 
        message: "Only upcoming meals can be rescheduled",
        currentStatus: meal.status 
      });
    }

    // Store previous scheduled time for response
    const previousScheduledTime = meal.scheduledTime || meal.time;

    // Update the meal fields
    meal.scheduledTime = newScheduledTime;
    meal.time = newScheduledTime;
    meal.updatedAt = new Date();

    // Optionally update meal type if provided
    if (mealType) {
      const validMealTypes = ["breakfast", "lunch", "dinner", "snack"];
      if (!validMealTypes.includes(mealType.toLowerCase())) {
        return res.status(400).json({ 
          message: "Invalid meal type. Must be one of: breakfast, lunch, dinner, snack" 
        });
      }
      meal.mealType = mealType;
    }

    // Optionally update notes if provided
    if (notes !== undefined) {
      meal.notes = notes;
    }

    await meal.save();

    res.status(200).json({
      message: "Meal rescheduled successfully",
      meal,
      previousScheduledTime,
      newScheduledTime,
    });
  } catch (error) {
    console.error("Error rescheduling meal:", error);
    
    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid meal ID format" });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.patch("/:mealId/convert-to-upcoming", async (req, res) => {
  try {
    const { mealId } = req.params;
    const userId = req.user._id; // assuming auth middleware

    const meal = await Meal.findOne({
      _id: mealId,
      userId,
    });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    // Only recommended meals can be converted
    if (meal.status !== "recommended") {
      return res.status(400).json({
        message: "Only recommended meals can be converted to upcoming",
      });
    }

    meal.status = "upcoming";
    await meal.save();

    return res.status(200).json({
      message: "Meal converted to upcoming successfully",
      meal,
    });
  } catch (error) {
    console.error("Error converting meal to upcoming:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});


router.patch("/upcoming/:mealId/eat", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealId } = req.params;
    const { time } = req.body;

    const meal = await Meal.findOne({ _id: mealId, userId });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    if (meal.status !== "upcoming") {
      return res.status(400).json({ message: "Meal is not upcoming" });
    }

    const consumedDate = time ? new Date(time) : new Date();
    meal.status = "eaten";
    meal.consumedAt = consumedDate;
    meal.time = consumedDate;
    await meal.save();

    const startOfDay = new Date(consumedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(consumedDate);
    endOfDay.setHours(23, 59, 59, 999);

    let stats = await NutritionStats.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const mealCals = Number(meal.calories) || 0;
    const add = (a, b) => (Number(a) || 0) + (Number(b) || 0);

    if (stats) {
      stats.calories = add(stats.calories, meal.calories);
      stats.protein_g = add(stats.protein_g, meal.protein_g);
      stats.carbs_g = add(stats.carbs_g, meal.carbs_g);
      stats.fat_g = add(stats.fat_g, meal.fat_g);
      stats.fiber_g = add(stats.fiber_g, meal.fiber_g);
      stats.sodium_mg = add(stats.sodium_mg, meal.sodium_mg);
      stats.sugar_g = add(stats.sugar_g, meal.sugar_g);

      if (!stats.mealIds.includes(meal._id)) {
        stats.mealIds.push(meal._id);
      }

      const type = meal.mealType ? meal.mealType.toLowerCase() : "snack";
      if (type === "breakfast") stats.breakFastCalories = add(stats.breakFastCalories, mealCals);
      else if (type === "lunch") stats.lunchCalories = add(stats.lunchCalories, mealCals);
      else if (type === "dinner") stats.dinnerCalories = add(stats.dinnerCalories, mealCals);
      else stats.snackCalories = add(stats.snackCalories, mealCals);

      await stats.save();
    } else {
      const type = meal.mealType ? meal.mealType.toLowerCase() : "snack";
      stats = await NutritionStats.create({
        userId,
        calories: mealCals,
        protein_g: Number(meal.protein_g) || 0,
        carbs_g: Number(meal.carbs_g) || 0,
        fat_g: Number(meal.fat_g) || 0,
        fiber_g: Number(meal.fiber_g) || 0,
        sodium_mg: Number(meal.sodium_mg) || 0,
        sugar_g: Number(meal.sugar_g) || 0,
        mealIds: [meal._id],
        breakFastCalories: type === "breakfast" ? mealCals : 0,
        lunchCalories: type === "lunch" ? mealCals : 0,
        dinnerCalories: type === "dinner" ? mealCals : 0,
        snackCalories: type !== "breakfast" && type !== "lunch" && type !== "dinner" ? mealCals : 0,
        createdAt: consumedDate,
      });
    }

    res.status(200).json({ message: "Upcoming meal marked as eaten", meal, stats });
  } catch (error) {
    console.error("Error marking upcoming meal as eaten:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.patch("/upcoming/:mealId/skip", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealId } = req.params;

    const meal = await Meal.findOne({ _id: mealId, userId });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    if (meal.status !== "upcoming") {
      return res.status(400).json({ message: "Meal is not upcoming" });
    }

    meal.status = "skipped";
    await meal.save();

    res.status(200).json({ message: "Meal marked as skipped", meal });
  } catch (error) {
    console.error("Error skipping meal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/recommendations/:mealId", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealId } = req.params;
    const meal = await Meal.findOneAndDelete({ _id: mealId, userId });

    if (!meal) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    res.status(200).json({ message: "Recommendation deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/upcoming/:mealId", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealId } = req.params;
    const meal = await Meal.findOneAndDelete({ _id: mealId, userId, status: "upcoming" });

    if (!meal) {
      return res.status(404).json({ message: "Upcoming meal not found" });
    }

    res.status(200).json({ message: "Upcoming meal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/status/:status", async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const validStatuses = ["eaten", "recommended", "upcoming", "skipped"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const skip = (page - 1) * limit;
    const meals = await Meal.find({ userId, status }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Meal.countDocuments({ userId, status });

    res.status(200).json({
      message: `${status} meals fetched successfully`,
      data: meals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
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
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!stats) {
      if (type === "water") {
        stats = await NutritionStats.create({ userId, water_goal_ml: goal });
      } else if (type === "calorie") {
        stats = await NutritionStats.create({ userId, calorie_goal: goal });
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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await NutritionStats.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!stats) {
      return res.status(404).json({ message: "No nutrition stats found for today" });
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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId,
      status: "eaten",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    res.status(200).json({ data: meals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.post("/save", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealType } = req.body;

    const meal = await Meal.create({ ...req.body, userId,   status: "eaten", });
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let stats = await NutritionStats.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
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
      
      const type = mealType.toLowerCase();
      if (type === "breakfast") stats.breakFastCalories += calories;
      else if (type === "lunch") stats.lunchCalories += calories;
      else if (type === "dinner") stats.dinnerCalories += calories;
      else if (type === "snack") stats.snackCalories += calories;
      
      await stats.save();
    } else {
      stats = await NutritionStats.create({
        userId,
        calories,
      
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fats,
        fiber_g: fiber,
        sodium_mg: sodium,
        sugar_g: sugar,
        mealIds: [meal._id],
        breakFastCalories: mealType.toLowerCase() === "breakfast" ? calories : 0,
        lunchCalories: mealType.toLowerCase() === "lunch" ? calories : 0,
        dinnerCalories: mealType.toLowerCase() === "dinner" ? calories : 0,
        snackCalories: mealType.toLowerCase() === "snack" ? calories : 0,
      });
    }

    res.status(201).json({ message: "Meal saved and daily stats updated", meal, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { quantity, type } = req.body;
    const userId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (quantity < 0 || (type !== "water" && type !== "calories")) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const updateField = type === "water" ? "water_ml" : "calories";
    const stats = await NutritionStats.findOneAndUpdate(
      { userId, createdAt: { $gte: startOfDay, $lte: endOfDay } },
      {
        $inc: { [updateField]: quantity },
        $setOnInsert: { userId, createdAt: new Date() },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: type === "water" ? "Water intake added successfully" : "Calories added successfully",
      [updateField]: stats[updateField],
      stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/:mealId", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealId } = req.params;
    const meal = await Meal.findOneAndDelete({ _id: mealId, userId });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await NutritionStats.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!stats) {
      return res.status(200).json({ message: "Meal deleted but no nutrition stats found for today" });
    }

    const calories = Number(meal.calories) || 0;
    stats.calories = Math.max(0, stats.calories - calories);
    stats.protein_g = Math.max(0, stats.protein_g - (Number(meal.protein_g) || 0));
    stats.carbs_g = Math.max(0, stats.carbs_g - (Number(meal.carbs_g) || 0));
    stats.fat_g = Math.max(0, stats.fat_g - (Number(meal.fat_g) || 0));
    stats.fiber_g = Math.max(0, stats.fiber_g - (Number(meal.fiber_g) || 0));
    stats.sodium_mg = Math.max(0, stats.sodium_mg - (Number(meal.sodium_mg) || 0));
    stats.sugar_g = Math.max(0, stats.sugar_g - (Number(meal.sugar_g) || 0));

    const type = meal.mealType.toLowerCase();
    if (type === "breakfast") stats.breakFastCalories = Math.max(0, stats.breakFastCalories - calories);
    else if (type === "lunch") stats.lunchCalories = Math.max(0, stats.lunchCalories - calories);
    else if (type === "dinner") stats.dinnerCalories = Math.max(0, stats.dinnerCalories - calories);
    else if (type === "snack") stats.snackCalories = Math.max(0, stats.snackCalories - calories);

    stats.mealIds = stats.mealIds.filter((id) => id.toString() !== meal._id.toString());
    await stats.save();

    res.status(200).json({ message: "Meal deleted and nutrition stats updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// PATCH /meals/upcoming/:mealId/reschedule - Reschedule an upcoming meal
router.patch("/upcoming/:mealId/reschedule", async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealId } = req.params;
    const { scheduledTime, mealType } = req.body;

    if (!scheduledTime) {
      return res.status(400).json({ message: "Scheduled time is required" });
    }

    const newScheduledTime = new Date(scheduledTime);
    
    // Validate that the new time is in the future
    if (newScheduledTime <= new Date()) {
      return res.status(400).json({ message: "Scheduled time must be in the future" });
    }

    const meal = await Meal.findOne({ _id: mealId, userId });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    if (meal.status !== "upcoming") {
      return res.status(400).json({ message: "Only upcoming meals can be rescheduled" });
    }

    // Update the meal
    meal.scheduledTime = newScheduledTime;
    meal.time = newScheduledTime;
    
    // Optionally update meal type if provided
    if (mealType) {
      meal.mealType = mealType;
    }

    await meal.save();

    res.status(200).json({ 
      message: "Meal rescheduled successfully", 
      meal 
    });
  } catch (error) {
    console.error("Error rescheduling meal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router;