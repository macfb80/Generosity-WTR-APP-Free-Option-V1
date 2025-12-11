import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Trophy } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icon with Trust Score color coding
const createCustomIcon = (trustGrade) => {
  const colors = {
    'A': '#51B0E6', // Primary blue
    'B': '#51B0E6',
    'C': '#FFA500', // Warning orange
    'D': '#FF6B6B', // Danger red
    'F': '#FF0000'  // Critical red
  };
  
  const color = colors[trustGrade] || '#51B0E6';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 40px;
          height: 40px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: markerDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
          <span style="
            color: white;
            font-weight: bold;
            font-size: 18px;
            transform: rotate(45deg);
            font-family: 'Manrope', sans-serif;
          ">${trustGrade}</span>
        </div>
      </div>
      <style>
        @keyframes markerDrop {
          0% { transform: translateY(-50px) rotate(-45deg); opacity: 0; }
          60% { transform: translateY(5px) rotate(-45deg); }
          80% { transform: translateY(-2px) rotate(-45deg); }
          100% { transform: translateY(0) rotate(-45deg); opacity: 1; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Component to recenter map when locations change
const MapController = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 13, {
        animate: true,
        duration: 1
      });
    }
  }, [center, map]);
  
  return null;
};

const ScanMap = ({ isOpen, onClose, currentScan }) => {
  const [scanLocations, setScanLocations] = useState([]);
  const [viewMode, setViewMode] = useState('recent'); // 'recent', 'last10', 'all'
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default: San Francisco

  useEffect(() => {
    if (isOpen) {
      fetchScanLocations();
    }
  }, [isOpen, viewMode]);

  const fetchScanLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/history`);
      const scans = response.data;
      
      // Filter scans that have location data
      const scansWithLocation = scans.filter(scan => scan.location);
      
      // Apply view mode filter
      let filteredScans = scansWithLocation;
      if (viewMode === 'recent') {
        filteredScans = scansWithLocation.slice(0, 1);
      } else if (viewMode === 'last10') {
        filteredScans = scansWithLocation.slice(0, 10);
      }
      
      setScanLocations(filteredScans);
      
      // Set map center to most recent scan or current scan
      if (filteredScans.length > 0 && filteredScans[0].location) {
        setMapCenter([
          filteredScans[0].location.latitude,
          filteredScans[0].location.longitude
        ]);
      } else if (currentScan?.location) {
        setMapCenter([
          currentScan.location.latitude,
          currentScan.location.longitude
        ]);
      }
    } catch (error) {
      console.error('Error fetching scan locations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute inset-4 md:inset-8 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/20 bg-white">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-sans text-xl font-bold text-text-primary">
                  Scan Locations
                </h3>
                <p className="font-body text-sm text-text-secondary">
                  Where you've verified your water
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary/10 transition-colors"
            >
              <X className="w-6 h-6 text-text-primary" />
            </button>
          </div>

          {/* Toggle Controls */}
          <div className="flex gap-2 p-4 bg-background-subtle border-b border-secondary/20">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('recent')}
              className={`flex-1 py-3 px-4 rounded-xl font-body font-semibold text-sm transition-all ${
                viewMode === 'recent'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-text-secondary hover:bg-secondary/10'
              }`}
            >
              Most Recent
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('last10')}
              className={`flex-1 py-3 px-4 rounded-xl font-body font-semibold text-sm transition-all ${
                viewMode === 'last10'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-text-secondary hover:bg-secondary/10'
              }`}
            >
              Last 10
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('all')}
              className={`flex-1 py-3 px-4 rounded-xl font-body font-semibold text-sm transition-all ${
                viewMode === 'all'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-text-secondary hover:bg-secondary/10'
              }`}
            >
              All-Time
            </motion.button>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background-subtle">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"
                  />
                  <p className="font-body text-text-secondary">Loading map...</p>
                </div>
              </div>
            ) : scanLocations.length > 0 ? (
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={mapCenter} />
                
                {scanLocations.map((scan, index) => (
                  scan.location && (
                    <Marker
                      key={scan.id}
                      position={[scan.location.latitude, scan.location.longitude]}
                      icon={createCustomIcon(scan.trust_grade || 'C')}
                    >
                      <Popup>
                        <div className="p-3 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              scan.trust_grade === 'A' || scan.trust_grade === 'B' ? 'bg-primary' :
                              scan.trust_grade === 'C' ? 'bg-status-warning' : 'bg-status-danger'
                            }`}>
                              {scan.trust_grade}
                            </div>
                            <div>
                              <p className="font-body font-bold text-text-primary text-sm">
                                {scan.brand_name}
                              </p>
                              <p className="font-mono text-xs text-text-secondary">
                                Score: {scan.quality_score}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-text-muted mt-2">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(scan.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {scan.trust_badges && scan.trust_badges.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {scan.trust_badges.slice(0, 2).map((badge, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-background-subtle">
                <div className="text-center max-w-sm px-4">
                  <MapPin className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <h4 className="font-sans text-lg font-semibold text-text-primary mb-2">
                    No Location Data Yet
                  </h4>
                  <p className="font-body text-sm text-text-secondary">
                    Enable location permissions when scanning water to see your scan locations on the map.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          {scanLocations.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-primary/5 border-t border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-body text-sm text-text-primary font-semibold">
                    {scanLocations.length} {scanLocations.length === 1 ? 'Location' : 'Locations'} Tracked
                  </span>
                </div>
                <span className="font-body text-xs text-text-muted">
                  Avg Score: {Math.round(scanLocations.reduce((sum, s) => sum + s.quality_score, 0) / scanLocations.length)}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScanMap;
