import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Document Management System
                </h1>
                <p className="text-xs text-gray-500">Hệ thống quản lý tài liệu</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                 className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </nav>
 {/* ========================= HERO SECTION ========================= */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* LEFT CONTENT */}
          <div className="space-y-8">

<h1 className="text-3xl lg:text-4xl font-extrabold leading-snug text-gray-900 max-w-3xl">
  Hệ thống Website quản lý tài liệu và hồ sơ minh chứng phục vụ
  <span className="block mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
    công tác Đảm bảo chất lượng cấp Khoa
  </span>
</h1>



         <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
  Hệ thống hỗ trợ lưu trữ, quản lý tài liệu và hồ sơ minh chứng một cách khoa học,
  đáp ứng đầy đủ yêu cầu phục vụ công tác đảm bảo chất lượng của Khoa Công nghệ Thông tin.
  Giúp tra cứu nhanh chóng, an toàn và bảo mật thông tin tuyệt đối.
</p>


            <div className="flex flex-wrap gap-4">

            </div>
          </div>
{/* RIGHT IMAGE */}
<div className="relative flex justify-center items-center">
  {/* Hiệu ứng nền nhẹ để ảnh hòa vào background */}
  <div className="absolute inset-0 bg-blue-200/20 rounded-full blur-2xl scale-150"></div>

  <img
    src="/img/bn1.png"
    alt="Document Management Illustration"
    className="w-[520px] lg:w-[600px] xl:w-[680px] h-auto select-none pointer-events-none"
  />
</div>


        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quy trình làm việc đơn giản
            </h2>
            <p className="text-xl text-gray-600">
              Chỉ 3 bước để bắt đầu quản lý tài liệu hiệu quả
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 -translate-y-1/2"></div>

            <div className="grid lg:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-blue-100 hover:border-blue-300">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-3xl font-bold text-white">1</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Đăng nhập tài khoản
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Tài khoản đã được Admin cấp. Bạn chỉ cần nhập thông tin đăng nhập và bắt đầu công việc ngay tức khắc.
                      </p>
                    </div>
                    <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-indigo-100 hover:border-indigo-300">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-3xl font-bold text-white">2</span>
                      </div>
                      <div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-100 rounded-full animate-ping opacity-75"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Upload tài liệu
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Tải lên tài liệu của bạn với giao diện kéo thả. Hỗ trợ
                        đa dạng định dạng file.
                      </p>
                    </div>
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-purple-100 hover:border-purple-300">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-3xl font-bold text-white">3</span>
                      </div>
                      <div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 rounded-full animate-ping opacity-75"
                        style={{ animationDelay: "0.6s" }}
                      ></div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Quản lý & Theo dõi
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Theo dõi tiến độ, xem báo cáo thống kê và quản lý tài
                        liệu một cách dễ dàng.
                      </p>
                    </div>
                    <div className="w-full h-48 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ========================= ƯU ĐIỂM NỔI BẬT ========================= */}
