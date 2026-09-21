import React, { useEffect, useRef, useState } from 'react';
import { getMoonPhase } from './lunar';
import './Sky.css';

export default function SkyMoon({ date = new Date() }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const moon = getMoonPhase(date);

  const { phase, illumination, name, position, formattedDate, skyNote } = moon;

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClickOutside = e => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={cardRef}
      className="sky-moon-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className="sky-moon-btn"
        onClick={() => setOpen(v => !v)}
        aria-label={`Moon phase: ${name}, ${illumination}% illuminated`}
        aria-expanded={open}
        title={`${name} · ${illumination}%`}
      >
        <svg
          className="sky-moon-svg"
          width="42"
          height="42"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f0f5ff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#c5daf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#89b2e8" stopOpacity="0" />
            </radialGradient>
            <filter id="lunarAtmosphere">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>
          </defs>

          {/* Atmospheric halo that scales with illumination */}
          <circle
            cx="16"
            cy="16"
            r="15"
            fill="url(#moonGlow)"
            opacity={0.35 + (illumination / 100) * 0.65}
          />

          {/* Dark body of moon */}
          <circle cx="16" cy="16" r="9" fill="#132034" stroke="#486282" strokeWidth="0.5" />

          {/* Lit portion */}
          {illumination > 2 && (
            <g>
              {illumination >= 96 ? (
                <circle cx="16" cy="16" r="9" fill="#eef5fc" filter="url(#lunarAtmosphere)" />
              ) : (
                <path
                  d={calculateMoonPath(phase)}
                  fill="#eaf2fa"
                  filter="url(#lunarAtmosphere)"
                />
              )}
            </g>
          )}
        </svg>
      </button>

      {/* Quick hover badge when details card is not open */}
      {hovered && !open && (
        <div className="sky-moon-tooltip" role="tooltip">
          <strong>{name}</strong>
          <span>{illumination}% illuminated</span>
        </div>
      )}

      {/* Rich details card when clicked */}
      {open && (
        <section
          className="sky-moon-card"
          role="dialog"
          aria-label={`Moon details: ${name}`}
        >
          <button
            type="button"
            className="sky-moon-close"
            aria-label="Close moon details"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
          <header className="sky-moon-card-header">
            <h2 className="sky-moon-card-title">{name}</h2>
            <span className="sky-moon-card-date">{formattedDate} · {illumination}% illuminated</span>
          </header>
          <div className="sky-moon-card-body">
            <p className="sky-moon-card-position">
              <span className="sky-moon-label">Sky Position:</span> {position}
            </p>
            <div className="sky-moon-card-divider" />
            <p className="sky-moon-card-note">
              {skyNote}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

// Compute SVG path arc for the crescent / gibbous phase
function calculateMoonPath(phase) {
  const cx = 16;
  const cy = 16;
  const r = 9;

  // Normalize phase between 0 and 1
  const p = ((phase % 1) + 1) % 1;
  const isWaxing = p < 0.5;

  // Normalized phase progress within half-cycle [0, 1]
  const sub = isWaxing ? p * 2 : (p - 0.5) * 2;
  // Curvature of terminator line: from -r (crescent) to 0 (quarter) to +r (gibbous)
  const terminatorX = (sub * 2 - 1) * r;

  // Semicircle arc on the lit limb (right side for waxing, left side for waning)
  if (isWaxing) {
    const sweepTerminator = terminatorX > 0 ? 1 : 0;
    const rx = Math.max(0.1, Math.abs(terminatorX));
    return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweepTerminator} ${cx} ${cy - r} Z`;
  } else {
    const sweepTerminator = terminatorX > 0 ? 0 : 1;
    const rx = Math.max(0.1, Math.abs(terminatorX));
    return `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweepTerminator} ${cx} ${cy - r} Z`;
  }
}
