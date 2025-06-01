// Nhập thư viện React
import React from 'react'

// Component FormField hiển thị một trường nhập liệu (input hoặc textarea)
const FormField = ({ labelName, placeholder, inputType, isTextArea, value, handleChange }) => {
  return (
    // Thẻ label chứa nhãn và trường nhập liệu
    <label className="flex-1 w-full flex flex-col">
      {/* Nhãn của trường nhập liệu (nếu có) */}
      {labelName && (
        <span className="font-epilogue font-medium text-[14px] leading-[22px] text-[#808191] mb-[10px]">{labelName}</span>
      )}
      {/* Hiển thị textarea nếu isTextArea là true */}
      {isTextArea ? (
        <textarea 
          required
          value={value}
          onChange={handleChange}
          rows={10}
          placeholder={placeholder}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px] sm:min-w-[300px]"
        />
      ) : (
        // Hiển thị input nếu isTextArea là false
        <input 
          required
          value={value}
          onChange={handleChange}
          type={inputType}
          step="0.1"
          placeholder={placeholder}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px] sm:min-w-[300px]"
        />
      )}
    </label>
  )
}

// Xuất component FormField để sử dụng trong các file khác
export default FormField