// Nhập thư viện React
import React from 'react'

// Component CountBox hiển thị một giá trị và tiêu đề trong một hộp
const CountBox = ({ title, value, color }) => {
  return (
    // Thẻ div chính chứa hộp thông tin
    <div className="flex flex-col items-center w-[150px]">
      {/* Giá trị được hiển thị với màu nền tùy chỉnh */}
      <h4 className={`font-epilogue font-bold text-[30px] pt-2 rounded-t-[10px] w-full text-center truncate`}
        style={{ backgroundColor: color, color: 'white' }}
      >{value}</h4>
      {/* Tiêu đề của hộp */}
      <p className="font-epilogue font-normal text-[16px] text-[#808191] bg-[#28282e] px-3 py-2 w-full rouned-b-[10px] text-center">{title}</p>
    </div>
  )
}

// Xuất component CountBox để sử dụng trong các file khác
export default CountBox