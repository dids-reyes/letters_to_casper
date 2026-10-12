import React, {useState, useEffect, useRef, memo} from 'react';
import logo from '../lotties/ltc_logo_1.webp';
import Typewriter from 'typewriter-effect';
import {FiSearch, FiX} from 'react-icons/fi';
import {alt_letters} from '../data/alt_letters';
import '../styles/App.css';

const compactLogo = `${process.env.PUBLIC_URL}/android-chrome-512x512.png`;

const preloadedHeaderLogos = [];

function preloadAndDecodeHeaderLogos() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (preloadedHeaderLogos.length > 0) return;

  [
    {src: logo, width: 400, height: 70},
    {src: compactLogo, width: 48, height: 48},
  ].forEach(({src, width, height}) => {
    if (!src) return;
    const img = new Image(width, height);
    img.decoding = 'sync';
    img.src = src;
    if (typeof img.decode === 'function') {
      img.decode().catch(() => {});
    }
    preloadedHeaderLogos.push(img);
  });
}

preloadAndDecodeHeaderLogos();

function Header({
  searchTerm = '',
  handleSearchChange,
  handleClearSearch,
  isCompact = false,
}) {
  const [showLogo, setShowLogo] = useState(true);
  const [randomMessage, setRandomMessage] = useState('');
  const searchInputRef = useRef(null);

  const letters = alt_letters;

  useEffect(() => {
    preloadAndDecodeHeaderLogos();
  }, []);

  const handleClear = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (handleClearSearch) {
      handleClearSearch();
    } else if (handleSearchChange) {
      handleSearchChange({ target: { value: '' } });
    }
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && searchTerm) {
      event.preventDefault();
      handleClear(event);
    }
  };

  useEffect(() => {
    let logoIntervalId;
    if (showLogo) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      setRandomMessage(letters[randomIndex]);

      logoIntervalId = setInterval(() => {
        setShowLogo(prevShowLogo => !prevShowLogo);
      }, 300000);
    }

    // Clear logo interval on component unmount
    return () => clearInterval(logoIntervalId);
  }, [showLogo, letters]);

  const showCompactLogo = Boolean(isCompact);
  const showFullLogo = !isCompact && showLogo;
  const showAltLogo = !isCompact && !showLogo;

  return (
    <div className="header">
      <br />
      <img
        key="compact-logo"
        id={showCompactLogo ? 'logo-ltc' : undefined}
        className={`logo logo--compact-mark${showCompactLogo ? '' : ' is-hidden-logo'}`}
        src={compactLogo}
        alt={showCompactLogo ? 'Letters to Casper' : ''}
        aria-hidden={showCompactLogo ? undefined : 'true'}
        hidden={!showCompactLogo}
        width="48"
        height="48"
        decoding="sync"
        loading="eager"
      />
      <img
        key="full-logo"
        id={showFullLogo ? 'logo-ltc' : undefined}
        className={`logo logo--full${showFullLogo ? '' : ' is-hidden-logo'}`}
        src={logo}
        alt={showFullLogo ? 'Letters to Casper' : ''}
        aria-hidden={showFullLogo ? undefined : 'true'}
        hidden={!showFullLogo}
        width="400"
        height="70"
        decoding="sync"
        loading="eager"
        fetchpriority="high"
      />
      {showAltLogo && (
        <div className="alt-logo">
          <Typewriter
            options={{delay: 50, loop: false}}
            onInit={typewriter => {
              typewriter
                .typeString(randomMessage)
                .pauseFor(3000)
                .deleteAll(30)
                .callFunction(() => {
                  setShowLogo(true); // Reset showLogo to true immediately
                })
                .start();
            }}
          />
          <br />
        </div>
      )}
      <div className="search-bar">
        <div className="search-field">
          <FiSearch className="search-icon" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            className="form-control search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search for your name or a letter"
            aria-label="Search letters"
          />
          {searchTerm ? (
            <button
              type="button"
              className="search-clear-button"
              onClick={handleClear}
              onMouseDown={(event) => event.preventDefault()}
              aria-label="Clear search"
              title="Clear search"
            >
              <FiX className="search-clear-icon" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default memo(Header);
