import React, { useEffect, useState } from "react";
import {
  Edit3,
  Download,
  Trash2,
  User,
  Activity,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  X,
  Camera,
  Scale,
  Ruler,
  Calendar,
  Leaf,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { useUserStore } from "../../store/userStore";

// Loading Skeleton Component
const LoadingSkeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);

// Empty State Component
const EmptyProfileState = ({ onCreateProfile }) => (
  <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-md w-full text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">
        No Profile Found
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Create your profile to get personalized nutrition recommendations and
        track your health journey.
      </p>
      <button
        onClick={onCreateProfile}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create Profile
      </button>
    </div>
  </div>
);

// Custom Select Component
const SelectField = ({ label, name, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-white appearance-none cursor-pointer text-slate-700"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// Multi-select Chip Component
const ChipSelect = ({ label, options, selected, onToggle }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      {label}
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            selected.includes(option)
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {option}
        </button>
      ))}
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
    dietType: profile?.dietType || "",
    dietaryRestrictions: profile?.dietaryRestrictions || [],
    allergies: profile?.allergies || [],
  });

  const [errors, setErrors] = useState({});

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const dietTypeOptions = [
    { value: "Vegetarian", label: "Vegetarian" },
    { value: "Non-Vegetarian", label: "Non-Vegetarian" },
    { value: "Vegan", label: "Vegan" },
    { value: "Pescatarian", label: "Pescatarian" },
  ];

  const dietaryRestrictionOptions = [
    "Gluten",
    "Lactose",
    "Peanuts",
    "Soy",
    "Shellfish",
  ];

  const allergyOptions = ["Peanuts", "Seafood", "Eggs", "Dairy", "Soy"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const toggleArrayField = (field, option) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(option)
        ? prev[field].filter((d) => d !== option)
        : [...prev[field], option],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.age) newErrors.age = "Age is required";
    else if (formData.age < 1 || formData.age > 120)
      newErrors.age = "Age must be between 1-120";
    if (!formData.weight) newErrors.weight = "Weight is required";
    else if (formData.weight < 1) newErrors.weight = "Weight must be at least 1kg";
    if (!formData.height) newErrors.height = "Height is required";
    else if (formData.height < 30) newErrors.height = "Height must be at least 30cm";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dietType) newErrors.dietType = "Diet type is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({
      ...formData,
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all ${
                errors.name ? "border-red-300 bg-red-50" : "border-slate-200"
              }`}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Age <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent ${
                  errors.age ? "border-red-300 bg-red-50" : "border-slate-200"
                }`}
                placeholder="Age"
              />
              {errors.age && (
                <p className="text-xs text-red-500 mt-1">{errors.age}</p>
              )}
            </div>
            <div>
              <SelectField
                label={
                  <>
                    Gender <span className="text-red-400">*</span>
                  </>
                }
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
                placeholder="Select"
              />
              {errors.gender && (
                <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Weight (kg) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                min="1"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent ${
                  errors.weight ? "border-red-300 bg-red-50" : "border-slate-200"
                }`}
                placeholder="e.g., 70"
              />
              {errors.weight && (
                <p className="text-xs text-red-500 mt-1">{errors.weight}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Height (cm) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                step="0.1"
                min="30"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent ${
                  errors.height ? "border-red-300 bg-red-50" : "border-slate-200"
                }`}
                placeholder="e.g., 175"
              />
              {errors.height && (
                <p className="text-xs text-red-500 mt-1">{errors.height}</p>
              )}
            </div>
          </div>

          {/* Diet Type */}
          <SelectField
            label={
              <>
                Diet Type <span className="text-red-400">*</span>
              </>
            }
            name="dietType"
            value={formData.dietType}
            onChange={handleChange}
            options={dietTypeOptions}
            placeholder="Select diet type"
          />
          {errors.dietType && (
            <p className="text-xs text-red-500 mt-1">{errors.dietType}</p>
          )}

          {/* Dietary Restrictions */}
          <ChipSelect
            label="Dietary Restrictions"
            options={dietaryRestrictionOptions}
            selected={formData.dietaryRestrictions}
            onToggle={(option) => toggleArrayField("dietaryRestrictions", option)}
          />

          {/* Allergies */}
          <ChipSelect
            label="Allergies"
            options={allergyOptions}
            selected={formData.allergies}
            onToggle={(option) => toggleArrayField("allergies", option)}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

// Info Card Component
const InfoCard = ({ icon: Icon, label, value, subValue, className = "" }) => (
  <div
    className={`p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all ${className}`}
  >
    <div className="flex items-center gap-2 text-slate-500 mb-2">
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-lg font-semibold text-slate-800">{value}</div>
    {subValue && <div className="text-xs text-slate-500 mt-0.5">{subValue}</div>}
  </div>
);

// Badge Component
const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    info: "bg-sky-50 text-sky-700 border border-sky-100",
    danger: "bg-rose-50 text-rose-700 border border-rose-100",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const {
    getUserProfile,
    editProfile: updateProfile,
    deleteProfile,
    profile,
    isLoading,
    error,
  } = useUserStore();

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
      ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : null;

  const getBMIInfo = (bmiValue) => {
    if (!bmiValue) return { category: "N/A", variant: "default" };
    const bmi = parseFloat(bmiValue);
    if (bmi < 18.5) return { category: "Underweight", variant: "info" };
    if (bmi < 25) return { category: "Healthy", variant: "success" };
    if (bmi < 30) return { category: "Overweight", variant: "warning" };
    return { category: "Obese", variant: "danger" };
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatGender = (gender) => {
    if (!gender) return "—";
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

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

  const handleSaveProfile = async (updatedData) => {
    setActionLoading(true);
    try {
      if (updateProfile) {
        await updateProfile(updatedData);
        await getUserProfile();
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProfile = () => {
    setIsEditModalOpen(true);
  };

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
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <LoadingSkeleton className="w-48 h-8 mb-2" />
              <LoadingSkeleton className="w-64 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <LoadingSkeleton className="w-24 h-10 rounded-xl" />
              <LoadingSkeleton className="w-20 h-10 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex flex-col items-center gap-4">
                <LoadingSkeleton className="w-32 h-32 rounded-2xl" />
                <LoadingSkeleton className="w-32 h-6" />
                <LoadingSkeleton className="w-20 h-4" />
                <div className="w-full grid grid-cols-2 gap-3 mt-4">
                  <LoadingSkeleton className="h-20 rounded-xl" />
                  <LoadingSkeleton className="h-20 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <LoadingSkeleton className="w-40 h-6 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  <LoadingSkeleton className="h-24 rounded-xl" />
                  <LoadingSkeleton className="h-24 rounded-xl" />
                  <LoadingSkeleton className="h-24 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!profile && !isLoading) {
    return (
      <>
        <EmptyProfileState onCreateProfile={handleCreateProfile} />
        {isEditModalOpen && (
          <EditProfileModal
            profile={null}
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
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error || localError}</p>
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const bmiInfo = getBMIInfo(bmi);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Profile</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your personal information and preferences
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={handleExport}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                    {profile.imageUrl ? (
                      <img
                        src={profile.imageUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 text-slate-500">
                        <span className="text-2xl font-bold">
                          {getInitials(profile.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute -bottom-1 -right-1 p-2 bg-slate-800 text-white rounded-xl shadow-lg hover:bg-slate-700 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Name & Info */}
                <h2 className="text-lg font-semibold text-slate-800 text-center">
                  {profile.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {formatGender(profile.gender)} • {profile.age} years
                </p>

                {/* Diet Type Badge */}
                {profile.dietType && (
                  <div className="mt-3">
                    <Badge variant="success">
                      <Leaf className="w-3 h-3 mr-1" />
                      {profile.dietType}
                    </Badge>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="w-full grid grid-cols-2 gap-3 mt-6">
                  <InfoCard
                    icon={Scale}
                    label="Weight"
                    value={`${profile.weight} kg`}
                  />
                  <InfoCard
                    icon={Ruler}
                    label="Height"
                    value={`${profile.height} cm`}
                  />
                </div>

                {/* BMI */}
                <div className="w-full mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        BMI
                      </span>
                    </div>
                    <Badge variant={bmiInfo.variant}>{bmiInfo.category}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {bmi || "—"}
                  </div>
                </div>

                {/* Timestamps */}
                {profile.createdAt && (
                  <div className="w-full mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Member since{" "}
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dietary Restrictions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-slate-400" />
                <h3 className="text-base font-semibold text-slate-800">
                  Dietary Restrictions
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.dietaryRestrictions?.length > 0 ? (
                  profile.dietaryRestrictions.map((restriction) => (
                    <Badge key={restriction} variant="warning">
                      {restriction}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No restrictions added</p>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-slate-400" />
                <h3 className="text-base font-semibold text-slate-800">
                  Allergies
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies?.length > 0 ? (
                  profile.allergies.map((allergy) => (
                    <Badge key={allergy} variant="danger">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No allergies reported</p>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                Profile Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Full Name
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {profile.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Gender
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {formatGender(profile.gender)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Age
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {profile.age} years
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Weight
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {profile.weight} kg
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Height
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {profile.height} cm
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Diet Type
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {profile.dietType || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            {/* <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Permanently delete your profile and all associated data.
              </p>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Profile
              </button>
            </div> */}
          </div>
        </div>


      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}