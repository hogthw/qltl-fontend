import React, { useEffect, useState, useCallback } from "react";
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

interface ProgressStats {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
  revision_required: number;
  completionRate: number;
}

interface QAOverview {
  totalFiles: number;
  standards: Array<{
    standard: string;
    fileCount: number;
    totalSize: number;
  }>;
}

interface TimelineData {
  period: string;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
  revision_required: number;
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

interface TeamGroup {
  _id: string;
  name: string;
  lecturerCount: number;
}

interface Standard {
  _id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  criteriaCount: number;
  isActive: boolean;
}

interface Criterion {
  _id: string;
  code: string;
  name: string;
  description: string;
  standardId: string | { _id: string; code: string; name: string };
}

const DepartmentHeadDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [qaOverview, setQAOverview] = useState<QAOverview | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("dashboardActiveTab") || "overview";
  });
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null);

  // Lưu trạng thái tab vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("dashboardActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const userResponse = await api.getMe();
        if (userResponse.success) {
          setUser(userResponse.data);
        } else {
          navigate("/login");
          return;
        }
      } catch {
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};

      const [progressRes, qaRes, timelineRes, standardsRes] = await Promise.all(
        [
          api.getDepartmentProgress(params),
          api.getDepartmentQAOverview(params),
          api.getDepartmentTimeline(params),
          api.getStandards({ pageSize: 100 }),
        ]
      );

      if (progressRes.success) setProgress(progressRes.data);
      if (qaRes.success) setQAOverview(qaRes.data);
      if (timelineRes.success) setTimeline(timelineRes.data);

      if (standardsRes.success) {
        setStandards(standardsRes.data.standards);

        // Load criteria for all standards
        const allCriteria: Criterion[] = [];
        for (const standard of standardsRes.data.standards) {
          const criteriaRes = await api.getCriteriaByStandard(standard._id, {
            pageSize: 100,
          });
          if (criteriaRes.success) {
            allCriteria.push(...criteriaRes.data.criteria);
          }
        }
        setCriteria(allCriteria);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCriteriaForStandard = (standardId: string) => {
    return criteria.filter((c) => {
      // Handle both string and object standardId
      const criterionStandardId =
        typeof c.standardId === "string" ? c.standardId : c.standardId?._id;
      return criterionStandardId === standardId;
    });
  };

  const getIconForColor = (color: string): string => {
    const iconMap: Record<string, string> = {
      blue: "📘",
      green: "📗",
      purple: "📕",
      orange: "📙",
      red: "📕",
      indigo: "📔",
    };
    return iconMap[color] || "📚";
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
      <DashboardHeader
        user={user}
        title="Dashboard Trưởng Bộ môn"
        subtitle="Quản lý hồ sơ và tiến độ bộ môn"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Xin chào, {user?.fullName} 👋
          </h2>
          <p className="text-gray-600">
            Chào mừng bạn đến với trang quản lý bộ môn
          </p>
        </div>

        {/* Statistics Cards */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
              <p className="text-gray-600 text-sm font-medium mb-1">
                Tổng số hồ sơ
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {progress.total}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
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
              <p className="text-gray-600 text-sm font-medium mb-1">Đã duyệt</p>
              <p className="text-3xl font-bold text-green-600">
                {progress.approved}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Chưa duyệt
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {progress.submitted +
                  progress.under_review +
                  progress.rejected +
                  progress.revision_required}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Tỷ lệ hoàn thành
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {progress.completionRate}%
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "actions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Hoạt động nhanh
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* QA Standards Overview from Database */}
                {standards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Danh sách tiêu chuẩn ĐBCLGD ({standards.length} Tiêu
                      chuẩn, {criteria.length} Tiêu chí)
                    </h3>
                    <div className="space-y-2">
                      {standards.map((standard) => {
                        const standardCriteria = getCriteriaForStandard(
                          standard._id
                        );
                        const colorClasses: Record<
                          string,
                          { bg: string; text: string }
                        > = {
                          blue: { bg: "bg-blue-100", text: "text-blue-600" },
                          green: { bg: "bg-green-100", text: "text-green-600" },
                          purple: {
                            bg: "bg-purple-100",
                            text: "text-purple-600",
                          },
                          orange: {
                            bg: "bg-orange-100",
                            text: "text-orange-600",
                          },
                          red: { bg: "bg-red-100", text: "text-red-600" },
                          indigo: {
                            bg: "bg-indigo-100",
                            text: "text-indigo-600",
                          },
                        };
                        const colors =
                          colorClasses[standard.color] || colorClasses.blue;

                        return (
                          <div
                            key={standard._id}
                            className="border border-gray-200 rounded-lg"
                          >
                            <button
                              onClick={() =>
                                setExpandedStandard(
                                  expandedStandard === standard._id
                                    ? null
                                    : standard._id
                                )
                              }
                              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}
                                >
                                  <span className="text-2xl">
                                    {getIconForColor(standard.color)}
                                  </span>
                                </div>
                                <div className="text-left">
                                  <h4 className="font-semibold text-gray-900">
                                    {standard.code}: {standard.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {standard.description}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {standardCriteria.length} tiêu chí
                                  </p>
                                </div>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${
                                  expandedStandard === standard._id
                                    ? "rotate-180"
                                    : ""
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
                            </button>
                            {expandedStandard === standard._id &&
                              standardCriteria.length > 0 && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                  <div className="grid grid-cols-1 gap-3">
                                    {standardCriteria.map((criterion) => (
                                      <div
                                        key={criterion._id}
                                        className="p-3 bg-white rounded border border-gray-200"
                                      >
                                        <p className="text-sm font-medium text-gray-900 break-words">
                                          {criterion.code}: {criterion.name}
                                        </p>
                                        {criterion.description && (
                                          <p className="text-xs text-gray-500 mt-1 break-words">
                                            {criterion.description}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Timeline Chart */}
                {timeline.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tiến độ theo thời gian
                    </h3>
                    <div className="space-y-3">
                      {timeline.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="text-sm font-medium w-24 text-gray-700">
                            {item.period}
                          </span>
                          <div className="flex-1 flex gap-1 bg-gray-100 rounded-full overflow-hidden h-8">
                            {item.approved > 0 && (
                              <div
                                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{
                                  width: `${
                                    (item.approved /
                                      (item.approved +
                                        item.submitted +
                                        item.under_review +
                                        item.draft || 1)) *
                                    100
                                  }%`,
                                }}
                                title={`Đã duyệt: ${item.approved}`}
                              >
                                {item.approved > 0 && item.approved}
                              </div>
                            )}
                            {item.under_review > 0 && (
                              <div
                                className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{
                                  width: `${
                                    (item.under_review /
                                      (item.approved +
                                        item.submitted +
                                        item.under_review +
                                        item.draft || 1)) *
                                    100
                                  }%`,
                                }}
                                title={`Đang duyệt: ${item.under_review}`}
                              >
                                {item.under_review > 0 && item.under_review}
                              </div>
                            )}
                            {item.submitted > 0 && (
                              <div
                                className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{
                                  width: `${
                                    (item.submitted /
                                      (item.approved +
                                        item.submitted +
                                        item.under_review +
                                        item.draft || 1)) *
                                    100
                                  }%`,
                                }}
                                title={`Đã nộp: ${item.submitted}`}
                              >
                                {item.submitted > 0 && item.submitted}
                              </div>
                            )}
                            {item.draft > 0 && (
                              <div
                                className="bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-medium"
                                style={{
                                  width: `${
                                    (item.draft /
                                      (item.approved +
                                        item.submitted +
                                        item.under_review +
                                        item.draft || 1)) *
                                    100
                                  }%`,
                                }}
                                title={`Nháp: ${item.draft}`}
                              >
                                {item.draft > 0 && item.draft}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions Tab */}
            {activeTab === "actions" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/department-files")}
                  className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    Quản lý hồ sơ
                  </h4>
                  <p className="text-sm text-gray-600">
                    Duyệt và quản lý hồ sơ minh chứng
                  </p>
                </button>

                <button
                  onClick={() => navigate("/announcements")}
                  className="p-6 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors group"
                >
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    Gửi thông báo
                  </h4>
                  <p className="text-sm text-gray-600">
                    Gửi thông báo cho giảng viên trong bộ môn
                  </p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeadDashboard;
