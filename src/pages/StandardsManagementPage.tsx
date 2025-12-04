import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface User {
  _id: string;
  fullName: string;
  email: string;
  roles: string[];
}

interface Standard {
  _id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
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

const StandardsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(
    null
  );
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddStandardModal, setShowAddStandardModal] = useState(false);
  const [showAddCriterionModal, setShowAddCriterionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteStandardModal, setShowDeleteStandardModal] = useState(false);
  const [showDeleteCriterionModal, setShowDeleteCriterionModal] =
    useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Standard | null>(null);
  const [deletingStandard, setDeletingStandard] = useState<Standard | null>(
    null
  );
  const [deletingCriterion, setDeletingCriterion] = useState<Criterion | null>(
    null
  );
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(
    null
  );
  const [showEditCriterionModal, setShowEditCriterionModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    color: "blue",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchUser();
    fetchStandards();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.getMe();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const fetchStandards = async () => {
    setLoading(true);
    try {
      const response = await api.getStandards({ pageSize: 100 });
      if (response.success) {
        setStandards(response.data.standards);
        // Load all criteria for all standards
        const allCriteria: Criterion[] = [];
        for (const standard of response.data.standards) {
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
      console.error("Failed to fetch standards:", error);
      setMessage({ type: "error", text: "Lỗi khi tải danh sách tiêu chuẩn" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStandard = async () => {
    if (!formData.code || !formData.name) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin!" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.createStandard({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        color: formData.color,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Thêm tiêu chuẩn thành công!" });
        setShowAddStandardModal(false);
        setFormData({
          code: "",
          name: "",
          description: "",
          color: "blue",
        });
        fetchStandards();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Lỗi khi thêm tiêu chuẩn",
        });
      }
    } catch (error) {
      console.error("Error adding standard:", error);
      setMessage({ type: "error", text: "Lỗi khi thêm tiêu chuẩn" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriterion = async () => {
    if (!formData.code || !formData.name || !selectedStandard) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin!" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.createCriterion({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        standardId: selectedStandard._id,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Thêm tiêu chí thành công!" });
        setShowAddCriterionModal(false);
        setFormData({
          code: "",
          name: "",
          description: "",
          color: "blue",
        });
        fetchStandards();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Lỗi khi thêm tiêu chí",
        });
      }
    } catch (error) {
      console.error("Error adding criterion:", error);
      setMessage({ type: "error", text: "Lỗi khi thêm tiêu chí" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStandard = (standard: Standard) => {
    setEditingItem(standard);
    setFormData({
      code: standard.code,
      name: standard.name,
      description: standard.description,
      color: standard.color,
    });
    setShowEditModal(true);
  };

  const handleUpdateStandard = async () => {
    if (!editingItem) return;

    setLoading(true);
    try {
      const response = await api.updateStandard(editingItem._id, {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        color: formData.color,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Cập nhật thành công!" });
        setShowEditModal(false);
        setEditingItem(null);
        setFormData({
          code: "",
          name: "",
          description: "",
          color: "blue",
        });
        fetchStandards();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Lỗi khi cập nhật",
        });
      }
    } catch (error) {
      console.error("Error updating standard:", error);
      setMessage({ type: "error", text: "Lỗi khi cập nhật tiêu chuẩn" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCriterion = async () => {
    if (!editingCriterion) return;

    setLoading(true);
    try {
      const response = await api.updateCriterion(editingCriterion._id, {
        code: formData.code,
        name: formData.name,
        description: formData.description,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Cập nhật tiêu chí thành công!" });
        setShowEditCriterionModal(false);
        setEditingCriterion(null);
        setFormData({
          code: "",
          name: "",
          description: "",
          color: "blue",
        });
        fetchStandards();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Lỗi khi cập nhật tiêu chí",
        });
      }
    } catch (error) {
      console.error("Error updating criterion:", error);
      setMessage({ type: "error", text: "Lỗi khi cập nhật tiêu chí" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteStandard = async () => {
    if (!deletingStandard) return;

    setLoading(true);
    try {
      const response = await api.deleteStandard(deletingStandard._id);

      if (response.success) {
        setMessage({ type: "success", text: "Xóa tiêu chuẩn thành công!" });
        setShowDeleteStandardModal(false);
        setDeletingStandard(null);
        fetchStandards();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: response.message || "Lỗi khi xóa" });
      }
    } catch (error) {
      console.error("Error deleting standard:", error);
      setMessage({ type: "error", text: "Lỗi khi xóa tiêu chuẩn" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCriterion = async () => {
    if (!deletingCriterion) return;

    setLoading(true);
    try {
      const response = await api.deleteCriterion(deletingCriterion._id);

      if (response.success) {
        setMessage({ type: "success", text: "Xóa tiêu chí thành công!" });
        setShowDeleteCriterionModal(false);
        setDeletingCriterion(null);
        fetchStandards();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Lỗi khi xóa tiêu chí",
        });
      }
    } catch (error) {
      console.error("Error deleting criterion:", error);
      setMessage({ type: "error", text: "Lỗi khi xóa tiêu chí" });
    } finally {
      setLoading(false);
    }
  };

  const getStandardCriteria = (standardId: string) => {
    return criteria.filter((c) => {
      // Handle both string and object standardId
      const criterionStandardId =
        typeof c.standardId === "string" ? c.standardId : c.standardId?._id;
      return criterionStandardId === standardId;
    });
  };

  const getIconForColor = (color: string) => {
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

  const colorClasses: Record<
    string,
    { bg: string; border: string; text: string; iconBg: string }
  > = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-900",
      iconBg: "bg-blue-100",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-900",
      iconBg: "bg-green-100",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-900",
      iconBg: "bg-purple-100",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-900",
      iconBg: "bg-orange-100",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-900",
      iconBg: "bg-red-100",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-900",
      iconBg: "bg-indigo-100",
    },
  };

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
                  Quản lý Tiêu chuẩn - Tiêu chí
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Tạo và quản lý tiêu chuẩn kiểm định
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddStandardModal(true)}
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
              <span>Thêm tiêu chuẩn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Standards Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {standards.map((standard) => {
              const colors = colorClasses[standard.color] || colorClasses.blue;
              return (
                <div
                  key={standard._id}
                  className={`border-2 ${colors.border} ${colors.bg} rounded-lg p-6 hover:shadow-md transition-all cursor-pointer`}
                  onClick={() => {
                    setSelectedStandard(standard);
                    setShowCriteriaModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">
                      {getIconForColor(standard.color)}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStandard(standard);
                        }}
                        className="p-1 hover:bg-white rounded transition-colors"
                        title="Sửa"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingStandard(standard);
                          setShowDeleteStandardModal(true);
                        }}
                        className="p-1 hover:bg-white rounded transition-colors"
                        title="Xóa"
                      >
                        <svg
                          className="w-4 h-4 text-red-600"
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
                  </div>
                  <h4 className={`font-semibold ${colors.text} mb-1 text-lg`}>
                    {standard.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {standard.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {standard.criteriaCount} tiêu chí
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStandard(standard);
                        setShowAddCriterionModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Thêm tiêu chí
                    </button>
                  </div>

                  {/* Criteria List */}
                  {getStandardCriteria(standard._id).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-2">
                        {getStandardCriteria(standard._id).map((criterion) => (
                          <div
                            key={criterion._id}
                            className="flex items-center justify-between bg-white p-2 rounded text-sm"
                          >
                            <div className="flex-1 min-w-0 mr-2">
                              <span className="font-medium text-gray-900">
                                {criterion.code}
                              </span>
                              <span className="text-gray-600 ml-2 truncate block">
                                {criterion.name}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingCriterion(criterion);
                                setShowDeleteCriterionModal(true);
                              }}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Standard Modal */}
      {showAddStandardModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Thêm tiêu chuẩn mới
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã tiêu chuẩn *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: CTDT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tiêu chuẩn *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: CTĐT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Chương trình đào tạo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <select
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="blue">Xanh dương</option>
                  <option value="green">Xanh lá</option>
                  <option value="purple">Tím</option>
                  <option value="orange">Cam</option>
                  <option value="red">Đỏ</option>
                  <option value="indigo">Chàm</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStandardModal(false);
                  setFormData({
                    code: "",
                    name: "",
                    description: "",
                    color: "blue",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddStandard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Criterion Modal */}
      {showAddCriterionModal && selectedStandard && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Thêm tiêu chí cho {selectedStandard.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã tiêu chí *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: TC1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tiêu chí *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Tiêu chí 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả chi tiết tiêu chí"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddCriterionModal(false);
                  setSelectedStandard(null);
                  setFormData({
                    code: "",
                    name: "",
                    description: "",
                    color: "blue",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddCriterion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Standard Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Sửa tiêu chuẩn
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã tiêu chuẩn *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tiêu chuẩn *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <select
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="blue">Xanh dương</option>
                  <option value="green">Xanh lá</option>
                  <option value="purple">Tím</option>
                  <option value="orange">Cam</option>
                  <option value="red">Đỏ</option>
                  <option value="indigo">Chàm</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setFormData({
                    code: "",
                    name: "",
                    description: "",
                    color: "blue",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStandard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Standard Confirmation Modal */}
      {showDeleteStandardModal && deletingStandard && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
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
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Xác nhận xóa tiêu chuẩn
            </h3>
            <p className="text-gray-600 mb-2 text-center">
              Bạn có chắc chắn muốn xóa tiêu chuẩn{" "}
              <span className="font-semibold">{deletingStandard.code}</span>?
            </p>
            <p className="text-sm text-red-600 mb-6 text-center">
              ⚠️ Lưu ý: Tất cả tiêu chí thuộc tiêu chuẩn này cũng sẽ bị xóa!
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteStandardModal(false);
                  setDeletingStandard(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteStandard}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Criterion Confirmation Modal */}
      {showDeleteCriterionModal && deletingCriterion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
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
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Xác nhận xóa tiêu chí
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Bạn có chắc chắn muốn xóa tiêu chí{" "}
              <span className="font-semibold">
                {deletingCriterion.code}: {deletingCriterion.name}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteCriterionModal(false);
                  setDeletingCriterion(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteCriterion}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Criterion Modal */}
      {showEditCriterionModal && editingCriterion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Sửa tiêu chí
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã tiêu chí *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tiêu chí *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditCriterionModal(false);
                  setEditingCriterion(null);
                  setFormData({
                    code: "",
                    name: "",
                    description: "",
                    color: "blue",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateCriterion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Criteria Modal */}
      {showCriteriaModal && selectedStandard && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div
              className={`p-6 border-b border-gray-200 ${
                colorClasses[selectedStandard.color]?.bg || "bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">
                    {getIconForColor(selectedStandard.color)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedStandard.code}: {selectedStandard.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedStandard.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCriteriaModal(false);
                    setSelectedStandard(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Danh sách tiêu chí (
                  {getStandardCriteria(selectedStandard._id).length})
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddCriterionModal(true);
                    setShowCriteriaModal(false);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Thêm tiêu chí
                </button>
              </div>

              {getStandardCriteria(selectedStandard._id).length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {getStandardCriteria(selectedStandard._id).map(
                    (criterion) => (
                      <div
                        key={criterion._id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="inline-block px-3 py-1 text-sm font-semibold bg-white text-gray-700 rounded border border-gray-300">
                            {criterion.code}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCriterion(criterion);
                                setFormData({
                                  code: criterion.code,
                                  name: criterion.name,
                                  description: criterion.description || "",
                                  color: "blue",
                                });
                                setShowEditCriterionModal(true);
                                setShowCriteriaModal(false);
                              }}
                              className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="Sửa tiêu chí"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingCriterion(criterion);
                                setShowDeleteCriterionModal(true);
                                setShowCriteriaModal(false);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Xóa tiêu chí"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <h5 className="font-semibold text-gray-900 mb-2 break-words">
                          {criterion.name}
                        </h5>
                        {criterion.description && (
                          <p className="text-sm text-gray-600 break-words">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                  <p className="text-gray-500 mb-4">Chưa có tiêu chí nào</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddCriterionModal(true);
                      setShowCriteriaModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thêm tiêu chí đầu tiên
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowCriteriaModal(false);
                  setSelectedStandard(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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

export default StandardsManagementPage;
