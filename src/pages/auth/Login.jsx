
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../utils/api";
import FormField from "../../components/common/FormField";
import Toast from "../../components/common/Toast";
import Spinner from "../../components/common/Spinner";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Send credentials with cookies
      await api.post("/api/login", formData, { withCredentials: true });
      
      // Verify authentication status
      const meResponse = await api.get("/api/me", { withCredentials: true });
      
      if (meResponse.data.id) {
        setToast({ message: "Login successful", type: "success" });
        navigate("/");
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Login failed",
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
          Login
        </h2>
        <form onSubmit={handleSubmit}>
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
            autocomplete="current-password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link
            to="/reset-password"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="mt-2 text-center">
          <Link
            to="/signup"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Don't have an account? Sign Up
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

export default Login;
