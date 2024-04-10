import React, {useState, useEffect} from 'react';
import logo from '../lotties/ltc_logo_1.webp';
import {Tooltip} from 'react-tooltip';
import Typewriter from 'typewriter-effect';

function Header({searchTerm, handleSearchChange}) {
  const [showLogo, setShowLogo] = useState(true);
  const [alternateMessage, setAlternateMessage] = useState('');

  // Array of alternate messages
  const letters = [
    'Unsent messages are the ghosts of conversations that haunt us.',
    // 'Every unsent message holds a story left untold.',
    // 'Behind every unsent message lies an untold emotion.',
    // "I have so much I want to say to you but I can't. All I can do is write it down and never send it - Sylvia Plath",
    // 'Ang Pag-iibigan natin ay muling maisusulat sa Huling pagkakataon... at ito ang Kahilingan ko. - Carmela Isabella',
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowLogo(prevShowLogo => !prevShowLogo);
    }, 10000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Run effect only once on component mount

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Display a random alternate message
      const randomIndex = Math.floor(Math.random() * letters.length);
      setAlternateMessage(letters[randomIndex]);
    }, 5000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [letters]); // Run effect when letters array changes

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
                .typeString(alternateMessage)
                .pauseFor(3000)
                .deleteAll(1)
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
      </div>
    </div>
  );
}

export default Header;
