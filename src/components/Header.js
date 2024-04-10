import React, {useState, useEffect} from 'react';
import logo from '../lotties/ltc_logo_1.webp';
import {Tooltip} from 'react-tooltip';
import Typewriter from 'typewriter-effect';
import {alt_letters} from '../data/alt_letters';

function Header({searchTerm, handleSearchChange}) {
  const [showLogo, setShowLogo] = useState(true);
  const [randomMessage, setRandomMessage] = useState('');

  const letters = alt_letters;

  useEffect(() => {
    let logoIntervalId;
    if (showLogo) {
      // Generate a random message from letters array
      const randomIndex = Math.floor(Math.random() * letters.length);
      setRandomMessage(letters[randomIndex]);

      logoIntervalId = setInterval(() => {
        setShowLogo(prevShowLogo => !prevShowLogo);
      }, 60000);
    }

    // Clear logo interval on component unmount
    return () => clearInterval(logoIntervalId);
  }, [showLogo, letters]);

  return (
    <div className="header">
      <br />
      {showLogo ? (
        <img
          className="logo"
          src={logo}
          alt="Letters to Casper"
          width="400"
          height="70"
        />
      ) : (
        <p className="alt-logo">
          <Typewriter
            options={{delay: 20, loop: false}}
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
        </p>
      )}

      <div className="search-bar">
        <a
          href
          data-tooltip-id="my-tooltip"
          data-tooltip-content="You can search by keywords, author or recipient"
          data-tooltip-place="left-start"
          data-tooltip-delay-show={3000}
          data-tooltip-variant="info"
        >
          <input
            type="text"
            className="form-control search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="🔍 Search Letters"
          />
        </a>
        <Tooltip id="my-tooltip" />
      </div>
    </div>
  );
}

export default Header;
