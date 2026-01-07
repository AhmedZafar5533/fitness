import React, { useEffect, useState, useMemo } from "react";
import { Loader2, Check, Flame, X, Droplets, Wheat, Beef } from "lucide-react";
import { motion } from "framer-motion";
import { useMealStore } from "../../store/mealStore";
import { useNavigate } from "react-router-dom";

export default function MealDetailsMinimal() {
  const { mealData, fetchMealData, loading, saveMeal } = useMealStore();
  const navigate = useNavigate();

  const [servings, setServings] = useState(1);
  const [grams, setGrams] = useState(100);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("grams");

  useEffect(() => {
    fetchMealData();
  }, [fetchMealData]);

  useEffect(() => {
    if (mealData?.nutrients?.serving_size_g) {
      setGrams(mealData.nutrients.serving_size_g);
      setServings(1);
    }
  }, [mealData]);

  const baseServingSize = mealData?.nutrients?.serving_size_g || 100;

  const nutrientsPer100g = useMemo(() => {
    if (!mealData?.nutrients) return {};
    const size = baseServingSize;
    return Object.fromEntries(
      Object.entries(mealData.nutrients).map(([k, v]) => {
        if (k === "serving_size_g") return [k, v];
        const per100 = (v / size) * 100;
        return [k, Number(per100.toFixed(3))];
      })
    );
  }, [mealData, baseServingSize]);

  const displayed = (() => {
    const factor = grams / 100;
    const out = {};
    if (nutrientsPer100g) {
      Object.entries(nutrientsPer100g).forEach(([k, v]) => {
        if (k !== "serving_size_g") {
          out[k] = Number((v * factor).toFixed(k === "sodium_mg" ? 0 : 1));
        }
      });
    }
    return out;
  })();

  const handleInputChange = (val) => {
    const value = Math.max(0, parseFloat(val) || 0);

    if (activeTab === "grams") {
      setGrams(value);
      setServings(parseFloat((value / baseServingSize).toFixed(2)));
    } else {
      setServings(value);
      setGrams(Math.round(value * baseServingSize));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        mealType: mealData.mealType || "lunch",
        mealName: mealData.foodName || "Unnamed Meal",
        time: new Date(),
        calories: displayed.calories,
        ...displayed,
        imagePath: mealData.imagePath,
      };
      await saveMeal(payload);
      navigate("/home");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading || !mealData) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
      </div>
    );
  }

  const MacroCard = ({ icon: Icon, label, value, color, bg }) => (
    <div
      className={`${bg} rounded-2xl p-5 flex flex-col items-start gap-3 transition-transform hover:scale-[1.02]`}
    >
      <div className={`p-2 rounded-full bg-white shadow-sm ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {value}
          <span className="text-sm font-medium text-gray-500 ml-0.5">g</span>
        </p>
        <p
          className={`text-sm font-medium ${color.replace(
            "text-",
            "text-opacity-80 "
          )}`}
        >
          {label}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen font-sans text-gray-900 pb-32">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-sm bg-gray-50 relative group">
              <img
                src={mealData.imagePath || "https://via.placeholder.com/600"}
                alt={mealData.foodName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                Detected
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold capitalize leading-tight mb-2">
                {mealData.foodName}
              </h1>
              <div className="flex items-center gap-2 text-gray-500">
                <Flame
                  className="w-5 h-5 text-orange-500"
                  fill="currentColor"
                />
                <span className="text-lg font-medium text-gray-900">
                  {Math.round(displayed.calories)}
                </span>
                <span className="text-base">kcal per serving</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-[2rem] p-6 md:p-8 flex flex-col justify-center h-full"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Portion Size</h2>
              <div className="flex bg-gray-200 p-1 rounded-full">
                <button
                  onClick={() => setActiveTab("grams")}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    activeTab === "grams"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Grams
                </button>
                <button
                  onClick={() => setActiveTab("servings")}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    activeTab === "servings"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Servings
                </button>
              </div>
            </div>

            <div className="relative mb-8 text-center">
              <input
                type="number"
                inputMode="decimal"
                value={activeTab === "grams" ? grams : servings}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full bg-transparent text-center text-7xl font-bold text-gray-900 outline-none placeholder-gray-300"
                placeholder="0"
              />
              <p className="text-gray-400 font-medium mt-2 text-lg">
                {activeTab === "grams" ? "grams" : "serving(s)"}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 flex items-center justify-between text-sm text-gray-500 border border-gray-100">
              <span>Standard Serving</span>
              <span className="font-semibold text-gray-900">
                {baseServingSize}g
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Macronutrients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <MacroCard
              icon={Beef}
              label="Protein"
              value={displayed.protein_g}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <MacroCard
              icon={Wheat}
              label="Carbs"
              value={displayed.carbs_g}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <MacroCard
              icon={Droplets}
              label="Fat"
              value={displayed.fat_g}
              color="text-amber-500"
              bg="bg-amber-50"
            />
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-wrap gap-8 justify-center md:justify-start">
            {[
              { label: "Fiber", value: displayed.fiber_g, unit: "g" },
              { label: "Sugar", value: displayed.sugar_g, unit: "g" },
              { label: "Sodium", value: displayed.sodium_mg, unit: "mg" },
            ].map((micro) => (
              <div key={micro.label} className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  {micro.label}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {micro.value}
                  <span className="text-sm text-gray-400 ml-0.5">
                    {micro.unit}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className=" bottom-0 w-full z-30 pb-6 pointer-events-none">
        <div className="max-w-5xl mx-auto px-4">
          <div className="pointer-events-auto bg-gray-900 text-white rounded-[1.5rem] p-3 pl-6 pr-3 shadow-2xl flex items-center justify-between transform transition-all hover:scale-[1.01]">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Total
              </span>
              <span className="text-2xl font-bold">
                {Math.round(displayed.calories)}{" "}
                <span className="text-sm font-normal text-gray-400">kcal</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`h-14 px-8 rounded-2xl font-bold text-base flex items-center gap-2 transition-all ${
                  saving
                    ? "bg-gray-700 text-gray-400"
                    : "bg-white text-gray-900 hover:bg-gray-100 active:scale-95"
                }`}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Save Meal <Check className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={saving}
                className="h-14 px-6 rounded-2xl font-bold text-base flex items-center gap-2 transition-all bg-red-500 text-white hover:bg-red-600 active:scale-95 disabled:bg-gray-700 disabled:text-gray-400"
              >
                Cancel <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
