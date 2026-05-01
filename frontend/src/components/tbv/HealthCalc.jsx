// src/components/tbv/HealthCalc.jsx
import React, { useState } from 'react';
import Icon from '../ds/Icon';

/**
 * HealthCalc — lifetime exposure calculator.
 *
 * Lets the user model their household's projected exposure to contaminants.
 * Persona changes the multiplier (children, pregnant, and infant are more
 * vulnerable). Sliders control cups/day and years. Outputs gallons consumed,
 * bottle equivalents, and a cumulative risk score.
 *
 * Props:
 *   city      (string)  City name from the active report (used in warning text)
 *   riskScore (number)  Base risk score 0-100 from the report
 */
export default function HealthCalc({ city, riskScore }) {
  const [cups, setCups] = useState(8);
  const [years, setYears] = useState(5);
  const [persona, setPersona] = useState('adult');

  const personas = [
    { id: 'adult',     label: 'Adult',           iconName: 'user', mult: 1.0 },
    { id: 'child',     label: 'Child under 12',  iconName: 'user', mult: 2.4 },
    { id: 'pregnant',  label: 'Pregnant',        iconName: 'user', mult: 3.1 },
    { id: 'infant',    label: 'Infant',          iconName: 'user', mult: 4.2 },
  ];

  const sel = personas.find((p) => p.id === persona);
  const gallons = cups * 0.0625 * 365 * years;
  const bottles = Math.round((gallons * 128) / 16.9);
  const cumScore = Math.min(
    100,
    Math.round((riskScore / 100) * sel.mult * Math.log(years + 1) * 22)
  );
  const cColor =
    cumScore > 66 ? '#B84A4A' : cumScore > 33 ? '#C89B3C' : '#4A8A6F';
  const cBg =
    cumScore > 66 ? 'rgba(184, 74, 74, 0.08)' :
    cumScore > 33 ? 'rgba(200, 155, 60, 0.08)' :
                    'rgba(74, 138, 111, 0.08)';

  return (
    <div
      className="bg-surface-card rounded-card shadow-card p-4 mb-4"
      data-testid="health-calculator"
    >
      <div className="text-micro uppercase font-semibold text-text-tertiary tracking-widest mb-3">
        LIFETIME EXPOSURE CALCULATOR
      </div>

      {/* Persona buttons */}
      <div
        className="flex flex-wrap gap-1.5 mb-3"
        data-testid="persona-selector"
      >
        {personas.map((p) => {
          const isSel = persona === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPersona(p.id)}
              data-testid={`persona-${p.id}`}
              className={`
                inline-flex items-center gap-1
                rounded-pill
                cursor-pointer
                transition-colors duration-200 ease-standard
              `}
              style={{
                background: isSel ? '#E8F4FB' : '#F0F1F3',
                border: `1px solid ${isSel ? '#51B0E6' : '#E8EAED'}`,
                padding: '5px 10px',
                fontSize: 10,
                color: isSel ? '#51B0E6' : '#8A8E93',
                fontWeight: isSel ? 700 : 400,
              }}
            >
              <Icon name={p.iconName} size={12} color={isSel ? '#51B0E6' : '#A6A8AB'} />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div>
          <div className="text-text-tertiary mb-1.5" style={{ fontSize: 9 }}>
            Cups/day:{' '}
            <strong className="text-text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {cups}
            </strong>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            value={cups}
            onChange={(e) => setCups(Number(e.target.value))}
            data-testid="cups-slider"
            className="w-full"
            style={{ accentColor: '#51B0E6' }}
          />
        </div>
        <div>
          <div className="text-text-tertiary mb-1.5" style={{ fontSize: 9 }}>
            Years:{' '}
            <strong className="text-text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {years}
            </strong>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            data-testid="years-slider"
            className="w-full"
            style={{ accentColor: '#51B0E6' }}
          />
        </div>
      </div>

      {/* Outputs grid */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="rounded-card text-center"
          style={{
            background: 'rgba(184, 74, 74, 0.08)',
            padding: 10,
          }}
        >
          <div
            className="font-display font-bold"
            style={{
              fontSize: 18,
              color: '#B84A4A',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {gallons.toFixed(0)}
          </div>
          <div className="text-text-tertiary" style={{ fontSize: 8 }}>gallons consumed</div>
        </div>
        <div
          className="rounded-card text-center"
          style={{
            background: 'rgba(200, 155, 60, 0.08)',
            padding: 10,
          }}
        >
          <div
            className="font-display font-bold"
            style={{
              fontSize: 18,
              color: '#C89B3C',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {bottles.toLocaleString()}
          </div>
          <div className="text-text-tertiary" style={{ fontSize: 8 }}>bottle equiv.</div>
        </div>
        <div
          className="rounded-card text-center"
          style={{ background: cBg, padding: 10 }}
          data-testid="cumulative-risk"
        >
          <div
            className="font-display font-bold"
            style={{
              fontSize: 18,
              color: cColor,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {cumScore}
          </div>
          <div className="text-text-tertiary" style={{ fontSize: 8 }}>cumulative risk</div>
        </div>
      </div>

      {/* Conditional warning */}
      {cumScore > 50 && (
        <div
          className="rounded-card mt-2.5"
          style={{
            background: 'rgba(184, 74, 74, 0.08)',
            padding: '9px 11px',
            fontSize: 10,
            color: '#7A2A2A',
            lineHeight: 1.6,
          }}
          data-testid="risk-warning"
        >
          <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 22h20L12 2z" />
              <line x1="12" y1="9" x2="12" y2="15" />
              <circle cx="12" cy="18" r="0.5" fill="currentColor" />
            </svg>
          </span>
          {sel.label} faces <strong>elevated long-term risk</strong> from{' '}
          {city?.split(',')[0] || 'your city'}'s contaminants.
        </div>
      )}
    </div>
  );
}
