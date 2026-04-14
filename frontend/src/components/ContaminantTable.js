/**
 * ContaminantTable.js
 * Generosity™ WTR App — Contaminant Display Component
 *
 * Sortable, filterable table of all detected contaminants.
 * Drop into: frontend/src/components/ContaminantTable.js
 *
 * Props:
 *   contaminants: array from transformReportForUI()
 *   onContaminantClick: (contaminant) => void  (opens modal)
 */

import React, { useState, useMemo } from 'react';
import { formatExceedance } from '../data/WaterDataService';

const FILTER_GROUPS = [
  { key: 'all',        label: 'All' },
  { key: 'PFAS',       label: 'PFAS' },
  { key: 'Heavy Metals', label: 'Heavy Metals' },
  { key: 'Disinfection Byproducts', label: 'DBPs' },
  { key: 'Radiological', label: 'Radiological' },
  { key: 'Nitrates',   label: 'Nitrates' },
  { key: 'violations', label: 'Violations Only' },
  { key: 'hub_removes', label: 'Filter Removes ✓' },
];

const SORT_OPTIONS = [
  { key: 'risk',    label: 'Risk Level' },
  { key: 'ewg',     label: 'EWG Exceedance' },
  { key: 'name',    label: 'Name A–Z' },
];

/**
 * Formats a contaminant measurement value for display.
 * Converts scientific notation to readable decimals with 2 sig figs max.
 * Examples:
 *   7.2e-11  → "< 0.01 ppt"  (too small to display meaningfully)
 *   0.00024  → "0.00024"
 *   1.234567 → "1.23"
 *   1200000  → "1,200,000"
 */
