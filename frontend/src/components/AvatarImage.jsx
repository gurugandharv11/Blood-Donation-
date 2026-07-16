import React, { useState } from 'react';
import { getInitials } from '../services/utils';

const API_BASE = 'http://localhost:8080';

/**
 * Reusable avatar component that shows a profile image if available,
 * or falls back to a styled initials-based placeholder.
 *
 * Props:
 *  - name: string (user's full name, used for initials fallback)
 *  - imageUrl: string|null (relative path like /uploads/profile-photos/xxx.jpg)
 *  - size: number (pixel size, default 44)
 *  - className: string (optional extra CSS class)
 */
export const AvatarImage = ({ name, imageUrl, size = 44, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const fullUrl = imageUrl
    ? (imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`)
    : null;

  const showImage = fullUrl && !imgError;

  if (showImage) {
    return (
      <img
        src={fullUrl}
        alt={name || 'User'}
        className={`avatar-image ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '2px solid rgba(231,76,60,0.15)'
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Initials fallback
  const initials = getInitials(name);
  return (
    <div
      className={`avatar-placeholder ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #C0392B, #E74C3C)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: '700',
        fontSize: `${size * 0.35}px`,
        flexShrink: 0,
        border: '2px solid rgba(231,76,60,0.15)'
      }}
    >
      {initials}
    </div>
  );
};
