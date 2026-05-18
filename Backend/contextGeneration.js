const UserProfile = require("../Backend/models/profile.");
const NutritionStats = require("../Backend/models/nutritionStats");
const Meal = require("../Backend/models/meal");

async function buildNutritionContext(userId) {
  const profile = await UserProfile.findOne({ userId });

  let profileText = "USER PROFILE:\nNot completed yet.";
  if (profile) {
    let bmiText = "N/A";
    if (profile.weight && profile.height) {
      const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
      let category = "Unknown";
      const bmiVal = parseFloat(bmi);
      if (bmiVal < 18.5) category = "Underweight";
      else if (bmiVal < 25) category = "Healthy weight";
      else if (bmiVal < 30) category = "Overweight";
      else category = "Obese";
      bmiText = `${bmi} (${category})`;
    }

    profileText = `USER PROFILE:
Name: ${profile.name || "User"}
Age: ${profile.age || "N/A"} years
Gender: ${profile.gender || "N/A"}
Weight: ${profile.weight ? profile.weight + " kg" : "N/A"}
Height: ${profile.height ? profile.height + " cm" : "N/A"}
BMI: ${bmiText}
Diet Type: ${profile.dietType || "None"}
Dietary Restrictions: ${profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0 ? profile.dietaryRestrictions.join(", ") : "None"}
Allergies: ${profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(", ") : "None"}`;
  }

  const todayStats = await NutritionStats.findOne(
    { userId },
    {},
    { sort: { createdAt: -1 } }
  );

  const recentMeals = await Meal.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5);

  const recentMealsText = recentMeals.length > 0
    ? recentMeals
        .map((m) => `- ${m.mealName}: ${m.calories} kcal, Protein ${m.protein_g}g, Carbs ${m.carbs_g}g, Fat ${m.fat_g}g (${m.mealType})`)
        .join("\n")
    : "No recent meals logged.";

  if (!todayStats) {
    return `${profileText}

TODAY'S INTAKE:
No intake logged yet today.

RECENT MEALS:
${recentMealsText}
`;
  }

  return `${profileText}

TODAY'S INTAKE:
Calories: ${todayStats.calories} / ${todayStats.calorie_goal} kcal
Protein: ${todayStats.protein_g} g
Carbs: ${todayStats.carbs_g} g
Fat: ${todayStats.fat_g} g
Fiber: ${todayStats.fiber_g} g
Sugar: ${todayStats.sugar_g} g
Sodium: ${todayStats.sodium_mg} mg
Water Intake: ${todayStats.water_ml} / ${todayStats.water_goal_ml} ml

RECENT MEALS:
${recentMealsText}
`;
}

module.exports = { buildNutritionContext };
