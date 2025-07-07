import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Registration, QRCodeData } from "../types";
import { generateQRCode } from "../utils/qrcode";

const ApprovalPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockRegistrations: Registration[] = [
      {
        id: "reg-1",
        eventId: "event-123",
        name: "John Doe",
        email: "john.doe@company.com",
        phone: "+1-555-0123",
        status: "pending",
        isUsed: false,
        createdAt: new Date("2024-01-15T10:30:00"),
        updatedAt: new Date("2024-01-15T10:30:00"),
      },
      {
        id: "reg-2",
        eventId: "event-123",
        name: "Jane Smith",
        email: "jane.smith@company.com",
        phone: "+1-555-0124",
        status: "pending",
        isUsed: false,
        createdAt: new Date("2024-01-15T11:15:00"),
        updatedAt: new Date("2024-01-15T11:15:00"),
      },
      {
        id: "reg-3",
        eventId: "event-123",
        name: "Bob Johnson",
        email: "bob.johnson@company.com",
        phone: "+1-555-0125",
        status: "approved",
        qrCode: "data:image/png;base64,mock-qr-code",
        isUsed: false,
        createdAt: new Date("2024-01-15T09:45:00"),
        updatedAt: new Date("2024-01-15T12:00:00"),
      },
    ];

    setTimeout(() => {
      setRegistrations(mockRegistrations);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleApproval = async (registrationId: string, approved: boolean) => {
    setProcessingIds((prev) => new Set(prev).add(registrationId));

    try {
      let qrCode = "";
      if (approved) {
        // Generate QR code for approved user
        const qrData: QRCodeData = {
          registrationId,
          eventId: "event-123",
          userId: `user-${registrationId}`,
          timestamp: Date.now(),
        };
        qrCode = await generateQRCode(qrData);
      }

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId
            ? {
                ...reg,
                status: approved ? "approved" : "rejected",
                qrCode: approved ? qrCode : undefined,
                updatedAt: new Date(),
              }
            : reg,
        ),
      );
    } catch (error) {
      console.error("Error processing approval:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(registrationId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: Registration["status"]) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const downloadQRCode = (qrCode: string, userName: string) => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `qr-code-${userName.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Registration Approval Panel
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
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Registrations",
                value: registrations.length,
                color: "blue",
              },
              {
                label: "Pending",
                value: registrations.filter((r) => r.status === "pending")
                  .length,
                color: "yellow",
              },
              {
                label: "Approved",
                value: registrations.filter((r) => r.status === "approved")
                  .length,
                color: "green",
              },
              {
                label: "Rejected",
                value: registrations.filter((r) => r.status === "rejected")
                  .length,
                color: "red",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card text-center"
              >
                <div
                  className={`text-2xl font-bold text-${stat.color}-600 mb-1`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Registrations List */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Event Registrations
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <motion.tr
                      key={registration.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {registration.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {registration.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.createdAt.toLocaleDateString()}{" "}
                        {registration.createdAt.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(registration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {registration.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApproval(registration.id, true)
                                }
                                disabled={processingIds.has(registration.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                              >
                                {processingIds.has(registration.id)
                                  ? "Processing..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() =>
                                  handleApproval(registration.id, false)
                                }
                                disabled={processingIds.has(registration.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {registration.status === "approved" &&
                            registration.qrCode && (
                              <button
                                onClick={() =>
                                  downloadQRCode(
                                    registration.qrCode!,
                                    registration.name,
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Download QR
                              </button>
                            )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {registrations.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No registrations
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No one has registered for this event yet.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ApprovalPanel;
