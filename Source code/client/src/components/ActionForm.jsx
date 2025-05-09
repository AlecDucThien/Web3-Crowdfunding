import React from "react";
import { CustomButton } from "../components";

const ActionForm = ({
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
    <div className="flex-1">
      <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
        {title}
      </h4>
      <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
        <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
          {description}
        </p>
        <div >
          {error && <p className="text-red-500 text-[14px] mb-4">{error}</p>}
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
          {showInput && (
            <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
              {buttonDisabled ? (
                <p className="font-epilogue font-normal text-[16px] leading-[26px] text-[#808191] text-center">
                  {campaignStatus === 'Successful'
                    ? 'The campaign has succeeded and is no longer accepting donations.'
                    : 'The campaign has failed or expired.'}
                </p>
              ) : (
                <>
                  <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                    Back it because you believe in it.
                  </h4>
                  <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                    Support the project for no reward, just because it speaks to
                    you.
                  </p>
                </>
              )}
            </div>
          )}
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

export default ActionForm;
