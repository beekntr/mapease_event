import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TenantProvider } from "./context/TenantContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import TenantDashboard from "./components/TenantDashboard";
import EventRegistration from "./components/EventRegistration";
import ApprovalPanel from "./components/ApprovalPanel";
import QRScanner from "./components/QRScanner";
import InteractiveMap from "./components/InteractiveMap";

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/register/:eventId"
                element={<EventRegistration />}
              />

              {/* Super Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Tenant Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="tenant_admin">
                    <TenantDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes (Any authenticated user) */}
              <Route
                path="/approval-panel"
                element={
                  <ProtectedRoute>
                    <ApprovalPanel />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/qr-scanner"
                element={
                  <ProtectedRoute>
                    <QRScanner />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/map-view"
                element={
                  <ProtectedRoute>
                    <InteractiveMap />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
