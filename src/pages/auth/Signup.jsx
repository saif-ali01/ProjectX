import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { api } from "../../utils/api";
import Toast from "../../components/common/Toast";

// Frontend form validation
const validateForm = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email address";
  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 8) errors.password = "Password must be at least 8 characters";
  else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password))
    errors.password = "Password must include uppercase, lowercase, number, and special character";
  return errors;
};

const Signup = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const error = query.get("error");

    if (error) {
      setToast({
        message: "Google authentication failed. Please try again.",
        type: "error",
        autoClose: 5000,
      });
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(form);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await api.post("/api/signup", form, { withCredentials: true });
      setToast({
        message: "Signup successful! Redirecting...",
        type: "success",
        autoClose: 3000,
      });
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setToast({
        message: err.response?.data?.error?.message || "Signup failed. Please try again.",
        type: "error",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setToast(null);
    setLoading(true);
    // Redirect to backend Google OAuth endpoint
    const backendUrl = `${
      process.env.NODE_ENV === "production"
        ? "https://projectxapi.onrender.com/auth/google"
        : "http://localhost:5000/auth/google"
    }`;
    console.log("Redirecting to Google OAuth:", backendUrl);
    window.location.href = backendUrl;
  };

  return (
    <div
      className={`max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md ${
        darkMode ? "bg-gray-800 border-gray-600 text-gray-100" : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            aria-describedby={formErrors.name ? "name-error" : undefined}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              formErrors.name
                ? "border-red-500"
                : darkMode
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-300"
            }`}
          />
          {formErrors.name && (
            <p id="name-error" className="text-red-500 text-sm mt-1">
              {formErrors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            aria-describedby={formErrors.email ? "email-error" : undefined}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              formErrors.email
                ? "border-red-500"
                : darkMode
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-300"
            }`}
          />
          {formErrors.email && (
            <p id="email-error" className="text-red-500 text-sm mt-1">
              {formErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
            aria-describedby={formErrors.password ? "password-error" : undefined}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              formErrors.password
                ? "border-red-500"
                : darkMode
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-300"
            }`}
          />
          {formErrors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1">
              {formErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      <div className="my-6 text-center text-gray-600">or</div>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-semibold flex items-center justify-center ${
          loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
        } transition-colors`}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.24 10.4V14.8H16.48C16.24 16.24 15.52 17.44 14.4 18.24L18.24 21.36C20.56 19.28 21.84 16.4 21.84 12.8C21.84 11.76 21.76 10.8 21.6 9.84H12.24V10.4Z" />
          <path d="M12 22C15.2 22 17.92 20.88 19.92 18.88L16.08 15.76C15.12 16.48 13.92 16.88 12 16.88C8.88 16.88 6.24 14.8 5.28 11.92H1.36V15.12C3.36 19.12 7.28 22 12 22Z" />
          <path d="M5.28 11.92C4.96 10.96 4.96 9.92 5.28 8.96V5.76H1.36C0.48 7.28 0 9.04 0 11C0 12.96 0.48 14.72 1.36 16.24L5.28 11.92Z" />
          <path d="M12 5.12C13.92 5.12 15.6 5.76 16.8 6.88L20.16 3.52C18.16 1.68 15.44 0.56 12 0.56C7.28 0.56 3.36 3.44 1.36 7.44L5.28 10.64C6.24 7.76 8.88 5.12 12 5.12Z" />
        </svg>
        {loading ? "Connecting..." : "Continue with Google"}
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          darkMode={darkMode}
          autoClose={toast.autoClose}
        />
      )}
    </div>
  );
};

Signup.propTypes = {
  darkMode: PropTypes.bool,
};

Signup.defaultProps = {
  darkMode: false,
};

export default Signup;