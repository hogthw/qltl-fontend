import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  email: string;
  fullName: string;
  role?: string;
  roles?: string[];
  department?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface DashboardHeaderProps {
  user: User | null;
  title?: string;
  subtitle?: string;
}

export default function DashboardHeader({
  user,
  title = "QLTL",
  subtitle = "Hệ thống quản lý tài liệu",
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("dashboardActiveTab");
    navigate("/login");
  };

  const getRoleBadge = (user: User) => {
    const roleMap: { [key: string]: { label: string; color: string } } = {
      admin: { label: "Admin", color: "bg-red-100 text-red-700" },
      manager: { label: "Manager", color: "bg-blue-100 text-blue-700" },
      department_head: {
        label: "Trưởng khoa",
        color: "bg-purple-100 text-purple-700",
      },
      lecturer: { label: "Giảng viên", color: "bg-green-100 text-green-700" },
    };

    const userRole = user.roles?.[0] || user.role || "unknown";
    const roleInfo = roleMap[userRole] || {
      label: userRole,
      color: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${roleInfo.color}`}
      >
        {roleInfo.label}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="relative"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onBlur={() => setTimeout(() => setShowProfileMenu(false), 200)}
            >
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-base font-bold text-white">
                    {user?.fullName
                      ? user.fullName.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.fullName || "User"}
                  </p>
                  <div className="mt-0.5">{user && getRoleBadge(user)}</div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 transition-all duration-200 z-50 overflow-hidden ${
                  showProfileMenu
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                }`}
              >
                <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-lg font-bold text-white">
                        {user?.fullName
                          ? user.fullName.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.fullName || "User"}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("/profile")}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors group/item cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover/item:bg-blue-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover/item:text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Hồ sơ cá nhân</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("/settings")}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors group/item cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover/item:bg-blue-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover/item:text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Cài đặt</span>
                  </div>
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50">
                  <div
                    role="button"
                    tabIndex={0}
                    onMouseDown={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group/item cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 group-hover/item:bg-red-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold">Đăng xuất</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
