import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";
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
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    console.log("Starting scanner..."); // Debug log
    setCameraError(null);
    setScanResult(null);
    
    // First, check if we can access the camera
    try {
      console.log("Checking camera permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // If we get here, camera access is granted
      console.log("Camera access granted, stopping test stream...");
      stream.getTracks().forEach(track => track.stop());
      
      // Now start the QR scanner
      setIsScanning(true);
    } catch (error) {
      console.error("Camera access failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission denied")) {
        setCameraError("Camera access denied. Please allow camera permissions and try again.");
      } else if (errorMessage.includes("NotFoundError")) {
        setCameraError("No camera found. Please check if your device has a camera.");
      } else {
        setCameraError(`Camera error: ${errorMessage}`);
      }
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear().then(() => {
        setScanner(null);
        setIsScanning(false);
      }).catch((error) => {
        console.error("Failed to clear scanner:", error);
        setScanner(null);
        setIsScanning(false);
      });
    }
  };

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log(`QR Code detected: ${decodedText}`, decodedResult);
    
    try {
      const qrData = parseQRCode(decodedText);

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
      const isUsed = Math.random() > 0.8; // 20% chance of being already used

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
        userName: `User ${qrData.userId.slice(-4)}`, // Mock user name
        message: "User entry completed successfully",
        timestamp: new Date(),
      });

      stopScanning();
    } catch (error) {
      console.error("Error parsing QR code:", error);
      setScanResult({
        success: false,
        message: "Error processing QR code",
        timestamp: new Date(),
      });
    }
  };

  const onScanFailure = (error: string) => {
    // Handle scan failure - usually this is just "No QR code found"
    console.debug("QR scan failed:", error);
    
    // Check for various types of camera errors
    if (error.includes("NotAllowedError") || 
        error.includes("Permission denied") ||
        error.includes("permission denied") ||
        error.includes("User denied")) {
      setCameraError("Camera access denied. Please allow camera permissions and refresh the page.");
      setIsScanning(false);
    } else if (error.includes("NotFoundError") || 
               error.includes("No camera found") ||
               error.includes("Could not start video source")) {
      setCameraError("No camera found. Please check if your device has a camera and it's not being used by another application.");
      setIsScanning(false);
    } else if (error.includes("NotReadableError") ||
               error.includes("Could not start video source")) {
      setCameraError("Camera is already in use by another application. Please close other camera apps and try again.");
      setIsScanning(false);
    } else if (error.includes("OverconstrainedError")) {
      setCameraError("Camera settings not supported. Trying with different settings...");
      // We could retry with different settings here
    }
    // For "QR code parse error" or similar, we don't show errors as these are normal
  };

  // Mock QR code detection for testing
  const simulateQRScan = () => {
    const mockQRData: QRCodeData = {
      registrationId: "reg-" + Math.random().toString(36).substr(2, 9),
      eventId: "event-123",
      userId: "user-" + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    };

    onScanSuccess(JSON.stringify(mockQRData), null);
  };

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanner]);

  // Initialize scanner when isScanning becomes true
  useEffect(() => {
    if (isScanning && !scanner) {
      const initScanner = () => {
        const scannerElement = document.getElementById("qr-reader");
        console.log("UseEffect - Scanner element found:", scannerElement);
        
        if (scannerElement) {
          try {
            // Try with comprehensive config first
            const config = {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              supportedScanTypes: [], // Only camera, no file upload
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 2,
              aspectRatio: 1.0, // Square aspect ratio
            };

            console.log("UseEffect - Creating scanner with config:", config);
            
            const html5QrCodeScanner = new Html5QrcodeScanner(
              "qr-reader",
              config,
              /* verbose= */ true // Enable verbose logging
            );

            console.log("UseEffect - Rendering scanner...");
            html5QrCodeScanner.render(
              (decodedText, decodedResult) => {
                console.log("Scan success callback triggered");
                onScanSuccess(decodedText, decodedResult);
              },
              (error) => {
                console.log("Scan failure callback triggered:", error);
                onScanFailure(error);
              }
            );
            setScanner(html5QrCodeScanner);
            console.log("UseEffect - Scanner created and rendered successfully");
            
            // Debug: Check what elements are created
            setTimeout(() => {
              const scanRegion = document.querySelector('#qr-reader__scan_region');
              const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
              const canvas = document.querySelector('#qr-reader canvas');
              console.log("Debug - Scan region:", scanRegion);
              console.log("Debug - Video element:", videoElement);
              console.log("Debug - Canvas element:", canvas);
              
              if (videoElement) {
                console.log("Debug - Video dimensions:", {
                  width: videoElement.offsetWidth,
                  height: videoElement.offsetHeight,
                  videoWidth: videoElement.videoWidth,
                  videoHeight: videoElement.videoHeight
                });
              }
            }, 2000);
          } catch (error) {
            console.error("UseEffect - Error creating scanner:", error);
            
            // Try with minimal config as fallback
            try {
              console.log("Trying fallback scanner configuration...");
              const fallbackConfig = {
                fps: 10,
                qrbox: 250,
              };
              
              const fallbackScanner = new Html5QrcodeScanner(
                "qr-reader",
                fallbackConfig,
                false
              );
              
              fallbackScanner.render(onScanSuccess, onScanFailure);
              setScanner(fallbackScanner);
              console.log("Fallback scanner created successfully");
            } catch (fallbackError) {
              console.error("Fallback scanner also failed:", fallbackError);
              const errorMessage = error instanceof Error ? error.message : String(error);
              setCameraError(`Failed to initialize camera scanner: ${errorMessage}`);
              setIsScanning(false);
            }
          }
        } else {
          // Retry after a short delay
          setTimeout(initScanner, 100);
        }
      };

      initScanner();
    }
  }, [isScanning, scanner]);

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

            {/* Camera Error Display */}
            {cameraError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <p className="text-red-700 text-sm">{cameraError}</p>
                </div>
                <button
                  onClick={() => setCameraError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </motion.div>
            )}

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
                  check-in. Make sure to allow camera access when prompted.
                </p>

                <button
                  onClick={async () => {
                    console.log("Button clicked!"); // Debug log
                    await startScanning();
                  }}
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
                {/* QR Scanner Container */}
                <div id="qr-reader" ref={scannerRef} className="w-full"></div>

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
