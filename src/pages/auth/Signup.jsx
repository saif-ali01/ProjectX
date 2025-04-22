
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/api";
import FormField from "../../components/common/FormField";
import Toast from "../../components/common/Toast";
import Spinner from "../../components/common/Spinner";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/signup", formData);
      setToast({ message: "Signup successful! Please login.", type: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Signup failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit}>
          <FormField
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            label="Name"
            required
          />
          <FormField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            label="Email"
            required
          />
          <FormField
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            label="Password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Sign Up"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Already have an account? Login
          </Link>
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Signup;
