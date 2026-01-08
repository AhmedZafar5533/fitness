import React, { useState, useEffect, useRef } from "react";
import { ImageIcon, X, Check, User, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

// Validation rules defined outside component
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    messages: {
      required: "Name is required.",
      minLength: "Name must be at least 2 characters.",
      maxLength: "Name cannot exceed 50 characters.",
      pattern: "Name can only contain letters, spaces, hyphens, and apostrophes.",
    },
  },
  age: {
    required: true,
    min: 13,
    max: 120,
    messages: {
      required: "Age is required.",
      min: "You must be at least 13 years old.",
      max: "Please enter a valid age (under 120).",
      invalid: "Please enter a valid age.",
    },
  },
  weight: {
    required: true,
    min: 20,
    max: 500,
    messages: {
      required: "Weight is required.",
      min: "Weight must be at least 20 kg.",
      max: "Weight cannot exceed 500 kg.",
      invalid: "Please enter a valid weight.",
    },
  },
  height: {
    required: true,
    min: 50,
    max: 300,
    messages: {
      required: "Height is required.",
      min: "Height must be at least 50 cm.",
      max: "Height cannot exceed 300 cm.",
      invalid: "Please enter a valid height.",
    },
  },
  gender: {
    required: true,
    validOptions: ["male", "female", "other"],
    messages: {
      required: "Please select your gender.",
      invalid: "Please select a valid gender option.",
    },
  },
  dietType: {
    required: true,
    validOptions: ["Vegetarian", "Non-Vegetarian", "Vegan", "Pescatarian"],
    messages: {
      required: "Please select your diet type.",
      invalid: "Please select a valid diet type.",
    },
  },
  image: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    messages: {
      maxSize: "Image size must be less than 5MB.",
      invalidType: "Only JPEG, PNG, GIF, and WebP images are allowed.",
    },
  },
};

const dietaryOptions = ["Gluten", "Lactose", "Peanuts", "Soy", "Shellfish"];
const allergyOptions = ["Peanuts", "Seafood", "Eggs", "Dairy", "Soy"];
const dietTypes = ["Vegetarian", "Non-Vegetarian", "Vegan", "Pescatarian"];

