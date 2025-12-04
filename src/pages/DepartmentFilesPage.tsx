import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import DashboardHeader from "../components/DashboardHeader";

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

interface FileItem {
  _id: string;
  filename: string;
  originalName: string;
  length: number;
  contentType: string;
  uploader: {
    _id: string;
    fullName: string;
    email: string;
  };
  departmentId: {
    code: string;
    name: string;
  };
  tags: string[];
  approved: boolean;
  approvedBy?: {
    fullName: string;
  };
  description?: string;
  qaStandard?: string;
  courseCode?: string;
  courseName?: string;
  activityType?: string;
  academicYear?: string;
  semester?: string;
  submissionStatus: string;
  reviewNotes?: string;
  reviewedBy?: {
    fullName: string;
  };
  reviewedAt?: string;
  createdAt: string;
}

interface LecturerStats {
  _id: string;
  fullName: string;
  email: string;
  submittedCount: number;
  totalExpected: number;
  lastSubmission?: string;
  hasSubmitted: boolean;
}

const DepartmentFilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [lecturers, setLecturers] = useState<
    Array<{ _id: string; fullName: string }>
  >([]);
  const [teams, setTeams] = useState<
    Array<{ _id: string; name: string; lecturerCount: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [lecturerStats, setLecturerStats] = useState<LecturerStats[]>([]);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  // Filters
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lecturerFilter, setLecturerFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  // Review form
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  // Reminder form
  const [reminderType, setReminderType] = useState<"all" | "specific">("all");
  const [selectedLecturers, setSelectedLecturers] = useState<string[]>([]);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderDueDate, setReminderDueDate] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const userResponse = await api.getMe();
        console.log("User response:", userResponse);

        if (userResponse.success) {
          const userData = userResponse.data?.user || userResponse.data;
          console.log("User data:", userData);
          console.log("User department:", userData.department);
          console.log("User departmentId:", userData.departmentId);
          console.log("User role:", userData.role);
          console.log("User roles:", userData.roles);

          setUser(userData);

          // Check if user is department head
          if (
            !userData.roles?.includes("department_head") &&
            userData.role !== "department_head"
          ) {
           // eslint-disable-next-line no-console
console.warn("User is not a department head");

          }
        } else {
          console.error("Failed to get user:", userResponse);
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYear, semester, statusFilter, lecturerFilter, teamFilter]);

  const fetchInitialData = async () => {
    try {
      console.log("Fetching initial data...");
      const [lecturersRes, teamsRes] = await Promise.all([
        api.getDepartmentLecturers(),
        api.getTeamsAndGroups(),
      ]);
      console.log("Lecturers response:", lecturersRes);
      console.log("Teams response:", teamsRes);

      if (lecturersRes.success) {
        setLecturers(lecturersRes.data || []);
      } else {
        console.error("Failed to fetch lecturers:", lecturersRes.message);
      }

      if (teamsRes.success) {
        setTeams(teamsRes.data || []);
      } else {
        console.error("Failed to fetch teams:", teamsRes.message);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setError("Không thể tải dữ liệu ban đầu");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const params: Record<string, string> = {};
      if (academicYear) params.academicYear = academicYear;
      if (semester) params.semester = semester;
      if (statusFilter) params.submissionStatus = statusFilter;

      console.log("Fetching files with params:", params);

      const [filesRes, lecturerStatsRes] = await Promise.all([
        api.getDepartmentHeadFiles(params),
        api.getLecturerSubmissionStats(params),
      ]);

      console.log("Files response:", filesRes);
      console.log("Lecturer stats response:", lecturerStatsRes);

      if (filesRes.success) {
        let filteredFiles = filesRes.data || [];
        console.log("Total files received:", filteredFiles.length);

        if (lecturerFilter) {
          filteredFiles = filteredFiles.filter(
            (f: FileItem) => f.uploader._id === lecturerFilter
          );
          console.log("Filtered files by lecturer:", filteredFiles.length);
        }
        setFiles(filteredFiles);
      } else {
        console.error("Failed to fetch files:", filesRes.message);
        setError(filesRes.message || "Không thể tải danh sách hồ sơ");
        setFiles([]);
      }

      if (lecturerStatsRes.success) {
        setLecturerStats(lecturerStatsRes.data || []);
      } else {
        console.error(
          "Failed to fetch lecturer stats:",
          lecturerStatsRes.message
        );
        setLecturerStats([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      if (error instanceof TypeError) {
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy."
        );
      } else {
        setError("Đã xảy ra lỗi khi tải dữ liệu");
      }
      setFiles([]);
      setLecturerStats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewFile = async () => {
    if (!selectedFile || !reviewStatus) return;

    try {
      await api.reviewDepartmentFile(selectedFile._id, {
        submissionStatus: reviewStatus,
        reviewNotes,
      });
      setReviewModalOpen(false);
      setSelectedFile(null);
      setReviewStatus("");
      setReviewNotes("");
      fetchData();
    } catch (error) {
      console.error("Failed to review file:", error);
      alert("Không thể duyệt file");
    }
  };

  const openReviewModal = (file: FileItem) => {
    setSelectedFile(file);
    setReviewStatus(file.submissionStatus);
    setReviewNotes(file.reviewNotes || "");
    setReviewModalOpen(true);
  };

  const openDetailModal = (file: FileItem) => {
    setSelectedFile(file);
    setDetailModalOpen(true);
  };

  const handleSendReminder = async () => {
    if (reminderType === "specific" && selectedLecturers.length === 0) {
      alert("Vui lòng chọn ít nhất một giảng viên");
      return;
    }

    if (!reminderMessage) {
      alert("Vui lòng nhập nội dung nhắc nhở");
      return;
    }

    try {
      await api.sendReminderToLecturers({
        reminderType,
        lecturerIds:
          reminderType === "specific" ? selectedLecturers : undefined,
        message: reminderMessage,
        dueDate: reminderDueDate || undefined,
      });
      setReminderModalOpen(false);
      setReminderType("all");
      setSelectedLecturers([]);
      setReminderMessage("");
      setReminderDueDate("");
      alert("Đã gửi nhắc nhở thành công");
    } catch (error) {
      console.error("Failed to send reminder:", error);
      alert("Không thể gửi nhắc nhở");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      revision_required: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Nháp",
      submitted: "Đã nộp",
      under_review: "Đang duyệt",
      approved: "Đã duyệt",
      rejected: "Từ chối",
      revision_required: "Yêu cầu chỉnh sửa",
    };
    return labels[status] || status;
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý hồ sơ
                </h1>
                <p className="text-sm text-gray-600">
                  Duyệt và theo dõi hồ sơ minh chứng của giảng viên
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-red-800">{error}</p>
                {error.includes("kết nối") && (
                  <button
                    onClick={() => {
                      setError("");
                      fetchData();
                    }}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Thử lại
                  </button>
                )}
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Tổng giảng viên
              </h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {lecturerStats.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Tổng hồ sơ</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-600"
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
            </div>
            <p className="text-3xl font-bold text-indigo-600">{files.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">GV đã nộp</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {lecturerStats.filter((l) => l.hasSubmitted).length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">GV chưa nộp</h3>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {lecturerStats.filter((l) => !l.hasSubmitted).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Bộ lọc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Năm học (VD: 2024-2025)"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả học kỳ</option>
                <option value="HK1">Học kỳ 1</option>
                <option value="HK2">Học kỳ 2</option>
                <option value="HK3">Học kỳ 3</option>
                <option value="FULL_YEAR">Cả năm</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="submitted">Đã nộp</option>
                <option value="under_review">Đang duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="revision_required">Yêu cầu chỉnh sửa</option>
              </select>
              <select
                value={lecturerFilter}
                onChange={(e) => setLecturerFilter(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả giảng viên</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer._id} value={lecturer._id}>
                    {lecturer.fullName}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setAcademicYear("");
                  setSemester("");
                  setStatusFilter("");
                  setLecturerFilter("");
                  setTeamFilter("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Lecturer Stats Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Trạng thái nộp bài giảng viên
            </h3>
            {lecturerStats.filter((l) => !l.hasSubmitted).length > 0 && (
              <button
                onClick={() => {
                  setSelectedLecturers(
                    lecturerStats
                      .filter((l) => !l.hasSubmitted)
                      .map((l) => l._id)
                  );
                  setReminderModalOpen(true);
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
              >
                Gửi nhắc nhở GV chưa nộp
              </button>
            )}
          </div>

          {lecturerStats.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-gray-500 text-sm">
                Chưa có dữ liệu thống kê giảng viên. Vui lòng kiểm tra lại bộ
                lọc hoặc liên hệ quản trị viên.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lecturerStats.slice(0, 6).map((lecturer) => (
                  <div
                    key={lecturer._id}
                    className={`p-4 rounded-lg border-2 ${
                      lecturer.hasSubmitted
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {lecturer.fullName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {lecturer.email}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          lecturer.hasSubmitted ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {lecturer.hasSubmitted ? (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Đã nộp:</span>
                        <span className="font-semibold">
                          {lecturer.submittedCount} / {lecturer.totalExpected}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            lecturer.hasSubmitted
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${
                              (lecturer.submittedCount /
                                (lecturer.totalExpected || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      {lecturer.lastSubmission && (
                        <p className="text-xs text-gray-500 mt-2">
                          Lần nộp cuối:{" "}
                          {new Date(lecturer.lastSubmission).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              {lecturerStats.length > 6 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate("/department-head/lecturers-stats")}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Xem tất cả ({lecturerStats.length} giảng viên)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách hồ sơ
            </h3>
            <span className="text-sm text-gray-600">
              Tổng: <span className="font-semibold">{files.length}</span> hồ sơ
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảng viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu chuẩn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học kỳ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <svg
                        className="w-12 h-12 mx-auto text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-sm">Không có hồ sơ nào</p>
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr
                      key={file._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600"
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
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {file.originalName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(file.length / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {file.uploader.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.uploader.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.qaStandard || (
                          <span className="text-gray-400">Chưa phân loại</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {file.academicYear || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.semester || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            file.submissionStatus
                          )}`}
                        >
                          {getStatusLabel(file.submissionStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openDetailModal(file)}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openReviewModal(file)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Duyệt hồ sơ"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {detailModalOpen && selectedFile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-purple-600"
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
                  Chi tiết hồ sơ
                </h2>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* File Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Thông tin file
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Tên file</p>
                      <p className="font-medium text-gray-900">
                        {selectedFile.originalName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kích thước</p>
                      <p className="font-medium text-gray-900">
                        {(selectedFile.length / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Loại file</p>
                      <p className="font-medium text-gray-900">
                        {selectedFile.contentType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ngày tạo</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedFile.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploader Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
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
                    Giảng viên
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Họ tên</p>
                      <p className="font-medium text-gray-900">
                        {selectedFile.uploader.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {selectedFile.uploader.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course & Activity Info */}
                {(selectedFile.courseCode ||
                  selectedFile.courseName ||
                  selectedFile.activityType) && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Thông tin môn học & Hoạt động
                    </h3>
                    <div className="space-y-3">
                      {selectedFile.activityType && (
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="text-xs text-gray-500 mb-1">
                            Loại hoạt động
                          </p>
                          <p className="font-semibold text-gray-900 text-base">
                            {selectedFile.activityType === "teaching" &&
                              "🎓 Giảng dạy"}
                            {selectedFile.activityType === "research" &&
                              "🔬 NCKH (Nghiên cứu khoa học)"}
                            {selectedFile.activityType === "seminar" &&
                              "📢 Hội thảo / Seminar"}
                            {selectedFile.activityType ===
                              "business_cooperation" &&
                              "🤝 Hợp tác Doanh nghiệp"}
                            {selectedFile.activityType === "student_activity" &&
                              "👥 Hoạt động Sinh viên"}
                            {selectedFile.activityType === "conference" &&
                              "🎤 Hội nghị / Conference"}
                            {selectedFile.activityType === "publication" &&
                              "📚 Xuất bản / Publication"}
                            {selectedFile.activityType === "project" &&
                              "💼 Dự án / Project"}
                            {selectedFile.activityType === "other" && "📋 Khác"}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Mã môn học</p>
                          <p className="font-medium text-gray-900">
                            {selectedFile.courseCode || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tên môn học</p>
                          <p className="font-medium text-gray-900">
                            {selectedFile.courseName || "--"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* QA Info */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Thông tin kiểm định
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Tiêu chuẩn QA</p>
                      <p className="font-medium text-gray-900">
                        {selectedFile.qaStandard || "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Năm học</p>
                      <p className="font-medium text-gray-900">
                        {selectedFile.academicYear || "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Học kỳ</p>
                      <p className="font-medium text-gray-900">
                        {selectedFile.semester || "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Trạng thái</p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          selectedFile.submissionStatus
                        )}`}
                      >
                        {getStatusLabel(selectedFile.submissionStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedFile.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedFile.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      Mô tả
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedFile.description}
                    </p>
                  </div>
                )}

                {/* Review Info */}
                {(selectedFile.reviewNotes || selectedFile.reviewedBy) && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Thông tin duyệt
                    </h3>
                    <div className="space-y-2">
                      {selectedFile.reviewedBy && (
                        <div>
                          <p className="text-xs text-gray-500">Người duyệt</p>
                          <p className="font-medium text-gray-900">
                            {selectedFile.reviewedBy.fullName}
                          </p>
                        </div>
                      )}
                      {selectedFile.reviewNotes && (
                        <div>
                          <p className="text-xs text-gray-500">Ghi chú</p>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedFile.reviewNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    openReviewModal(selectedFile);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Duyệt hồ sơ
                </button>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && selectedFile && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Duyệt hồ sơ</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {selectedFile.originalName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảng viên
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {selectedFile.uploader.fullName} (
                    {selectedFile.uploader.email})
                  </p>
                </div>
                {selectedFile.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      {selectedFile.description}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái mới <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="under_review">Đang duyệt</option>
                    <option value="approved">Duyệt</option>
                    <option value="rejected">Từ chối</option>
                    <option value="revision_required">Yêu cầu chỉnh sửa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Nhập ghi chú, góp ý..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setReviewModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReviewFile}
                  disabled={!reviewStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reminder Modal */}
        {reminderModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Gửi nhắc nhở cho giảng viên
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Loại gửi <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 mb-4">
                    <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 {reminderType === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}">
                      <input
                        type="radio"
                        name="reminderType"
                        value="all"
                        checked={reminderType === "all"}
                        onChange={(e) => {
                          setReminderType(e.target.value as "all");
                          setSelectedLecturers([]);
                        }}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          Gửi cho toàn bộ khoa
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Tất cả giảng viên trong khoa sẽ nhận được thông báo
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 {reminderType === 'specific' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}">
                      <input
                        type="radio"
                        name="reminderType"
                        value="specific"
                        checked={reminderType === "specific"}
                        onChange={(e) =>
                          setReminderType(e.target.value as "specific")
                        }
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          Gửi riêng từng người
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Chọn giảng viên cụ thể để gửi nhắc nhở
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {reminderType === "specific" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn giảng viên ({selectedLecturers.length} đã chọn)
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                      {lecturers.map((lecturer) => (
                        <label
                          key={lecturer._id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLecturers.includes(lecturer._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLecturers([
                                  ...selectedLecturers,
                                  lecturer._id,
                                ]);
                              } else {
                                setSelectedLecturers(
                                  selectedLecturers.filter(
                                    (id) => id !== lecturer._id
                                  )
                                );
                              }
                            }}
                            className="rounded"
                          />
                          <span>{lecturer.fullName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung nhắc nhở <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Nhập nội dung nhắc nhở..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn nộp (tùy chọn)
                  </label>
                  <input
                    type="date"
                    value={reminderDueDate}
                    onChange={(e) => setReminderDueDate(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setReminderModalOpen(false);
                    setReminderType("all");
                    setSelectedLecturers([]);
                    setReminderMessage("");
                    setReminderDueDate("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={
                    !reminderMessage ||
                    (reminderType === "specific" &&
                      selectedLecturers.length === 0)
                  }
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Gửi nhắc nhở
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentFilesPage;
