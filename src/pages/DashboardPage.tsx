import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import AdminDashboard from "../components/AdminDashboard";
import ManagerDashboard from "../components/ManagerDashboard";
import DepartmentHeadDashboard from "../components/DepartmentHeadDashboard";
import LecturerDashboard from "../components/LecturerDashboard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const userResponse = await api.getMe();
        if (userResponse.success) {
          const roles = userResponse.data.roles || [userResponse.data.role];
          const currentRole = roles[0] || "lecturer";
          setUserRole(currentRole);
        } else {
          navigate("/login");
          return;
        }
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Render dashboard theo role
  switch (userRole) {
    case "admin":
      return <AdminDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "department_head":
      return <DepartmentHeadDashboard />;
    case "lecturer":
    default:
      return <LecturerDashboard />;
  }
}
