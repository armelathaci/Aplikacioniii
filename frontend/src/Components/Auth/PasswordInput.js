import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function PasswordInput({ 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  style = {}, 
  iconStyle = {},
  isMobile = false 
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const iconSize = isMobile ? 18 : 22;
  const inputHeight = isMobile ? 36 : 44;
  const leftPadding = isMobile ? 36 : 44;

  return (
    <div style={{ position: 'relative', marginBottom: isMobile ? 6 : 12 }}>
      {/* Lock icon on the left */}
      <span className="input-icon" style={{
        left: isMobile ? 8 : 14,
        top: '40%',
        position: 'absolute',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        height: inputHeight,
        ...iconStyle
      }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" style={{filter: 'brightness(0) invert(1)'}}>
          <path d="M17 11V7a5 5 0 10-10 0v4" stroke="#00eaff" strokeWidth="1.5"/>
          <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#00eaff" strokeWidth="1.5"/>
          <circle cx="12" cy="15.5" r="1.5" fill="#00eaff"/>
        </svg>
      </span>

      {/* Password input field */}
      <input
        className="login-input"
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          paddingLeft: leftPadding,
          height: inputHeight,
          ...style
        }}
      />

      {/* Eye icon on the right */}
      <button
        type="button"
        onClick={togglePasswordVisibility}
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSize,
          height: iconSize,
          color: '#00eaff',
          padding: 0
        }}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <FaEyeSlash size={iconSize} /> : <FaEye size={iconSize} />}
      </button>
    </div>
  );
}

export default PasswordInput;