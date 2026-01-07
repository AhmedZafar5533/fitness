import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Activity,
  Dumbbell,
  Apple,
  TrendingUp,
  Heart,
  Lock,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { sendResetPasswordRequest } = useAuthStore();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slides for the right side illustration (kept same as login for consistency)
  const slides = [
    { title: "Track your calories and reach your goals", subtitle: "FitTrack" },
    { title: "Make your work easier and organized", subtitle: "FitTrack" },
    { title: "Transform your fitness journey", subtitle: "FitTrack" },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      // The store handles the toast notifications
      const success = await sendResetPasswordRequest(token, formData.password);
      if (success) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {isSuccess ? (
            // SUCCESS STATE
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Password Reset!
              </h1>
              <p className="text-gray-600 mb-8">
                Your password has been successfully reset.
                <br />
                You can now login with your new credentials.
              </p>

              <button
                onClick={() => navigate("/auth")}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Back to Login
              </button>
            </div>
          ) : (
            // FORM STATE
            <>
              {/* Header */}
              <div className="mb-10">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Set new password
                </h1>
                <p className="text-gray-600">
                  Your new password must be different from
                  <br />
                  previously used passwords.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-5 mb-8">
                {/* New Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className={`w-full px-6 py-4 pr-14 bg-white border rounded-full text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-300 focus:border-purple-500"
                    }`}
                    placeholder="New Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className={`w-full px-6 py-4 pr-14 bg-white border rounded-full text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300 focus:border-purple-500"
                    }`}
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mb-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Reset Password"
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 mx-auto font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side - Illustration (Same as Auth Page) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-50 to-pink-50 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-pink-200 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="mb-8 relative h-96 flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center relative">
                <Activity className="w-32 h-32 text-white" />
                <div
                  className="absolute -top-8 -left-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce"
                  style={{ animationDelay: "0s", animationDuration: "3s" }}
                >
                  <Dumbbell className="w-8 h-8 text-purple-600" />
                </div>
                <div
                  className="absolute -top-4 -right-12 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce"
                  style={{ animationDelay: "0.5s", animationDuration: "3s" }}
                >
                  <Apple className="w-8 h-8 text-purple-600" />
                </div>
                <div
                  className="absolute -bottom-8 -right-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce"
                  style={{ animationDelay: "1s", animationDuration: "3s" }}
                >
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 min-w-max">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      Fitness Goal
                    </div>
                    <div className="text-xs text-gray-600">Track Progress</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-lg font-bold text-purple-600">84%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? "w-8 bg-gray-900" : "w-2 bg-gray-400"
                }`}
              />
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {slides[currentSlide].title}
          </h2>
          <p className="text-lg">
            <span className="text-gray-600">with </span>
            <span className="font-bold text-gray-900">
              {slides[currentSlide].subtitle}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
