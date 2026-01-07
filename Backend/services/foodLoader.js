const fs = require("fs");
const path = require("path");
const FOOD_DB_PATH = path.join(__dirname, "../food.json");
let cachedFoods = null;
function loadFoodDb() {
  if (cachedFoods) return cachedFoods;
  const raw = fs.readFileSync(FOOD_DB_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  cachedFoods = parsed.foods || parsed;
  return cachedFoods;
}
module.exports = { loadFoodDb };
