import React, { useState, useEffect, useRef } from "react";
import { Check, ImageIcon, X, Loader2, HelpCircle } from "lucide-react";
import { useMealStore } from "../../store/mealStore";
import { useNavigate } from "react-router-dom";

export default function MealTrackingForm() {
  const [mealType, setMealType] = useState("breakfast");

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [portionType, setPortionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false); // tooltip popup
  const infoRef = useRef();
  const imageInputRef = useRef();
  const { sendMealData } = useMealStore();
  const navigate = useNavigate();

  const mealTypes = [
    { id: "breakfast", label: "Breakfast", range: "7:00 - 10:00" },
    { id: "lunch", label: "Lunch", range: "12:00 - 14:00" },
    { id: "dinner", label: "Dinner", range: "18:00 - 21:00" },
    { id: "snack", label: "Snack", range: "Anytime" },
  ];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (image?.preview) URL.revokeObjectURL(image.preview);

    setImage({
      file,
      preview: URL.createObjectURL(file),
    });
  };

  useEffect(() => {
    return () => {
      if (image?.preview) URL.revokeObjectURL(image.preview);
    };
  }, [image]);

  // Close popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [infoRef]);

  const validate = () => {
    const newErrors = {};
    if (!mealType) newErrors.mealType = "Please select a meal type.";

    if (!image) newErrors.image = "Please upload an image.";
    if (!portionType) newErrors.portionType = "Please select portion type.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    console.log("Submitting meal with type:", mealType);
    formData.append("mealType", mealType);

    formData.append("portionType", portionType);
    formData.append("image", image.file);

    try {
      const success = await sendMealData(formData);
      if (success) {
        navigate("/meals");
        // alert("Meal submitted!");

        // setMealType("breakfast");
        // setPortionType("");
        // setImage(null);
        // setErrors({});
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5] p-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Log Meal
          </h1>
          <p className="text-sm text-gray-600">{today}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-3 gap-8">
        {/* Left Column - Meal Type */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-8 shadow-sm p-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Meal Type
            </h3>
            <div className="space-y-2">
              {mealTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMealType(type.id)}
                  className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-200 flex flex-col gap-1 ${
                    mealType === type.id
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "hover:bg-purple-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{type.label}</span>
                    {mealType === type.id && (
                      <Check className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <p
                    className={`text-sm mt-1 ${
                      mealType === type.id ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {type.range}
                  </p>
                </button>
              ))}
              {errors.mealType && (
                <p className="text-xs text-red-500 mt-1">{errors.mealType}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portion type */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Portion Type <span className="text-red-500">*</span>
              <HelpCircle
                className="w-4 h-4 text-gray-400 cursor-pointer"
                onClick={() => setShowInfo(!showInfo)}
              />
            </label>
            <div className="flex gap-4">
              {["per_serving", "per_100g"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPortionType(type)}
                  className={`px-4 py-2 rounded-xl border transition-all duration-200 flex-1 ${
                    portionType === type
                      ? "bg-purple-500 text-white shadow"
                      : "border-gray-300 text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  {type === "per_serving" ? "Per Serving" : "Per 100g"}
                </button>
              ))}
            </div>
            {errors.portionType && (
              <p className="text-xs text-red-500 mt-1">{errors.portionType}</p>
            )}

            {/* Info popup */}
            {showInfo && (
              <div
                ref={infoRef}
                className="absolute top-12 left-0 bg-white border border-gray-300 rounded-xl shadow-lg p-4 w-64 z-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">Portion Info</span>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Per Serving:</strong> Each serving represents a
                  general standard portion size.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Per 100g:</strong> Nutritional info is calculated per
                  100 grams of the food.
                </p>
              </div>
            )}
          </div>

          {/* Image Upload */}
          {/* Image Upload */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" /> Upload Meal Image
            </label>
            <div
              className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors ${
                errors.image ? "border-red-500" : "border-gray-300"
              }`}
              onClick={() => imageInputRef.current.click()}
            >
              {!image ? (
                <>
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm">
                    Click or drag image here to upload
                  </p>
                </>
              ) : (
                <div className="relative w-40 h-40">
                  <img
                    src={image.preview}
                    alt="Meal Preview"
                    className="w-full h-full object-cover rounded-xl shadow-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (image?.preview) URL.revokeObjectURL(image.preview);
                      setImage(null);
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* 👇 THIS INPUT WAS MISSING */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />

            {errors.image && (
              <p className="text-xs text-red-500 mt-1">{errors.image}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 ${
              loading ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Log Meal"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
