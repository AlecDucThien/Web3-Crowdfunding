import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { useStateContext } from '../context';
import { money } from '../assets';
import { CustomButton, FormField, Loader } from '../components';
import { checkIfImage } from '../utils';

// Component để tạo một chiến dịch mới
const CreateCampaign = () => {
  const navigate = useNavigate(); // Hook để điều hướng
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const { createCampaign } = useStateContext(); // Lấy hàm createCampaign từ context
  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    target: '', 
    deadline: '',
    image: ''
  }); // Trạng thái form chứa thông tin chiến dịch

  // Hàm cập nhật giá trị của các trường trong form
  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value }); // Cập nhật giá trị trường tương ứng
  }

  // Hàm xử lý khi gửi form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form

    // Kiểm tra xem URL hình ảnh có hợp lệ không
    checkIfImage(form.image, async (exists) => {
      if(exists) {
        setIsLoading(true); // Bật trạng thái loading
        await createCampaign({ ...form, target: ethers.utils.parseUnits(form.target, 18)}); // Gọi hàm tạo chiến dịch với dữ liệu form
        setIsLoading(false); // Tắt trạng thái loading
        navigate('/'); // Điều hướng về trang chủ
      } else {
        alert('Provide valid image URL'); // Thông báo nếu URL hình ảnh không hợp lệ
        setForm({ ...form, image: '' }); // Xóa trường hình ảnh
      }
    })
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />} {/* Hiển thị loader khi đang xử lý */}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Start a Campaign</h1> {/* Tiêu đề form */}
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Your Name *"
            placeholder="John Doe"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange('name', e)} // Xử lý thay đổi trường tên
          />
          <FormField 
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)} // Xử lý thay đổi trường tiêu đề
          />
        </div>

        <FormField 
            labelName="Story *"
            placeholder="Write your story"
            isTextArea
            value={form.description}
            handleChange={(e) => handleFormFieldChange('description', e)} // Xử lý thay đổi trường mô tả
          />

        <div className="w-full flex justify-start items-center p-4 bg-[#8c6dfd] h-[120px] rounded-[10px]">
          <img src={money} alt="money" className="w-[40px] h-[40px] object-contain"/> {/* Hình ảnh biểu tượng tiền */}
          <h4 className="font-epilogue font-bold text-[25px] text-white ml-[20px]">You will get 100% of the raised amount</h4> {/* Thông báo về số tiền nhận được */}
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.target}
            handleChange={(e) => handleFormFieldChange('target', e)} // Xử lý thay đổi trường mục tiêu
          />
          <FormField 
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange('deadline', e)} // Xử lý thay đổi trường ngày kết thúc
          />
        </div>

        <FormField 
            labelName="Campaign image *"
            placeholder="Place image URL of your campaign"
            inputType="url"
            value={form.image}
            handleChange={(e) => handleFormFieldChange('image', e)} // Xử lý thay đổi trường hình ảnh
          />

          <div className="flex justify-center items-center mt-[40px]">
            <CustomButton 
              btnType="submit"
              title="Submit new campaign"
              styles="bg-[#1dc071]"
            /> {/* Nút gửi form tạo chiến dịch */}
          </div>
      </form>
    </div>
  )
}

export default CreateCampaign