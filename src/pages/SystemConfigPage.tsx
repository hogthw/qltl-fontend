import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface SystemConfig {
  maxFileSize: number; // in MB
  maxFilePerUpload: number; // số file tối đa mỗi lần upload
  allowedFileTypes: string[];
  storagePath: string;
  maxStoragePerUser: number; // in GB
  maxStorageMB: number; // tổng dung lượng hệ thống (MB)
  enableFileCompression: boolean;
  autoDeleteAfterDays: number;
}

export default function SystemConfigPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({
    maxFileSize: 10,
    maxFilePerUpload: 5,
    allowedFileTypes: [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
    ],
    storagePath: "/uploads",
    maxStoragePerUser: 5,
    maxStorageMB: 1000,
    enableFileCompression: true,
    autoDeleteAfterDays: 365,
  });
  const [newFileType, setNewFileType] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getSystemConfig();
      if (response.success && response.data) {
        // Ensure allowedFileTypes is an array
        const configData = {
          ...response.data,
          allowedFileTypes: Array.isArray(response.data.allowedFileTypes)
            ? response.data.allowedFileTypes
            : [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"],
        };
        setConfig(configData);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
      setError("Không thể tải cấu hình hệ thống");
      // Keep default config on error
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await api.updateSystemConfig(config);

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(response.message || "Không thể lưu cấu hình");
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      setError("Đã xảy ra lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFileType = () => {
    if (newFileType && !config.allowedFileTypes.includes(newFileType)) {
      setConfig({
        ...config,
        allowedFileTypes: [...config.allowedFileTypes, newFileType],
      });
      setNewFileType("");
    }
  };

  const handleRemoveFileType = (fileType: string) => {
    setConfig({
      ...config,
      allowedFileTypes: config.allowedFileTypes.filter(
        (type) => type !== fileType
      ),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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
                  Cấu hình hệ thống
                </h1>
                <p className="text-sm text-gray-500">
                  Quản lý giới hạn file, dung lượng và thư mục lưu trữ
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
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
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  <span>Lưu cấu hình</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
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
            <span>Lưu cấu hình thành công!</span>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              <svg
                className="w-4 h-4"
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
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Size Limits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Giới hạn dung lượng file
                </h2>
                <p className="text-sm text-gray-500">
                  Kích thước tối đa cho mỗi file tải lên
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích thước tối đa (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.maxFileSize}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxFileSize: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Từ 1 MB đến 100 MB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dung lượng tối đa mỗi người dùng (GB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.maxStoragePerUser}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxStoragePerUser: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tổng dung lượng lưu trữ cho mỗi người dùng
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số file tối đa mỗi lần upload
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.maxFilePerUpload}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxFilePerUpload: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Giới hạn số lượng file có thể upload cùng lúc (từ 1 đến 20)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng dung lượng hệ thống (MB)
                </label>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  value={config.maxStorageMB}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxStorageMB: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Dung lượng lưu trữ tổng của toàn hệ thống (100 MB - 100 GB)
                </p>
              </div>
            </div>
          </div>

          {/* Storage Path */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Thư mục lưu trữ
                </h2>
                <p className="text-sm text-gray-500">
                  Đường dẫn lưu trữ file trên server
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đường dẫn thư mục
                </label>
                <input
                  type="text"
                  value={config.storagePath}
                  onChange={(e) =>
                    setConfig({ ...config, storagePath: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder="/uploads"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Đường dẫn tương đối hoặc tuyệt đối
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tự động xóa file sau (ngày)
                </label>
                <input
                  type="number"
                  min="30"
                  max="1825"
                  value={config.autoDeleteAfterDays}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      autoDeleteAfterDays: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  0 = không tự động xóa (từ 30 đến 1825 ngày)
                </p>
              </div>
            </div>
          </div>

          {/* Allowed File Types */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Loại file được phép
                </h2>
                <p className="text-sm text-gray-500">
                  Các định dạng file được phép tải lên hệ thống
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddFileType();
                    }
                  }}
                  placeholder="Nhập đuôi file (vd: .pdf)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddFileType}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Thêm
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {config.allowedFileTypes.map((fileType) => (
                  <div
                    key={fileType}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg"
                  >
                    <span className="font-mono text-sm">{fileType}</span>
                    <button
                      onClick={() => handleRemoveFileType(fileType)}
                      className="p-0.5 hover:bg-green-200 rounded transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                ))}
              </div>

              {config.allowedFileTypes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p>Chưa có loại file nào được cấu hình</p>
                  <p className="text-sm">Thêm đuôi file để cho phép tải lên</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
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
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Cài đặt bổ sung
                </h2>
                <p className="text-sm text-gray-500">
                  Các tùy chọn nâng cao khác
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Nén file tự động
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tự động nén file để tiết kiệm dung lượng
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfig({
                      ...config,
                      enableFileCompression: !config.enableFileCompression,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enableFileCompression ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enableFileCompression
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Lưu ý quan trọng</h3>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Thay đổi cấu hình sẽ ảnh hưởng đến toàn bộ hệ thống</li>
                <li>• Đảm bảo thư mục lưu trữ có đủ quyền ghi</li>
                <li>
                  • File đã tải lên không bị ảnh hưởng bởi thay đổi giới hạn mới
                </li>
                <li>
                  • Nên backup dữ liệu trước khi thay đổi cấu hình quan trọng
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
