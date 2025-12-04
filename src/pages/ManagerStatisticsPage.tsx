import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface User {
  _id: string;
  email: string;
  fullName: string;
  department?: {
    _id: string;
    name: string;
  };
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

interface Department {
  _id: string;
  code: string;
  name: string;
  fileCount?: number;
  approvedCount?: number;
  completionRate?: number;
}

const ManagerStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [qaOverview, setQAOverview] = useState<QAOverview | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "departments" | "qa">(
    "overview"
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meRes, progressRes, qaRes, timelineRes, deptsRes] =
        await Promise.all([
          api.getMe(),
          api.getAdminProgress({}),
          api.getAdminQAOverview({}),
          api.getAdminTimeline({}),
          api.getAdminDepartmentStatistics(),
        ]);

      if (meRes.success) {
        setUser(meRes.data);
      }
      if (progressRes.success) {
        setProgress(progressRes.data);
      }
      if (qaRes.success) {
        setQAOverview(qaRes.data);
      }
      if (timelineRes.success) {
        setTimeline(timelineRes.data);
      }
      if (deptsRes.success) {
        setDepartments(deptsRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      submitted: "bg-blue-100 text-blue-700",
      under_review: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      revision_required: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Nháp",
      submitted: "Đã nộp",
      under_review: "Đang xét duyệt",
      approved: "Đã duyệt",
      rejected: "Bị từ chối",
      revision_required: "Cần sửa",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
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
                  Thống kê & Báo cáo
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Báo cáo tổng hợp theo tiêu chí QA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
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
                📊 Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("departments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "departments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                🏢 Theo Khoa/Phòng ban
              </button>
              <button
                onClick={() => setActiveTab("qa")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "qa"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📋 Theo tiêu chuẩn QA
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && progress && (
              <div className="space-y-6">
                {/* Progress Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        Tổng số hồ sơ
                      </span>
                      <span className="text-3xl">📄</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      {progress.total}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">
                        Đã duyệt
                      </span>
                      <span className="text-3xl">✅</span>
                    </div>
                    <p className="text-3xl font-bold text-green-900">
                      {progress.approved}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-700">
                        Đang xử lý
                      </span>
                      <span className="text-3xl">⏳</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-900">
                      {progress.submitted +
                        progress.under_review +
                        progress.revision_required}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">
                        Tỷ lệ hoàn thành
                      </span>
                      <span className="text-3xl">📊</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {progress.completionRate}%
                    </p>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Chi tiết trạng thái
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: "draft", label: "Nháp", value: progress.draft },
                      {
                        key: "submitted",
                        label: "Đã nộp",
                        value: progress.submitted,
                      },
                      {
                        key: "under_review",
                        label: "Đang xét duyệt",
                        value: progress.under_review,
                      },
                      {
                        key: "approved",
                        label: "Đã duyệt",
                        value: progress.approved,
                      },
                      {
                        key: "revision_required",
                        label: "Cần sửa",
                        value: progress.revision_required,
                      },
                      {
                        key: "rejected",
                        label: "Bị từ chối",
                        value: progress.rejected,
                      },
                    ].map((status) => (
                      <div
                        key={status.key}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              status.key
                            )}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {status.value}
                          </span>
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status.key === "approved"
                                  ? "bg-green-500"
                                  : status.key === "rejected"
                                  ? "bg-red-500"
                                  : status.key === "revision_required"
                                  ? "bg-orange-500"
                                  : status.key === "under_review"
                                  ? "bg-yellow-500"
                                  : status.key === "submitted"
                                  ? "bg-blue-500"
                                  : "bg-gray-400"
                              }`}
                              style={{
                                width: `${
                                  progress.total > 0
                                    ? (status.value / progress.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {progress.total > 0
                              ? Math.round(
                                  (status.value / progress.total) * 100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                {timeline.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Xu hướng theo thời gian
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Kỳ
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Nháp
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Đã nộp
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Đang xét
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Đã duyệt
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Cần sửa
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Từ chối
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {timeline.map((item) => (
                            <tr key={item.period} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {item.period}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-600">
                                {item.draft}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-blue-600 font-medium">
                                {item.submitted}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-yellow-600 font-medium">
                                {item.under_review}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">
                                {item.approved}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-orange-600 font-medium">
                                {item.revision_required}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-red-600 font-medium">
                                {item.rejected}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === "departments" && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khoa/Phòng ban
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số hồ sơ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departments.map((dept) => (
                        <tr key={dept._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {dept.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                              {dept.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-900">
                              {dept.approvedCount || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() =>
                                navigate(`/department-files?dept=${dept._id}`)
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QA Standards Tab */}
            {activeTab === "qa" && qaOverview && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Tổng số hồ sơ theo tiêu chuẩn QA
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Phân loại theo các tiêu chuẩn kiểm định
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-indigo-900">
                        {qaOverview.totalFiles}
                      </p>
                      <p className="text-sm text-gray-600">Tổng hồ sơ</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {qaOverview.standards.map((standard, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {standard.standard || "Chưa phân loại"}
                        </h4>
                        <span className="text-2xl">📋</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Số lượng hồ sơ:
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {standard.fileCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Tổng dung lượng:
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {(standard.totalSize / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                qaOverview.totalFiles > 0
                                  ? (standard.fileCount /
                                      qaOverview.totalFiles) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerStatisticsPage;
