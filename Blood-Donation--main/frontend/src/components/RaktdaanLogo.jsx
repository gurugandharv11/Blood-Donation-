import React from 'react';

export const RaktdaanLogo = ({ size = 'medium', className = '', showText = true }) => {
  const dimensions = {
    small: { iconSize: 36, fontSize: '0.95rem' },
    medium: { iconSize: 48, fontSize: '1.2rem' },
    large: { iconSize: 180, fontSize: '1.7rem' },
  }[size] || { iconSize: 48, fontSize: '1.2rem' };

  if (size === 'large') {
    return (
      <div className={`raktdaan-hero-logo-wrapper ${className}`}>
        <div className="raktdaan-3d-card text-center p-4">
          {/* Black hands holding red blood drop SVG */}
          <div className="raktdaan-visual-container position-relative mb-3">
            <svg
              viewBox="0 0 300 220"
              className="raktdaan-svg-main"
              xmlns="http://www.w3.org/2000/svg"
              style={{ maxHeight: '240px' }}
            >
              <defs>
                {/* Blood Drop Gradients */}
                <radialGradient id="redDropGrad" cx="40%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FF4D4D" />
                  <stop offset="50%" stopColor="#E74C3C" />
                  <stop offset="100%" stopColor="#990000" />
                </radialGradient>

                <linearGradient id="blackHandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2B2B2B" />
                  <stop offset="70%" stopColor="#111111" />
                  <stop offset="100%" stopColor="#000000" />
                </linearGradient>

                <filter id="redAura" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Red glowing aura */}
              <circle cx="150" cy="75" r="45" fill="rgba(231, 76, 60, 0.45)" filter="url(#redAura)" className="aura-pulse" />

              {/* Glossy Red Blood Drop */}
              <g className="floating-drop-group">
                <path
                  d="M 150 18 C 150 18 108 72 108 98 C 108 122 126 138 150 138 C 174 138 192 122 192 98 C 192 72 150 18 150 18 Z"
                  fill="url(#redDropGrad)"
                  filter="url(#redAura)"
                />
                {/* Specular Gloss Highlight */}
                <ellipse cx="137" cy="75" rx="8" ry="18" fill="rgba(255, 255, 255, 0.7)" transform="rotate(-22 137 75)" />
                <circle cx="162" cy="108" r="4" fill="rgba(255, 255, 255, 0.5)" />
              </g>

              {/* Black Hands holding the drop */}
              <g className="black-hands-group">
                {/* Left Hand */}
                <path
                  d="M 45 65 C 55 95 75 135 118 170 C 138 186 150 205 150 205 C 145 188 122 160 98 132 C 78 108 68 88 58 68 Z"
                  fill="url(#blackHandGrad)"
                />
                <path
                  d="M 68 70 C 78 98 98 132 132 165 C 122 148 102 120 84 92 C 78 84 72 76 68 70 Z"
                  fill="#1C1C1C"
                />

                {/* Right Hand */}
                <path
                  d="M 255 65 C 245 95 225 135 182 170 C 162 186 150 205 150 205 C 155 188 178 160 202 132 C 222 108 232 88 242 68 Z"
                  fill="url(#blackHandGrad)"
                />
                <path
                  d="M 232 70 C 222 98 202 132 168 165 C 178 148 198 120 216 92 C 222 84 228 76 232 70 Z"
                  fill="#1C1C1C"
                />
              </g>
            </svg>
          </div>

          {/* Hindi Slogans with Underlines matching Image 1 */}
          <div className="slogan-container pt-2 border-top border-secondary border-opacity-25">
            <h3 className="hindi-banner-title text-danger fw-bold mb-2 pb-1 border-bottom border-danger border-2 d-inline-block">
              रक्तदान मानव कल्याण
            </h3>
            <div className="mt-2">
              <h2 className="hindi-banner-subtitle text-danger fw-bold pb-1 border-bottom border-danger border-2 d-inline-block">
                रक्तदानी है महान
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact Header / Navbar logo
  return (
    <div className={`d-inline-flex align-items-center gap-2 raktdaan-logo-compact ${className}`}>
      <div className="position-relative d-flex align-items-center justify-content-center">
        <svg width={dimensions.iconSize} height={dimensions.iconSize} viewBox="0 0 100 100" fill="none">
          <defs>
            <radialGradient id="dropGradSm2" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="60%" stopColor="#E74C3C" />
              <stop offset="100%" stopColor="#800000" />
            </radialGradient>
          </defs>
          <path d="M 50 10 C 50 10 30 38 30 52 C 30 65 39 74 50 74 C 61 74 70 65 70 52 C 70 38 50 10 50 10 Z" fill="url(#dropGradSm2)" />
          <ellipse cx="44" cy="40" rx="3.5" ry="9" fill="rgba(255,255,255,0.7)" transform="rotate(-20 44 40)" />
          <path d="M 15 35 C 20 50 30 70 50 88 C 50 88 45 78 33 62 C 23 48 18 38 15 35 Z" fill="#111111" />
          <path d="M 85 35 C 80 50 70 70 50 88 C 50 88 55 78 67 62 C 77 48 82 38 85 35 Z" fill="#111111" />
        </svg>
      </div>

      {showText && (
        <div className="d-flex flex-column leading-tight">
          <div className="d-flex align-items-center gap-1.5 font-weight-bold text-danger fw-bold" style={{ fontSize: dimensions.fontSize, lineHeight: 1.15 }}>
            <span>रक्तदान</span>
            <span className="text-danger">मानव कल्याण</span>
          </div>
          <span className="text-white-50" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            रक्तदानी है महान
          </span>
        </div>
      )}
    </div>
  );
};