export default function ProfileForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    gender: "",
    dietType: "",
    dietaryRestrictions: [],
    allergies: [],
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const infoRef = useRef();
  const imageInputRef = useRef();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  // Validate a single field
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return "";

    if (rules.required && (!value || (typeof value === "string" && !value.trim()))) {
      return rules.messages.required;
    }

    if (!value || (typeof value === "string" && !value.trim())) {
      return "";
    }

    if (typeof value === "string") {
      const trimmedValue = value.trim();

      if (rules.minLength && trimmedValue.length < rules.minLength) {
        return rules.messages.minLength;
      }

      if (rules.maxLength && trimmedValue.length > rules.maxLength) {
        return rules.messages.maxLength;
      }

      if (rules.pattern && !rules.pattern.test(trimmedValue)) {
        return rules.messages.pattern;
      }

      if (rules.validOptions && !rules.validOptions.includes(value)) {
        return rules.messages.invalid;
      }
    }

    if (rules.min !== undefined || rules.max !== undefined) {
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        return rules.messages.invalid;
      }

      if (rules.min !== undefined && numValue < rules.min) {
        return rules.messages.min;
      }

      if (rules.max !== undefined && numValue > rules.max) {
        return rules.messages.max;
      }

      if (fieldName === "age" && !Number.isInteger(numValue)) {
        return "Age must be a whole number.";
      }
    }

    return "";
  };

  const validateImage = (file) => {
    const rules = validationRules.image;
    if (!file) return "";

    if (file.size > rules.maxSize) {
      return rules.messages.maxSize;
    }

    if (!rules.allowedTypes.includes(file.type)) {
      return rules.messages.invalidType;
    }

    return "";
  };

  const validateAll = () => {
    const newErrors = {};
    const fieldsToValidate = ["name", "age", "weight", "height", "gender", "dietType"];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (image?.file) {
      const imageError = validateImage(image.file);
      if (imageError) newErrors.image = imageError;
    }

    // BMI sanity check
    if (!newErrors.weight && !newErrors.height && formData.weight && formData.height) {
      const weightNum = parseFloat(formData.weight);
      const heightNum = parseFloat(formData.height) / 100;
      const bmi = weightNum / (heightNum * heightNum);

      if (bmi < 10 || bmi > 60) {
        newErrors.weight = "Please verify your weight and height values.";
        newErrors.height = "Please verify your weight and height values.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, formData[fieldName]);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageError = validateImage(file);
    if (imageError) {
      toast.error(imageError);
      setErrors((prev) => ({ ...prev, image: imageError }));
      return;
    }

    if (image?.preview) URL.revokeObjectURL(image.preview);

    setImage({
      file,
      preview: URL.createObjectURL(file),
    });
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const removeImage = (e) => {
    e.stopPropagation();
    if (image?.preview) URL.revokeObjectURL(image.preview);
    setImage(null);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const toggleOption = (option, field) => {
    setFormData((prev) => {
      const list = prev[field];
      if (list.includes(option)) {
        return { ...prev, [field]: list.filter((item) => item !== option) };
      } else {
        return { ...prev, [field]: [...list, option] };
      }
    });
  };

  const handleSubmit = async () => {
    setTouched({
      name: true,
      age: true,
      weight: true,
      height: true,
      gender: true,
      dietType: true,
    });

    if (!validateAll()) {
      toast.error("Please fix the errors before submitting.");
      const firstErrorField = document.querySelector(".border-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
      return;
    }

    setLoading(true);
    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("age", parseInt(formData.age, 10));
    submitData.append("weight", parseFloat(formData.weight));
    submitData.append("height", parseFloat(formData.height));
    submitData.append("gender", formData.gender);
    submitData.append("dietType", formData.dietType);
    submitData.append("dietaryRestrictions", formData.dietaryRestrictions.join(","));
    submitData.append("allergies", formData.allergies.join(","));
    if (image?.file) submitData.append("image", image.file);

    try {
      const response = await fetch("http://localhost:3000/api/profile", {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save profile");
      
      toast.success("Profile saved successfully!");
      if (user) {
        setUser({ ...user, profileDone: true });
      }
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (image?.preview) URL.revokeObjectURL(image.preview);
    };
  }, [image]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInputClassName = (fieldName) =>
    `w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
      errors[fieldName]
        ? "border-red-500 focus:ring-red-200 bg-red-50"
        : "border-gray-300 focus:ring-purple-200 focus:border-purple-400"
    }`;

  const hasErrors = Object.values(errors).some((error) => error);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Profile</h1>
          <p className="text-gray-500 mt-1">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-500" />
            Personal Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="Enter your full name"
                className={getInputClassName("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                onBlur={() => handleBlur("age")}
                placeholder="Enter your age"
                min="13"
                max="120"
                className={getInputClassName("age")}
              />
              {errors.age && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.age}
                </p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                onBlur={() => handleBlur("weight")}
                placeholder="Enter your weight"
                min="20"
                max="500"
                step="0.1"
                className={getInputClassName("weight")}
              />
              {errors.weight && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.weight}
                </p>
              )}
            </div>

            {/* Height */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Height (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
                onBlur={() => handleBlur("height")}
                placeholder="Enter your height"
                min="50"
                max="300"
                step="0.1"
                className={getInputClassName("height")}
              />
              {errors.height && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.height}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                onBlur={() => handleBlur("gender")}
                className={getInputClassName("gender")}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.gender}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Diet Preferences */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Diet Preferences</h3>

          {/* Diet Type */}
          <div className="mb-4 relative">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Diet Type <span className="text-red-500">*</span>
              <Info
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setShowInfo(!showInfo)}
              />
            </label>
            <div className="flex gap-2 flex-wrap mt-2">
              {dietTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    handleChange("dietType", type);
                    setErrors((prev) => ({ ...prev, dietType: "" }));
                  }}
                  className={`px-4 py-2 border rounded-xl transition-all ${
                    formData.dietType === type
                      ? "bg-purple-500 text-white shadow border-purple-500"
                      : errors.dietType
                      ? "border-red-300 text-gray-700 hover:bg-purple-50"
                      : "border-gray-300 text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  {formData.dietType === type && <Check className="w-4 h-4 inline mr-1" />}
                  {type}
                </button>
              ))}
            </div>
            {errors.dietType && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.dietType}
              </p>
            )}

            {showInfo && (
              <div
                ref={infoRef}
                className="absolute bg-white border border-gray-300 shadow-lg rounded-xl p-4 mt-2 w-72 z-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">Diet Type Info</span>
                  <button type="button" onClick={() => setShowInfo(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Vegetarian:</strong> No meat or fish</li>
                  <li><strong>Non-Vegetarian:</strong> Includes all foods</li>
                  <li><strong>Vegan:</strong> No animal products</li>
                  <li><strong>Pescatarian:</strong> Fish but no meat</li>
                </ul>
              </div>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Dietary Restrictions <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleOption(option, "dietaryRestrictions")}
                  className={`px-3 py-1.5 border rounded-xl text-sm transition-all ${
                    formData.dietaryRestrictions.includes(option)
                      ? "bg-purple-500 text-white shadow border-purple-500"
                      : "border-gray-300 text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  {formData.dietaryRestrictions.includes(option) && (
                    <Check className="w-3 h-3 inline mr-1" />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Allergies <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleOption(option, "allergies")}
                  className={`px-3 py-1.5 border rounded-xl text-sm transition-all ${
                    formData.allergies.includes(option)
                      ? "bg-red-500 text-white shadow border-red-500"
                      : "border-gray-300 text-gray-700 hover:bg-red-50"
                  }`}
                >
                  {formData.allergies.includes(option) && (
                    <Check className="w-3 h-3 inline mr-1" />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Image */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> Upload Profile Image
            <span className="text-gray-400 font-normal">(Optional, max 5MB)</span>
          </label>
          <div
            className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              errors.image
                ? "border-red-400 bg-red-50 hover:border-red-500"
                : "border-gray-300 hover:border-purple-500"
            }`}
            onClick={() => imageInputRef.current?.click()}
          >
            {!image ? (
              <>
                <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-gray-500 text-sm">Click or drag image here to upload</p>
                <p className="text-gray-400 text-xs mt-1">JPEG, PNG, GIF, or WebP (max 5MB)</p>
              </>
            ) : (
              <div className="relative w-40 h-40">
                <img
                  src={image.preview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover rounded-xl shadow-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
          {errors.image && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.image}
            </p>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Error Summary */}
        {hasErrors && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="text-red-700 font-medium flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              Please fix the following errors:
            </h4>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {Object.entries(errors)
                .filter(([, error]) => error)
                .map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-purple-700 ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}