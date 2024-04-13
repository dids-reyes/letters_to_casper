// DetailsModal.js
import React from 'react';
import {BsX} from 'react-icons/bs';
import {BsMailboxFlag} from 'react-icons/bs';
import Typewriter from 'typewriter-effect';
import {Tooltip} from 'react-tooltip';
import {useState} from 'react';

function DetailsModal({showDetailsModal, toggleDetailsModal, selectedLetter}) {
  const formatTimestamp = timestamp => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return new Date(timestamp).toLocaleString('en-US', options);
  };

  const extractSpotifyLink = message => {
    if (!message) {
      // Return null if message is null or undefined
      return null;
    }

    // Regular expression to find the Spotify track link
    const spotifyLinkRegex =
      /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)\?.*/;

    // Execute the regex to find the link in the message
    const match = message.match(spotifyLinkRegex);

    if (match && match[1]) {
      // Extract the track ID from the match
      const trackId = match[1];

      // Remove the entire Spotify link from the message and any preceding whitespace
      const newMessage = message
        .replace(spotifyLinkRegex, '')
        .replace(/\s*$/, '');

      // Return an object with the track ID and the updated message
      return {trackId, newMessage};
    } else {
      // If no match found, return the original message
      return {trackId: null, newMessage: message};
    }
  };

  // Ensure selectedLetter is defined and selectedLetter.message is truthy before calling extractSpotifyLink
  const {trackId, newMessage} =
    selectedLetter && selectedLetter.message
      ? extractSpotifyLink(selectedLetter.message)
      : {trackId: null, newMessage: null};

  const [showSpotify, setShowSpotify] = useState(false);

  const handleCloseModal = () => {
    toggleDetailsModal();
    setShowSpotify(false);
  };

  return (
    showDetailsModal &&
    selectedLetter && (
      <div className="modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                onClick={handleCloseModal}
              >
                <BsX className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="letter-info">
                <Typewriter
                  options={{delay: 50, loop: false}}
                  onInit={typewriter => {
                    typewriter
                      .typeString(
                        `<strong>From:</strong> ${selectedLetter.from}`,
                      )
                      .start();
                  }}
                />
              </div>
              <br />
              <div className="letter-info">
                <Typewriter
                  options={{delay: 50, loop: false}}
                  onInit={typewriter => {
                    typewriter
                      .typeString(`<strong>To:</strong> ${selectedLetter.to}`)
                      .start();
                  }}
                />
              </div>
              <div>
                <br />
                <label htmlFor="timestamp">
                  <BsMailboxFlag size="25px" />
                </label>

                <div
                  data-tooltip-id="timezone_tooltip"
                  data-tooltip-content="Philippine Standard Time (UTC+08)"
                  data-tooltip-place="top"
                  data-tooltip-variant="info"
                >
                  <span className="timestamp-text">
                    <Typewriter
                      options={{delay: 70, loop: false}}
                      onInit={typewriter => {
                        typewriter
                          .typeString(formatTimestamp(selectedLetter.timestamp))
                          .start();
                      }}
                    />
                  </span>
                </div>
                <Tooltip id="timezone_tooltip" />
                <br />
              </div>
              <div className="form-group">
                <div className="letter-text">
                  <span>
                    {console.log(newMessage)}
                    <Typewriter
                      options={{delay: 50, loop: false}}
                      onInit={typewriter => {
                        typewriter
                          .typeString(newMessage)
                          .pauseFor(1000)
                          .callFunction(() => {
                            setShowSpotify(true);
                          })
                          .start();
                      }}
                    />
                  </span>
                </div>
              </div>

              {showSpotify && trackId && (
                <div>
                  <iframe
                    style={{border: '12px'}}
                    src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default DetailsModal;
