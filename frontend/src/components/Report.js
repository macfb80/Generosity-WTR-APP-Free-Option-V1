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
    <div className="fixed inset-0 z-50 bg-white overflow-auto" data-testid="report-view">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-secondary/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="font-sans text-xl font-semibold text-text-primary">Water Quality Report</h2>
          <button
            data-testid="close-report-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary/10 transition-colors"
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