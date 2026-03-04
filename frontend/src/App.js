import React, { useState, useEffect } from 'react';
import '@/App.css';
import { Scan, History, Droplets, User, LogIn, Settings, MapPin, Home } from 'lucide-react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import WaterRing from './components/WaterRing';
import Scanner from './components/Scanner';
import Report from './components/Report';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import ScanMap from './components/ScanMap';
import ZipCodeTest from './components/ZipCodeTest';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latestScan, setLatestScan] = useState(null);
  const [stats, setStats] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showZipCodeTest, setShowZipCodeTest] = useState(false);
  const [latestHomeTest, setLatestHomeTest] = useState(null);
  const [homeTestHistory, setHomeTestHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
    fetchStats();
    
    // Check for existing auth token
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
      setAuthToken(token);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setScanHistory(response.data);
      if (response.data.length > 0) {
        setLatestScan(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleScan = async (barcode) => {
    setShowScanner(false);
    setIsLoading(true);
    toast.loading('🔍 Scanning barcode...', { id: 'scan' });

    try {
      // Brief delay to show scanning message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture geolocation
      let locationData = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          
          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          toast.loading('📍 Location captured • 🧪 Analyzing water quality...', { id: 'scan' });
        } catch (geoError) {
          console.log('Geolocation not available:', geoError);
          toast.loading('🧪 Analyzing water quality with AI...', { id: 'scan' });
        }
      } else {
        toast.loading('🧪 Analyzing water quality with AI...', { id: 'scan' });
      }
      
      const response = await axios.post(`${API}/scan`, {
        barcode,
        ...locationData,
        user_id: "user_001", // In production, use actual user ID
        app_version: "1.0.0"
      }, {
        timeout: 60000, // 60 second timeout for AI processing
      });
      
      setScanResult(response.data);
      setLatestScan(response.data);
      
      toast.success('✅ Water Quality Report Ready!', { id: 'scan' });
      
      // Automatically show report
      setTimeout(() => {
        setShowReport(true);
      }, 500);
      
      fetchHistory();
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(
        error.response?.data?.detail || '❌ Failed to analyze. Please try again.',
        { id: 'scan' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = (scan) => {
    setScanResult(scan);
    setShowReport(true);
  };

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setShowAuthModal(false);
    toast.success(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
  };

  return (
    <div className="min-h-screen bg-background" data-testid="app-container">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header */}
      <header className="border-b border-secondary/20 backdrop-blur-xl bg-white/95 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Left spacer */}
          <div className="w-10"></div>
          
          {/* Centered Generosity Water Intelligence Logo */}
          <img 
            src="https://customer-assets.emergentagent.com/job_waterfax-check/artifacts/hq3g7o5u_image.png" 
            alt="Generosity Water Intelligence" 
            className="w-full"
            data-testid="app-logo"
            style={{ maxWidth: '380px', height: 'auto' }}
          />
          
          {/* Right - Profile/Sign In */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative group">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-body text-sm font-semibold text-text-primary hidden sm:inline">
                    {currentUser.name?.split(' ')[0] || 'Profile'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white transition-all font-body font-semibold"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Scan Button - First Action */}
        <button
          data-testid="scan-new-water-btn"
          onClick={() => setShowScanner(true)}
          disabled={isLoading}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-sans font-bold text-lg transition-all shadow-neon disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <Scan className="w-6 h-6" />
          Scan Water Bottle
        </button>

        {/* Zip Code Water Test Button */}
        <button
          onClick={() => setShowZipCodeTest(true)}
          className="w-full p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 border-2 border-secondary/30 rounded-2xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-body font-bold text-text-primary group-hover:text-primary transition-colors">
                  Test Your Home Water
                </p>
                <p className="font-body text-xs text-text-muted">
                  Check tap water quality by ZIP code
                </p>
              </div>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold">→</span>
            </div>
          </div>
        </button>

        {/* Hero Ring with Trust Grade */}
        <div className="glass-card rounded-2xl p-8 text-center fade-in" data-testid="dashboard">
          <div className="relative inline-block">
            <WaterRing score={latestScan?.quality_score || 0} size={200} />
            {latestScan && latestScan.trust_grade && (
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-neon border-4 border-white">
                <span className="font-sans text-2xl font-bold text-white">
                  {latestScan.trust_grade}
                </span>
              </div>
            )}
          </div>
          <div className="mt-6">
            <h2 className="font-sans text-2xl font-semibold text-text-primary">
              {latestScan ? 'Latest Scan' : 'No Scans Yet'}
            </h2>
            {latestScan && (
              <>
                <p className="font-body text-text-secondary mt-2">
                  {latestScan.brand_name} {latestScan.product_name}
                </p>
                
                {/* Trust Badges */}
                {latestScan.trust_badges && latestScan.trust_badges.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {latestScan.trust_badges.slice(0, 3).map((badge, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full font-body text-xs font-semibold"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                
                <button
                  data-testid="view-latest-report-btn"
                  onClick={() => handleViewHistory(latestScan)}
                  className="mt-4 px-6 py-2 bg-secondary/10 hover:bg-secondary/20 text-text-primary rounded-full font-body text-sm transition-colors"
                >
                  View Full Report
                </button>
              </>
            )}
          </div>
        </div>

        {/* History */}
        {scanHistory.length > 0 && (
          <div className="glass-card rounded-2xl p-6 fade-in">
            <h3 className="font-sans text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Scans
            </h3>
            <div className="space-y-3" data-testid="scan-history-list">
              {scanHistory.slice(0, 5).map((scan) => (
                <button
                  key={scan.id}
                  data-testid={`history-item-${scan.id}`}
                  onClick={() => handleViewHistory(scan)}
                  className="w-full p-4 bg-background-subtle hover:bg-secondary/10 rounded-xl text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-body font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {scan.brand_name}
                      </p>
                      <p className="font-body text-sm text-text-secondary">
                        {new Date(scan.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="font-mono text-2xl font-bold text-primary">
                      {scan.quality_score}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access: View Scan Map */}
        {stats && stats.locations_tracked > 0 && (
          <button
            onClick={() => setShowMapModal(true)}
            className="w-full p-4 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-2 border-primary/30 rounded-2xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-body font-bold text-text-primary group-hover:text-primary transition-colors">
                    View Scan Map
                  </p>
                  <p className="font-body text-xs text-text-muted">
                    {stats.locations_tracked} {stats.locations_tracked === 1 ? 'location' : 'locations'} tracked
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">→</span>
              </div>
            </div>
          </button>
        )}

        {/* Water Tracker - Enhanced */}
        {stats && stats.total_scans > 0 && (
          <div className="glass-card rounded-2xl p-6 fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sans text-xl font-bold text-text-primary">
                Water Intelligence
              </h3>
              <div className="px-3 py-1 bg-primary/10 rounded-full">
                <p className="font-body text-xs font-semibold text-primary">
                  Health Score: {stats.health_score}
                </p>
              </div>
            </div>

            {/* Safety Alerts */}
            {stats.safety_alerts && stats.safety_alerts.length > 0 && (
              <div className="mb-6 p-4 bg-status-warning/10 border border-status-warning/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-status-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-semibold text-text-primary text-sm mb-1">
                      Safety Alert
                    </p>
                    <p className="font-body text-xs text-text-secondary">
                      {stats.safety_alerts[0].message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-primary" />
                  <p className="font-body text-xs text-text-secondary">This Week</p>
                </div>
                <p className="font-mono text-2xl font-bold text-primary">{stats.this_week}</p>
                <p className="font-body text-xs text-text-muted mt-1">
                  {stats.trend === 'improving' ? '📈 Improving' : stats.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                </p>
              </div>

              <div className="p-4 bg-background-subtle rounded-xl">
                <p className="font-body text-xs text-text-secondary mb-1">This Month</p>
                <p className="font-mono text-2xl font-bold text-text-primary">{stats.this_month}</p>
                <p className="font-body text-xs text-text-muted mt-1">
                  {stats.total_scans} total scans
                </p>
              </div>

              <div className="p-4 bg-background-subtle rounded-xl">
                <p className="font-body text-xs text-text-secondary mb-1">Clean Water %</p>
                <p className="font-mono text-2xl font-bold text-status-safe">{stats.clean_water_percentage}%</p>
                <p className="font-body text-xs text-text-muted mt-1">
                  Score ≥75
                </p>
              </div>

              <div className="p-4 bg-background-subtle rounded-xl">
                <p className="font-body text-xs text-text-secondary mb-1">Avg Score</p>
                <p className="font-mono text-2xl font-bold text-primary">{stats.average_trust_score}</p>
                <p className="font-body text-xs text-text-muted mt-1">
                  {stats.unique_brands_scanned} brands
                </p>
              </div>
            </div>

            {/* Locations Tracked */}
            {stats.locations_tracked > 0 && (
              <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Scan className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-body font-semibold text-text-primary text-sm">
                        {stats.locations_tracked} Locations Tracked
                      </p>
                      <p className="font-body text-xs text-text-muted">
                        Building your hydration map
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Top Rated Bottles */}
            {stats.top_5_cleanest && stats.top_5_cleanest.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-body font-semibold text-text-primary flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Top Rated Bottles
                  </h4>
                  <span className="font-body text-xs text-text-muted">
                    Best choices
                  </span>
                </div>
                <div className="space-y-2">
                  {stats.top_5_cleanest.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-background-subtle hover:bg-primary/5 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          item.trust_grade === 'A' ? 'bg-status-safe text-white' :
                          item.trust_grade === 'B' ? 'bg-primary text-white' :
                          'bg-secondary text-white'
                        }`}>
                          {item.trust_grade}
                        </div>
                        <div>
                          <p className="font-body font-semibold text-text-primary text-sm">{item.brand_name}</p>
                          <p className="font-body text-xs text-text-muted">{item.bottle_material} bottle</p>
                        </div>
                      </div>
                      <div className="font-mono text-lg font-bold text-primary">{item.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottles to Avoid */}
            {stats.brands_to_avoid && stats.brands_to_avoid.length > 0 && stats.brands_to_avoid[0].score < 70 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-body font-semibold text-text-primary flex items-center gap-2">
                    <div className="w-6 h-6 bg-status-warning/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    Bottles to Reconsider
                  </h4>
                  <span className="font-body text-xs text-text-muted">
                    Lower quality
                  </span>
                </div>
                <div className="space-y-2">
                  {stats.brands_to_avoid.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-status-warning/5 border border-status-warning/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-status-warning/20 rounded-full flex items-center justify-center font-bold text-sm text-status-warning">
                          {item.trust_grade}
                        </div>
                        <div>
                          <p className="font-body font-semibold text-text-primary text-sm">{item.brand_name}</p>
                          <p className="font-body text-xs text-text-muted">Consider upgrading</p>
                        </div>
                      </div>
                      <div className="font-mono text-lg font-bold text-status-warning">{item.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h3 className="font-sans text-lg font-semibold text-text-primary mb-3">
            About WTR APP
          </h3>
          <p className="font-body text-text-secondary text-sm leading-relaxed">
            WTR APP analyzes bottled water quality using the <strong>Trust but Verify™ System</strong>. 
            Get your WTR Trust Score™, badges, and insights from EPA, EWG, and state Title 21 reports.
          </p>
        </div>
      </main>

      {/* Scanner Overlay */}
      {showScanner && (
        <Scanner
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
        />
      )}

      {/* Report Overlay */}
      {showReport && (
        <Report
          scanResult={scanResult}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          authToken={authToken}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
          onUpdateProfile={handleProfileUpdate}
        />
      )}

      {/* Scan Map Modal - Quick Access */}
      {showMapModal && (
        <ScanMap
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          currentScan={latestScan}
        />
      )}

      {/* Zip Code Test Modal */}
      <ZipCodeTest
        isOpen={showZipCodeTest}
        onClose={() => setShowZipCodeTest(false)}
      />
    </div>
  );
}

export default App;