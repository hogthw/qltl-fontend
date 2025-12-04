import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface Backup {
  filename: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export default function RestorePage() {
  const navigate = useNavigate();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState<Backup | null>(null);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await api.listBackups();
      if (response.success) {
        setBackups(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
      alert("Không thể tải danh sách backup");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (backup: Backup) => {
    setBackupToRestore(backup);
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = async () => {
    if (!backupToRestore) return;

    try {
      setRestoring(true);
      const response = await api.restoreBackup(backupToRestore.filename);
      if (response.success) {
        setShowRestoreConfirm(false);
        setBackupToRestore(null);
        alert("Khôi phục database thành công! Vui lòng đăng nhập lại.");
        // Logout and redirect to login
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert(response.message || "Có lỗi xảy ra khi khôi phục");
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      alert("Không thể khôi phục database. Vui lòng kiểm tra server logs.");
    } finally {
      setRestoring(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".json")) {
        alert("Vui lòng chọn file backup định dạng .json");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadAndRestoreClick = () => {
    if (!selectedFile) {
      alert("Vui lòng chọn file backup");
      return;
    }
    setShowUploadConfirm(true);
  };

  const handleUploadAndRestoreConfirm = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const response = await api.uploadAndRestoreBackup(selectedFile);
      if (response.success) {
        setShowUploadConfirm(false);
        setSelectedFile(null);
        alert("Upload và khôi phục thành công! Vui lòng đăng nhập lại.");
        // Logout and redirect to login
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert(response.message || "Có lỗi xảy ra khi upload và khôi phục");
      }
    } catch (error) {
      console.error("Error uploading and restoring:", error);
      alert(
        "Không thể upload và khôi phục. Vui lòng kiểm tra file và thử lại."
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  Khôi phục Dữ liệu
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Restore database từ bản sao lưu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-red-600 mt-0.5 shrink-0"
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
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                ⚠️ CẢNH BÁO QUAN TRỌNG
              </h3>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                <li>Khôi phục sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại</li>
                <li>Tất cả thay đổi sau thời điểm backup sẽ BỊ MẤT</li>
                <li>Quá trình không thể HOÀN TÁC sau khi bắt đầu</li>
                <li>Bạn sẽ cần đăng nhập lại sau khi khôi phục</li>
                <li>
                  <strong>Chỉ thực hiện khi thực sự cần thiết!</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upload File Backup
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Tải lên file backup (.zip) từ máy tính để khôi phục database
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-amber-50 file:text-amber-700
                  hover:file:bg-amber-100
                  cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleUploadAndRestoreClick}
              disabled={!selectedFile || uploading}
              className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang khôi phục...</span>
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span>Upload & Khôi phục</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Existing Backups Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Khôi phục từ Backup Hiện có
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Chọn một bản backup để khôi phục
            </p>
          </div>

          {backups.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <p className="text-lg font-medium">Không có backup nào</p>
                <p className="text-sm mt-1">
                  Vui lòng tạo backup trước hoặc upload file backup
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên file
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kích thước
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.filename} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg
                              className="w-5 h-5 text-amber-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {backup.filename}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {formatFileSize(backup.size)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(backup.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRestoreClick(backup)}
                          disabled={restoring}
                          className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Khôi phục
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && backupToRestore && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ⚠️ Xác nhận khôi phục
                </h3>
              </div>
            </div>
            <div className="mb-6 space-y-2">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn khôi phục từ backup{" "}
                <span className="font-semibold">
                  {backupToRestore.filename}
                </span>
                ?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-medium">
                  Hành động này sẽ:
                </p>
                <ul className="text-sm text-red-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Xóa toàn bộ dữ liệu hiện tại</li>
                  <li>Thay thế bằng dữ liệu từ backup</li>
                  <li>Không thể hoàn tác</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRestoreConfirm(false);
                  setBackupToRestore(null);
                }}
                disabled={restoring}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={restoring}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {restoring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang khôi phục...</span>
                  </>
                ) : (
                  <span>Xác nhận khôi phục</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Restore Confirmation Modal */}
      {showUploadConfirm && selectedFile && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ⚠️ Xác nhận upload & khôi phục
                </h3>
              </div>
            </div>
            <div className="mb-6 space-y-2">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn upload và khôi phục từ file{" "}
                <span className="font-semibold">{selectedFile.name}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-medium">
                  Hành động này sẽ:
                </p>
                <ul className="text-sm text-red-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Upload file backup lên server</li>
                  <li>Xóa toàn bộ dữ liệu hiện tại</li>
                  <li>Thay thế bằng dữ liệu từ backup</li>
                  <li>Không thể hoàn tác</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadConfirm(false)}
                disabled={uploading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUploadAndRestoreConfirm}
                disabled={uploading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang upload...</span>
                  </>
                ) : (
                  <span>Xác nhận</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
