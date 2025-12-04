import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import SystemConfigPage from "./pages/SystemConfigPage";
import DepartmentsManagementPage from "./pages/DepartmentsManagementPage";
import FilesManagementPage from "./pages/FilesManagementPage";
import AnnouncementsManagementPage from "./pages/AnnouncementsManagementPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import DepartmentFilesPage from "./pages/DepartmentFilesPage";
import AllLecturersStatsPage from "./pages/AllLecturersStatsPage";
import BackupPage from "./pages/BackupPage";
import RestorePage from "./pages/RestorePage";
import StandardsManagementPage from "./pages/StandardsManagementPage";
import EvidenceCodeManagementPage from "./pages/EvidenceCodeManagementPage";
import ManagerStatisticsPage from "./pages/ManagerStatisticsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAdmin={false}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAdmin={false}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requireAdmin={false}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-config"
          element={
            <ProtectedRoute requireAdmin={true}>
              <SystemConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute requireAdmin={true}>
              <DepartmentsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedRoute requireAdmin={true}>
              <FilesManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute requireAdmin={false}>
              <AnnouncementsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute requireAdmin={false}>
              <ActivityLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-files"
          element={
            <ProtectedRoute requireAdmin={false}>
              <DepartmentFilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-head/lecturers-stats"
          element={
            <ProtectedRoute requireAdmin={false}>
              <AllLecturersStatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/backup"
          element={
            <ProtectedRoute requireAdmin={true}>
              <BackupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restore"
          element={
            <ProtectedRoute requireAdmin={true}>
              <RestorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/standards"
          element={
            <ProtectedRoute requireAdmin={false}>
              <StandardsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-statistics"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManagerStatisticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evidence-codes"
          element={
            <ProtectedRoute requireAdmin={false}>
              <EvidenceCodeManagementPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
