import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

interface TenantFormData {
  placeName: string;
  subdomain: string;
  mapFile: File | null;
}

interface FormErrors {
  placeName?: string;
  subdomain?: string;
  mapFile?: string;
}

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState<TenantFormData>({
    placeName: "",
    subdomain: "",
    mapFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, mapFile: file }));

    if (errors.mapFile) {
      setErrors((prev) => ({ ...prev, mapFile: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.placeName.trim()) {
      newErrors.placeName = "Place name is required";
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = "Subdomain is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain =
        "Subdomain can only contain lowercase letters, numbers, and hyphens";
    }

    if (!formData.mapFile) {
      newErrors.mapFile = "SVG map file is required";
    } else if (!formData.mapFile.name.endsWith(".svg")) {
      newErrors.mapFile = "Please upload an SVG file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Mock API call to create tenant
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to the created subdomain
      const protocol = window.location.protocol;
      if (window.location.hostname.includes("localhost")) {
        window.location.href = `${protocol}//localhost:3000/dashboard?tenant=${formData.subdomain}`;
      } else {
        window.location.href = `${protocol}//${formData.subdomain}.mapease.com`;
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                MapEase Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create New Tenant
            </h2>
            <p className="text-gray-600">
              Set up a new organization with their custom map and subdomain.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="placeName" className="form-label">
                  Place Name *
                </label>
                <input
                  type="text"
                  id="placeName"
                  name="placeName"
                  value={formData.placeName}
                  onChange={handleInputChange}
                  className={`input-field ${errors.placeName ? "border-red-500" : ""}`}
                  placeholder="e.g., Microsoft Campus Building A"
                />
                {errors.placeName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.placeName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subdomain" className="form-label">
                  Subdomain *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleInputChange}
                    className={`input-field rounded-r-none ${errors.subdomain ? "border-red-500" : ""}`}
                    placeholder="company-name"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    .mapease.com
                  </span>
                </div>
                {errors.subdomain && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.subdomain}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  This will be accessible at https://
                  {formData.subdomain || "your-subdomain"}.mapease.com
                </p>
              </div>

              <div>
                <label htmlFor="mapFile" className="form-label">
                  SVG Map File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="mapFile"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload SVG file</span>
                        <input
                          id="mapFile"
                          name="mapFile"
                          type="file"
                          accept=".svg"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">SVG files only</p>
                    {formData.mapFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {formData.mapFile.name}
                      </p>
                    )}
                  </div>
                </div>
                {errors.mapFile && (
                  <p className="mt-1 text-sm text-red-600">{errors.mapFile}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Tenant...</span>
                    </div>
                  ) : (
                    "Create Tenant"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
