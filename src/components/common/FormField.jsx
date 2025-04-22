import React from "react";

const FormField = ({ type, name, value, onChange, label, required, children, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
        {label}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required={required}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required={required}
          {...props}
        />
      )}
    </div>
  );
};

export default FormField;