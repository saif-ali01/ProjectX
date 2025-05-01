import React, { useEffect } from "react";
import PropTypes from "prop-types";

const Toast = ({ message, type, onClose, darkMode }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xs md:max-w-md z-50">
        <div
          className={`relative flex items-center justify-between p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === "error"
              ? darkMode
                ? "bg-red-600/90 text-white"
                : "bg-red-500/90 text-white"
              : darkMode
              ? "bg-green-600/90 text-white"
              : "bg-green-500/90 text-white"
          } font-semibold backdrop-blur-sm`}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 h-1 w-full bg-black/10">
            <div
              className={`h-full ${
                type === "error" ? "bg-red-200" : "bg-green-200"
              } animate-progress`}
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Icons */}
            {type === "error" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span className="text-sm md:text-base">{message}</span>
          </div>

          <button
            onClick={onClose}
            className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0; }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "info"]).isRequired,
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

Toast.defaultProps = {
  darkMode: false,
};

export default Toast;