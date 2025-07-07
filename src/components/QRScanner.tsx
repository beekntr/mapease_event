import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { QRCodeData } from "../types";
import { parseQRCode, isQRCodeValid } from "../utils/qrcode";

interface ScanResult {
  success: boolean;
  userName?: string;
  message: string;
  timestamp: Date;
}

const QRScanner: React.FC = () => {
  const { user, logout } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setScanResult({
        success: false,
        message: "Unable to access camera. Please check permissions.",
        timestamp: new Date(),
      });
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  // Mock QR code detection - in real app, use a proper QR scanner library
  const simulateQRScan = () => {
    // Simulate scanning a QR code
    const mockQRData: QRCodeData = {
      registrationId: "reg-1",
      eventId: "event-123",
      userId: "user-123",
      timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    };

    const qrData = parseQRCode(JSON.stringify(mockQRData));

    if (!qrData) {
      setScanResult({
        success: false,
        message: "Invalid QR code format",
        timestamp: new Date(),
      });
      return;
    }

    if (!isQRCodeValid(qrData)) {
      setScanResult({
        success: false,
        message: "QR code has expired",
        timestamp: new Date(),
      });
      return;
    }

    // Check if QR code has already been used (mock check)
    const isUsed = Math.random() > 0.7; // 30% chance of being already used

    if (isUsed) {
      setScanResult({
        success: false,
        message: "QR code has already been used",
        timestamp: new Date(),
      });
      return;
    }

    // Successful scan
    setScanResult({
      success: true,
      userName: "John Doe", // Mock user name
      message: "User entry completed successfully",
      timestamp: new Date(),
    });

    stopScanning();
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

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
                QR Code Scanner
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
          className="space-y-6"
        >
          {/* Scanner Interface */}
          <div className="card text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Scan Attendee QR Code
            </h2>

            {!isScanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-16 h-16 text-primary-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 13h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z" />
                  </svg>
                </div>

                <p className="text-gray-600">
                  Click the button below to start scanning QR codes for event
                  check-in
                </p>

                <button
                  onClick={startScanning}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Start Scanning
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-primary-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white"></div>

                      {/* Scanning line animation */}
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-primary-500"
                        animate={{ y: [0, 184, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-gray-600">
                  Position the QR code within the scanning area
                </p>

                <div className="flex space-x-4 justify-center">
                  <button onClick={simulateQRScan} className="btn-secondary">
                    Simulate Scan
                  </button>
                  <button onClick={stopScanning} className="btn-secondary">
                    Stop Scanning
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Scan Results */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`card ${scanResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      scanResult.success ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {scanResult.success ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        scanResult.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {scanResult.success ? "Entry Successful" : "Entry Failed"}
                    </h3>
                    <p
                      className={`text-sm ${
                        scanResult.success ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {scanResult.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {scanResult.userName && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-green-700">
                      Attendee:
                    </p>
                    <p className="text-green-800">{scanResult.userName}</p>
                  </div>
                )}

                <p
                  className={`${
                    scanResult.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {scanResult.message}
                </p>

                <button
                  onClick={() => setScanResult(null)}
                  className="mt-4 btn-secondary text-sm w-full"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Scanning Instructions
            </h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Ensure good lighting for optimal QR code detection</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                  Hold the device steady and position the QR code within the
                  scanning area
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Each QR code can only be used once for entry</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Invalid or expired QR codes will be rejected</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default QRScanner;