<section className="w-full bg-white pt-20 pb-28 px-4 sm:px-6 lg:px-12">
  <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-600 mb-14 w-full mx-auto">
    ƯU ĐIỂM NỔI BẬT
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">

    {[
      {
        img: "/img/j1.png",
        title: "THIẾT LẬP KHO LƯU TRỮ TÀI LIỆU SỐ TẬP TRUNG",
        desc: "Tiết kiệm không gian lưu trữ tài liệu và chi phí bảo quản tài liệu vật lý."
      },
      {
        img: "/img/j2.png",
        title: "TÌM KIẾM TÀI LIỆU NHANH CHÓNG VÀ DỄ DÀNG",
        desc: "Tìm kiếm tài liệu nhanh chóng và chính xác hơn phương pháp truyền thống."
      },
      {
        img: "/img/j3.png",
        title: "CHIA SẺ TÀI LIỆU LINH HOẠT VÀ AN TOÀN",
        desc: "Truy cập tài liệu cần thiết mọi lúc, mọi nơi, cải thiện khả năng làm việc linh hoạt từ xa, từ đó, nâng cao hiệu suất làm việc toàn Khoa"
      },
      {
        img: "/img/j4.png",
        title: "BẢO MẬT TUYỆT ĐỐI",
        desc: "Cơ chế bảo mật đa lớp, phân quyền chi tiết xem, sửa, xoá, di chuyển... cho từng người dùng, bộ môn trên từng tài liệu"
      }
    ].map((item, i) => (
      <div
        key={i}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col h-full"
      >
        <img src={item.img} className="w-40 mb-6 mx-auto" />
        
        <div className="flex-grow flex flex-col items-center text-center">
          <h3 className="text-blue-600 font-bold text-lg uppercase">
            {item.title}
          </h3>
          <p className="text-gray-600 mt-4 leading-relaxed">
            {item.desc}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>
           {/* ========================= STORAGE SETUP SECTION ========================= */}
<section className="pt-5 pb-24 bg-white">

  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start px-4 sm:px-6 lg:px-8">
{/* LEFT IMAGE (single) */}
<div className="w-full">
  <img
    src="/img/m1.png"
    alt="Kho lưu trữ"
    className="w-full rounded-xl shadow-xl"
  />
</div>

    {/* RIGHT CONTENT */}
    <div className="pt-4">
<h2 className="text-4xl font-bold text-blue-600 leading-tight">
  THIẾT LẬP KHO LƯU TRỮ
  <span className="block text-orange-500">
    TÀI LIỆU SỐ TẬP TRUNG
  </span>
</h2>


      <ul className="mt-8 space-y-6 text-gray-700 text-lg">

  <li className="flex gap-4">
    {/* TICK XANH */}
    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 flex-shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>

    <div>
      <p className="font-semibold text-blue-600">Quản lý minh chứng</p>
     Cho phép giảng viên nộp, cập nhật và theo dõi trạng thái duyệt minh chứng theo tiêu chuẩn kiểm định căn cứ theo pháp lý.
    </div>
  </li>

  <li className="flex gap-4">
    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 flex-shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>

    <div>
      <p className="font-semibold text-blue-600">Lưu trữ tài liệu</p>
      Không giới hạn, hỗ trợ lịch sử phiên bản của tài liệu tại cùng vị trí.
    </div>
  </li>

  <li className="flex gap-4">
    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 flex-shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>

    <div>
      <p className="font-semibold text-blue-600">Quản lý tài liệu cá nhân</p>
      Lưu trữ, phân quyền & chia sẻ tài liệu cá nhân theo bộ môn, người dùng cụ thể.
    </div>
  </li>

  <li className="flex gap-4">
    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 flex-shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>

    <div>
      <p className="font-semibold text-blue-600">Thiết lập kho tài liệu điện tử</p>
      Tùy biến kho tài liệu phù hợp nhu cầu sử dụng của Khoa, truy cập tài liệu mọi lúc mọi nơi.
    </div>
  </li>

</ul>

    </div>
  </div>
</section>


       <section className="pt-5 pb-24 bg-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <div>
          <h2 className="text-4xl font-bold text-blue-600 leading-tight">
            TÌM KIẾM HỒ SƠ MINH CHỨNG
            <span className="block text-orange-500">THEO TÊN TÀI LIỆU</span>
          </h2>

          <div className="mt-10 space-y-6 text-gray-700 text-lg">

            {/* ITEM */}
{/* ITEM */}
<div className="flex items-start gap-3">
  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 flex-shrink-0 mt-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </span>

  <div>
    <p className="font-semibold text-orange-500">Tra cứu hồ sơ minh chứng</p>
    <p>
Hỗ trợ tìm kiếm nhanh các hồ sơ minh chứng theo từ khóa, tiêu chuẩn hoặc tiêu chí kiểm định, giúp giảng viên và bộ môn dễ dàng truy xuất tài liệu cần thiết.
    </p>
  </div>
</div>

{/* ITEM */}
<div className="flex items-start gap-3">
  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 flex-shrink-0 mt-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </span>

  <div>
    <p className="font-semibold text-orange-500">Theo dõi và truy xuất minh chứng</p>
    <p>
 Giúp giảng viên và bộ môn dễ dàng theo dõi và truy xuất các hồ sơ phục vụ công tác kiểm định.
    </p>
  </div>
</div>

{/* ITEM */}
<div className="flex items-start gap-3">
  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 flex-shrink-0 mt-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </span>

  <div>
<p className="font-semibold text-orange-500">Thống kê & báo cáo</p>
<p>
  Cung cấp số liệu tổng hợp về hồ sơ minh chứng, hỗ trợ giảng viên và bộ môn theo dõi tình trạng tài liệu phục vụ kiểm định.
</p>

  </div>
</div>

          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-orange-200/30 rounded-full blur-3xl"></div>

          <img
            src="/img/m2.png" // 👉 sửa lại theo đường dẫn thật của bạn
            alt="Search Feature Preview"
            className="relative w-full max-w-xl rounded-2xl shadow-xl"
          />
        </div>

      </div>
    </section>
          {/* Benefits */}
       
        </div>
      </section>

{/* Stats + Legal Section */}
<section className="pb-8 pt-5">


  <div className="max-w-7xl mx-auto text-center">

    {/* Heading */}
    <h2 className="text-4xl font-extrabold text-blue-700">
      Hệ thống & Văn bản Pháp lý
    </h2>

    <p className="text-gray-600 text-lg mt-4 max-w-3xl mx-auto">
      Các văn bản pháp lý quan trọng liên quan đến đảm bảo chất lượng cấp khoa,
      được sử dụng làm nền tảng xây dựng hệ thống quản lý tài liệu.
    </p>

    {/* Cards */}
    <div className="grid md:grid-cols-3 gap-10 mt-16">

      {/* ITEM 1 */}
      <div className="p-8 rounded-2xl shadow-lg border border-blue-100 bg-gradient-to-b from-blue-50 to-white hover:shadow-2xl hover:-translate-y-1 transition-all">
        <div className="text-3xl font-bold text-blue-700">Thông tư 06/2017</div>

        <div className="mt-3 text-blue-600 font-semibold text-lg">
          Đảm bảo chất lượng giáo dục đại học
        </div>

        <p className="text-gray-600 text-sm mt-2">
          Hướng dẫn tiêu chuẩn & quy trình đánh giá chất lượng áp dụng cho các khoa.
        </p>

        <div className="flex justify-center items-center gap-2 mt-5">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          </svg>
          <a href="#" className="text-blue-700 font-medium underline text-sm">Xem chi tiết</a>
        </div>

        <span className="inline-block mt-4 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
          Bắt buộc
        </span>
      </div>

      {/* ITEM 2 */}
      <div className="p-8 rounded-2xl shadow-lg border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white hover:shadow-2xl hover:-translate-y-1 transition-all">
        <div className="text-3xl font-bold text-indigo-700">Nghị định 05/2019</div>

        <div className="mt-3 text-indigo-600 font-semibold text-lg">
          Kiểm định chất lượng cấp khoa
        </div>

        <p className="text-gray-600 text-sm mt-2">
          Quy định về kiểm định chương trình đào tạo & bộ môn theo tiêu chuẩn quốc gia.
        </p>

        <div className="flex justify-center items-center gap-2 mt-5">
          <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          </svg>
          <a href="#" className="text-indigo-700 font-medium underline text-sm">Xem chi tiết</a>
        </div>

        <span className="inline-block mt-4 px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">
          Bắt buộc
        </span>
      </div>

      {/* ITEM 3 */}
      <div className="p-8 rounded-2xl shadow-lg border border-purple-100 bg-gradient-to-b from-purple-50 to-white hover:shadow-2xl hover:-translate-y-1 transition-all">
        <div className="text-3xl font-bold text-purple-700">Thông tư 12/2021</div>

        <div className="mt-3 text-purple-600 font-semibold text-lg">
          Chuẩn đầu ra cấp khoa
        </div>

        <p className="text-gray-600 text-sm mt-2">
          Định nghĩa năng lực đầu ra cho từng ngành, đảm bảo sinh viên đạt chuẩn tốt nghiệp.
        </p>

        <div className="flex justify-center items-center gap-2 mt-5">
          <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          </svg>
          <a href="#" className="text-purple-700 font-medium underline text-sm">Xem chi tiết</a>
        </div>

        <span className="inline-block mt-4 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
          Tham khảo
        </span>
      </div>

    </div>
  </div>
</section>

      {/* Footer */}
<footer className="bg-white border-t border-gray-200 py-16 px-6">
  <div className="max-w-7xl mx-auto">
    <div className="grid md:grid-cols-4 gap-12 mb-12">

      {/* LOGO + INTRO */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg
              className="w-7 h-7 text-white"
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
          <span className="text-2xl font-bold text-blue-700">Document Management System</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          Giải pháp quản lý tài liệu hiện đại, hiệu quả và bảo mật dành cho
          giảng viên – bộ môn.
        </p>
      </div>

      {/* PRODUCT */}
{/* PRODUCT / FEATURES */}
<div>
  <h3 className="font-semibold text-blue-700 mb-4 text-lg">Chức năng</h3>
  <ul className="space-y-2 text-gray-600">
    <li><a href="#" className="hover:text-blue-600 transition">Quản lý tài liệu</a></li>
    <li><a href="#" className="hover:text-blue-600 transition">Tìm kiếm tài liệu</a></li>
    <li><a href="#" className="hover:text-blue-600 transition">Phân quyền & chia sẻ</a></li>
  </ul>
</div>

{/* SUPPORT */}
<div>
  <h3 className="font-semibold text-blue-700 mb-4 text-lg">Hỗ trợ</h3>
  <ul className="space-y-2 text-gray-600">
    <li><a href="#" className="hover:text-blue-600 transition">Liên hệ khoa</a></li>
    <li><a href="#" className="hover:text-blue-600 transition">Hướng dẫn sử dụng</a></li>
    <li><a href="#" className="hover:text-blue-600 transition">Câu hỏi thường gặp</a></li>
  </ul>
</div>

{/* LEGAL / INFORMATION */}
<div>
  <h3 className="font-semibold text-blue-700 mb-4 text-lg">Thông tin</h3>
  <ul className="space-y-2 text-gray-600">
    <li><a href="#" className="hover:text-blue-600 transition">Về hệ thống</a></li>
    <li><a href="#" className="hover:text-blue-600 transition">Chính sách dữ liệu</a></li>
    <li><a href="#" className="hover:text-blue-600 transition">Quy định sử dụng</a></li>
  </ul>
</div>

    </div>

    {/* COPYRIGHT */}
    <div className="border-t border-gray-200 pt-8 text-center">
      <p className="text-gray-500">
        © 2025 Document Management System. All rights reserved.
      </p>
    </div>
  </div>
</footer>

    </div>
  );
};

export default HomePage;
