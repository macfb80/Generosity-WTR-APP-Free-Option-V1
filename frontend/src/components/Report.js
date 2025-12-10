import React from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Download } from 'lucide-react';
import WaterRing from './WaterRing';

const Report = ({ scanResult, onClose }) => {
  if (!scanResult) return null;

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-status-safe', icon: CheckCircle };
    if (score >= 60) return { label: 'Good', color: 'text-status-warning', icon: AlertTriangle };
    return { label: 'Poor', color: 'text-status-danger', icon: XCircle };
  };

  const status = getScoreStatus(scanResult.quality_score);
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto" data-testid="report-view">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="font-sans text-xl font-semibold text-text-primary">Water Quality Report</h2>
          <button
            data-testid="close-report-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-text-primary" />
          </button>
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
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="font-body text-text-secondary text-sm">Lead Level</p>
              <p className="font-mono text-2xl font-bold text-text-primary mt-1">
                {scanResult.contaminants.lead_ppb} <span className="text-sm text-text-muted">ppb</span>
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="font-body text-text-secondary text-sm">PFAS</p>
              <p className="font-mono text-2xl font-bold text-text-primary mt-1">
                {scanResult.contaminants.pfas_ppt} <span className="text-sm text-text-muted">ppt</span>
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="font-body text-text-secondary text-sm">Microplastics</p>
              <p className="font-mono text-2xl font-bold text-text-primary mt-1">
                {scanResult.contaminants.microplastics}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
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
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="font-body text-text-primary">EPA Standards</span>
              {scanResult.compliance.epa_compliant ? (
                <CheckCircle className="w-6 h-6 text-status-safe" />
              ) : (
                <XCircle className="w-6 h-6 text-status-danger" />
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="font-body text-text-primary">EWG Rating</span>
              <span className="font-mono font-bold text-text-primary">
                {scanResult.compliance.ewg_rating}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="font-body text-text-primary">State Compliance</span>
              {scanResult.compliance.state_compliant ? (
                <CheckCircle className="w-6 h-6 text-status-safe" />
              ) : (
                <XCircle className="w-6 h-6 text-status-danger" />
              )}
            </div>
          </div>
        </div>

        {/* Detailed Report */}
        <div className="glass-card rounded-2xl p-6 fade-in">
          <h3 className="font-sans text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            Detailed Analysis
          </h3>
          <div 
            className="font-body text-text-secondary prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: scanResult.detailed_report.replace(/\n/g, '<br/>') }}
          />
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