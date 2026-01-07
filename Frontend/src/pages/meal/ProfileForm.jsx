import React, { useState, useEffect, useRef } from "react";
import { ImageIcon, X, Check, User, Info } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProfileForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [dietType, setDietType] = useState(""); // veg, non-veg, vegan, etc.
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef();
  const imageInputRef = useRef();
  const navigate = useNavigate();
  const {user, setUser} = useAuthStore();

  const dietaryOptions = ["Gluten", "Lactose", "Peanuts", "Soy", "Shellfish"];
  const allergyOptions = ["Peanuts", "Seafood", "Eggs", "Dairy", "Soy"];
  const dietTypes = ["Vegetarian", "Non-Vegetarian", "Vegan", "Pescatarian"];

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
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Please enter your name.";
    if (!age) newErrors.age = "Please enter your age.";
    if (!weight) newErrors.weight = "Please enter your weight.";
    if (!height) newErrors.height = "Please enter your height.";
    if (!gender) newErrors.gender = "Please select your gender.";
    if (!dietType) newErrors.dietType = "Please select your diet type.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("weight", weight);
    formData.append("height", height);
    formData.append("gender", gender);
    formData.append("dietType", dietType);
    formData.append("dietaryRestrictions", dietaryRestrictions.join(","));
    formData.append("allergies", allergies.join(","));
    if (image?.file) formData.append("image", image.file);

    try {
      const response = await fetch("http://localhost:3000/api/profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save profile");
      if (response.status === 200) {
        toast.success("Profile saved successfully!");
      
if (user) {
  setUser({ ...user, profileDone: true });
}
        navigate("/profile");
      }
      // Reset form if needed
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (option, list, setList) => {
    if (list.includes(option)) {
      setList(list.filter((item) => item !== option));
    } else {
      setList([...list, option]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Your Profile
        </h1>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Personal Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none ${
                  errors.age ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.age && (
                <p className="text-xs text-red-500">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={`w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none ${
                  errors.weight ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.weight && (
                <p className="text-xs text-red-500">{errors.weight}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={`w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none ${
                  errors.height ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.height && (
                <p className="text-xs text-red-500">{errors.height}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender}</p>
              )}
            </div>
          </div>
        </div>

        {/* Diet Preferences */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Diet Preferences</h3>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Diet Type <span className="text-red-500">*</span>
              <Info
                className="w-4 h-4 text-gray-400 cursor-pointer"
                onClick={() => setShowInfo(!showInfo)}
              />
            </label>
            <div className="flex gap-2 flex-wrap mt-2">
              {dietTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setDietType(type)}
                  className={`px-4 py-2 border rounded-xl transition-all ${
                    dietType === type
                      ? "bg-purple-500 text-white shadow"
                      : "border-gray-300 text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.dietType && (
              <p className="text-xs text-red-500 mt-1">{errors.dietType}</p>
            )}

            {showInfo && (
              <div
                ref={infoRef}
                className="absolute bg-white border border-gray-300 shadow-lg rounded-xl p-4 mt-2 w-72 z-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">Diet Type Info</span>
                  <button onClick={() => setShowInfo(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-700">
                  Select your dietary preference. This helps us tailor your
                  nutrition recommendations.
                </p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    toggleOption(
                      option,
                      dietaryRestrictions,
                      setDietaryRestrictions
                    )
                  }
                  className={`px-3 py-1.5 border rounded-xl text-sm transition-all ${
                    dietaryRestrictions.includes(option)
                      ? "bg-purple-500 text-white shadow"
                      : "border-gray-300 text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Allergies
            </label>
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option, allergies, setAllergies)}
                  className={`px-3 py-1.5 border rounded-xl text-sm transition-all ${
                    allergies.includes(option)
                      ? "bg-red-500 text-white shadow"
                      : "border-gray-300 text-gray-700 hover:bg-red-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Image */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> Upload Profile Image (optional)
          </label>
          <div
            className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors`}
            onClick={() =>
              imageInputRef.current && imageInputRef.current.click()
            }
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
                  alt="Profile Preview"
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
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
