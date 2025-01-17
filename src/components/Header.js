import React, {useState, useEffect} from 'react';
import logo from '../lotties/ltc_logo_1.webp';
import {Tooltip} from 'react-tooltip';
import Typewriter from 'typewriter-effect';
import {alt_letters} from '../data/alt_letters';
import '../styles/App.css';

function Header({searchTerm, handleSearchChange}) {
  const [showLogo, setShowLogo] = useState(true);
  const [randomMessage, setRandomMessage] = useState('');

  const letters = alt_letters;

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

  return (
    <div className="header">
      <br />
      {showLogo ? (
        <img
          id="logo-ltc"
          className="logo"
          src={logo}
          alt="Letters to Casper"
          width="400"
          height="70"
        />
      ) : (
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
        <div
          // eslint-disable-next-line
          data-tooltip-id="search_tooltip"
          data-tooltip-html="Try searching your name; <br/>you might find an open letter written for you."
          data-tooltip-place="left-center"
          data-tooltip-delay-show={2000}
          data-tooltip-variant="info"
        >
          <input
            type="text"
            className="form-control search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="🔍 Is There a Letter Written for You?"
          />
        </div>
        <Tooltip id="search_tooltip" />
      </div>
    </div>
  );
}

export default Header;
