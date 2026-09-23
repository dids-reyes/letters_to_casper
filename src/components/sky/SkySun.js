import React, { useEffect, useRef, useState } from 'react';
import { getSolarPosition } from './celestial';
import './Sky.css';

export default function SkySun({
  date = new Date(),
  coords = null,
  solarData = null,
  weather = null,
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  const solar =
    solarData ||
    getSolarPosition(
      date,
      coords?.lat ?? 14.5995,
      coords?.lon ?? 120.9842
    );

  const { elevation, position, sunriseText, sunsetText, formattedDate, skyNote } = solar;

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        setOpen(false);
        setHovered(false);
      }
    };
    const handleClickOutside = e => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setOpen(false);
        setHovered(false);
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
  const statusText = weather?.statusText || 'Clear sky in your local area';

  // Scale corona opacity based on weather obscuration
  let coronaOpacity = 0.75;
  let sunDimClass = '';
  if (obscuration === 'clouds') {
    coronaOpacity = 0.25;
    sunDimClass = 'sky-celestial--dimmed';
  } else if (obscuration === 'rain') {
    coronaOpacity = 0.15;
    sunDimClass = 'sky-celestial--heavily-dimmed';
  } else if (obscuration === 'fog') {
    coronaOpacity = 0.3;
    sunDimClass = 'sky-celestial--dimmed';
  } else if (obscuration === 'partly') {
    coronaOpacity = 0.55;
  }

  return (
    <div
      ref={cardRef}
      className="sky-sun-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={`sky-sun-btn ${sunDimClass}`}
        onClick={() => {
          if (open) setHovered(false);
          setOpen(v => !v);
        }}
        aria-label={`Sun: ${elevation}° altitude, ${position}. ${statusText}`}
        aria-expanded={open}
        title={`The Sun · ${elevation}° · ${statusText}`}
      >
        <svg
          className="sky-sun-svg"
          width="42"
          height="42"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8db" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#ffd35a" stopOpacity="0.45" />
              <stop offset="75%" stopColor="#ff9b15" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ff7a00" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#ffe279" />
              <stop offset="100%" stopColor="#f5b01a" />
            </radialGradient>
            <filter id="sunAtmosphere">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
            </filter>
            <filter id="cloudFilter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
          </defs>

          {/* Atmospheric corona glow */}
          <circle
            cx="16"
            cy="16"
            r="15"
            fill="url(#sunCorona)"
            opacity={coronaOpacity}
          />

          {/* Subtle corona rays (visible in clear or partly cloudy skies) */}
          {obscuration !== 'clouds' && obscuration !== 'rain' && (
            <g opacity={obscuration === 'partly' ? 0.25 : 0.45} stroke="#ffc952" strokeWidth="0.8" strokeLinecap="round">
              <line x1="16" y1="5" x2="16" y2="7.5" />
              <line x1="16" y1="24.5" x2="16" y2="27" />
              <line x1="5" y1="16" x2="7.5" y2="16" />
              <line x1="24.5" y1="16" x2="27" y2="16" />
              <line x1="8.2" y1="8.2" x2="10" y2="10" />
              <line x1="22" y1="22" x2="23.8" y2="23.8" />
              <line x1="8.2" y1="23.8" x2="10" y2="22" />
              <line x1="22" y1="10" x2="23.8" y2="8.2" />
            </g>
          )}

          {/* Core sun disc */}
          <circle
            cx="16"
            cy="16"
            r="7.5"
            fill="url(#sunCore)"
            filter="url(#sunAtmosphere)"
          />

          {/* Dynamic Weather Obscuration Layer */}
          {obscuration === 'partly' && (
            <g filter="url(#cloudFilter)" opacity="0.7" transform="translate(3.2 3.2) scale(0.8)">
              <path
                d="M 9 20 C 8 18 10 16 12 16 C 13 14 16 14 18 16 C 20 15 22 17 22 19 C 23 20 22 23 20 23 L 11 23 C 9 23 8 21 9 20 Z"
                fill="#d8e6f7"
              />
            </g>
          )}

          {obscuration === 'clouds' && (
            <g filter="url(#cloudFilter)" opacity="0.88" transform="translate(5.6 5.6) scale(0.65)">
              <path
                d="M 6 21 C 5 18 8 15 11 16 C 12 13 16 12 19 14 C 22 13 25 15 25 18 C 26 21 24 24 21 24 L 9 24 C 6 24 5 22 6 21 Z"
                fill="#b8cbdf"
              />
              <path
                d="M 9 14 C 10 12 13 11 15 12 C 16 10 19 10 20 12 C 22 12 23 14 22 16 L 10 16 Z"
                fill="#9db5cf"
                opacity="0.6"
              />
            </g>
          )}

          {obscuration === 'rain' && (
            <g transform="translate(4.8 4.8) scale(0.7)">
              <g filter="url(#cloudFilter)" opacity="0.9">
                <path
                  d="M 5 19 C 4 16 7 14 10 15 C 11 12 15 11 18 13 C 21 12 24 14 24 17 C 25 20 23 23 20 23 L 8 23 C 5 23 4 21 5 19 Z"
                  fill="#8ea3bc"
                />
              </g>
              {/* Rain streaks */}
              <g stroke="#bad2ec" strokeWidth="0.8" strokeLinecap="round" opacity="0.75">
                <line x1="8" y1="24" x2="6.5" y2="28" />
                <line x1="12" y1="24" x2="10.5" y2="28" />
                <line x1="16" y1="24" x2="14.5" y2="28" />
                <line x1="20" y1="24" x2="18.5" y2="28" />
                <line x1="24" y1="24" x2="22.5" y2="28" />
              </g>
            </g>
          )}

          {obscuration === 'fog' && (
            <g filter="url(#cloudFilter)" opacity="0.8">
              <ellipse cx="16" cy="16" rx="14" ry="9" fill="#c3d5e8" />
              <ellipse cx="16" cy="18" rx="12" ry="6" fill="#a7bfd8" opacity="0.6" />
            </g>
          )}
        </svg>
      </button>

      {/* Hover tooltip */}
      {hovered && !open && (
        <div className="sky-sun-tooltip" role="tooltip">
          <strong>The Sun</strong>
          <span>{elevation}° altitude</span>
          <span className="sky-sun-tooltip-weather">{statusText}</span>
        </div>
      )}

      {/* Rich details dialog card */}
      {open && (
        <section
          className="sky-sun-card"
          role="dialog"
          aria-label={`Sun details: ${elevation}° altitude`}
        >
          <button
            type="button"
            className="sky-sun-close"
            aria-label="Close sun details"
            onClick={() => {
              setOpen(false);
              setHovered(false);
            }}
          >
            ×
          </button>
          <header className="sky-sun-card-header">
            <h2 className="sky-sun-card-title">The Sun</h2>
            <span className="sky-sun-card-date">
              {formattedDate} · {elevation}° altitude
            </span>
          </header>
          <div className="sky-sun-card-body">
            <p className="sky-sun-card-position">
              <span className="sky-sun-label">Sky Position:</span> {position}
            </p>
            <p className="sky-sun-card-hours">
              <span className="sky-sun-label">Daylight Hours:</span> Sunrise {sunriseText} · Sunset {sunsetText}
            </p>
            <div className="sky-sun-card-divider" />
            <div className="sky-sun-card-weather">
              <span className="sky-sun-label">Local Sky:</span>{' '}
              <span className="sky-sun-weather-val">
                {weather?.summary || 'Clear'}
                {weather?.cloudCover !== undefined ? ` (${weather.cloudCover}% clouds)` : ''}
              </span>
              <p className="sky-sun-weather-desc">{statusText}</p>
            </div>
            <div className="sky-sun-card-divider" />
            <p className="sky-sun-card-note">{skyNote}</p>
          </div>
        </section>
      )}
    </div>
  );
}
