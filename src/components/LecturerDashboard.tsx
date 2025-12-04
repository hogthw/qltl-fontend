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
  courseCode?: string;
  courseName?: string;
  activityType?: string;
  academicYear?: string;
  semester?: string;
  submissionStatus: string;
  reviewNotes?: string;
  createdAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdBy: {
    fullName: string;
  };
  createdAt: string;
  isActive: boolean;
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

interface Standard {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface Criterion {
  _id: string;
  code: string;
  name: string;
  standardId: string;
  isActive: boolean;
}

const LecturerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    maxFileSize: 10,
    maxFilePerUpload: 5,
    allowedFileTypes: [".pdf", ".doc", ".docx"],
  });
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFileForDetail, setSelectedFileForDetail] =
    useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedFileForEdit, setSelectedFileForEdit] =
    useState<FileItem | null>(null);
  const [fileNames, setFileNames] = useState<{ [key: number]: string }>({});
  const [uploadData, setUploadData] = useState({
    tags: "",
    description: "",
    qaStandard: "",
    courseCode: "",
    courseName: "",
    activityType: "",
    academicYear: "",
    semester: "",
    originalName: "",
    submissionStatus: "draft",
  });
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    activityType: "",
    qaStandard: "",
    courseCode: "",
    courseName: "",
    academicYear: "",
    semester: "",
    submissionStatus: "",
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("lecturerDashboardActiveTab") || "overview";
  });
  const [fileTab, setFileTab] = useState<
    "all" | "qa" | "nckh" | "approved" | "pending"
  >("all");

  useEffect(() => {
    localStorage.setItem("lecturerDashboardActiveTab", activeTab);
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileTab, myFiles]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [filesRes, announcementsRes, configRes, standardsRes, criteriaRes] =
        await Promise.all([
          api.getFiles({ limit: 100 }),
          api.getAnnouncements({ limit: 10, sort: "-createdAt" }),
          api.getSystemConfig(),
          api.getStandards({ pageSize: 100, isActive: true }),
          api.getCriteria({ pageSize: 500, isActive: true }),
        ]);

      setMyFiles(filesRes.data || []);
      setAnnouncements(announcementsRes.data || []);

      if (configRes.success && configRes.data) {
        setSystemConfig({
          maxFileSize: configRes.data.maxFileSize || 10,
          maxFilePerUpload: configRes.data.maxFilePerUpload || 5,
          allowedFileTypes: configRes.data.allowedFileTypes || [
            ".pdf",
            ".doc",
            ".docx",
          ],
        });
      }

      if (standardsRes.success && standardsRes.data?.standards) {
        setStandards(standardsRes.data.standards);
      }

      if (criteriaRes.success && criteriaRes.data?.criteria) {
        setCriteria(criteriaRes.data.criteria);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...myFiles];

    if (fileTab === "qa") {
      filtered = filtered.filter(
        (f) => f.qaStandard && f.qaStandard.trim() !== ""
      );
    } else if (fileTab === "nckh") {
      filtered = filtered.filter((f) =>
        f.tags.some(
          (t) =>
            t.toLowerCase().includes("nckh") ||
            t.toLowerCase().includes("nghiên cứu") ||
            t.toLowerCase().includes("seminar") ||
            t.toLowerCase().includes("hội thảo")
        )
      );
    } else if (fileTab === "approved") {
      filtered = filtered.filter((f) => f.submissionStatus === "approved");
    } else if (fileTab === "pending") {
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
    if (searchFilters.activityType) {
      filtered = filtered.filter(
        (f) => f.activityType === searchFilters.activityType
      );
    }
    if (searchFilters.qaStandard) {
      filtered = filtered.filter(
        (f) =>
          f.qaStandard &&
          f.qaStandard
            .toLowerCase()
            .includes(searchFilters.qaStandard.toLowerCase())
      );
    }
    if (searchFilters.courseCode) {
      filtered = filtered.filter(
        (f) =>
          f.courseCode &&
          f.courseCode
            .toLowerCase()
            .includes(searchFilters.courseCode.toLowerCase())
      );
    }
    if (searchFilters.courseName) {
      filtered = filtered.filter(
        (f) =>
          f.courseName &&
          f.courseName
            .toLowerCase()
            .includes(searchFilters.courseName.toLowerCase())
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

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Vui lòng chọn file");
      return;
    }

    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach((file, index) => {
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
      formData.append("courseCode", uploadData.courseCode);
      formData.append("courseName", uploadData.courseName);
      formData.append("activityType", uploadData.activityType);
      formData.append("academicYear", uploadData.academicYear);
      formData.append("semester", uploadData.semester);
      formData.append("submissionStatus", uploadData.submissionStatus);

      await api.uploadFiles(formData);
      setUploadModalOpen(false);
      setSelectedFiles(null);
      setFileNames({});
      setUploadData({
        tags: "",
        description: "",
        qaStandard: "",
        courseCode: "",
        courseName: "",
        activityType: "",
        academicYear: "",
        semester: "",
        originalName: "",
        submissionStatus: "draft",
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
        qaStandard: uploadData.qaStandard,
        courseCode: uploadData.courseCode,
        courseName: uploadData.courseName,
        activityType: uploadData.activityType,
        academicYear: uploadData.academicYear,
        semester: uploadData.semester,
        submissionStatus: uploadData.submissionStatus,
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
      courseCode: file.courseCode || "",
      courseName: file.courseName || "",
      activityType: file.activityType || "",
      academicYear: file.academicYear || "",
      semester: file.semester || "",
      originalName: file.originalName,
      submissionStatus: file.submissionStatus || "draft",
    });
    setEditModalOpen(true);
  };

  const openDetailModal = (file: FileItem) => {
    setSelectedFileForDetail(file);
    setDetailModalOpen(true);
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

  const handleSearch = () => {
    applyFilters();
    setSearchModalOpen(false);
  };

  const handleResetSearch = () => {
    setSearchFilters({
      keyword: "",
      activityType: "",
      qaStandard: "",
      courseCode: "",
      courseName: "",
      academicYear: "",
      semester: "",
      submissionStatus: "",
    });
    setFileTab("all");
    applyFilters();
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
      under_review: "Đang xét",
      approved: "Đã duyệt",
      rejected: "Từ chối",
      revision_required: "Yêu cầu sửa",
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

  const approvedCount = myFiles.filter(
    (f) => f.submissionStatus === "approved"
  ).length;
  const pendingCount = myFiles.filter(
    (f) => f.submissionStatus != "draft" && f.submissionStatus !== "approved"
  ).length;
  const rejectedCount = myFiles.filter((f) =>
    ["rejected", "revision_required"].includes(f.submissionStatus)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={user}
        title="Dashboard Giảng viên"
        subtitle="Quản lý hồ sơ minh chứng cá nhân"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Xin chào, {user?.fullName} 👋
              </h2>
              <p className="text-gray-600">
                Chào mừng bạn đến với trang quản lý hồ sơ cá nhân
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
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
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
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
            <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
          </div>
        </div>

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
                onClick={() => setActiveTab("files")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "files"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Hồ sơ
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Announcements */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
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
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông báo hệ thống & Hạn nộp
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {announcements.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p>Không có thông báo mới</p>
                      </div>
                    ) : (
                      announcements.slice(0, 5).map((announcement) => (
                        <div
                          key={announcement._id}
                          className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg pl-4 pr-4 py-3"
                        >
                          <h3 className="font-semibold text-gray-900">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">
                            {announcement.content}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString("vi-VN")}
                            <span className="mx-2">•</span>
                            <svg
                              className="w-4 h-4 mr-1"
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
                            {announcement.createdBy.fullName}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === "files" && (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFileTab("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        fileTab === "all"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setFileTab("approved")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        fileTab === "approved"
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Đã duyệt
                    </button>
                    <button
                      onClick={() => setFileTab("pending")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        fileTab === "pending"
                          ? "bg-yellow-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Chờ duyệt
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setUploadModalOpen(true)}
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Upload minh chứng</span>
                    </button>
                    <button
                      onClick={() => setSearchModalOpen(true)}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium flex items-center space-x-2"
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
                      <span>Tìm kiếm</span>
                    </button>
                    {(searchFilters.keyword ||
                      searchFilters.activityType ||
                      searchFilters.qaStandard ||
                      searchFilters.courseCode ||
                      searchFilters.courseName ||
                      searchFilters.academicYear ||
                      searchFilters.semester ||
                      searchFilters.submissionStatus) && (
                      <button
                        onClick={handleResetSearch}
                        className="px-4 py-2 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 font-medium flex items-center space-x-2 text-red-700"
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
                        <span>Xóa bộ lọc</span>
                      </button>
                    )}
                    <button
                      onClick={handleExportFiles}
                      className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200 font-medium"
                    >
                      Xuất CSV
                    </button>
                  </div>
                </div>

                {/* Files Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                            Năm học / HK
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Trạng thái
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Phản hồi
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredFiles.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-12 text-center text-gray-500"
                            >
                              <svg
                                className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
                              <p className="font-medium mb-1">
                                Chưa có hồ sơ nào
                              </p>
                              <p className="text-sm">
                                Nhấn "Upload minh chứng" để bắt đầu nộp hồ sơ
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredFiles.map((file) => (
                            <tr key={file._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {file.originalName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(file.length / 1024).toFixed(2)} KB
                                  </p>
                                  {file.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                      {file.tags.slice(0, 3).map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {file.tags.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                          +{file.tags.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {file.qaStandard || (
                                  <span className="text-gray-400">
                                    Chưa phân loại
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm">
                                  <p className="text-gray-900">
                                    {file.academicYear || "-"}
                                  </p>
                                  <p className="text-gray-500 text-xs">
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
                                  {file.reviewNotes &&
                                  file.reviewNotes.length > 50
                                    ? `${file.reviewNotes.substring(0, 50)}...`
                                    : file.reviewNotes || "-"}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openDetailModal(file)}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
                                    onClick={() =>
                                      handleDownloadFile(
                                        file._id,
                                        file.originalName
                                      )
                                    }
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                                    onClick={() => openEditModal(file)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                                    onClick={() => handleDeleteFile(file._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-blue-600"
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
                Upload minh chứng
              </h2>
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
                  <select
                    value={uploadData.qaStandard}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        qaStandard: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn tiêu chuẩn/tiêu chí --</option>
                    {standards.map((standard) => (
                      <React.Fragment key={standard._id}>
                        <option value={standard.code}>
                          {standard.code}: {standard.name}
                        </option>
                        {criteria
                          .filter((c) => c.standardId === standard._id)
                          .map((criterion) => (
                            <option
                              key={criterion._id}
                              value={`${standard.code}.${criterion.code}`}
                            >
                              {standard.code}.{criterion.code}: {criterion.name}
                            </option>
                          ))}
                      </React.Fragment>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mã môn học
                    </label>
                    <input
                      type="text"
                      value={uploadData.courseCode}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          courseCode: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: IT001, CS101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên môn học
                    </label>
                    <input
                      type="text"
                      value={uploadData.courseName}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          courseName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Lập trình căn bản"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Loại hoạt động / Minh chứng
                  </label>
                  <select
                    value={uploadData.activityType}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        activityType: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn loại hoạt động --</option>
                    <option value="teaching">
                      🎓 Giảng dạy (Đề cương, Giáo trình, Bài giảng)
                    </option>
                    <option value="research">
                      🔬 NCKH (Nghiên cứu khoa học)
                    </option>
                    <option value="seminar">📢 Hội thảo / Seminar</option>
                    <option value="business_cooperation">
                      🤝 Hợp tác Doanh nghiệp
                    </option>
                    <option value="student_activity">
                      👥 Hoạt động Sinh viên
                    </option>
                    <option value="conference">🎤 Hội nghị / Báo cáo</option>
                    <option value="publication">📄 Công bố / Bài báo</option>
                    <option value="project">📁 Dự án / Đề tài</option>
                    <option value="other">📌 Khác</option>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2024-2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Học kỳ
                    </label>
                    <select
                      value={uploadData.semester}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          semester: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Trạng thái
                  </label>
                  <select
                    value={uploadData.submissionStatus}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        submissionStatus: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Nháp</option>
                    <option value="submitted">Đã nộp</option>
                  </select>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: giảng dạy, nghiên cứu, seminar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Mô tả ngắn về minh chứng..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleFileUpload}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Upload
                </button>
                <button
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedFiles(null);
                    setFileNames({});
                    setUploadData({
                      tags: "",
                      description: "",
                      qaStandard: "",
                      courseCode: "",
                      courseName: "",
                      activityType: "",
                      academicYear: "",
                      semester: "",
                      originalName: "",
                      submissionStatus: "draft",
                    });
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && selectedFileForEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">✏️ Chỉnh sửa hồ sơ</h2>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tiêu chuẩn QA
                  </label>
                  <select
                    value={uploadData.qaStandard}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        qaStandard: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn tiêu chuẩn/tiêu chí --</option>
                    {standards.map((standard) => (
                      <React.Fragment key={standard._id}>
                        <option value={standard.code}>
                          {standard.code}: {standard.name}
                        </option>
                        {criteria
                          .filter((c) => c.standardId === standard._id)
                          .map((criterion) => (
                            <option
                              key={criterion._id}
                              value={`${standard.code}.${criterion.code}`}
                            >
                              {standard.code}.{criterion.code}: {criterion.name}
                            </option>
                          ))}
                      </React.Fragment>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mã môn học
                    </label>
                    <input
                      type="text"
                      value={uploadData.courseCode}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          courseCode: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: IT001, CS101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên môn học
                    </label>
                    <input
                      type="text"
                      value={uploadData.courseName}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          courseName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Lập trình căn bản"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Loại hoạt động / Minh chứng
                  </label>
                  <select
                    value={uploadData.activityType}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        activityType: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn loại hoạt động --</option>
                    <option value="teaching">
                      🎓 Giảng dạy (Đề cương, Giáo trình, Bài giảng)
                    </option>
                    <option value="research">
                      🔬 NCKH (Nghiên cứu khoa học)
                    </option>
                    <option value="seminar">📢 Hội thảo / Seminar</option>
                    <option value="business_cooperation">
                      🤝 Hợp tác Doanh nghiệp
                    </option>
                    <option value="student_activity">
                      👥 Hoạt động Sinh viên
                    </option>
                    <option value="conference">🎤 Hội nghị / Báo cáo</option>
                    <option value="publication">📄 Công bố / Bài báo</option>
                    <option value="project">📁 Dự án / Đề tài</option>
                    <option value="other">📌 Khác</option>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Học kỳ
                    </label>
                    <select
                      value={uploadData.semester}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          semester: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Trạng thái
                  </label>
                  <select
                    value={uploadData.submissionStatus}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        submissionStatus: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Nháp</option>
                    <option value="submitted">Đã nộp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, tags: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditFile}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedFileForEdit(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {detailModalOpen && selectedFileForDetail && (
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
                    setSelectedFileForDetail(null);
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
                      className="w-5 h-5 mr-2 text-blue-600"
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
                      <p className="text-sm text-gray-600 mb-1">Tên file:</p>
                      <p className="font-medium text-gray-900">
                        {selectedFileForDetail.originalName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kích thước:</p>
                      <p className="font-medium text-gray-900">
                        {(selectedFileForDetail.length / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Loại file:</p>
                      <p className="font-medium text-gray-900">
                        {selectedFileForDetail.contentType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ngày tạo:</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          selectedFileForDetail.createdAt
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                {(selectedFileForDetail.courseCode ||
                  selectedFileForDetail.courseName ||
                  selectedFileForDetail.activityType) && (
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
                      {selectedFileForDetail.activityType && (
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="text-xs text-gray-500 mb-1">
                            Loại hoạt động / Minh chứng
                          </p>
                          <p className="font-semibold text-gray-900 text-base">
                            {selectedFileForDetail.activityType ===
                              "teaching" &&
                              "🎓 Giảng dạy (Đề cương, Giáo trình, Bài giảng)"}
                            {selectedFileForDetail.activityType ===
                              "research" && "🔬 NCKH (Nghiên cứu khoa học)"}
                            {selectedFileForDetail.activityType === "seminar" &&
                              "📢 Hội thảo / Seminar"}
                            {selectedFileForDetail.activityType ===
                              "business_cooperation" &&
                              "🤝 Hợp tác Doanh nghiệp"}
                            {selectedFileForDetail.activityType ===
                              "student_activity" && "👥 Hoạt động Sinh viên"}
                            {selectedFileForDetail.activityType ===
                              "conference" && "🎤 Hội nghị / Báo cáo"}
                            {selectedFileForDetail.activityType ===
                              "publication" && "📄 Công bố / Bài báo"}
                            {selectedFileForDetail.activityType === "project" &&
                              "📁 Dự án / Đề tài"}
                            {selectedFileForDetail.activityType === "other" &&
                              "📌 Khác"}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Mã môn học:
                          </p>
                          <p className="font-medium text-gray-900">
                            {selectedFileForDetail.courseCode || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Tên môn học:
                          </p>
                          <p className="font-medium text-gray-900">
                            {selectedFileForDetail.courseName || "--"}
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
                      <p className="text-sm text-gray-600 mb-1">
                        Tiêu chuẩn QA:
                      </p>
                      <p className="font-medium text-gray-900">
                        {selectedFileForDetail.qaStandard || (
                          <span className="text-gray-400">Chưa phân loại</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Năm học:</p>
                      <p className="font-medium text-gray-900">
                        {selectedFileForDetail.academicYear || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Học kỳ:</p>
                      <p className="font-medium text-gray-900">
                        {selectedFileForDetail.semester || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Trạng thái:</p>
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                          selectedFileForDetail.submissionStatus
                        )}`}
                      >
                        {getStatusLabel(selectedFileForDetail.submissionStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedFileForDetail.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFileForDetail.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedFileForDetail.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-600"
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
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                      {selectedFileForDetail.description}
                    </p>
                  </div>
                )}

                {/* Review Info */}
                {(selectedFileForDetail.approvedBy ||
                  selectedFileForDetail.reviewNotes) && (
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Thông tin duyệt
                    </h3>
                    <div className="space-y-3">
                      {selectedFileForDetail.approvedBy && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Người duyệt:
                          </p>
                          <p className="font-medium text-gray-900">
                            {selectedFileForDetail.approvedBy.fullName}
                          </p>
                        </div>
                      )}
                      {selectedFileForDetail.reviewNotes && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Phản hồi:
                          </p>
                          <p className="text-gray-700 bg-white rounded p-3">
                            {selectedFileForDetail.reviewNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() =>
                    handleDownloadFile(
                      selectedFileForDetail._id,
                      selectedFileForDetail.originalName
                    )
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Tải xuống
                </button>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    openEditModal(selectedFileForDetail);
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedFileForDetail(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Modal */}
        {searchModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">🔍 Tìm kiếm nâng cao</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Từ khóa
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tìm trong tên file, mô tả, tags..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Loại hồ sơ / Hoạt động
                  </label>
                  <select
                    value={searchFilters.activityType}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        activityType: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    <option value="teaching">🎓 Giảng dạy</option>
                    <option value="research">🔬 NCKH</option>
                    <option value="seminar">📢 Seminar / Hội thảo</option>
                    <option value="business_cooperation">
                      🤝 Hợp tác doanh nghiệp
                    </option>
                    <option value="student_activity">
                      👥 Hoạt động sinh viên
                    </option>
                    <option value="conference">🎤 Hội nghị</option>
                    <option value="publication">📚 Công bố</option>
                    <option value="project">💼 Dự án</option>
                    <option value="other">📋 Khác</option>
                  </select>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Tiêu chuẩn 1.1, 2.3..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mã môn học
                    </label>
                    <input
                      type="text"
                      value={searchFilters.courseCode}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                          courseCode: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: IT001, CS101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên môn học
                    </label>
                    <input
                      type="text"
                      value={searchFilters.courseName}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                          courseName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Lập trình căn bản"
                    />
                  </div>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2024-2025"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Trạng thái
                  </label>
                  <select
                    value={searchFilters.submissionStatus}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        submissionStatus: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    <option value="draft">Nháp</option>
                    <option value="submitted">Đã nộp</option>
                    <option value="under_review">Đang xét</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                    <option value="revision_required">Yêu cầu sửa</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Tìm kiếm
                </button>
                <button
                  onClick={handleResetSearch}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Đặt lại
                </button>
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerDashboard;
