function normalizeFoodKey(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}
module.exports = { normalizeFoodKey };
