const Meal = require("../models/meal");
const NutritionStats = require("../models/nutritionStats");
const mongoose = require("mongoose");
async function upsertTodayStats(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  let stats = await NutritionStats.findOne({
    userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
  if (!stats) {
    stats = await NutritionStats.create({ userId });
  }
  return stats;
}
async function executeAddMeal(rec, userId) {
  const mealData = {
    mealType: rec.mealType || "snack",
    userId,
    mealName: rec.mealName || "Suggested Meal",
    time: new Date(),
    calories: Number(rec.calories) || 0,
    fat_g: Number(rec.fat_g) || 0,
    protein_g: Number(rec.protein_g) || 0,
    carbs_g: Number(rec.carbs_g) || 0,
    fiber_g: Number(rec.fiber_g) || 0,
    sugar_g: Number(rec.sugar_g) || 0,
    sodium_mg: Number(rec.sodium_mg) || 0,
    imagePath: rec.imagePath || null,
  };
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const meal = await Meal.create([mealData], { session });
    const stats = await upsertTodayStats(userId);
    stats.calories += mealData.calories;
    stats.protein_g += mealData.protein_g;
    stats.carbs_g += mealData.carbs_g;
    stats.fat_g += mealData.fat_g;
    stats.fiber_g += mealData.fiber_g;
    stats.sugar_g += mealData.sugar_g;
    stats.sodium_mg += mealData.sodium_mg;
    stats.mealIds.push(meal[0]._id);
    const mtype = (mealData.mealType || "").toLowerCase();
    if (mtype === "breakfast") stats.breakFastCalories += mealData.calories;
    if (mtype === "lunch") stats.lunchCalories += mealData.calories;
    if (mtype === "dinner") stats.dinnerCalories += mealData.calories;
    if (mtype === "snack") stats.snackCalories += mealData.calories;
    await stats.save({ session });
    await session.commitTransaction();
    session.endSession();
    return { success: true, meal: meal[0], stats };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return { success: false, error: err.message };
  }
}
async function executeIncreaseWater(rec, userId) {
  const amount_ml = Number(rec.amount_ml || rec.amount || 0);
  if (amount_ml <= 0) return { success: false, error: "invalid amount" };
  const stats = await upsertTodayStats(userId);
  stats.water_ml = (stats.water_ml || 0) + amount_ml;
  await stats.save();
  return { success: true, stats, amount_ml };
}
async function executeAdjustGoal(rec, userId) {
  const goalType = rec.goalType;
  const amount = Number(rec.amount || 0);
  const stats = await upsertTodayStats(userId);
  if (goalType === "calorie") {
    stats.calorie_goal = amount;
  } else if (goalType === "water") {
    stats.water_goal_ml = amount;
  } else {
    return { success: false, error: "invalid goalType" };
  }
  await stats.save();
  return { success: true, stats };
}
async function executeRecommendations(recommendations, userId) {
  const results = [];
  for (const rec of recommendations) {
    if (rec.type === "add_meal") {
      const r = await executeAddMeal(rec, userId);
      results.push({ rec, result: r });
    } else if (rec.type === "increase_water") {
      const r = await executeIncreaseWater(rec, userId);
      results.push({ rec, result: r });
    } else if (rec.type === "adjust_goal") {
      const r = await executeAdjustGoal(rec, userId);
      results.push({ rec, result: r });
    } else {
      results.push({ rec, result: { success: false, error: "unknown type" } });
    }
  }
  return results;
}
module.exports = { executeRecommendations };
