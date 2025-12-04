import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import DashboardHeader from "../components/DashboardHeader";

interface FileItem {
  _id: string;
  filename: string;
  originalName: string;
  length: number;
  contentType: string;
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
  createdAt: string;
}

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

interface SystemConfig {
  maxFileSize: number;
  maxFilePerUpload: number;
  allowedFileTypes: string[];
}

const MyFilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    maxFileSize: 10,
    maxFilePerUpload: 5,
    allowedFileTypes: [".pdf", ".doc", ".docx"],
  });
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedFileForEdit, setSelectedFileForEdit] =
    useState<FileItem | null>(null);
  const [uploadData, setUploadData] = useState({
    tags: "",
    description: "",
    qaStandard: "",
    academicYear: "",
    semester: "",
    courseCode: "",
    activityType: "",
    originalName: "",
  });
  const [fileNames, setFileNames] = useState<{ [key: number]: string }>({});
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    qaStandard: "",
    academicYear: "",
    semester: "",
    submissionStatus: "",
  });
  const [activeTab, setActiveTab] = useState<
    "all" | "qa" | "nckh" | "approved" | "pending"
  >("all");

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

  useEffect(() => {
    fetchSystemConfig();
    fetchData();
  }, []);

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

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, myFiles]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filesRes = await api.getFiles({ limit: 100 });
      setMyFiles(filesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Vui lòng chọn file");
      return;
    }

    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach((file, index) => {
        // Rename file if custom name provided
        if (fileNames[index] && fileNames[index].trim()) {
          const extension = file.name.substring(file.name.lastIndexOf("."));
          const newName = fileNames[index].trim() + extension;
          const renamedFile = new File([file], newName, { type: file.type });
          formData.append("files", renamedFile);
        } else {
          formData.append("files", file);
        }
      });
      formData.append("tags", uploadData.tags);
      formData.append("description", uploadData.description);
      formData.append("qaStandard", uploadData.qaStandard);
      formData.append("academicYear", uploadData.academicYear);
      formData.append("semester", uploadData.semester);

      await api.uploadFiles(formData);
      setUploadModalOpen(false);
      setSelectedFiles(null);
      setFileNames({});
      setUploadData({
        tags: "",
        description: "",
        qaStandard: "",
        academicYear: "",
        semester: "",
        courseCode: "",
        activityType: "",
        originalName: "",
      });
      fetchData();
      alert("Upload file thành công");
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("Không thể upload file");
    }
  };

  const handleEditFile = async () => {
    if (!selectedFileForEdit) return;

    try {
      await api.updateFile(selectedFileForEdit._id, {
        description: uploadData.description,
        originalName:
          uploadData.originalName.trim() || selectedFileForEdit.originalName,
        tags: uploadData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      });

      setEditModalOpen(false);
      setSelectedFileForEdit(null);
      fetchData();
      alert("Cập nhật file thành công");
    } catch (error) {
      console.error("Failed to update file:", error);
      alert("Không thể cập nhật file");
    }
  };

  const openEditModal = (file: FileItem) => {
    setSelectedFileForEdit(file);
    setUploadData({
      tags: file.tags.join(", "),
      description: file.description || "",
      qaStandard: file.qaStandard || "",
      academicYear: file.academicYear || "",
      semester: file.semester || "",
      courseCode: "",
      activityType: "",
      originalName: file.originalName,
    });
    setEditModalOpen(true);
  };

  const applyFilters = () => {
    let filtered = [...myFiles];

    if (activeTab === "qa") {
      filtered = filtered.filter(
        (f) => f.qaStandard && f.qaStandard.trim() !== ""
      );
    } else if (activeTab === "nckh") {
      filtered = filtered.filter((f) =>
        f.tags.some(
          (t) =>
            t.toLowerCase().includes("nckh") ||
            t.toLowerCase().includes("nghiên cứu") ||
            t.toLowerCase().includes("seminar") ||
            t.toLowerCase().includes("hội thảo")
        )
      );
    } else if (activeTab === "approved") {
      filtered = filtered.filter((f) => f.submissionStatus === "approved");
    } else if (activeTab === "pending") {
      filtered = filtered.filter((f) =>
        ["draft", "submitted", "under_review"].includes(f.submissionStatus)
      );
    }

    if (searchFilters.keyword) {
      const keyword = searchFilters.keyword.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.originalName.toLowerCase().includes(keyword) ||
          f.description?.toLowerCase().includes(keyword) ||
          f.tags.some((t) => t.toLowerCase().includes(keyword))
      );
    }
    if (searchFilters.qaStandard) {
      filtered = filtered.filter(
        (f) => f.qaStandard === searchFilters.qaStandard
      );
    }
    if (searchFilters.academicYear) {
      filtered = filtered.filter(
        (f) => f.academicYear === searchFilters.academicYear
      );
    }
    if (searchFilters.semester) {
      filtered = filtered.filter((f) => f.semester === searchFilters.semester);
    }
    if (searchFilters.submissionStatus) {
      filtered = filtered.filter(
        (f) => f.submissionStatus === searchFilters.submissionStatus
      );
    }

    setFilteredFiles(filtered);
  };

  const handleSearch = () => {
    applyFilters();
    setSearchModalOpen(false);
  };

  const handleResetSearch = () => {
    setSearchFilters({
      keyword: "",
      qaStandard: "",
      academicYear: "",
      semester: "",
      submissionStatus: "",
    });
    setActiveTab("all");
    fetchData();
  };

  const handleExportFiles = () => {
    const csvData = [
      [
        "STT",
        "Tên file",
        "Tiêu chuẩn QA",
        "Năm học",
        "Học kỳ",
        "Trạng thái",
        "Ghi chú",
      ],
      ...filteredFiles.map((file, idx) => [
        idx + 1,
        file.originalName,
        file.qaStandard || "-",
        file.academicYear || "-",
        file.semester || "-",
        getStatusLabel(file.submissionStatus),
        file.reviewNotes || "-",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `danh-sach-ho-so-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Bạn có chắc muốn xóa file này?")) return;

    try {
      await api.deleteFile(fileId);
      fetchData();
      alert("Xóa file thành công");
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Không thể xóa file");
    }
  };

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      await api.downloadFile(fileId, filename);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert("Không thể tải file");
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

  const displayFiles =
    filteredFiles.length > 0 ||
    activeTab !== "all" ||
    Object.values(searchFilters).some((v) => v)
      ? filteredFiles
      : myFiles;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={user}
        title="Quản lý hồ sơ"
        subtitle="Upload và quản lý minh chứng cá nhân"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Actions */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại Dashboard
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center space-x-2"
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
            <span>Upload minh chứng</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Tổng hồ sơ</h3>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{myFiles.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Đã duyệt</h3>
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
              {myFiles.filter((f) => f.submissionStatus === "approved").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Đang chờ</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-600"
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
            <p className="text-3xl font-bold text-yellow-600">
              {
                myFiles.filter((f) =>
                  ["draft", "submitted", "under_review"].includes(
                    f.submissionStatus
                  )
                ).length
              }
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Yêu cầu sửa</h3>
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {
                myFiles.filter((f) =>
                  ["rejected", "revision_required"].includes(f.submissionStatus)
                ).length
              }
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bộ lọc & Tìm kiếm
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "qa"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Theo tiêu chí QA
            </button>
            <button
              onClick={() => setActiveTab("nckh")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "nckh"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              NCKH / Hoạt động
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "approved"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-yellow-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Chờ duyệt
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium flex items-center space-x-2 transition-colors"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Tìm kiếm nâng cao</span>
            </button>
            <button
              onClick={handleExportFiles}
              className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200 font-medium flex items-center space-x-2 transition-colors"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Xuất danh sách</span>
            </button>
            <button
              onClick={handleResetSearch}
              className="px-4 py-2 bg-orange-100 border border-orange-300 rounded-lg hover:bg-orange-200 font-medium flex items-center space-x-2 transition-colors"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
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
              <h2 className="text-lg font-semibold text-gray-900">
                Hồ sơ minh chứng của tôi ({displayFiles.length})
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên file
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tiêu chuẩn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Năm học / Học kỳ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phản hồi Ban QA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayFiles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Chưa có hồ sơ nào. Hãy upload minh chứng!
                    </td>
                  </tr>
                ) : (
                  displayFiles.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {(file.length / 1024).toFixed(2)} KB
                          </p>
                          {file.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {file.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {file.qaStandard || (
                          <span className="text-gray-400">Chưa phân loại</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p>{file.academicYear || "-"}</p>
                          <p className="text-gray-500">
                            {file.semester || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            file.submissionStatus
                          )}`}
                        >
                          {getStatusLabel(file.submissionStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-600">
                          {file.reviewNotes || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleDownloadFile(file._id, file.originalName)
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Tải
                          </button>
                          <button
                            onClick={() => openEditModal(file)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Xóa
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
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">📤 Upload minh chứng</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chọn file (PDF/DOCX)
                </label>
                <div className="relative">
                  <input
                    id="file-upload-myfiles"
                    type="file"
                    multiple
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files);
                        const existingFiles = selectedFiles
                          ? Array.from(selectedFiles)
                          : [];
                        const allFiles = [...existingFiles, ...newFiles];

                        if (allFiles.length > systemConfig.maxFilePerUpload) {
                          alert(
                            `Bạn chỉ có thể chọn tối đa ${systemConfig.maxFilePerUpload} file cùng lúc. Hiện tại đã có ${existingFiles.length} file.`
                          );
                          e.target.value = "";
                          return;
                        }

                        // Convert array back to FileList
                        const dataTransfer = new DataTransfer();
                        allFiles.forEach((file) =>
                          dataTransfer.items.add(file)
                        );
                        setSelectedFiles(dataTransfer.files);
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload-myfiles"
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
                        Tối đa {systemConfig.maxFilePerUpload} file, gắn với
                        tiêu chuẩn - tiêu chí kiểm định
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Đã chọn {selectedFiles.length} file:
                    </p>
                    {Array.from(selectedFiles).map((file, index) => (
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
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const filesArray = Array.from(selectedFiles);
                              filesArray.splice(index, 1);

                              const newFileNames = { ...fileNames };
                              delete newFileNames[index];
                              setFileNames(newFileNames);

                              const dataTransfer = new DataTransfer();
                              filesArray.forEach((f) =>
                                dataTransfer.items.add(f)
                              );
                              setSelectedFiles(dataTransfer.files);
                            }}
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
                <label className="block text-sm font-medium mb-1">
                  Tiêu chuẩn kiểm định QA
                </label>
                <input
                  type="text"
                  value={uploadData.qaStandard}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, qaStandard: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="VD: Tiêu chuẩn 1, Tiêu chí 1.1 hoặc Đề cương, CDR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Liên kết với môn học (Mã môn)
                </label>
                <input
                  type="text"
                  value={uploadData.courseCode}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, courseCode: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="VD: CS101, MATH203"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Loại hoạt động NCKH
                </label>
                <select
                  value={uploadData.activityType}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      activityType: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Chọn loại --</option>
                  <option value="nckh">Hồ sơ NCKH</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Hợp tác ĐN</option>
                  <option value="activity">Hoạt động SV</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Năm học
                  </label>
                  <input
                    type="text"
                    value={uploadData.academicYear}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        academicYear: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="VD: 2024-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Học kỳ
                  </label>
                  <select
                    value={uploadData.semester}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, semester: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Chọn học kỳ --</option>
                    <option value="HK1">Học kỳ 1</option>
                    <option value="HK2">Học kỳ 2</option>
                    <option value="HK3">Học kỳ 3</option>
                    <option value="FULL_YEAR">Cả năm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Thẻ tag (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, tags: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="VD: giảng dạy, nghiên cứu, nckh, seminar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Mô tả ngắn về minh chứng..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleFileUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Upload
              </button>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFiles(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedFileForEdit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">✏️ Sửa / Cập nhật hồ sơ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên file
                </label>
                <input
                  type="text"
                  value={uploadData.originalName}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      originalName: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nhập tên file mới..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Bạn có thể đổi tên file hiển thị (bao gồm phần mở rộng)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiêu chuẩn kiểm định QA
                </label>
                <input
                  type="text"
                  value={uploadData.qaStandard}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, qaStandard: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Năm học
                  </label>
                  <input
                    type="text"
                    value={uploadData.academicYear}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        academicYear: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Học kỳ
                  </label>
                  <select
                    value={uploadData.semester}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, semester: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Chọn học kỳ --</option>
                    <option value="HK1">Học kỳ 1</option>
                    <option value="HK2">Học kỳ 2</option>
                    <option value="HK3">Học kỳ 3</option>
                    <option value="FULL_YEAR">Cả năm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Thẻ tag
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, tags: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEditFile}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Lưu thay đổi
              </button>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedFileForEdit(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              🔍 Tìm kiếm minh chứng nâng cao
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Từ khóa (theo tên file, tiêu chuẩn QA, môn học, năm học)
                </label>
                <input
                  type="text"
                  value={searchFilters.keyword}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      keyword: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nhập từ khóa..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiêu chuẩn QA
                </label>
                <input
                  type="text"
                  value={searchFilters.qaStandard}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      qaStandard: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Năm học
                  </label>
                  <input
                    type="text"
                    value={searchFilters.academicYear}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        academicYear: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Học kỳ
                  </label>
                  <select
                    value={searchFilters.semester}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        semester: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Tất cả</option>
                    <option value="HK1">Học kỳ 1</option>
                    <option value="HK2">Học kỳ 2</option>
                    <option value="HK3">Học kỳ 3</option>
                    <option value="FULL_YEAR">Cả năm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Trạng thái duyệt
                </label>
                <select
                  value={searchFilters.submissionStatus}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      submissionStatus: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Tất cả</option>
                  <option value="draft">Nháp</option>
                  <option value="submitted">Đã nộp</option>
                  <option value="under_review">Đang duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                  <option value="revision_required">Yêu cầu chỉnh sửa</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tìm kiếm
              </button>
              <button
                onClick={handleResetSearch}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFilesPage;
