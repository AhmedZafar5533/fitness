const { loadFoodDb } = require("./foodLoader");
const { normalizeFoodKey } = require("./foodUtils");
const UserProfile = require("../models/profile");
function containsAnyKeyword(name, keywords) {
  const n = String(name || "").toLowerCase();
  return keywords.some((k) => n.includes(k));
}
async function validateRecommendations(recommendations, userId) {
  if (!Array.isArray(recommendations)) {
    return { valid: [], invalid: [{ reason: "recommendations must be an array" }] };
  }
  const maxCount = 5;
  const deduped = [];
  const seen = new Set();
  for (const r of recommendations) {
    const key = JSON.stringify(r);
    if (!seen.has(key) && deduped.length < maxCount) {
      seen.add(key);
      deduped.push(r);
    }
  }
  const foods = loadFoodDb();
  const profile = await UserProfile.findOne({ userId });
  const valid = [];
  const invalid = [];
  for (const rec of deduped) {
    if (!rec || typeof rec !== "object") {
      invalid.push({ rec, reason: "invalid format" });
      continue;
    }
    const type = rec.type;
    if (!["add_meal", "increase_water", "adjust_goal"].includes(type)) {
      invalid.push({ rec, reason: "unknown recommendation type" });
      continue;
    }
    if (type === "add_meal") {
      const mealName = String(rec.mealName || rec.food || "").trim();
      if (!mealName) {
        invalid.push({ rec, reason: "mealName missing" });
        continue;
      }
      const key = normalizeFoodKey(mealName);
      const food = foods[key];
      if (!food) {
        const containsNonFood = containsAnyKeyword(mealName, ["pill", "supplement", "medicine", "steroid"]);
        if (containsNonFood) {
          invalid.push({ rec, reason: "prohibited item suggested" });
          continue;
        }
      }
      if (profile && profile.dietType) {
        const diet = (profile.dietType || "").toLowerCase();
        if (["vegetarian", "vegan", "pescatarian"].includes(diet)) {
          const nonVegKeywords = ["chicken", "beef", "pork", "fish", "shrimp", "bacon", "lamb"];
          if (containsAnyKeyword(mealName, nonVegKeywords)) {
            invalid.push({ rec, reason: "conflicts with user diet" });
            continue;
          }
        }
        if (Array.isArray(profile.allergies) && profile.allergies.length) {
          const allergyKeywords = profile.allergies.map((a) => a.toLowerCase());
          if (containsAnyKeyword(mealName, allergyKeywords)) {
            invalid.push({ rec, reason: "conflicts with user allergies" });
            continue;
          }
        }
      }
      const portion = rec.portionType === "per_100g" ? "per_100g" : "per_serving";
      const nutrients = food ? food[portion] : null;
      const calories = nutrients ? Number(nutrients.calories || 0) : Number(rec.calories || 0);
      const safeCalories = calories > 0 && calories < 5000;
      if (!safeCalories) {
        invalid.push({ rec, reason: "calories out of range or missing" });
        continue;
      }
      valid.push({
        type: "add_meal",
        mealName: food ? (food.name || mealName) : mealName,
        mealKey: food ? normalizeFoodKey(food.name || mealName) : null,
        portionType: portion,
        mealType: rec.mealType || "snack",
        calories,
        protein_g: nutrients ? Number(nutrients.protein_g || 0) : Number(rec.protein_g || 0),
        carbs_g: nutrients ? Number(nutrients.carbs_g || 0) : Number(rec.carbs_g || 0),
        fat_g: nutrients ? Number(nutrients.fat_g || 0) : Number(rec.fat_g || 0),
        fiber_g: nutrients ? Number(nutrients.fiber_g || 0) : Number(rec.fiber_g || 0),
        sugar_g: nutrients ? Number(nutrients.sugar_g || 0) : Number(rec.sugar_g || 0),
        sodium_mg: nutrients ? Number(nutrients.sodium_mg || 0) : Number(rec.sodium_mg || 0)
      });
    } else if (type === "increase_water") {
      const amount_ml = Number(rec.amount_ml || rec.amount || 0);
      if (!Number.isFinite(amount_ml) || amount_ml <= 0 || amount_ml > 5000) {
        invalid.push({ rec, reason: "invalid water amount" });
        continue;
      }
      valid.push({ type: "increase_water", amount_ml });
    } else if (type === "adjust_goal") {
      const goalType = rec.goalType;
      const amount = Number(rec.amount || 0);
      if (!["calorie", "water"].includes(goalType)) {
        invalid.push({ rec, reason: "invalid goalType" });
        continue;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        invalid.push({ rec, reason: "invalid goal amount" });
        continue;
      }
      if (goalType === "calorie" && (amount < 800 || amount > 5000)) {
        invalid.push({ rec, reason: "calorie goal out of safe range" });
        continue;
      }
      if (goalType === "water" && (amount < 500 || amount > 8000)) {
        invalid.push({ rec, reason: "water goal out of safe range" });
        continue;
      }
      valid.push({ type: "adjust_goal", goalType, amount });
    } else {
      invalid.push({ rec, reason: "unhandled type" });
    }
  }
  return { valid, invalid };
}
module.exports = { validateRecommendations };
