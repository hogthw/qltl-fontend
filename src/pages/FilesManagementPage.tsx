import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface FileAsset {
  _id: string;
  filename: string;
  originalName: string;
  length: number;
  contentType: string;
  gridFsId: string;
  uploader: {
    _id: string;
    fullName: string;
    email: string;
  };
  departmentId?: {
    _id: string;
    code: string;
    name: string;
  };
  tags: string[];
  approved: boolean;
  approvedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  approvedAt?: string;
  downloadCount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface SystemConfig {
  maxFileSize: number;
  maxFilePerUpload: number;
  allowedFileTypes: string[];
}

export default function FilesManagementPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileAsset | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterApproved, setFilterApproved] = useState<
    "all" | "approved" | "pending"
  >("all");
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    maxFileSize: 10,
    maxFilePerUpload: 5,
    allowedFileTypes: [".pdf", ".doc", ".docx"],
  });
  const itemsPerPage = 20;

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadData, setUploadData] = useState({
    tags: "",
    description: "",
  });
  const [fileNames, setFileNames] = useState<{ [key: number]: string }>({});

  // Edit form state
  const [editData, setEditData] = useState({
    tags: [] as string[],
    description: "",
    originalName: "",
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [currentPage, filterApproved]);

  const fetchSystemConfig = async () => {
    try {
      const response = await api.getSystemConfig();
      if (response.success && response.data) {
        setSystemConfig({
          maxFileSize: response.data.maxFileSize || 10,
          maxFilePerUpload: response.data.maxFilePerUpload || 5,
          allowedFileTypes: response.data.allowedFileTypes || [
            ".pdf",
            ".doc",
            ".docx",
          ],
        });
      }
    } catch (error) {
      console.error("Failed to fetch system config:", error);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.getFiles({
        limit: itemsPerPage,
        page: currentPage,
        sort: "-createdAt",
      });

      if (response.success) {
        setFiles(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPage]);

  const handleOpenUploadModal = () => {
    setUploadFiles(null);
    setUploadData({ tags: "", description: "" });
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFiles(null);
    setUploadData({ tags: "", description: "" });
    setFileNames({});
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const existingFiles = uploadFiles ? Array.from(uploadFiles) : [];
      const allFiles = [...existingFiles, ...newFiles];

      if (allFiles.length > systemConfig.maxFilePerUpload) {
        alert(
          `Bạn chỉ có thể chọn tối đa ${systemConfig.maxFilePerUpload} file cùng lúc. Hiện tại đã có ${existingFiles.length} file.`
        );
        e.target.value = "";
        return;
      }

      // Convert array back to FileList-like object
      const dataTransfer = new DataTransfer();
      allFiles.forEach((file) => dataTransfer.items.add(file));
      setUploadFiles(dataTransfer.files);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (!uploadFiles) return;

    const filesArray = Array.from(uploadFiles);
    filesArray.splice(indexToRemove, 1);

    const newFileNames = { ...fileNames };
    delete newFileNames[indexToRemove];
    setFileNames(newFileNames);

    const dataTransfer = new DataTransfer();
    filesArray.forEach((file) => dataTransfer.items.add(file));
    setUploadFiles(dataTransfer.files);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) {
      alert("Vui lòng chọn file để upload");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        // Rename file if custom name provided
        if (fileNames[i] && fileNames[i].trim()) {
          const extension = file.name.substring(file.name.lastIndexOf("."));
          const newName = fileNames[i].trim() + extension;
          const renamedFile = new File([file], newName, { type: file.type });
          formData.append("files", renamedFile);
        } else {
          formData.append("files", file);
        }
      }
      formData.append("tags", uploadData.tags);
      formData.append("description", uploadData.description);

      const response = await api.uploadFiles(formData);
      if (response.success) {
        await fetchFiles();
        handleCloseUploadModal();
      } else {
        alert(response.message || "Có lỗi xảy ra khi upload file");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Có lỗi xảy ra khi upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEditModal = (file: FileAsset) => {
    setSelectedFile(file);
    setEditData({
      tags: [...file.tags],
      description: file.description || "",
      originalName: file.originalName,
    });
    setNewTag("");
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedFile(null);
    setEditData({ tags: [], description: "", originalName: "" });
    setNewTag("");
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData({ ...editData, tags: [...editData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditData({
      ...editData,
      tags: editData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSaving(true);
    try {
      const response = await api.updateFile(selectedFile._id, editData);
      if (response.success) {
        await fetchFiles();
        handleCloseEditModal();
      } else {
        alert(response.message || "Có lỗi xảy ra khi cập nhật file");
      }
    } catch (error) {
      console.error("Error updating file:", error);
      alert("Có lỗi xảy ra khi cập nhật file");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (file: FileAsset) => {
    try {
      const response = await api.approveFile(file._id, !file.approved);
      if (response.success) {
        await fetchFiles();
      }
    } catch (error) {
      console.error("Error approving file:", error);
    }
  };

  const handleDeleteClick = (file: FileAsset) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      const response = await api.deleteFile(fileToDelete._id);
      if (response.success) {
        await fetchFiles();
        setShowDeleteConfirm(false);
        setFileToDelete(null);
      } else {
        alert(response.message || "Có lỗi xảy ra khi xóa file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Có lỗi xảy ra khi xóa file");
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      await api.downloadFile(fileId, filename);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert("Không thể tải file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };
  
  const filteredFiles = files.filter((file) => {
    if (filterApproved === "approved" && !file.approved) return false;
    if (filterApproved === "pending" && file.approved) return false;

    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      file.originalName.toLowerCase().includes(search) ||
      file.description?.toLowerCase().includes(search) ||
      file.tags.some((tag) => tag.toLowerCase().includes(search)) ||
      file.uploader?.fullName?.toLowerCase().includes(search)

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
                  Quản lý Tài liệu
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Quản lý tài liệu và file minh chứng trong hệ thống
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenUploadModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload tài liệu</span>
            </button>
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
                  placeholder="Tìm kiếm theo tên file, mô tả, tags, người upload..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterApproved}
                onChange={(e) =>
                  setFilterApproved(
                    e.target.value as "all" | "approved" | "pending"
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
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
                    Tên file
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kích thước
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người upload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt tải
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày upload
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          Không tìm thấy tài liệu
                        </p>
                        <p className="text-sm mt-1">
                          Thử thay đổi bộ lọc hoặc upload tài liệu mới
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {file.originalName}
                            </div>
                            {file.description && (
                              <div className="text-xs text-gray-500 truncate">
                                {file.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {formatFileSize(file.length)}
                        </span>
                      </td>
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm text-gray-900">
    {file.uploader?.fullName || "Không rõ"}
  </div>
  <div className="text-xs text-gray-500">
    {file.departmentId?.name || "-"}
  </div>
</td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {file.tags.length > 0 ? (
                            file.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                          {file.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{file.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleApprove(file)}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            file.approved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {file.approved ? "Đã duyệt" : "Chờ duyệt"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {file.downloadCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleDownload(file._id, file.originalName)
                          }
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Tải xuống"
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
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(file)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Chỉnh sửa"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(file)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Upload tài liệu mới
              </h2>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">
                          Nhấn để chọn file
                        </span>{" "}
                        hoặc kéo thả vào đây
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Có thể chọn nhiều file cùng lúc (tối đa{" "}
                        {systemConfig.maxFilePerUpload} file)
                      </p>
                    </div>
                  </label>
                </div>

                {uploadFiles && uploadFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Đã chọn {uploadFiles.length} file:
                    </p>
                    {Array.from(uploadFiles).map((file, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <svg
                              className="w-5 h-5 text-blue-500 shrink-0"
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
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Xóa file"
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
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Đổi tên file (không bao gồm phần mở rộng)
                          </label>
                          <input
                            type="text"
                            value={
                              fileNames[index] ||
                              file.name.replace(/\.[^/.]+$/, "")
                            }
                            onChange={(e) => {
                              setFileNames({
                                ...fileNames,
                                [index]: e.target.value,
                              });
                            }}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                            placeholder="Nhập tên file mới..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, tags: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: minh-chứng, báo-cáo (phân cách bằng dấu phẩy)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mô tả về tài liệu..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={uploading}
                >
                  {uploading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>Upload</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedFile && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Chỉnh sửa tài liệu
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedFile.originalName}
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên file
                </label>
                <input
                  type="text"
                  value={editData.originalName}
                  onChange={(e) =>
                    setEditData({ ...editData, originalName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên file mới..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Bạn có thể đổi tên file hiển thị (bao gồm phần mở rộng)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Thêm tag mới..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editData.tags.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có tag nào</p>
                  ) : (
                    editData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mô tả về tài liệu..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={saving}
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && fileToDelete && (
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
                  Xác nhận xóa
                </h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa file{" "}
              <span className="font-semibold">{fileToDelete.originalName}</span>
              ? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFileToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
