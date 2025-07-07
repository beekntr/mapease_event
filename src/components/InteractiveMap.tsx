import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTenant } from "../context/TenantContext";

interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  type: "room" | "facility" | "entrance" | "emergency";
  description?: string;
}

const InteractiveMap: React.FC = () => {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock map locations - in real app, these would be extracted from SVG or API
  const locations: MapLocation[] = [
    {
      id: "1",
      name: "Main Entrance",
      x: 100,
      y: 150,
      type: "entrance",
      description: "Primary building entrance",
    },
    {
      id: "2",
      name: "Auditorium",
      x: 300,
      y: 200,
      type: "room",
      description: "Main event venue, capacity 500",
    },
    {
      id: "3",
      name: "Registration Desk",
      x: 150,
      y: 180,
      type: "facility",
      description: "Check-in and information",
    },
    {
      id: "4",
      name: "Conference Room A",
      x: 400,
      y: 150,
      type: "room",
      description: "Breakout session room",
    },
    {
      id: "5",
      name: "Emergency Exit",
      x: 500,
      y: 100,
      type: "emergency",
      description: "Emergency exit point",
    },
    {
      id: "6",
      name: "Cafeteria",
      x: 250,
      y: 300,
      type: "facility",
      description: "Food and beverages",
    },
    {
      id: "7",
      name: "Restrooms",
      x: 180,
      y: 250,
      type: "facility",
      description: "Public restrooms",
    },
  ];

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getLocationIcon = (type: MapLocation["type"]) => {
    const icons = {
      room: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      facility: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ),
      entrance: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      ),
      emergency: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      ),
    };
    return icons[type];
  };

  const getLocationColor = (type: MapLocation["type"]) => {
    const colors = {
      room: "text-blue-600 bg-blue-100",
      facility: "text-green-600 bg-green-100",
      entrance: "text-purple-600 bg-purple-100",
      emergency: "text-red-600 bg-red-100",
    };
    return colors[type];
  };

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

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
                Interactive Map
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
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r overflow-y-auto">
          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <label htmlFor="search" className="form-label">
                Search Locations
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search rooms, facilities..."
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </div>
            </div>

            {/* Location List */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Locations
              </h3>
              {filteredLocations.map((location) => (
                <motion.button
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedLocation?.id === location.id
                      ? "border-primary-300 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getLocationColor(location.type)}`}
                    >
                      {getLocationIcon(location.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {location.name}
                      </p>
                      {location.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {location.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
              <div className="space-y-2">
                {[
                  { type: "room" as const, label: "Rooms" },
                  { type: "facility" as const, label: "Facilities" },
                  { type: "entrance" as const, label: "Entrances" },
                  { type: "emergency" as const, label: "Emergency Exits" },
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${getLocationColor(type)}`}
                    >
                      {getLocationIcon(type)}
                    </div>
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-2 space-y-2">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13H5v-2h14v2z" />
              </svg>
            </button>
            <button
              onClick={resetView}
              className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </button>
          </div>

          {/* Map Container */}
          <div
            ref={mapRef}
            className="h-full bg-gray-100 overflow-hidden relative"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: "center center",
            }}
          >
            {/* Mock SVG Map - Replace with actual SVG content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-72 bg-white border-2 border-gray-300 rounded-lg relative shadow-lg">
                {/* Building outline */}
                <div className="absolute inset-4 border border-gray-400 rounded">
                  {/* Map locations */}
                  {locations.map((location) => (
                    <motion.button
                      key={location.id}
                      onClick={() => handleLocationClick(location)}
                      className={`absolute w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        selectedLocation?.id === location.id
                          ? "border-primary-600 shadow-lg scale-125 z-10"
                          : "border-white shadow-md hover:scale-110"
                      } ${getLocationColor(location.type)}`}
                      style={{
                        left: `${location.x - 16}px`,
                        top: `${location.y - 16}px`,
                      }}
                      whileHover={{
                        scale:
                          selectedLocation?.id === location.id ? 1.25 : 1.1,
                      }}
                      whileTap={{ scale: 1 }}
                    >
                      {getLocationIcon(location.type)}
                    </motion.button>
                  ))}
                </div>

                {/* Building Label */}
                <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded shadow text-sm font-medium text-gray-700">
                  {tenant?.name || "Event Venue"}
                </div>
              </div>
            </div>
          </div>

          {/* Location Info Panel */}
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getLocationColor(selectedLocation.type)}`}
                  >
                    {getLocationIcon(selectedLocation.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedLocation.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedLocation.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {selectedLocation.description && (
                <p className="text-gray-600 text-sm mb-3">
                  {selectedLocation.description}
                </p>
              )}

              <div className="flex space-x-2">
                <button className="btn-primary text-sm flex-1">
                  Get Directions
                </button>
                <button className="btn-secondary text-sm">
                  Share Location
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
