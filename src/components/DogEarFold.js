import React from "react";

/**
 * Skeuomorphic vintage Dog-Ear Corner Fold component.
 * Faithfully matches the heirloom stationery reference image:
 * - Upper-right exposed envelope lining with ornate vintage damask/acanthus floral pattern.
 * - Diagonal fold crease with paper depth highlight and crease shadow.
 * - Lower-left turned-down paper flap with tactile texture, scalloped lace border trim, and drop shadow.
 */
export const DogEarFold = React.memo(({ className = "" }) => {
  return (
    <svg
      className={`letter-fold-corner ${className}`.trim()}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Vintage Damask Pattern for the exposed corner lining */}
        <pattern
          id="dogear-damask-lining"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          {/* Deep charcoal antique lining base */}
          <rect width="12" height="12" className="dogear-lining-base" />

          {/* Intricate interlocking acanthus & floral filigree */}
          <g className="dogear-damask-filigree">
            {/* Center symmetrical fleur-de-lis / palmette */}
            <path
              d="M 6 3.5 C 5.2 4.2, 4.8 5.2, 6 6.8 C 7.2 5.2, 6.8 4.2, 6 3.5 Z"
              fill="currentColor"
              opacity="0.85"
            />
            <path
              d="M 6 5.5 C 4.5 4.8, 3.8 3.8, 4.2 3 C 4.8 3.5, 5.4 4.5, 6 5 Z"
              fill="currentColor"
              opacity="0.7"
            />
            <path
              d="M 6 5.5 C 7.5 4.8, 8.2 3.8, 7.8 3 C 7.2 3.5, 6.6 4.5, 6 5 Z"
              fill="currentColor"
              opacity="0.7"
            />
            <circle cx="6" cy="7.2" r="0.6" fill="currentColor" opacity="0.9" />

            {/* Corner scrolls interlocking across tiles */}
            <path
              d="M 0 0 C 1.2 0.8, 1.8 1.8, 1.2 2.8 C 0.5 2.2, 0.4 1.2, 0 0 Z"
              fill="currentColor"
              opacity="0.65"
            />
            <path
              d="M 12 0 C 10.8 0.8, 10.2 1.8, 10.8 2.8 C 11.5 2.2, 11.6 1.2, 12 0 Z"
              fill="currentColor"
              opacity="0.65"
            />
            <path
              d="M 0 12 C 1.2 11.2, 1.8 10.2, 1.2 9.2 C 0.5 9.8, 0.4 10.8, 0 12 Z"
              fill="currentColor"
              opacity="0.65"
            />
            <path
              d="M 12 12 C 10.8 11.2, 10.2 10.2, 10.8 9.2 C 11.5 9.8, 11.6 10.8, 12 12 Z"
              fill="currentColor"
              opacity="0.65"
            />

            {/* Side connecting arabesque vines */}
            <path
              d="M 0 6 Q 2.2 4.5 3.2 6 Q 2.2 7.5 0 6 Z"
              fill="currentColor"
              opacity="0.55"
            />
            <path
              d="M 12 6 Q 9.8 4.5 8.8 6 Q 9.8 7.5 12 6 Z"
              fill="currentColor"
              opacity="0.55"
            />
            <path
              d="M 6 0 Q 4.5 2.2 6 3.2 Q 7.5 2.2 6 0 Z"
              fill="currentColor"
              opacity="0.55"
            />
            <path
              d="M 6 12 Q 4.5 9.8 6 8.8 Q 7.5 9.8 6 12 Z"
              fill="currentColor"
              opacity="0.55"
            />
          </g>
        </pattern>

        {/* Subtle drop shadow under the turned-down flap */}
        <filter id="dogear-flap-cast-shadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow
            dx="-2"
            dy="2.5"
            stdDeviation="1.8"
            floodColor="#1a150c"
            floodOpacity="0.45"
          />
        </filter>

        {/* Paper texture gradient for subtle fold curl */}
        <linearGradient id="dogear-paper-shading" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffdf7" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#f7f1e1" stopOpacity="1" />
          <stop offset="100%" stopColor="#ece2c9" stopOpacity="1" />
        </linearGradient>

        <linearGradient id="dogear-paper-shading-night" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#35332a" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#2b2921" stopOpacity="1" />
          <stop offset="100%" stopColor="#212019" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* 1. Upper-Right Triangle: Exposed Vintage Damask Lining (cut-away corner) */}
      <polygon
        points="0,0 48,0 48,48"
        fill="url(#dogear-damask-lining)"
        className="dogear-lining"
      />

      {/* Corner vignette / shading in the lining crevice */}
      <polygon
        points="0,0 48,0 48,48"
        fill="black"
        opacity="0.18"
      />

      {/* 2. Lower-Left Triangle: Turned-Down Paper Flap */}
      <g className="dogear-flap-group">
        {/* Main folded paper flap with gentle soft curve at bottom-left corner */}
        <path
          d="M 0 0 L 0 45 Q 0 48 3 48 L 48 48 Z"
          className="dogear-flap-body"
        />

        {/* Paper pulp specks / texture on the flap */}
        <g className="dogear-specks" opacity="0.45">
          <circle cx="8" cy="18" r="0.5" fill="#7a6b52" />
          <circle cx="14" cy="30" r="0.6" fill="#7a6b52" />
          <circle cx="22" cy="38" r="0.4" fill="#7a6b52" />
          <circle cx="28" cy="42" r="0.5" fill="#7a6b52" />
          <circle cx="10" cy="36" r="0.4" fill="#7a6b52" />
          <circle cx="18" cy="24" r="0.5" fill="#7a6b52" />
          <circle cx="26" cy="30" r="0.4" fill="#7a6b52" />
          <circle cx="34" cy="44" r="0.5" fill="#7a6b52" />
          <circle cx="6" cy="28" r="0.4" fill="#7a6b52" />
        </g>

        {/* Decorative Scalloped Lace / Filigree Border Trim along outer edges of the flap */}
        <g className="dogear-lace-trim">
          {/* Outer edge inner guide line */}
          <path
            d="M 4 2 L 4 44 Q 4 44 44 44"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="1.5 1.5"
            opacity="0.6"
          />

          {/* Left vertical edge scallops (running from y=4 to y=44) */}
          <path
            d="
              M 0 4 Q 2.4 6 0 8
              Q 2.4 10 0 12
              Q 2.4 14 0 16
              Q 2.4 18 0 20
              Q 2.4 22 0 24
              Q 2.4 26 0 28
              Q 2.4 30 0 32
              Q 2.4 34 0 36
              Q 2.4 38 0 40
              Q 2.4 42 0 44
            "
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Left edge mini lace pearls */}
          <circle cx="1.8" cy="6" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="10" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="14" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="18" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="22" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="26" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="30" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="34" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="38" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="1.8" cy="42" r="0.45" fill="currentColor" opacity="0.75" />

          {/* Bottom horizontal edge scallops (running from x=4 to x=44) */}
          <path
            d="
              M 4 48 Q 6 45.6 8 48
              Q 10 45.6 12 48
              Q 14 45.6 16 48
              Q 18 45.6 20 48
              Q 22 45.6 24 48
              Q 26 45.6 28 48
              Q 30 45.6 32 48
              Q 34 45.6 36 48
              Q 38 45.6 40 48
              Q 42 45.6 44 48
            "
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Bottom edge mini lace pearls */}
          <circle cx="6" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="10" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="14" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="18" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="22" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="26" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="30" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="34" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="38" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
          <circle cx="42" cy="46.2" r="0.45" fill="currentColor" opacity="0.75" />
        </g>

        {/* 3. Diagonal Fold Crease */}
        {/* Soft crease shadow */}
        <line
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          stroke="#3d3424"
          strokeWidth="1.1"
          opacity="0.65"
        />
        {/* Crisp fold highlight reflection */}
        <line
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          stroke="#ffffff"
          strokeWidth="0.6"
          opacity="0.75"
        />
      </g>
    </svg>
  );
});

export default DogEarFold;

