import React, { useEffect, useRef, useState } from 'react';
import { getMoonPhase } from './lunar';
import './Sky.css';

export default function SkyMoon({ date = new Date(), weather = null }) {
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

  const obscuration = weather?.obscuration || 'none';
  const statusText = weather?.statusText || '';

  let dimClass = '';
  let haloOpacity = 0.35 + (illumination / 100) * 0.65;
  if (obscuration === 'clouds') {
    dimClass = 'sky-celestial--dimmed';
    haloOpacity *= 0.4;
  } else if (obscuration === 'rain') {
    dimClass = 'sky-celestial--heavily-dimmed';
    haloOpacity *= 0.25;
  } else if (obscuration === 'fog') {
    dimClass = 'sky-celestial--dimmed';
    haloOpacity *= 0.45;
  } else if (obscuration === 'partly') {
    haloOpacity *= 0.8;
  }

  const ariaLabel = `Moon phase: ${name}, ${illumination}% illuminated${statusText ? `. ${statusText}` : ''}`;

  return (
    <div
      ref={cardRef}
      className="sky-moon-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={`sky-moon-btn ${dimClass}`}
        onClick={() => setOpen(v => !v)}
        aria-label={ariaLabel}
        aria-expanded={open}
        title={`${name} · ${illumination}%${statusText ? ` · ${statusText}` : ''}`}
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
            <filter id="lunarCloudFilter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
          </defs>

          {/* Atmospheric halo that scales with illumination & weather */}
          <circle
            cx="16"
            cy="16"
            r="15"
            fill="url(#moonGlow)"
            opacity={haloOpacity}
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

          {/* Dynamic Weather Obscuration Layer */}
          {obscuration === 'partly' && (
            <g filter="url(#lunarCloudFilter)" opacity="0.65" transform="translate(3.2 3.2) scale(0.8)">
              <path
                d="M 9 20 C 8 18 10 16 12 16 C 13 14 16 14 18 16 C 20 15 22 17 22 19 C 23 20 22 23 20 23 L 11 23 C 9 23 8 21 9 20 Z"
                fill="#d8e6f7"
              />
            </g>
          )}

          {obscuration === 'clouds' && (
            <g filter="url(#lunarCloudFilter)" opacity="0.85" transform="translate(5.6 5.6) scale(0.65)">
              <path
                d="M 6 21 C 5 18 8 15 11 16 C 12 13 16 12 19 14 C 22 13 25 15 25 18 C 26 21 24 24 21 24 L 9 24 C 6 24 5 22 6 21 Z"
                fill="#8fa5be"
              />
            </g>
          )}

          {obscuration === 'rain' && (
            <g transform="translate(4.8 4.8) scale(0.7)">
              <g filter="url(#lunarCloudFilter)" opacity="0.88">
                <path
                  d="M 5 19 C 4 16 7 14 10 15 C 11 12 15 11 18 13 C 21 12 24 14 24 17 C 25 20 23 23 20 23 L 8 23 C 5 23 4 21 5 19 Z"
                  fill="#6c849e"
                />
              </g>
              <g stroke="#9ab9dc" strokeWidth="0.8" strokeLinecap="round" opacity="0.7">
                <line x1="8" y1="24" x2="6.5" y2="28" />
                <line x1="12" y1="24" x2="10.5" y2="28" />
                <line x1="16" y1="24" x2="14.5" y2="28" />
                <line x1="20" y1="24" x2="18.5" y2="28" />
                <line x1="24" y1="24" x2="22.5" y2="28" />
              </g>
            </g>
          )}

          {obscuration === 'fog' && (
            <g filter="url(#lunarCloudFilter)" opacity="0.75">
              <ellipse cx="16" cy="16" rx="14" ry="9" fill="#9db5cc" />
            </g>
          )}
        </svg>
      </button>

      {/* Quick hover badge when details card is not open */}
      {hovered && !open && (
        <div className="sky-moon-tooltip" role="tooltip">
          <strong>{name}</strong>
          <span>{illumination}% illuminated</span>
          {statusText ? <span className="sky-moon-tooltip-weather">{statusText}</span> : null}
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
            {weather ? (
              <>
                <div className="sky-moon-card-divider" />
                <div className="sky-moon-card-weather">
                  <span className="sky-moon-label">Local Sky:</span>{' '}
                  <span className="sky-moon-weather-val">
                    {weather.summary || 'Clear'}
                    {weather.cloudCover !== undefined ? ` (${weather.cloudCover}% clouds)` : ''}
                  </span>
                  {statusText ? <p className="sky-moon-weather-desc">{statusText}</p> : null}
                </div>
              </>
            ) : null}
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
