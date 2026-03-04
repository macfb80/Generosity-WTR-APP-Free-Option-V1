import React from 'react';

const WaterRing = ({ score, size = 180, strokeWidth = 12 }) => {
  // Calculate progress based on score
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const remaining = circumference - progress;

  // Determine color based on score
  let gradientId, glowColor, scoreColor;
  if (score >= 85) {
    gradientId = 'excellentGradient';
    glowColor = '#10b981'; // Green
    scoreColor = '#10b981';
  } else if (score >= 75) {
    gradientId = 'goodGradient';
    glowColor = '#51B0E6'; // Primary blue
    scoreColor = '#51B0E6';
  } else if (score >= 60) {
    gradientId = 'fairGradient';
    glowColor = '#f59e0b'; // Orange
    scoreColor = '#f59e0b';
  } else {
    gradientId = 'poorGradient';
    glowColor = '#ef4444'; // Red
    scoreColor = '#ef4444';
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          {/* Gradient Definitions */}
          <linearGradient id="excellentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="goodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#51B0E6" stopOpacity="1" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="fairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="poorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
          </linearGradient>
          
          {/* Glow Filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Shadow Filter */}
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          opacity="0.3"
        />

        {/* Progress Circle with Gradient and Glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${remaining}`}
          strokeLinecap="round"
          filter="url(#glow)"
          style={{
            transition: 'stroke-dasharray 1s ease-out',
          }}
        />

        {/* Inner Glow Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth - 4}
          fill="none"
          stroke={glowColor}
          strokeWidth="2"
          opacity="0.2"
        />
      </svg>

      {/* Center Content - Will be positioned absolutely by parent */}
    </div>
  );
};

export default WaterRing;