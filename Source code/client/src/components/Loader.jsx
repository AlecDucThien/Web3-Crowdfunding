// Nhập thư viện React
import React from 'react'

// Nhập hình ảnh loader
import { loader } from '../assets';

// Component Loader hiển thị màn hình tải khi giao dịch đang được xử lý
const Loader = () => {
  return (
    // Thẻ div chính chứa màn hình tải
    <div className="fixed inset-0 z-10 h-screen bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col">
      {/* Hình ảnh loader */}
      <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain"/>
      {/* Thông báo giao dịch đang được xử lý */}
      <p className="mt-[20px] font-epilogue font-bold text-[20px] text-white text-center">Transaction is in progress <br /> Please wait...</p>
    </div>
  )
}

// Xuất component Loader để sử dụng trong các file khác
export default Loader