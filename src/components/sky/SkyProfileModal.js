import React, { useEffect, useRef, useState } from 'react';
import { GENDER_ICONS, VALID_GENDERS, processTemporaryAvatar } from './avatar';

export function DefaultAvatarIcon({ size = 48, className = '' }) {
  return (
    <svg
      className={`sky-avatar-placeholder ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="23" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="24" cy="18" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13 36C13 30.4772 17.4772 26 23 26H25C30.5228 26 35 30.4772 35 36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="34" cy="15" r="1.2" fill="currentColor" opacity="0.7" />
      <circle cx="33" cy="30" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="15" cy="28" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function GenderSymbol({ gender, size = 20, className = '' }) {
  if (gender === 'male') {
    return (
      <svg
        className={`sky-gender-svg ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="10" cy="14" r="5" />
        <line x1="19" y1="5" x2="13.6" y2="10.4" />
        <polyline points="14 5 19 5 19 10" />
      </svg>
    );
  }
  if (gender === 'female') {
    return (
      <svg
        className={`sky-gender-svg ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="9" r="5" />
        <line x1="12" y1="14" x2="12" y2="21" />
        <line x1="9" y1="18" x2="15" y2="18" />
      </svg>
    );
  }
  if (gender === 'non-binary') {
    return (
      <svg
        className={`sky-gender-svg ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.5" />
        <line x1="15.2" y1="8.8" x2="20" y2="4" />
        <polyline points="16 4 20 4 20 8" />
        <line x1="12" y1="16.5" x2="12" y2="22" />
        <line x1="9.5" y1="19.5" x2="14.5" y2="19.5" />
        <line x1="8.8" y1="8.8" x2="4" y2="4" />
        <polyline points="8 4 4 4 4 8" />
        <line x1="4.5" y1="8" x2="8" y2="4.5" />
      </svg>
    );
  }
  return null;
}

export default function SkyProfileModal({ onSubmit, onClose, initialData = null }) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [age, setAge] = useState(initialData?.age ? String(initialData.age) : '');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [avatar, setAvatar] = useState(initialData?.avatar || null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [touched, setTouched] = useState({ username: false, age: false, gender: false });

  const fileInputRef = useRef(null);

  // Close on Escape key if onClose is provided
  useEffect(() => {
    if (!onClose) return undefined;
    const handleKeyDown = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const trimmedUsername = username.trim();
  const parsedAge = Number(age);

  const isUsernameValid = trimmedUsername.length >= 3 && trimmedUsername.length <= 18;
  const isAgeValid = !Number.isNaN(parsedAge) && parsedAge >= 13 && parsedAge <= 99;
  const isGenderValid = VALID_GENDERS.includes(gender);
  const isFormValid = isUsernameValid && isAgeValid && isGenderValid && !avatarLoading;

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setAvatarLoading(true);
    try {
      const compressed = await processTemporaryAvatar(file);
      setAvatar(compressed);
    } catch (err) {
      setAvatarError(err.message || 'Could not process avatar.');
      setAvatar(null);
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!isFormValid) {
      setTouched({ username: true, age: true, gender: true });
      return;
    }

    onSubmit({
      username: trimmedUsername,
      age: parsedAge,
      gender,
      avatar,
      status: initialData?.status || 'peaceful',
    });
  }

  return (
    <div
      className="sky-profile-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sky-profile-title"
      onClick={e => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="sky-profile-modal">
        {onClose && (
          <button
            type="button"
            className="sky-profile-close"
            onClick={onClose}
            aria-label="Close profile editor"
          >
            ×
          </button>
        )}
        <header className="sky-profile-header">
          <h2 id="sky-profile-title">
            {initialData ? 'Customize Your Temporary Profile' : 'Create Your Temporary Profile'}
          </h2>
          <p className="sky-profile-notice">
            This is a temporary profile for this session only. Your avatar and details will vanish completely when you leave.
          </p>
        </header>

        <form className="sky-profile-form" onSubmit={handleSubmit} noValidate>
          {/* Avatar Upload */}
          <div className="sky-profile-field sky-profile-field--avatar">
            <div
              className="sky-profile-avatar-preview"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload temporary profile avatar"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar preview" className="sky-profile-avatar-img" />
              ) : (
                <DefaultAvatarIcon size={64} />
              )}
              <span className="sky-profile-avatar-badge" aria-hidden="true">
                {avatarLoading ? '…' : '+'}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sky-visually-hidden"
              onChange={handleFileChange}
              disabled={avatarLoading}
            />

            {avatar && (
              <div className="sky-profile-avatar-meta">
                <button
                  type="button"
                  className="sky-profile-avatar-remove"
                  onClick={() => setAvatar(null)}
                >
                  Remove
                </button>
              </div>
            )}
            {avatarError && <small className="sky-profile-error" role="alert">{avatarError}</small>}
          </div>

          {/* Username & Age horizontally aligned */}
          <div className="sky-profile-row">
            {/* Username */}
            <div className="sky-profile-field sky-profile-field--username">
              <label htmlFor="sky-profile-username" className="sky-profile-label">
                Username <span className="sky-profile-required">*</span>
              </label>
              <input
                id="sky-profile-username"
                type="text"
                className={`sky-profile-input ${touched.username && !isUsernameValid ? 'sky-profile-input--error' : ''}`}
                placeholder="e.g. Orion"
                maxLength={18}
                value={username}
                onChange={e => setUsername(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, username: true }))}
                required
              />
              {touched.username && !isUsernameValid && (
                <small className="sky-profile-error" role="alert">
                  3 to 18 characters.
                </small>
              )}
            </div>

            {/* Age */}
            <div className="sky-profile-field sky-profile-field--age">
              <label htmlFor="sky-profile-age" className="sky-profile-label">
                Age <span className="sky-profile-required">*</span>
              </label>
              <input
                id="sky-profile-age"
                type="number"
                min="13"
                max="99"
                className={`sky-profile-input ${touched.age && !isAgeValid ? 'sky-profile-input--error' : ''}`}
                placeholder="13–99"
                value={age}
                onChange={e => setAge(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, age: true }))}
                required
              />
              {touched.age && !isAgeValid && (
                <small className="sky-profile-error" role="alert">
                  13 to 99.
                </small>
              )}
            </div>
          </div>

          {/* Gender Selection */}
          <div className="sky-profile-field">
            <span className="sky-profile-label" id="sky-gender-group-label">
              Gender <span className="sky-profile-required">*</span>
            </span>
            <div
              className="sky-profile-gender-group"
              role="radiogroup"
              aria-labelledby="sky-gender-group-label"
            >
              {VALID_GENDERS.map(g => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={gender === g}
                  className={`sky-gender-btn ${gender === g ? 'is-selected' : ''}`}
                  onClick={() => {
                    setGender(g);
                    setTouched(t => ({ ...t, gender: true }));
                  }}
                  aria-label={g === 'non-binary' ? 'Non-binary' : g.charAt(0).toUpperCase() + g.slice(1)}
                >
                  <span className="sky-gender-icon" aria-hidden="true">
                    <GenderSymbol gender={g} size={20} />
                  </span>
                  <span className="sky-visually-hidden">{GENDER_ICONS[g]}</span>
                </button>
              ))}
            </div>
            {touched.gender && !isGenderValid && (
              <small className="sky-profile-error" role="alert">
                Please select a gender icon.
              </small>
            )}
          </div>

          {/* Submit Action */}
          <div className="sky-profile-actions">
            <button
              type="submit"
              className="sky-profile-submit"
              disabled={!isFormValid}
            >
              Step Into the Sky
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

