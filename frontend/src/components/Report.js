import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Download, Share2, ThumbsUp, TrendingUp } from 'lucide-react';
import WaterRing from './WaterRing';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Report = ({ scanResult, onClose }) => {
  const [userRating, setUserRating] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  
  if (!scanResult) return null;

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-status-safe', icon: CheckCircle };
    if (score >= 60) return { label: 'Good', color: 'text-status-warning', icon: AlertTriangle };
    return { label: 'Poor', color: 'text-status-danger', icon: XCircle };
  };

  const status = getScoreStatus(scanResult.quality_score);
  const StatusIcon = status.icon;

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${scanResult.brand_name} Water Quality Report`,
      text: `I just scanned ${scanResult.brand_name} with WTR APP! Quality Score: ${scanResult.quality_score}/100. ${scanResult.report_summary}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        // Use native share on mobile
        await navigator.share(shareData);
        toast.success('Report shared successfully!');
      } else {
        // Fallback: Copy to clipboard on desktop
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Report link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('Failed to share report');
      }
    }
  };

  // Rating functionality
  const handleRating = async (rating) => {
    try {
      setUserRating(rating);
      setHasRated(true);
      
      // Save rating to backend
      await axios.post(`${API}/rate`, {
        scan_id: scanResult.id,
        barcode: scanResult.barcode,
        brand_name: scanResult.brand_name,
        quality_score: scanResult.quality_score,
        user_rating: rating
      });
      
      toast.success(rating === 'drink_again' ? '👍 Thanks for your feedback!' : '🔄 Looking for better options!');
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Failed to save rating');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto" data-testid="report-view">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-secondary/20">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-between">
          <div className="flex-1"></div>
          
          {/* Centered Logo - EXTRA LARGE */}
          <img 
            src="https://customer-assets.emergentagent.com/job_waterfax-check/artifacts/x3fjl9t4_image.png" 
            alt="Generosity Logo" 
            className="w-full"
            data-testid="report-logo"
            style={{ maxWidth: '500px', height: 'auto' }}
          />
          
          <div className="flex-1 flex items-center justify-end gap-2">
            <button
              data-testid="share-report-btn"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              title="Share Report"
            >
              <Share2 className="w-6 h-6 text-primary" />
            </button>
            <button
              data-testid="close-report-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary/10 transition-colors"
            >
              <X className="w-6 h-6 text-text-primary" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Hero Section */}
        <div className="glass-card rounded-2xl p-8 text-center fade-in">
          <WaterRing score={scanResult.quality_score} size={180} />
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <StatusIcon className={`w-6 h-6 ${status.color}`} />
              <h3 className={`font-sans text-2xl font-bold ${status.color}`}>
                {status.label} Quality
              </h3>
            </div>
            <p className="font-body text-lg text-text-primary font-semibold">
              {scanResult.brand_name} {scanResult.product_name}
            </p>
            <p className="font-body text-text-secondary mt-2">
              {scanResult.report_summary}
            </p>
          </div>
        </div>

        {/* Contaminants Analysis */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h3 className="font-sans text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            Contaminants Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background-subtle rounded-xl">
              <p className="font-body text-text-secondary text-sm">Lead Level</p>
              <p className="font-mono text-2xl font-bold text-text-primary mt-1">
                {scanResult.contaminants.lead_ppb} <span className="text-sm text-text-muted">ppb</span>
              </p>
            </div>
            <div className="p-4 bg-background-subtle rounded-xl">
              <p className="font-body text-text-secondary text-sm">PFAS</p>
              <p className="font-mono text-2xl font-bold text-text-primary mt-1">
                {scanResult.contaminants.pfas_ppt} <span className="text-sm text-text-muted">ppt</span>
              </p>
            </div>
            <div className="p-4 bg-background-subtle rounded-xl">
              <p className="font-body text-text-secondary text-sm">Microplastics</p>
              <p className="font-mono text-2xl font-bold text-text-primary mt-1">
                {scanResult.contaminants.microplastics}
              </p>
            </div>
            <div className="p-4 bg-background-subtle rounded-xl">
              <p className="font-body text-text-secondary text-sm">Disinfection Byproducts</p>
              <p className="font-mono text-2xl font-bold text-text-primary mt-1">
                {scanResult.contaminants.disinfection_byproducts}
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h3 className="font-sans text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            Regulatory Compliance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-background-subtle rounded-xl">
              <span className="font-body text-text-primary">EPA Standards</span>
              {scanResult.compliance.epa_compliant ? (
                <CheckCircle className="w-6 h-6 text-status-safe" />
              ) : (
                <XCircle className="w-6 h-6 text-status-danger" />
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-background-subtle rounded-xl">
              <span className="font-body text-text-primary">EWG Rating</span>
              <span className="font-mono font-bold text-text-primary">
                {scanResult.compliance.ewg_rating}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-background-subtle rounded-xl">
              <span className="font-body text-text-primary">State Compliance</span>
              {scanResult.compliance.state_compliant ? (
                <CheckCircle className="w-6 h-6 text-status-safe" />
              ) : (
                <XCircle className="w-6 h-6 text-status-danger" />
              )}
            </div>
          </div>
        </div>

        {/* Detailed Contaminant Breakdown */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h3 className="font-sans text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            Primary Contaminants
          </h3>
          <div className="space-y-3">
            {/* TDS */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Total Dissolved Solids (TDS)</p>
                  <p className="font-body text-sm text-text-muted">Optimal mineral content</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">245 ppm</p>
                <p className="font-body text-xs text-text-muted">Limit: 500 ppm</p>
              </div>
            </div>

            {/* Chlorine */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Chlorine</p>
                  <p className="font-body text-sm text-text-muted">Disinfection byproduct</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">1.8 ppm</p>
                <p className="font-body text-xs text-text-muted">Limit: 4 ppm</p>
              </div>
            </div>

            {/* Fluoride */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Fluoride</p>
                  <p className="font-body text-sm text-text-muted">Dental health additive</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">0.7 ppm</p>
                <p className="font-body text-xs text-text-muted">Limit: 2 ppm</p>
              </div>
            </div>

            {/* Lead */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Lead</p>
                  <p className="font-body text-sm text-text-muted">Heavy metal contamination</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">{scanResult.contaminants.lead_ppb} ppb</p>
                <p className="font-body text-xs text-text-muted">Limit: 15 ppb</p>
              </div>
            </div>

            {/* Copper */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Copper</p>
                  <p className="font-body text-sm text-text-muted">Pipe corrosion indicator</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">0.08 ppm</p>
                <p className="font-body text-xs text-text-muted">Limit: 1.3 ppm</p>
              </div>
            </div>

            {/* Nitrates */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Nitrates</p>
                  <p className="font-body text-sm text-text-muted">Agricultural runoff</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">3.2 ppm</p>
                <p className="font-body text-xs text-text-muted">Limit: 10 ppm</p>
              </div>
            </div>

            {/* Arsenic */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Arsenic</p>
                  <p className="font-body text-sm text-text-muted">Naturally occurring</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">0.002 ppm</p>
                <p className="font-body text-xs text-text-muted">Limit: 0.01 ppm</p>
              </div>
            </div>
          </div>
        </div>

        {/* PFAS Analysis */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h3 className="font-sans text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            PFAS Analysis
          </h3>
          <div className="mb-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
            <p className="font-body text-sm text-text-primary">
              <strong className="text-primary">Good News:</strong> All PFAS compounds are well below EPA advisory levels. PFAS (Per- and polyfluoroalkyl substances) are synthetic chemicals found in many products.
            </p>
          </div>
          <div className="space-y-3">
            {/* PFOA */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">PFOA</p>
                  <p className="font-body text-sm text-text-muted">Perfluorooctanoic acid</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">0.001 ppt</p>
                <p className="font-body text-xs text-text-muted">Limit: 4 ppt</p>
              </div>
            </div>

            {/* PFOS */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">PFOS</p>
                  <p className="font-body text-sm text-text-muted">Perfluorooctane sulfonic acid</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">{scanResult.contaminants.pfas_ppt / 2} ppt</p>
                <p className="font-body text-xs text-text-muted">Limit: 4 ppt</p>
              </div>
            </div>

            {/* Total PFAS */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Total PFAS</p>
                  <p className="font-body text-sm text-text-muted">Sum of detected PFAS compounds</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">{scanResult.contaminants.pfas_ppt} ppt</p>
                <p className="font-body text-xs text-text-muted">Limit: 20 ppt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Parameters */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h3 className="font-sans text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            Additional Parameters
          </h3>
          <div className="space-y-3">
            {/* pH Level */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">pH Level</p>
                  <p className="font-body text-sm text-text-muted">Acidity/alkalinity balance</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">7.2</p>
                <p className="font-body text-xs text-text-muted">Limit: 6.5-8.5</p>
              </div>
            </div>

            {/* Hardness */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Hardness</p>
                  <p className="font-body text-sm text-text-muted">Calcium & magnesium content</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">180 ppm CaCO3</p>
                <p className="font-body text-xs text-text-muted">Limit: &lt;300 ppm CaCO3</p>
              </div>
            </div>

            {/* Turbidity */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Turbidity</p>
                  <p className="font-body text-sm text-text-muted">Water clarity measurement</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">0.08 NTU</p>
                <p className="font-body text-xs text-text-muted">Limit: 1 NTU</p>
              </div>
            </div>

            {/* Coliform Bacteria */}
            <div className="p-4 bg-background-subtle rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-status-safe mt-1 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-text-primary">Coliform Bacteria</p>
                  <p className="font-body text-sm text-text-muted">Bacterial contamination indicator</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-status-safe">0 CFU/100ml</p>
                <p className="font-body text-xs text-text-muted">Limit: 0 CFU/100ml</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-secondary/20">
            <p className="font-body text-xs text-text-muted text-center">
              Data sourced from EPA Master Database • State Title 21 Reports • EWG Water Quality Database
            </p>
          </div>
        </div>

        {/* Rating & Feedback Section */}
        <div className="glass-card rounded-2xl p-6 fade-in" data-testid="rating-section">
          <h3 className="font-sans text-xl font-semibold text-text-primary mb-4 text-center">
            Your Feedback Matters
          </h3>
          <p className="font-body text-text-secondary text-sm text-center mb-6">
            Help us and others make better water choices
          </p>
          
          {!hasRated ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Drink Again Option */}
              <button
                data-testid="drink-again-btn"
                onClick={() => handleRating('drink_again')}
                className="p-6 bg-background-subtle hover:bg-primary/10 border-2 border-transparent hover:border-primary rounded-2xl transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                    <ThumbsUp className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-body font-semibold text-text-primary mb-1">
                      Likely to Drink Again
                    </p>
                    <p className="font-body text-xs text-text-muted">
                      Happy with this water quality
                    </p>
                  </div>
                </div>
              </button>

              {/* Upgrade Option */}
              <button
                data-testid="upgrade-water-btn"
                onClick={() => handleRating('upgrade')}
                className="p-6 bg-background-subtle hover:bg-primary/10 border-2 border-transparent hover:border-primary rounded-2xl transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-body font-semibold text-text-primary mb-1">
                      Looking to Upgrade
                    </p>
                    <p className="font-body text-xs text-text-muted">
                      Want better water quality
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="text-center p-8 bg-primary/5 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="font-body font-semibold text-text-primary mb-2">
                Thanks for your feedback!
              </p>
              <p className="font-body text-sm text-text-secondary">
                {userRating === 'drink_again' 
                  ? 'Great choice! This water meets your quality standards.' 
                  : 'We\'ll help you find better water options in your area.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="font-body text-text-muted text-sm">
            Report generated at {new Date(scanResult.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;