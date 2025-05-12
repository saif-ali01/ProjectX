import React, { useState, useRef } from 'react';

const OTPInput = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputsRef = useRef([]);

  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/, ''); // only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to next box
    if (index < 3) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = () => {
    alert('Entered OTP: ' + otp.join(''));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">OTP Verification</h2>
        <p className="text-gray-500 mb-6">Enter the 4-digit code sent to your email</p>
        <div className="flex justify-between mb-6 space-x-3">
          {otp.map((data, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              maxLength="1"
              value={otp[i]}
              onChange={(e) => handleChange(e.target, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-12 text-xl text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default OTPInput;
