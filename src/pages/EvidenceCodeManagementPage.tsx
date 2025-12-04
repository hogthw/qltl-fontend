import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface Department {
  _id: string;
  code: string;
  name: string;
}

interface Criterion {
  _id: string;
  code: string;
  name: string;
  standardId?: {
    _id: string;
    code: string;
    name: string;
  };
}

interface EvidenceCode {
  _id: string;
  code: string;
  departmentId: {
    _id: string;
    code: string;
    name: string;
  };
  criterionId: {
    _id: string;
    code: string;
    name: string;
  };
  sequenceNumber: number;
  year: number;
  month: number;
  description: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
}

const EvidenceCodeManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evidenceCodes, setEvidenceCodes] = useState<EvidenceCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCriterion, setSelectedCriterion] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [generatedCode, setGeneratedCode] = useState<EvidenceCode | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCode, setDeletingCode] = useState<EvidenceCode | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchDepartments();
    fetchCriteria();
    fetchEvidenceCodes();
  }, [currentPage, searchTerm]);

  const fetchDepartments = async () => {
    try {
      const response = await api.getDepartments({ limit: 1000 });
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCriteria = async () => {
    try {
      const response = await api.getCriteria({ pageSize: 1000 });
      if (response.success) {
        setCriteria(response.data.criteria || []);
      }
    } catch (error) {
      console.error("Error fetching criteria:", error);
    }
  };

  const fetchEvidenceCodes = async () => {
    try {
      setLoading(true);
      const response = await api.getEvidenceCodes({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
      });
      if (response.success) {
        setEvidenceCodes(response.data.evidenceCodes || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (error) {
      console.error("Error fetching evidence codes:", error);
      setMessage({
        type: "error",
        text: "Lỗi khi tải danh sách mã minh chứng",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!selectedDepartment || !selectedCriterion) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn khoa và tiêu chí!",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.generateEvidenceCode({
        departmentId: selectedDepartment,
        criterionId: selectedCriterion,
        description: description || undefined,
      });

      if (response.success) {
        setGeneratedCode(response.data);
        setMessage({
          type: "success",
          text: `Sinh mã thành công: ${response.data.code}`,
        });
        setSelectedDepartment("");
        setSelectedCriterion("");
        setDescription("");
        fetchEvidenceCodes();
        setTimeout(() => {
          setMessage(null);
          setGeneratedCode(null);
        }, 5000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Lỗi khi sinh mã minh chứng",
        });
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setMessage({ type: "error", text: "Lỗi khi sinh mã minh chứng" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (code: EvidenceCode) => {
    setDeletingCode(code);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCode) return;

    setLoading(true);
    try {
      const response = await api.deleteEvidenceCode(deletingCode._id);
      if (response.success) {
        setMessage({ type: "success", text: "Xóa mã minh chứng thành công!" });
        setShowDeleteModal(false);
        setDeletingCode(null);
        fetchEvidenceCodes();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Lỗi khi xóa mã minh chứng",
        });
      }
    } catch (error) {
      console.error("Error deleting evidence code:", error);
      setMessage({ type: "error", text: "Lỗi khi xóa mã minh chứng" });
    } finally {
      setLoading(false);
    }
  };

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
                  Quản lý Mã minh chứng
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Sinh mã hồ sơ theo quy ước khoa
                </p>
              </div>
            </div>
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

        {/* Generated Code Display */}
        {generatedCode && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-600 mt-0.5 mr-3"
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
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Mã mới đã được sinh thành công!
                </h3>
                <div className="bg-white rounded border border-green-300 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Mã minh chứng:
                    </span>
                    <code className="px-4 py-2 bg-gray-100 text-gray-900 rounded text-lg font-mono font-bold">
                      {generatedCode.code}
                    </code>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Khoa:</span>{" "}
                      {generatedCode.departmentId.name}
                    </p>
                    <p>
                      <span className="font-medium">Tiêu chí:</span>{" "}
                      {generatedCode.criterionId.code} -{" "}
                      {generatedCode.criterionId.name}
                    </p>
                    <p>
                      <span className="font-medium">Số thứ tự:</span>{" "}
                      {generatedCode.sequenceNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
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
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Quy tắc đặt mã
              </h3>
              <p className="text-sm text-amber-800 mb-2">
                Cấu trúc: MC-[KHOA]-[TIÊU CHÍ]-[STT]-[NĂM]-[THÁNG]
              </p>
              <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                <li>MC: Mã cố định (Minh Chứng)</li>
                <li>Khoa: Mã khoa (VD: CNTT, ĐIỆN)</li>
                <li>Tiêu chí: Mã tiêu chí (VD: TC1, TC2)</li>
                <li>STT: Số thứ tự tự động tăng</li>
                <li>Năm-Tháng: Thời gian sinh mã</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Generate Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">
            Sinh mã minh chứng mới
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoa <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn khoa --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu chí <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCriterion}
                onChange={(e) => setSelectedCriterion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn tiêu chí --</option>
                {criteria.map((criterion) => (
                  <option key={criterion._id} value={criterion._id}>
                    {criterion.code} - {criterion.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về mã minh chứng..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleGenerateCode}
            disabled={loading || !selectedDepartment || !selectedCriterion}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
            <span>{loading ? "Đang sinh mã..." : "Sinh mã tự động"}</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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
              placeholder="Tìm kiếm theo mã hoặc mô tả..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Evidence Codes List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã minh chứng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khoa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu chí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người tạo
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
                {loading && evidenceCodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : evidenceCodes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Chưa có mã minh chứng nào
                    </td>
                  </tr>
                ) : (
                  evidenceCodes.map((code) => (
                    <tr key={code._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-sm font-mono font-semibold">
                          {code.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {code.departmentId.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {code.criterionId.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {code.sequenceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {code.createdBy.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(code.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClick(code)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
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
                <span className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <div className="flex space-x-2">
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCode && (
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
                <h3 className="text-lg font-bold text-gray-900">
                  Xác nhận xóa
                </h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa mã minh chứng{" "}
              <span className="font-semibold">{deletingCode.code}</span>? Hành
              động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCode(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceCodeManagementPage;
