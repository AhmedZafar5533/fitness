import React from "react";
import {
  Activity,
  Home,
  Utensils,
  MessageCircle,
  Settings,
  X,
  User,
  LogOut,
  Calendar
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { sendLogoutRequest } = useAuthStore();

  const sidebarItems = [
    { icon: User, label: "profile", path: "/profile" },
    { icon: Home, label: "dashboard", path: "/home" },
    { icon: Utensils, label: "Add Meal", path: "/form" },
    { icon:  Calendar, label: "Meal History", path: "/history" },
    { icon: MessageCircle, label: "Nutrition Genie", path: "/chat" },

  ];

  const handleLogout = async () => {
    const success = await sendLogoutRequest();
    if (success) {
      navigate("/");
    }
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-all duration-300 ease-out lg:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Section: Logo + Navigation */}
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                FitTrack
              </h1>
            </div>

            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm capitalize">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
