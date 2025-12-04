import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface ActivityLog {
  _id: string;
  actor?: {
    _id: string;
    fullName: string;
    email: string;
  };
  action: string;
  resourceType?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  status: "success" | "failure";
  message?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export default function ActivityLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const itemsPerPage = 20;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: itemsPerPage,
        page: currentPage,
        sort: "-createdAt",
      };

      if (filterAction !== "all") params.action = filterAction;
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await api.getLogs(params);

      if (response.success) {
        setLogs(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filterAction, filterStatus]);

  const handleViewDetail = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  const getActionBadge = (action: string) => {
    const actionMap: { [key: string]: { label: string; color: string } } = {
      login: { label: "Đăng nhập", color: "bg-green-100 text-green-700" },
      logout: { label: "Đăng xuất", color: "bg-gray-100 text-gray-700" },
      login_failed: {
        label: "Đăng nhập thất bại",
        color: "bg-red-100 text-red-700",
      },
      create: { label: "Tạo mới", color: "bg-blue-100 text-blue-700" },
      read: { label: "Xem", color: "bg-purple-100 text-purple-700" },
      update: { label: "Cập nhật", color: "bg-yellow-100 text-yellow-700" },
      delete: { label: "Xóa", color: "bg-red-100 text-red-700" },
      upload: { label: "Upload", color: "bg-indigo-100 text-indigo-700" },
      download: { label: "Tải xuống", color: "bg-cyan-100 text-cyan-700" },
      approve: { label: "Duyệt", color: "bg-green-100 text-green-700" },
      reject: { label: "Từ chối", color: "bg-orange-100 text-orange-700" },
    };

    const actionInfo = actionMap[action] || {
      label: action,
      color: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${actionInfo.color}`}
      >
        {actionInfo.label}
      </span>
    );
  };

  const getResourceTypeBadge = (resourceType?: string) => {
    if (!resourceType) return <span className="text-xs text-gray-400">-</span>;

    const resourceMap: { [key: string]: { label: string; color: string } } = {
      user: { label: "Người dùng", color: "bg-blue-100 text-blue-700" },
      department: { label: "Khoa/Phòng", color: "bg-green-100 text-green-700" },
      file: { label: "Tài liệu", color: "bg-purple-100 text-purple-700" },
      announcement: {
        label: "Thông báo",
        color: "bg-orange-100 text-orange-700",
      },
      config: { label: "Cấu hình", color: "bg-red-100 text-red-700" },
      system: { label: "Hệ thống", color: "bg-gray-100 text-gray-700" },
    };

    const resourceInfo = resourceMap[resourceType] || {
      label: resourceType,
      color: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${resourceInfo.color}`}
      >
        {resourceInfo.label}
      </span>
    );
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.actor?.fullName.toLowerCase().includes(search) ||
      log.actor?.email.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search) ||
      log.resourceType?.toLowerCase().includes(search) ||
      log.message?.toLowerCase().includes(search) ||
      log.ip?.toLowerCase().includes(search)
    );
  });

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (loading && currentPage === 1) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
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
                  Nhật ký Hoạt động
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Xem lịch sử hoạt động và theo dõi hành động trong hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo người dùng, hành động, IP..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả hành động</option>
                <option value="login">Đăng nhập</option>
                <option value="logout">Đăng xuất</option>
                <option value="create">Tạo mới</option>
                <option value="update">Cập nhật</option>
                <option value="delete">Xóa</option>
                <option value="upload">Upload</option>
                <option value="download">Tải xuống</option>
                <option value="approve">Duyệt</option>
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="success">Thành công</option>
                <option value="failure">Thất bại</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đối tượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg
                          className="w-12 h-12 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          Không tìm thấy nhật ký
                        </p>
                        <p className="text-sm mt-1">
                          Thử thay đổi bộ lọc hoặc tìm kiếm
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.actor ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.actor.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.actor.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Hệ thống
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getResourceTypeBadge(log.resourceType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.status === "success" ? "Thành công" : "Thất bại"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">
                          {log.ip || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(log)}
                          className="text-blue-600 hover:text-blue-900"
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {renderPagination()}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Chi tiết Nhật ký
                </h2>
                <button
                  onClick={handleCloseDetailModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
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
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người dùng
                  </label>
                  {selectedLog.actor ? (
                    <div>
                      <p className="text-sm text-gray-900">
                        {selectedLog.actor.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedLog.actor.email}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Hệ thống</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hành động
                  </label>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đối tượng
                  </label>
                  <div>{getResourceTypeBadge(selectedLog.resourceType)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedLog.status === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedLog.status === "success"
                      ? "Thành công"
                      : "Thất bại"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedLog.ip || "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian
                  </label>
                  <div>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedLog.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedLog.createdAt).toLocaleTimeString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>

                {selectedLog.resourceId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource ID
                    </label>
                    <p className="text-sm text-gray-900 font-mono break-all">
                      {selectedLog.resourceId}
                    </p>
                  </div>
                )}
              </div>

              {selectedLog.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thông điệp
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedLog.message}
                  </p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Agent
                  </label>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg break-all font-mono">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}

              {selectedLog.metadata &&
                Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Metadata
                    </label>
                    <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handleCloseDetailModal}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
