const express = require("express");
const router = express.Router();
const ensureAuthenticated = require("../middleware/ensureAuthenticated");
const { validateRecommendations } = require("../services/recommendationValidator");
const { executeRecommendations } = require("../services/recommendationExecutor");
router.post("/execute", ensureAuthenticated, async (req, res) => {
  const userId = req.user._id;
  const rec = req.body.recommendation || req.body.recommendations;
  const recs = Array.isArray(rec) ? rec : [rec];
  const { valid, invalid } = await validateRecommendations(recs, userId);
  if (!valid.length) {
    return res.status(400).json({ valid, invalid });
  }
  const results = await executeRecommendations(valid, userId);
  return res.status(200).json({ valid, invalid, results });
});
module.exports = router;
