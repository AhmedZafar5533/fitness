import React, { useEffect, useState } from "react";
import {
  ImageIcon,
  Edit3,
  Download,
  Trash2,
  Check,
  User,
  Heart,
  Activity,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  X,
  Camera,
} from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { Link } from "react-router-dom";

// Loading Skeleton Component
const LoadingSkeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Empty State Component
const EmptyProfileState = ({ onCreateProfile }) => (
  <div className="min-h-screen bg-[#FFF5F5] p-6 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-md w-full text-center">
      <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="w-10 h-10 text-purple-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Profile Found</h2>
      <p className="text-sm text-gray-600 mb-6">
        Create your profile to get personalized nutrition recommendations and
        track your health journey.
      </p>
      <button
        onClick={onCreateProfile}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
      >
        <Plus className="w-5 h-5" />
        Create Profile
      </button>
    </div>
  </div>
);

// Edit Profile Modal Component
const EditProfileModal = ({ profile, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    age: profile?.age || "",
    weight: profile?.weight || "",
    height: profile?.height || "",
    gender: profile?.gender || "",
    dietary: profile?.dietary || [],
    allergies: profile?.allergies || "",
  });

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Pescatarian",
    "Keto",
    "Paleo",
    "Low Carb",
    "Low Sugar",
    "Gluten Free",
    "Dairy Free",
    "Halal",
    "Kosher",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDietary = (option) => {
    setFormData((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(option)
        ? prev.dietary.filter((d) => d !== option)
        : [...prev.dietary, option],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Weight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Height"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies
            </label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Peanuts, Gluten, Dairy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.dietary.includes(option)
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const {
    getUserProfile,
    updateProfile,
    deleteProfile,
    profile,
    isLoading,
    error,
  } = useUserStore();

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getUserProfile();
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLocalError("Failed to load profile");
      }
    };
    fetchProfile();
  }, [getUserProfile]);

  // Calculate BMI
  const bmi =
    profile?.weight && profile?.height
      ? (profile.weight / Math.pow(profile.height / 100 || 1, 2)).toFixed(1)
      : null;

  // Get BMI category
  const getBMICategory = (bmiValue) => {
    if (!bmiValue) return "Provide weight & height";
    const bmi = parseFloat(bmiValue);
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Healthy";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  // Get BMI color
  const getBMIColor = (bmiValue) => {
    if (!bmiValue) return "text-gray-500";
    const bmi = parseFloat(bmiValue);
    if (bmi < 18.5) return "text-blue-500";
    if (bmi < 25) return "text-green-500";
    if (bmi < 30) return "text-yellow-500";
    return "text-red-500";
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Handle export
  const handleExport = () => {
    if (!profile) return;
    const dataStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(profile.name || "profile")
      .replace(/\s+/g, "_")
      .toLowerCase()}_profile.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Delete your profile? This action cannot be undone.")) return;
    setActionLoading(true);
    try {
      if (deleteProfile) {
        await deleteProfile();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle save profile
  const handleSaveProfile = async (updatedData) => {
    setActionLoading(true);
    try {
      if (updateProfile) {
        await updateProfile(updatedData);
        await getUserProfile(); // Refresh profile data
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create profile (for empty state)
  const handleCreateProfile = () => {
    setIsEditModalOpen(true);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await getUserProfile();
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  };

  // Loading state
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <LoadingSkeleton className="w-48 h-8 mb-2" />
              <LoadingSkeleton className="w-64 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <LoadingSkeleton className="w-28 h-10 rounded-lg" />
              <LoadingSkeleton className="w-24 h-10 rounded-lg" />
              <LoadingSkeleton className="w-20 h-10 rounded-lg" />
            </div>
          </div>

          {/* Main grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex flex-col items-center gap-4">
                  <LoadingSkeleton className="w-36 h-36 rounded-xl" />
                  <LoadingSkeleton className="w-32 h-6" />
                  <LoadingSkeleton className="w-20 h-4" />
                  <div className="w-full grid grid-cols-3 gap-3 mt-3">
                    <LoadingSkeleton className="h-16 rounded-lg" />
                    <LoadingSkeleton className="h-16 rounded-lg" />
                    <LoadingSkeleton className="h-16 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <LoadingSkeleton className="w-40 h-6 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  <LoadingSkeleton className="h-24 rounded-lg" />
                  <LoadingSkeleton className="h-24 rounded-lg" />
                  <LoadingSkeleton className="h-24 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no profile
  if (!profile && !isLoading) {
    return (
      <>
        <EmptyProfileState onCreateProfile={handleCreateProfile} />
        {isEditModalOpen && (
          <EditProfileModal
            profile={{
              name: "",
              age: "",
              weight: "",
              height: "",
              gender: "",
              dietary: [],
              allergies: "",
            }}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveProfile}
            isLoading={actionLoading}
          />
        )}
      </>
    );
  }

  // Error state
  if (error || localError) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-sm text-gray-600 mb-6">{error || localError}</p>
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get dietary as array (handle both string and array formats)
  const getDietaryArray = () => {
    if (!profile?.dietary) return [];
    if (Array.isArray(profile.dietary)) return profile.dietary;
    if (typeof profile.dietary === "string") {
      return profile.dietary
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    }
    return [];
  };

  const dietaryArray = getDietaryArray();

  return (
    <div className="min-h-screen bg-[#FFF5F5] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-sm text-gray-600 mt-1">
              Personal details and dietary preferences
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md text-sm text-gray-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              onClick={handleExport}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md text-sm text-gray-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg shadow-sm hover:bg-red-50 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg text-sm hover:shadow-purple-500/30 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - avatar & basics */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-36 h-36 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center text-4xl">
                    {profile.imageUrl || profile.imageUrl || profile.avatar ? (
                      <img
                        src={
                          // "http://localhost:3000" + profile.imageUrl ||
                          // profile.imageUrl ||
                          // profile.avatar ||
                          "https://www.gravatar.com/avatar/?d=mp"
                        }
                        alt={`${profile.name} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-200 to-purple-50 text-purple-700">
                        <span className="text-3xl font-bold">
                          {getInitials(profile.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute -bottom-2 -right-2 p-2 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile.name || "No Name"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {profile.gender || "—"}
                  </p>
                  {profile.email && (
                    <p className="text-xs text-gray-500 mt-1">
                      {profile.email}
                    </p>
                  )}
                </div>

                <div className="w-full grid grid-cols-3 gap-3 mt-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center hover:bg-gray-100 transition-colors">
                    <div className="text-xs text-gray-500">Age</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {profile.age ?? "—"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center hover:bg-gray-100 transition-colors">
                    <div className="text-xs text-gray-500">Weight</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {profile.weight ? `${profile.weight} kg` : "—"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center hover:bg-gray-100 transition-colors">
                    <div className="text-xs text-gray-500">Height</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {profile.height ? `${profile.height} cm` : "—"}
                    </div>
                  </div>
                </div>

                <div className="w-full mt-4 border-t pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span>Dietary</span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {dietaryArray.length > 0
                        ? dietaryArray.slice(0, 2).join(", ") +
                          (dietaryArray.length > 2
                            ? ` +${dietaryArray.length - 2}`
                            : "")
                        : "None set"}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs">
                        Keep your dietary preferences up to date for better
                        recommendations.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - nutrition & details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Health Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Health Summary
                </h3>
                <span className="text-sm text-gray-600">Overview</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-sm text-gray-500">BMI</div>
                  <div
                    className={`mt-2 text-2xl font-bold ${getBMIColor(bmi)}`}
                  >
                    {bmi ?? "—"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getBMICategory(bmi)}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-sm text-gray-500">Allergies</div>
                  <div className="mt-2 text-sm text-gray-900">
                    {profile.allergies || "No allergies reported"}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-sm text-gray-500">Preferences</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dietaryArray.length > 0 ? (
                      dietaryArray.map((d) => (
                        <span
                          key={d}
                          className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-lg"
                        >
                          {d}
                        </span>
                      ))
                    ) : (
                      <div className="text-sm text-gray-700">None set</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                <div className="text-sm text-gray-600">Account info</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Full name</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {profile.name || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Gender</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {profile.gender || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Age</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {profile.age ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {profile.email || "—"}
                  </div>
                </div>

                {profile.createdAt && (
                  <div>
                    <div className="text-xs text-gray-500">Member since</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}

                {profile.updatedAt && (
                  <div>
                    <div className="text-xs text-gray-500">Last updated</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
                <div className="text-sm text-gray-600">Manage</div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-xs text-gray-500 text-center mt-4">
          Data privacy note: personal data is stored securely on your server.
          Keep your profile up to date for accurate suggestions.
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          profile={{
            ...profile,
            dietary: dietaryArray,
          }}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
