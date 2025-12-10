import React, { useState, useEffect } from 'react';
import '@/App.css';
import { Scan, History, Droplets } from 'lucide-react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import WaterRing from './components/WaterRing';
import Scanner from './components/Scanner';
import Report from './components/Report';

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

  useEffect(() => {
    fetchHistory();
    fetchStats();
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
      
      toast.loading('🧪 Analyzing water quality with AI...', { id: 'scan' });
      
      const response = await axios.post(`${API}/scan`, { barcode }, {
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

  return (
    <div className="min-h-screen bg-background" data-testid="app-container">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header */}
      <header className="border-b border-secondary/20 backdrop-blur-xl bg-white/95 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-center">
          {/* Centered Generosity Logo - 25% Smaller */}
          <img 
            src="https://customer-assets.emergentagent.com/job_waterfax-check/artifacts/5hx57fqb_image.png" 
            alt="Generosity Logo" 
            className="w-full"
            data-testid="app-logo"
            style={{ maxWidth: '410px', height: 'auto' }}
          />
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

        {/* My Bottle Stats */}
        {stats && stats.total_scans > 0 && (
          <div className="glass-card rounded-2xl p-6 fade-in">
            <h3 className="font-sans text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              My Bottle Log
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-primary">{stats.total_scans}</p>
                <p className="font-body text-xs text-text-muted mt-1">Bottles Scanned</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-primary">{stats.average_trust_score}</p>
                <p className="font-body text-xs text-text-muted mt-1">Avg Trust Score</p>
              </div>
              <div className="text-center">
                <p className="font-body text-sm font-bold text-text-primary truncate">{stats.most_scanned_brand}</p>
                <p className="font-body text-xs text-text-muted mt-1">Most Scanned</p>
              </div>
            </div>
            
            {/* Top 5 Cleanest */}
            {stats.top_5_cleanest && stats.top_5_cleanest.length > 0 && (
              <div className="mt-4">
                <h4 className="font-body font-semibold text-text-primary mb-3 text-sm">
                  🏆 Top 5 Cleanest Bottles You've Found
                </h4>
                <div className="space-y-2">
                  {stats.top_5_cleanest.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg font-bold text-primary">#{idx + 1}</span>
                        <div>
                          <p className="font-body font-semibold text-text-primary text-sm">{item.brand_name}</p>
                          <p className="font-body text-xs text-text-muted">{item.product_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xl font-bold text-primary">{item.trust_grade}</span>
                        <span className="font-body text-xs text-text-muted">{item.score}</span>
                      </div>
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
    </div>
  );
}

export default App;