function formatContaminantValue(value, unit) {
  if (value == null || value === '' || isNaN(value)) return '—';

  const num = parseFloat(value);
  if (isNaN(num)) return '—';

  let formatted;

  if (num === 0) {
    formatted = '0';
  } else if (Math.abs(num) < 0.0001) {
    // Values this small are effectively trace — show as < 0.0001
    formatted = '< 0.0001';
  } else if (Math.abs(num) < 0.01) {
    // Show up to 4 decimal places for small values
    formatted = num.toPrecision(2);
  } else if (Math.abs(num) < 1) {
    // Show up to 4 decimal places
    formatted = parseFloat(num.toFixed(4)).toString();
  } else if (Math.abs(num) < 1000) {
    // Show up to 2 decimal places
    formatted = parseFloat(num.toFixed(2)).toString();
  } else {
    // Large numbers — use locale formatting, no decimals
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  return unit ? `${formatted} ${unit}` : formatted;
}

export default function ContaminantTable({ contaminants = [], onContaminantClick }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy]             = useState('risk');
  const [expandedCode, setExpandedCode] = useState(null);

  const filtered = useMemo(() => {
    let list = [...contaminants];

    // Filter
    if (activeFilter === 'violations')  list = list.filter(c => c.isViolation);
    else if (activeFilter === 'hub_removes') list = list.filter(c => c.hubRemoves);
    else if (activeFilter !== 'all')    list = list.filter(c => c.group === activeFilter);

    // Sort
    if (sortBy === 'risk') {
      const order = { red: 0, orange: 1, yellow: 2, blue: 3 };
      list.sort((a, b) => (order[a.riskColor] ?? 4) - (order[b.riskColor] ?? 4));
    } else if (sortBy === 'ewg') {
      list.sort((a, b) => (b.ewgExceedance ?? 0) - (a.ewgExceedance ?? 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [contaminants, activeFilter, sortBy]);

  if (!contaminants.length) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#51B0E6" strokeWidth="1.5"><path d="M12 2C12 2 6 10 6 14a6 6 0 0012 0c0-4-6-12-6-12z"/></svg></div>
        <div style={styles.emptyTitle}>No contaminant data yet</div>
        <div style={styles.emptySub}>Data loads with your water report</div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>

      {/* ── Filter chips ───────────────────────────────────────── */}
      <div style={styles.filterBar}>
        {FILTER_GROUPS.map(fg => {
          const count = fg.key === 'all' ? contaminants.length
            : fg.key === 'violations' ? contaminants.filter(c => c.isViolation).length
            : fg.key === 'hub_removes' ? contaminants.filter(c => c.hubRemoves).length
            : contaminants.filter(c => c.group === fg.key).length;
          if (count === 0 && fg.key !== 'all') return null;
          return (
            <button
              key={fg.key}
              style={{
                ...styles.filterChip,
                ...(activeFilter === fg.key ? styles.filterChipActive : {})
              }}
              onClick={() => setActiveFilter(fg.key)}
            >
              {fg.label}
              {count > 0 && (
                <span style={{
                  ...styles.filterBadge,
                  ...(activeFilter === fg.key ? styles.filterBadgeActive : {})
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Sort row ───────────────────────────────────────────── */}
      <div style={styles.sortRow}>
        <span style={styles.sortLabel}>Sort by:</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            style={{
              ...styles.sortBtn,
              ...(sortBy === opt.key ? styles.sortBtnActive : {})
            }}
            onClick={() => setSortBy(opt.key)}
          >
            {opt.label}
          </button>
        ))}
        <span style={styles.countLabel}>{filtered.length} shown</span>
      </div>

      {/* ── Column headers ─────────────────────────────────────── */}
      <div style={styles.tableHeader}>
        <div style={{ flex: 3 }}>Contaminant</div>
        <div style={{ flex: 1.5, textAlign: 'right' }}>Detected</div>
        <div style={{ flex: 1.5, textAlign: 'right' }}>EWG Safe Limit</div>
        <div style={{ flex: 1.5, textAlign: 'center' }}>Exceedance</div>
        <div style={{ flex: 1, textAlign: 'center' }}>EPA Status</div>
        <div style={{ flex: 1, textAlign: 'center' }}>Filtered</div>
      </div>

      {/* ── Rows ───────────────────────────────────────────────── */}
      {filtered.map(c => (
        <ContaminantRow
          key={c.code || c.name}
          contaminant={c}
          isExpanded={expandedCode === (c.code || c.name)}
          onToggle={() => setExpandedCode(
            expandedCode === (c.code || c.name) ? null : (c.code || c.name)
          )}
          onClick={onContaminantClick}
        />
      ))}
    </div>
  );
}

// ── Individual row ──────────────────────────────────────────────────────

function ContaminantRow({ contaminant: c, isExpanded, onToggle, onClick }) {
  const colors = {
    red:    '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    blue:   '#51B0E6',
  };
  const color = colors[c.riskColor] || colors.orange;

  const exceedanceStr = formatExceedance(c.ewgExceedance);
  const epaStatus = c.isViolation ? 'VIOLATION'
    : !c.isRegulated ? 'UNREGULATED'
    : c.exceedsMcl ? 'OVER LIMIT'
    : 'LEGAL';

  const epaStatusColor = {
    'VIOLATION':   '#FF3B30',
    'UNREGULATED': '#AF52DE',
    'OVER LIMIT':  '#FF9500',
    'LEGAL':       '#34C759',
  }[epaStatus] || '#8E8E93';

  return (
    <>
      <div
        style={{
          ...styles.row,
          borderLeft: `3px solid ${color}`,
          background: isExpanded ? 'rgba(81,176,230,0.04)' : '#FFFFFF',
        }}
        onClick={onToggle}
      >
        {/* Name + group */}
        <div style={{ flex: 3 }}>
          <div style={styles.contaminantName}>
            <span style={styles.contaminantIcon}>{c.icon}</span>
            {c.name}
            {c.hasNoSafeLevel && (
              <span style={styles.noSafeTag}>NO SAFE LEVEL</span>
            )}
          </div>
          <div style={styles.groupBadge}>
            <span style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px' }}>
              {c.group?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Detected level — formatted */}
        <div style={{ flex: 1.5, textAlign: 'right' }}>
          <span style={styles.valueText}>
            {formatContaminantValue(c.detected, c.unit)}
          </span>
        </div>

        {/* EWG guideline — formatted */}
        <div style={{ flex: 1.5, textAlign: 'right' }}>
          <span style={styles.guidelineText}>
            {formatContaminantValue(c.ewgGuideline, c.unit)}
          </span>
        </div>

        {/* Exceedance */}
        <div style={{ flex: 1.5, textAlign: 'center' }}>
          {exceedanceStr ? (
            <span style={{
              ...styles.exceedancePill,
              background: `${color}18`,
              color,
            }}>
              {exceedanceStr}
            </span>
          ) : (
            <span style={styles.naText}>—</span>
          )}
        </div>

        {/* EPA Status */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{
            ...styles.statusPill,
            color: epaStatusColor,
            background: `${epaStatusColor}18`,
          }}>
            {epaStatus}
          </span>
        </div>

        {/* Filter removes */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{
            fontSize: 16,
            color: c.hubRemoves ? '#34C759' : '#C7C7CC',
          }}>
            {c.hubRemoves ? '✓' : '✗'}
          </span>
          {c.hubRemoves && c.hubRemovalPct && (
            <div style={{ fontSize: 9, color: '#34C759', fontWeight: 600 }}>
              {c.hubRemovalPct}%
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded detail row ─────────────────────────────── */}
      {isExpanded && (
        <div style={styles.expandedPanel}>
          <div style={styles.expandedGrid}>

            <div style={styles.expandedBlock}>
              <div style={styles.expandedLabel}>Health Effects</div>
              <div style={styles.expandedValue}>{c.healthShort || '—'}</div>
            </div>

            {c.vulnerable?.length > 0 && (
              <div style={styles.expandedBlock}>
                <div style={styles.expandedLabel}>Most Vulnerable</div>
                <div style={styles.expandedValue}>{c.vulnerable.join(' · ')}</div>
              </div>
            )}

            {c.carcinogenClass && (
              <div style={styles.expandedBlock}>
                <div style={styles.expandedLabel}>Cancer Classification</div>
                <div style={{ ...styles.expandedValue, color: '#FF3B30', fontWeight: 700 }}>
                  {c.carcinogenClass} Human Carcinogen
                </div>
              </div>
            )}

            {c.sourceOrg && (
              <div style={styles.expandedBlock}>
                <div style={styles.expandedLabel}>Data Source</div>
                <div style={styles.expandedValue}>
                  {c.sourceUrl ? (
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer"
                       style={{ color: '#51B0E6' }}>
                      {c.sourceOrg} ↗
                    </a>
                  ) : c.sourceOrg}
                </div>
              </div>
            )}
          </div>

          <div style={styles.expandedBody}>{c.healthLong}</div>

          <button
            style={styles.expandedCta}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(c); }}
          >
            See full details + filter solution →
          </button>
        </div>
      )}
    </>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    fontFamily: "'Montserrat', -apple-system, sans-serif",
    background: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  filterBar: {
    display: 'flex',
    gap: 6,
    padding: '12px 16px',
    overflowX: 'auto',
    borderBottom: '1px solid #F0F1F3',
    scrollbarWidth: 'none',
  },
  filterChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 11px',
    borderRadius: 20,
    border: '1.5px solid #E5E5EA',
    background: '#FFFFFF',
    fontSize: 11,
    fontWeight: 600,
    color: '#6E6E73',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: "'Montserrat', sans-serif",
    transition: 'all 0.15s',
  },
  filterChipActive: {
    background: '#51B0E6',
    borderColor: '#51B0E6',
    color: '#FFFFFF',
  },
  filterBadge: {
    background: '#F0F1F3',
    color: '#6E6E73',
    borderRadius: 10,
    padding: '1px 5px',
    fontSize: 10,
    fontWeight: 700,
  },
  filterBadgeActive: {
    background: 'rgba(255,255,255,0.3)',
    color: '#FFFFFF',
  },
  sortRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderBottom: '1px solid #F0F1F3',
    background: '#FAFAFA',
  },
  sortLabel: { fontSize: 11, color: '#AEAEB2', fontWeight: 600 },
  sortBtn: {
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid #E5E5EA',
    background: '#FFFFFF',
    fontSize: 11,
    fontWeight: 600,
    color: '#6E6E73',
    cursor: 'pointer',
    fontFamily: "'Montserrat', sans-serif",
  },
  sortBtnActive: { background: '#1C1C1E', color: '#FFFFFF', borderColor: '#1C1C1E' },
  countLabel: { marginLeft: 'auto', fontSize: 11, color: '#AEAEB2', fontWeight: 600 },
  tableHeader: {
    display: 'flex',
    padding: '8px 16px',
    background: '#F8F8FA',
    fontSize: 10,
    fontWeight: 700,
    color: '#AEAEB2',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    borderBottom: '1px solid #F0F1F3',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #F8F8FA',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  contaminantName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1C1C1E',
    letterSpacing: '-0.2px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  contaminantIcon: { fontSize: 15 },
  noSafeTag: {
    fontSize: 9,
    fontWeight: 800,
    color: '#FF3B30',
    background: 'rgba(255,59,48,0.1)',
    padding: '2px 6px',
    borderRadius: 4,
    letterSpacing: '0.5px',
  },
  groupBadge: { marginTop: 2 },
  valueText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1C1C1E',
    fontVariantNumeric: 'tabular-nums',
  },
  guidelineText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6E6E73',
    fontVariantNumeric: 'tabular-nums',
  },
  exceedancePill: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.3px',
  },
  naText: { color: '#C7C7CC', fontSize: 12 },
  statusPill: {
    display: 'inline-block',
    padding: '3px 7px',
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.5px',
  },
  expandedPanel: {
    padding: '16px 20px 20px',
    background: '#F8F9FB',
    borderBottom: '2px solid #51B0E6',
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
    marginBottom: 12,
  },
  expandedBlock: {},
  expandedLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: '#AEAEB2',
    marginBottom: 3,
  },
  expandedValue: { fontSize: 13, fontWeight: 600, color: '#1C1C1E' },
  expandedBody: {
    fontSize: 13,
    color: '#6E6E73',
    lineHeight: 1.6,
    marginBottom: 14,
    fontWeight: 400,
  },
  expandedCta: {
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #51B0E6, #2E8DC7)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '-0.2px',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    background: '#FFFFFF',
    borderRadius: 16,
  },
  emptyIcon: { marginBottom: 12, display: 'flex', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: 700, color: '#1C1C1E', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#6E6E73' },
};
