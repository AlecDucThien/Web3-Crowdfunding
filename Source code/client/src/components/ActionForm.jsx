// Nhập thư viện React
import React from "react";
// Nhập component CustomButton
import { CustomButton } from "../components";

// Component ActionForm hiển thị biểu mẫu để thực hiện hành động (ví dụ: quyên góp, rút tiền)
const ActionForm = ({
  formName,
  title,
  description,
  buttonText,
  buttonColor,
  handleAction,
  error,
  inputValue,
  setInputValue,
  showInput,
  buttonDisabled,
  campaignStatus
}) => {
  return (
    // Thẻ div chính chứa biểu mẫu hành động
    <div className="flex-1">
      {/* Tiêu đề biểu mẫu */}
      <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
        {formName}
      </h4>
      {/* Nội dung biểu mẫu */}
      <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
        {/* Tiêu đề phụ của biểu mẫu */}
        <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
          {title}
        </p>
        <div >
          {/* Hiển thị thông báo lỗi nếu có */}
          {error && <p className="text-red-500 text-[14px] mb-4">{error}</p>}
          {/* Hiển thị trường nhập liệu nếu showInput là true và nút không bị vô hiệu */}
          {showInput && !buttonDisabled && (
            <input
              type="number"
              placeholder="ETH 0.1"
              step="0.01"
              className="mt-[30px] w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          )}
          {/* Phần mô tả của biểu mẫu */}
          <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
              <p className="font-epilogue font-normal text-[16px] leading-[26px] text-[#808191] text-center">
                {description}
              </p>
          </div>
          {/* Nút hành động (CustomButton) */}
          <CustomButton
            btnType="button"
            title={buttonText}
            disabled={buttonDisabled}
            styles={`w-full ${buttonColor}`}
            handleClick={handleAction}
          />
        </div>
      </div>
    </div>
  );
};

// Xuất component ActionForm để sử dụng trong các file khác
export default ActionForm;