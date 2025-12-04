import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  targets: {
    type: "all" | "roles" | "departments" | "users";
    roles?: string[];
    departments?: string[];
    users?: string[];
  };
  publishedAt: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  _id: string;
  code: string;
  name: string;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  role?: string;
  roles?: string[];
  department?: {
    _id: string;
    name: string;
    code: string;
  };
}

export default function AnnouncementsManagementPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] =
    useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const itemsPerPage = 20;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetType: "all" as "all" | "roles" | "departments" | "users",
    targetRoles: [] as string[],
    targetDepartments: [] as string[],
    targetUsers: [] as string[],
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.getAnnouncements({
        limit: itemsPerPage,
        page: currentPage,
        sort: "-createdAt",
        management: true, // Flag to indicate this is management page
      });

      if (response.success) {
        setAnnouncements(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.getDepartments({ limit: 1000 });
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers({ limit: 1000 });
      console.log("Users API response:", response);

      if (response.success) {
        // Check if response.data is array or object with data property
        const usersData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.users || [];
        console.log("Users data:", usersData);
        setUsers(usersData);
      } else {
        console.error("Failed to fetch users:", response.message);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.getMe();
      if (response.success) {
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const handleOpenModal = (
    mode: "create" | "edit",
    announcement?: Announcement
  ) => {
    setModalMode(mode);
    if (mode === "edit" && announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        targetType: announcement.targets.type,
        targetRoles: announcement.targets.roles || [],
        targetDepartments: announcement.targets.departments || [],
        targetUsers: announcement.targets.users || [],
      });
    } else {
      setSelectedAnnouncement(null);
      // Department head and Manager can only create announcements for their department
      const userRole = currentUser?.roles?.[0] || currentUser?.role;
      const isDeptHead = userRole === "department_head";
      const isManager = userRole === "manager";
      const userDeptId = currentUser?.department?._id;

      console.log("DEBUG handleOpenModal:", {
        currentUser,
        userRole,
        isDeptHead,
        isManager,
        userDeptId,
      });

      setFormData({
        title: "",
        content: "",
        targetType: isDeptHead || isManager ? "departments" : "all",
        targetRoles: [],
        targetDepartments:
          (isDeptHead || isManager) && userDeptId ? [userDeptId] : [],
        targetUsers: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
    setFormData({
      title: "",
      content: "",
      targetType: "all",
      targetRoles: [],
      targetDepartments: [],
      targetUsers: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const targets: {
        type: "all" | "roles" | "departments" | "users";
        roles?: string[];
        departments?: string[];
        users?: string[];
      } = {
        type: formData.targetType,
      };

      if (formData.targetType === "roles") {
        targets.roles = formData.targetRoles;
      } else if (formData.targetType === "departments") {
        targets.departments = formData.targetDepartments;
      } else if (formData.targetType === "users") {
        targets.users = formData.targetUsers;
      }

      const data = {
        title: formData.title,
        content: formData.content,
        targets,
      };

      console.log("DEBUG handleSubmit - formData:", formData);
      console.log("DEBUG handleSubmit - data to send:", data);

      if (modalMode === "create") {
        const response = await api.createAnnouncement(data);
        if (response.success) {
          await fetchAnnouncements();
          handleCloseModal();
        } else {
          alert(response.message || "Có lỗi xảy ra khi tạo thông báo");
        }
      } else if (modalMode === "edit" && selectedAnnouncement) {
        const response = await api.updateAnnouncement(
          selectedAnnouncement._id,
          data
        );
        if (response.success) {
          await fetchAnnouncements();
          handleCloseModal();
        } else {
          alert(response.message || "Có lỗi xảy ra khi cập nhật thông báo");
        }
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Có lỗi xảy ra khi lưu thông báo");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const response = await api.updateAnnouncement(announcement._id, {
        isActive: !announcement.isActive,
      });
      if (response.success) {
        await fetchAnnouncements();
      }
    } catch (error) {
      console.error("Error toggling announcement status:", error);
    }
  };

  const handleDeleteClick = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;

    try {
      const response = await api.deleteAnnouncement(announcementToDelete._id);
      if (response.success) {
        await fetchAnnouncements();
        setShowDeleteConfirm(false);
        setAnnouncementToDelete(null);
      } else {
        alert(response.message || "Có lỗi xảy ra khi xóa thông báo");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Có lỗi xảy ra khi xóa thông báo");
    }
  };

  const toggleRole = (role: string) => {
    if (formData.targetRoles.includes(role)) {
      setFormData({
        ...formData,
        targetRoles: formData.targetRoles.filter((r) => r !== role),
      });
    } else {
      setFormData({
        ...formData,
        targetRoles: [...formData.targetRoles, role],
      });
    }
  };

  const toggleDepartment = (deptId: string) => {
    if (formData.targetDepartments.includes(deptId)) {
      setFormData({
        ...formData,
        targetDepartments: formData.targetDepartments.filter(
          (d) => d !== deptId
        ),
      });
    } else {
      setFormData({
        ...formData,
        targetDepartments: [...formData.targetDepartments, deptId],
      });
    }
  };

  const toggleUser = (userId: string) => {
    if (formData.targetUsers.includes(userId)) {
      setFormData({
        ...formData,
        targetUsers: formData.targetUsers.filter((u) => u !== userId),
      });
    } else {
      setFormData({
        ...formData,
        targetUsers: [...formData.targetUsers, userId],
      });
    }
  };

  const getTargetDisplay = (announcement: Announcement) => {
    if (announcement.targets.type === "all") {
      return <span className="text-sm text-gray-600">Tất cả người dùng</span>;
    } else if (announcement.targets.type === "roles") {
      return (
        <div className="flex flex-wrap gap-1">
          {announcement.targets.roles?.map((role) => (
            <span
              key={role}
              className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
            >
              {roleMap[role] || role}
            </span>
          ))}
        </div>
      );
    } else if (announcement.targets.type === "departments") {
      return (
        <div className="flex flex-wrap gap-1">
          {announcement.targets.departments?.slice(0, 2).map((deptId) => {
            const dept = departments.find((d) => d._id === deptId);
            return dept ? (
              <span
                key={deptId}
                className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700"
              >
                {dept.code}
              </span>
            ) : null;
          })}
          {(announcement.targets.departments?.length || 0) > 2 && (
            <span className="text-xs text-gray-500">
              +{(announcement.targets.departments?.length || 0) - 2}
            </span>
          )}
        </div>
      );
    } else if (announcement.targets.type === "users") {
      return (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(users) &&
            announcement.targets.users?.slice(0, 2).map((userId) => {
              const user = users.find((u) => u._id === userId);
              return user ? (
                <span
                  key={userId}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700"
                >
                  {user.fullName}
                </span>
              ) : null;
            })}
          {(announcement.targets.users?.length || 0) > 2 && (
            <span className="text-xs text-gray-500">
              +{(announcement.targets.users?.length || 0) - 2}
            </span>
          )}
        </div>
      );
    }
  };

  const roleMap: { [key: string]: string } = {
    admin: "Admin",
    manager: "Manager",
    department_head: "Trưởng khoa",
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    if (filterStatus === "active" && !ann.isActive) return false;
    if (filterStatus === "inactive" && ann.isActive) return false;

    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      ann.title.toLowerCase().includes(search) ||
      ann.content.toLowerCase().includes(search) ||
      ann.createdBy.fullName.toLowerCase().includes(search)
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
                  Quản lý Thông báo
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Tạo và quản lý thông báo hệ thống
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal("create")}
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
              <span>Tạo thông báo</span>
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
                  placeholder="Tìm kiếm theo tiêu đề, nội dung, người tạo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã tắt</option>
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
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đối tượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
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
                {filteredAnnouncements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
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
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          Không tìm thấy thông báo
                        </p>
                        <p className="text-sm mt-1">
                          Thử thay đổi bộ lọc hoặc tạo thông báo mới
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAnnouncements.map((announcement) => (
                    <tr key={announcement._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {announcement.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {announcement.content}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getTargetDisplay(announcement)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {announcement.createdBy.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {announcement.createdBy.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(announcement)}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            announcement.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {announcement.isActive ? "Hoạt động" : "Đã tắt"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {(() => {
                          const userRole =
                            currentUser?.roles?.[0] || currentUser?.role;
                          const isAdmin = userRole === "admin";
                          const isManager = userRole === "manager";
                          const isDeptHead = userRole === "department_head";
                          const isOwnAnnouncement =
                            announcement.createdBy._id === currentUser?._id;

                          // Admin có thể sửa/xóa tất cả
                          // Manager và Department_head chỉ có thể sửa/xóa thông báo của mình
                          const canEdit =
                            isAdmin ||
                            ((isManager || isDeptHead) && isOwnAnnouncement);

                          return (
                            <>
                              {canEdit ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleOpenModal("edit", announcement)
                                    }
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
                                    onClick={() =>
                                      handleDeleteClick(announcement)
                                    }
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
                                </>
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  Không có quyền
                                </span>
                              )}
                            </>
                          );
                        })()}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "create"
                  ? "Tạo thông báo mới"
                  : "Chỉnh sửa thông báo"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tiêu đề thông báo..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={5}
                  placeholder="Nội dung thông báo..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng nhận thông báo{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {(currentUser?.roles?.[0] || currentUser?.role) !==
                    "department_head" &&
                    (currentUser?.roles?.[0] || currentUser?.role) !==
                      "manager" && (
                      <>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="all"
                            checked={formData.targetType === "all"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                targetType: e.target.value as "all",
                                targetRoles: [],
                                targetDepartments: [],
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Tất cả người dùng</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="roles"
                            checked={formData.targetType === "roles"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                targetType: e.target.value as "roles",
                                targetDepartments: [],
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Theo vai trò</span>
                        </label>
                      </>
                    )}

                  {formData.targetType === "roles" && (
                    <div className="ml-6 space-y-2">
                      {Object.entries(roleMap).map(([key, label]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.targetRoles.includes(key)}
                            onChange={() => toggleRole(key)}
                            className="mr-2"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="departments"
                      checked={formData.targetType === "departments"}
                      onChange={(e) => {
                        const isDeptHeadOrManager =
                          (currentUser?.roles?.[0] || currentUser?.role) ===
                            "department_head" ||
                          (currentUser?.roles?.[0] || currentUser?.role) ===
                            "manager";
                        const userDeptId = currentUser?.department?._id;

                        setFormData({
                          ...formData,
                          targetType: e.target.value as "departments",
                          targetRoles: [],
                          targetUsers: [],
                          // Tự động chọn department của user nếu là manager/dept head
                          targetDepartments:
                            isDeptHeadOrManager && userDeptId
                              ? [userDeptId]
                              : [],
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {(currentUser?.roles?.[0] || currentUser?.role) ===
                        "department_head" ||
                      (currentUser?.roles?.[0] || currentUser?.role) ===
                        "manager"
                        ? `Khoa/Phòng ban của bạn: ${
                            currentUser?.department?.name || ""
                          }`
                        : "Theo khoa/phòng ban"}
                    </span>
                  </label>

                  {formData.targetType === "departments" && (
                    <div className="ml-6 space-y-2 max-h-40 overflow-y-auto">
                      {((currentUser?.roles?.[0] || currentUser?.role) ===
                        "department_head" ||
                      (currentUser?.roles?.[0] || currentUser?.role) ===
                        "manager"
                        ? departments.filter(
                            (d) => d._id === currentUser?.department?._id
                          )
                        : departments
                      ).map((dept) => (
                        <label key={dept._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.targetDepartments.includes(
                              dept._id
                            )}
                            onChange={() => toggleDepartment(dept._id)}
                            className="mr-2"
                            disabled={
                              (currentUser?.roles?.[0] || currentUser?.role) ===
                                "department_head" ||
                              (currentUser?.roles?.[0] || currentUser?.role) ===
                                "manager"
                            }
                          />
                          <span className="text-sm">
                            {dept.code} - {dept.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="users"
                      checked={formData.targetType === "users"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetType: e.target.value as "users",
                          targetRoles: [],
                          targetDepartments: [],
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">Người dùng cụ thể</span>
                  </label>

                  {formData.targetType === "users" && (
                    <div className="ml-6 space-y-2 max-h-40 overflow-y-auto">
                      {Array.isArray(users) && users.length > 0 ? (
                        users.map((user) => (
                          <label key={user._id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.targetUsers.includes(user._id)}
                              onChange={() => toggleUser(user._id)}
                              className="mr-2"
                            />
                            <span className="text-sm">
                              {user.fullName} ({user.email})
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          Đang tải danh sách người dùng...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  <span>{modalMode === "create" ? "Tạo" : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && announcementToDelete && (
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
              Bạn có chắc chắn muốn xóa thông báo{" "}
              <span className="font-semibold">
                {announcementToDelete.title}
              </span>
              ? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAnnouncementToDelete(null);
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
