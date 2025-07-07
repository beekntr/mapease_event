import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTenant } from "../context/TenantContext";
import { Event } from "../types";

interface EventFormData {
  name: string;
  locationName: string;
  type: "open" | "closed";
}

const TenantDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    locationName: "",
    type: "open",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof EventFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }

    if (!formData.locationName.trim()) {
      newErrors.locationName = "Location name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Mock API call to create event
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newEvent: Event = {
        id: `event-${Date.now()}`,
        name: formData.name,
        locationName: formData.locationName,
        type: formData.type,
        tenantId: tenant?.id || "unknown",
        shareableLink: `${window.location.origin}/register/${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCreatedEvent(newEvent);
      setFormData({ name: "", locationName: "", type: "open" });
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {tenant?.name || "Organization Dashboard"}
                </h1>
                <p className="text-sm text-gray-500">Event Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={() => (window.location.href = "/approval-panel")}
                className="btn-secondary text-sm"
              >
                View Registrations
              </button>
              <button
                onClick={() => (window.location.href = "/qr-scanner")}
                className="btn-secondary text-sm"
              >
                QR Scanner
              </button>
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Event Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Create New Event
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input-field ${errors.name ? "border-red-500" : ""}`}
                    placeholder="e.g., Annual Tech Conference 2024"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="locationName" className="form-label">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    id="locationName"
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleInputChange}
                    className={`input-field ${errors.locationName ? "border-red-500" : ""}`}
                    placeholder="e.g., Main Auditorium"
                  />
                  {errors.locationName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.locationName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="form-label">
                    Event Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="open">Open Event</option>
                    <option value="closed">Closed Event</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Open events allow public registration, closed events require
                    approval
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Event...</span>
                    </div>
                  ) : (
                    "Create Event"
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Event Created Success */}
          {createdEvent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Event Created Successfully!
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Event Name:
                    </p>
                    <p className="text-green-800">{createdEvent.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Location:
                    </p>
                    <p className="text-green-800">
                      {createdEvent.locationName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Shareable Registration Link:
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={createdEvent.shareableLink}
                        readOnly
                        className="input-field text-sm bg-white"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(createdEvent.shareableLink)
                        }
                        className="btn-secondary text-sm whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-600">
                    Share this link with attendees to allow them to register for
                    your event.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => (window.location.href = "/approval-panel")}
              className="card hover:shadow-lg transition-shadow text-left p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Approval Panel</h4>
                  <p className="text-sm text-gray-500">Review registrations</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => (window.location.href = "/qr-scanner")}
              className="card hover:shadow-lg transition-shadow text-left p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 13h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">QR Scanner</h4>
                  <p className="text-sm text-gray-500">Check-in attendees</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => (window.location.href = "/map-view")}
              className="card hover:shadow-lg transition-shadow text-left p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Interactive Map</h4>
                  <p className="text-sm text-gray-500">View venue layout</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TenantDashboard;
