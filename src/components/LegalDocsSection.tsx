import React, { useState } from "react";

interface LegalDoc {
  id: number;
  year: string;
  title: string;
  summary: string;
  details: string;
  level: string;
  color: string;
}

const legalDocs: LegalDoc[] = [
  {
    id: 1,
    year: "06/2017",
    title: "Thông tư về đảm bảo chất lượng giáo dục đại học",
    summary: "Quy định các chuẩn đầu ra, tiêu chuẩn đánh giá chương trình đào tạo và đảm bảo chất lượng giáo dục tại các trường đại học.",
    details: "Chi tiết Thông tư 06/2017: Hướng dẫn thực hiện kiểm định chất lượng, đánh giá chương trình, hồ sơ minh chứng và quy trình đánh giá định kỳ...",
    level: "Cấp áp dụng: Khoa CNTT",
    color: "blue-600",
  },
  {
    id: 2,
    year: "05/2019",
    title: "Nghị định về kiểm định chất lượng cấp khoa",
    summary: "Quy định chi tiết về kiểm định, đánh giá chất lượng các khoa, quy trình nộp hồ sơ minh chứng và báo cáo đánh giá định kỳ.",
    details: "Chi tiết Nghị định 05/2019: Hướng dẫn từng bước hồ sơ minh chứng, yêu cầu báo cáo, thẩm định, và các tiêu chuẩn đánh giá...",
    level: "Cấp áp dụng: Khoa CNTT",
    color: "indigo-600",
  },
  {
    id: 3,
    year: "12/2021",
    title: "Thông tư hướng dẫn chuẩn đầu ra cấp khoa",
    summary: "Hướng dẫn các chuẩn đầu ra chi tiết cho sinh viên, hướng dẫn hồ sơ minh chứng và đánh giá hiệu quả đào tạo theo từng chuyên ngành.",
    details: "Chi tiết Thông tư 12/2021: Bao gồm bảng chuẩn đầu ra, cách đánh giá, hướng dẫn lập hồ sơ minh chứng cho từng môn học và chuyên ngành...",
    level: "Cấp áp dụng: Khoa CNTT",
    color: "purple-600",
  },
];

const LegalDocsSection: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<LegalDoc | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto text-white">
        {/* Dòng giới thiệu */}
        <h2 className="text-4xl font-bold text-center mb-4">
          Web này căn cứ pháp lý vào các văn bản
        </h2>
        <p className="text-center text-blue-100 mb-12">
          Các văn bản pháp lý dưới đây hướng dẫn công tác quản lý hồ sơ minh chứng và đảm bảo chất lượng đào tạo cấp khoa.
        </p>

        {/* Grid cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {legalDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white/10 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className={`flex items-center justify-center mb-4 w-12 h-12 rounded-full bg-${doc.color}`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-center mb-2">{doc.year}</div>
              <div className="text-xl font-semibold text-center mb-3">{doc.title}</div>
              <p className="text-gray-200 text-sm mb-2">{doc.summary}</p>
              <p className="text-gray-300 text-xs text-right font-medium">{doc.level}</p>
              <div className="mt-3 text-center">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white text-sm font-medium hover:shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDoc(doc);
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal chi tiết */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-xl font-bold"
                onClick={() => setSelectedDoc(null)}
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-4">{selectedDoc.title}</h3>
              <p className="text-gray-700 mb-2"><strong>Năm / Mã văn bản:</strong> {selectedDoc.year}</p>
              <p className="text-gray-700 mb-2"><strong>Cấp áp dụng:</strong> {selectedDoc.level}</p>
              <p className="text-gray-700 mt-4">{selectedDoc.details}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LegalDocsSection;
