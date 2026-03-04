import React, { useState } from 'react';
import { X, MapPin, AlertTriangle, CheckCircle, Droplets, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ZipCodeTest = ({ isOpen, onClose }) => {
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleTest = async (e) => {
    e.preventDefault();
    
    if (!zipCode || zipCode.length < 5) {
      toast.error('Please enter a valid ZIP code');
      return;
    }

    setLoading(true);
    toast.loading('Analyzing water quality...', { id: 'zip-test' });

    try {
      const response = await axios.post(`${API}/water-quality/zip`, {
        zip_code: zipCode,
        address: address || null
      });

      setResults(response.data);
      toast.success('Water quality report ready!', { id: 'zip-test' });
    } catch (error) {
      console.error('Zip code test error:', error);
      toast.error(
        error.response?.data?.detail || 'Failed to fetch water quality data',
        { id: 'zip-test' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setZipCode('');
    setAddress('');
    setResults(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="min-h-screen flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                  <Droplets className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-sans text-2xl font-bold text-white">
                    Zip Code Water Test
                  </h2>
                  <p className="font-body text-sm text-white/80">
                    Check your home's tap water quality
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!results ? (
                <>
                  {/* Info Section */}
                  <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="font-body text-sm text-text-primary">
                      <strong className="text-primary">Learn about your tap water:</strong> Enter your ZIP code to see contaminants, violations, and water quality data from EPA databases for your local water utility.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleTest} className="space-y-4">
                    {/* Address Input */}
                    <div>
                      <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                        Street Address (Optional)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="123 Main St, City, State"
                          className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    {/* ZIP Code Input */}
                    <div>
                      <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                        ZIP Code <span className="text-status-danger">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          placeholder="Enter 5-digit ZIP code"
                          required
                          maxLength="5"
                          className="w-full px-4 py-4 bg-background-subtle border-2 border-secondary/30 rounded-xl text-text-primary font-mono text-lg focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <p className="font-body text-xs text-text-muted mt-2">
                        Example: 10001, 90210, 85001
                      </p>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || !zipCode || zipCode.length !== 5}
                      className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-body font-semibold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing Water Quality...
                        </>
                      ) : (
                        <>
                          <Droplets className="w-5 h-5" />
                          Test My Water
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* Features */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-body text-sm text-text-primary font-semibold">EPA Data</p>
                      <p className="font-body text-xs text-text-muted mt-1">Official government reports</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-body text-sm text-text-primary font-semibold">Violations</p>
                      <p className="font-body text-xs text-text-muted mt-1">Safety limit exceedances</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-body text-sm text-text-primary font-semibold">Trends</p>
                      <p className="font-body text-xs text-text-muted mt-1">Historical comparisons</p>
                    </div>
                  </div>
                </>
              ) : (
                <WaterQualityResults results={results} onReset={handleReset} />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const WaterQualityResults = ({ results, onReset }) => {
  const getSeverityColor = (level) => {
    if (level === 'high') return 'status-danger';
    if (level === 'medium') return 'status-warning';
    return 'status-safe';
  };

  const getSeverityIcon = (level) => {
    if (level === 'high') return AlertTriangle;
    if (level === 'medium') return AlertCircle;
    return CheckCircle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-sans text-xl font-bold text-text-primary">
            Water Quality Report
          </h3>
          <p className="font-body text-sm text-text-muted">
            ZIP Code: {results.zip_code} • {results.utility_name}
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-text-primary rounded-lg font-body text-sm font-semibold transition-colors"
        >
          New Test
        </button>
      </div>

      {/* Overall Quality Score */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-text-secondary mb-1">Overall Water Quality</p>
            <p className="font-sans text-4xl font-bold text-primary">{results.quality_score}</p>
            <p className="font-body text-sm text-text-muted mt-1">Out of 100</p>
          </div>
          <div className={`w-16 h-16 rounded-full bg-${getSeverityColor(results.risk_level)} flex items-center justify-center`}>
            <p className="font-sans text-2xl font-bold text-white">{results.grade}</p>
          </div>
        </div>
      </div>

      {/* Contaminants Detected */}
      {results.contaminants && results.contaminants.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h4 className="font-sans text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            Contaminants Detected ({results.contaminants.length})
          </h4>
          <div className="space-y-3">
            {results.contaminants.map((contaminant, idx) => {
              const Icon = getSeverityIcon(contaminant.severity);
              return (
                <div
                  key={idx}
                  className={`p-4 bg-${getSeverityColor(contaminant.severity)}/5 border border-${getSeverityColor(contaminant.severity)}/20 rounded-xl`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`w-5 h-5 text-${getSeverityColor(contaminant.severity)} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <p className="font-body font-semibold text-text-primary">{contaminant.name}</p>
                        <p className="font-body text-sm text-text-secondary mt-1">{contaminant.description}</p>
                        <div className="mt-2 flex items-center gap-4 font-mono text-xs">
                          <span className="text-text-muted">
                            Detected: <strong>{contaminant.level}</strong>
                          </span>
                          <span className="text-text-muted">
                            Limit: <strong>{contaminant.legal_limit}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    {contaminant.exceeds_limit && (
                      <span className="px-2 py-1 bg-status-danger/20 text-status-danger rounded-full text-xs font-semibold whitespace-nowrap">
                        Exceeds Limit
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Violations */}
      {results.violations && results.violations.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h4 className="font-sans text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-status-warning" />
            Recent Violations ({results.violations.length})
          </h4>
          <div className="space-y-2">
            {results.violations.map((violation, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-status-warning/5 border border-status-warning/20 rounded-lg"
              >
                <div>
                  <p className="font-body font-semibold text-text-primary text-sm">{violation.type}</p>
                  <p className="font-body text-xs text-text-muted">{violation.date}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="glass-card rounded-2xl p-6 bg-primary/5 border border-primary/20">
          <h4 className="font-sans text-lg font-bold text-text-primary mb-4">
            💡 Recommendations
          </h4>
          <ul className="space-y-2">
            {results.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                <p className="font-body text-sm text-text-primary">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Source */}
      <div className="p-4 bg-background-subtle rounded-xl">
        <p className="font-body text-xs text-text-muted text-center">
          Data sourced from EPA Safe Drinking Water Information System (SDWIS) • Last updated: {results.last_updated}
        </p>
      </div>
    </motion.div>
  );
};

export default ZipCodeTest;
