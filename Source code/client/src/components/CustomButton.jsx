import React from 'react'

const CustomButton = ({ btnType, title, handleClick, styles, disabled }) => {
  return (
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

export default CustomButton