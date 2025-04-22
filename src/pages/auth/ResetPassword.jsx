import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../../utils/api";
import FormField from "../../components/common/FormField";
import Toast from "../../components/common/Toast";
import Spinner from "../../components/common/Spinner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const token = searchParams.get("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/reset-password/confirm", {
        token,
        newPassword: formData.newPassword,
      });
      setToast({
        message: "Password reset successfully",
        type: "success",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to reset password",
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
          Reset Password
        </h2>
        <form onSubmit={handleSubmit}>
          <FormField
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            label="New Password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Reset Password"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Login
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

export default ResetPassword;