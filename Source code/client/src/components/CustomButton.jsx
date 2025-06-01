// Nhập thư viện React
import React from 'react'

// Component CustomButton hiển thị một nút tùy chỉnh
const CustomButton = ({ btnType, title, handleClick, styles, disabled }) => {
  return (
    // Thẻ button với các thuộc tính tùy chỉnh
    <button
      type={btnType}
      disabled={disabled}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] transition ${
        disabled ? 'w-full bg-gray-500 cursor-not-allowed' : styles
      }`}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}

// Xuất component CustomButton để sử dụng trong các file khác
export default CustomButton