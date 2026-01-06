import React, { useEffect, useState, useMemo } from "react";
import {
  Info,
  Loader2,
  ArrowLeft,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMealStore } from "../../store/mealStore";
import { useNavigate } from "react-router-dom";

export default function MealDetailsRefined() {
  const { mealData, fetchMealData, loading, saveMeal } = useMealStore();
  const [servings, setServings] = useState(1);
  const [grams, setGrams] = useState(0);
  const [unsaved, setUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMealData();
  }, [fetchMealData]);

  useEffect(() => {
    if (mealData) {
      setGrams(mealData.nutrients?.serving_size_g || 100);
      setServings(1);
    }
  }, [mealData]);

  const nutrientsPer100g = useMemo(() => {
    if (!mealData?.nutrients) return {};
    const size = mealData.nutrients.serving_size_g || 100;
    return Object.fromEntries(
      Object.entries(mealData.nutrients).map(([k, v]) => {
        if (k === "serving_size_g") return [k, v];
        const per100 = (v / size) * 100;
        return [k, Number(per100.toFixed(3))];
      })
    );
  }, [mealData]);

  if (loading || !mealData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#FFF6F8]">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <span className="ml-4 text-gray-600 font-medium">
          Loading meal data…
        </span>
      </div>
    );
  }

  const mode = mealData.portionType || "per_serving";

  const computeDisplayed = () => {
    const out = {};
    const usingCustomGrams =
      mode === "per_serving"
        ? grams !== mealData.nutrients.serving_size_g * servings
        : true;

    if (usingCustomGrams) {
      const factor = grams / 100;
      Object.entries(nutrientsPer100g).forEach(([k, v]) => {
        if (k !== "serving_size_g")
          out[k] = Number((v * factor).toFixed(k === "sodium_mg" ? 0 : 2));
      });
      out._context = `${grams} g (custom)`;
    } else {
      Object.entries(mealData.nutrients).forEach(([k, v]) => {
        if (k !== "serving_size_g")
          out[k] = Number((v * servings).toFixed(k === "sodium_mg" ? 0 : 2));
      });
      out._context = `${servings} × ${mealData.nutrients.serving_size_g} g (per serving)`;
    }
    return out;
  };

  const displayed = computeDisplayed();

  const DAILY_MAX = {
    calories: 2000,
    fat_g: 70,
    protein_g: 50,
    carbs_g: 300,
    fiber_g: 30,
    sugar_g: 50,
    sodium_mg: 2300,
  };

  const nutrientMeta = [
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "fat_g", label: "Fat", unit: "g" },
    { key: "protein_g", label: "Protein", unit: "g" },
    { key: "carbs_g", label: "Carbs", unit: "g" },
    { key: "fiber_g", label: "Fiber", unit: "g" },
    { key: "sugar_g", label: "Sugar", unit: "g" },
    { key: "sodium_mg", label: "Sodium", unit: "mg" },
  ];

  const percentOf = (key, value) => {
    const max = DAILY_MAX[key] || Math.max(value, 100);
    return Math.min(100, Math.round((value / max) * 100));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        mealType: mealData.mealType || "lunch",
        mealName: mealData.foodName || "Unnamed Meal",
        time: new Date(),
        calories: displayed.calories,
        fat_g: displayed.fat_g,
        protein_g: displayed.protein_g,
        carbs_g: displayed.carbs_g,
        fiber_g: displayed.fiber_g,
        sugar_g: displayed.sugar_g,
        sodium_mg: displayed.sodium_mg,
        imagePath: mealData.imagePath,
      };

      await saveMeal(payload);
      setUnsaved(false);
      navigate("/home");
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onServingsChange = (v) => {
    const n = Math.max(1, Math.floor(Number(v) || 1));
    setServings(n);
    setUnsaved(true);
  };

  const onGramsChange = (v) => {
    const n = Math.max(1, Number(v) || 1);
    setGrams(n);
    setUnsaved(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF6F8] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              {mealData.foodName
                ? mealData.foodName.charAt(0).toUpperCase() +
                  mealData.foodName.slice(1)
                : "Meal"}
            </h1>

            <div className="mt-2 text-sm text-gray-500 flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span>
                Serving size:{" "}
                <strong>{mealData.nutrients.serving_size_g} g</strong>
              </span>

              <span className="ml-2 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                {mode === "per_serving" ? "Per Serving" : "Per 100 g"}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Meal recorded</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date().toLocaleString()}
              </div>
            </div>

            <div className="w-28 h-28 rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden flex items-center justify-center">
              {mealData.imagePath ? (
                <img
                  src={mealData.imagePath}
                  alt={mealData.foodName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="w-6 h-6" />
                  <div className="text-xs mt-1">No image</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Left / image + context */}
          <div className="p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
            <motion.div
              initial={{ opacity: 0.8, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm"
            >
              <div className="rounded-xl overflow-hidden bg-gray-50 shadow-inner">
                <img
                  src={
                    mealData.imagePath || "https://via.placeholder.com/600x400"
                  }
                  alt={mealData.foodName}
                  className="w-full h-56 object-cover"
                />
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                <Info className="w-4 h-4 text-gray-400" />
                <div>
                  <div>Context</div>
                  <div className="mt-1 font-medium text-gray-700">
                    {mealData.nutrients.serving_size_g} g = one serving
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm text-center">
                  <div className="text-xs text-gray-500">Servings</div>
                  <div className="text-lg font-semibold">{servings}</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm text-center">
                  <div className="text-xs text-gray-500">Selected grams</div>
                  <div className="text-lg font-semibold">{grams} g</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: controls + nutrients */}
          <div className="lg:col-span-2 p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-gray-500">Mode</div>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                      {mode === "per_serving" ? "Per Serving" : "Per 100 g"}
                    </span>
                    <span className="text-sm text-gray-500">(locked)</span>
                  </div>
                </div>

                <div className="hidden md:block h-8 w-px bg-gray-100" />

                <div className="text-sm text-gray-600">
                  <div className="text-xs text-gray-500">Quick adjust</div>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      aria-label="Servings"
                      type="number"
                      min={1}
                      value={servings}
                      onChange={(e) => onServingsChange(e.target.value)}
                      className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />

                    <div className="text-xs text-gray-400">or</div>

                    <input
                      aria-label="Grams"
                      type="number"
                      min={1}
                      value={grams}
                      onChange={(e) => onGramsChange(e.target.value)}
                      className="w-36 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setServings(1);
                    setGrams(mealData.nutrients.serving_size_g || 100);
                    setUnsaved(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm shadow-sm hover:bg-gray-50"
                >
                  Reset
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 ${
                    saving
                      ? "bg-purple-400 cursor-wait"
                      : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700"
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </div>

            {/* Nutrients grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nutrientMeta.map((n) => {
                const val = displayed[n.key] ?? 0;
                const pct = percentOf(n.key, val);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={n.key}
                    className="p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm text-gray-700 font-medium">
                        {n.label}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {val} {n.unit}
                      </div>
                    </div>

                    <div className="w-full h-2 bg-white border border-gray-200 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <div>{pct}% of reference</div>
                      <div className="text-right">{n.unit}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="mt-2 text-xs text-gray-500">
              Tip: change the grams to match your plate — numbers update live.
              Unsaved changes will be lost if you leave or reload.
            </div>
          </div>
        </div>

        {/* Sticky Save bar for mobile */}
        <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-5xl px-4 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto bg-white rounded-2xl p-3 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">Showing:</div>
              <div className="text-sm font-medium">{displayed._context}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setServings(1);
                  setGrams(mealData.nutrients.serving_size_g || 100);
                  setUnsaved(false);
                }}
                className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm shadow-sm hover:bg-gray-50"
              >
                Reset
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-lg text-white font-semibold ${
                  saving
                    ? "bg-purple-400 cursor-wait"
                    : "bg-gradient-to-r from-purple-600 to-purple-500"
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                ) : null}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
