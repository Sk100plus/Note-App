import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword((prev) => !prev);
  };

  return (
    <div className="flex items-center border-[1.5px] rounded mb-3 relative">
      <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "password" : "text"} // Prevent showing text on eye toggle
        placeholder={placeholder || "Password"}
        className=" pasin w-full text-sm py-3 px-5 rounded outline-none peer"
      />

      <button
        type="button"
        onClick={toggleShowPassword}
        className="absolute right-3 cursor-pointer"
      >
        {isShowPassword ? (
          <FaRegEyeSlash size={22} className="text-slate-400" />
        ) : (
          <FaRegEye size={22} className="text-[#2B85FF]" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
