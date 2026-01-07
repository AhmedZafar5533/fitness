const UserProfile = require("../Backend/models/profile.");
const NutritionStats = require("../Backend/models/nutritionStats");
const Meal = require("../Backend/models/meal");

async function buildNutritionContext(userId) {
  const profile = await UserProfile.findOne({ userId });

  const todayStats = await NutritionStats.findOne(
    { userId },
    {},
    { sort: { createdAt: -1 } }
  );

  const recentMeals = await Meal.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5);

  return `
USER PROFILE:
Age: ${profile.age}
Gender: ${profile.gender}
Diet: ${profile.dietType}
Allergies: ${profile.allergies.join(", ") || "None"}

TODAY'S INTAKE:
Calories: ${todayStats.calories} / ${todayStats.calorie_goal}
Protein: ${todayStats.protein_g} g
Carbs: ${todayStats.carbs_g} g
Fat: ${todayStats.fat_g} g
Fiber: ${todayStats.fiber_g} g
Sugar: ${todayStats.sugar_g} g
Sodium: ${todayStats.sodium_mg} mg

RECENT MEALS:
${recentMeals
  .map((m) => `- ${m.mealName}: ${m.calories} kcal, Protein ${m.protein_g}g`)
  .join("\n")}
`;
}

module.exports = { buildNutritionContext };
