import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Menu, User, Settings, LogOut } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";

export default function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, sendLogoutRequest } = useAuthStore();
  const { profile, getUserProfile } = useUserStore();

  useEffect(() => {
    if (!profile) {
      getUserProfile().catch((err) => console.error("Error loading profile in layout:", err));
    }
  }, [profile, getUserProfile]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    const success = await sendLogoutRequest();
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5]">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* HEADER (COMMON) */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* Right Section */}
              <div className="flex items-center gap-4 ml-auto">
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all active:scale-95 relative z-30"
                  >
                    {profile?.imageUrl ? (
                      <img
                        src={profile.imageUrl}
                        alt={profile.name || "User profile"}
                        className="w-9 h-9 rounded-full object-cover shadow-lg border border-purple-100"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-50 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                        {profile?.name ? (
                          <span className="text-white text-xs font-bold uppercase">
                            {profile.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </span>
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                    )}
                  </button>

                  {showUserMenu && (
                    <>
                      {/* Transparent overlay for click-outside to close dropdown */}
                      <div 
                        className="fixed inset-0 z-20 cursor-default" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Summary Header */}
                        <div className="px-4 py-2 border-b border-gray-50 pb-2 mb-1">
                          <p className="text-xs text-gray-400">Logged in as</p>
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {profile?.name || user?.username || "FitTrack User"}
                          </p>
                          {user?.email && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {user.email}
                            </p>
                          )}
                        </div>

                        {/* Navigation Links */}
                        <Link 
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700"
                        >
                          <User className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">Profile</span>
                        </Link>

                        

                        <hr className="my-1 border-gray-50" />

                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ROUTED PAGE CONTENT */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
