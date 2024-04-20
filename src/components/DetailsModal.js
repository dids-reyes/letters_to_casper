// DetailsModal.js
import React from 'react';
import {BsX} from 'react-icons/bs';
import {BsMailboxFlag} from 'react-icons/bs';
import Typewriter from 'typewriter-effect';
import {Tooltip} from 'react-tooltip';
import {useState, useEffect} from 'react';

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

  const extractMediaLinks = message => {
    if (!message) {
      // Return null if message is null or undefined
      return null;
    }

    // Regular expression to find the Spotify track link
    const spotifyLinkRegex =
      /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)\?.*/;

    // Regular expression to find the YouTube video link
    const youtubeLinkRegex = /https:\/\/youtu\.be\/(.*)/;

    // Execute the regex to find the links in the message
    const spotifyMatch = message.match(spotifyLinkRegex);
    const youtubeMatch = message.match(youtubeLinkRegex);

    const extractedMedia = {};

    if (spotifyMatch && spotifyMatch[1]) {
      // Extract the Spotify track ID from the match
      const trackId = spotifyMatch[1];
      const newMessage = message
        .replace(spotifyLinkRegex, '')
        .replace(/\s*$/, '');

      extractedMedia.spotifyLink = {id: trackId, newMessage};
    }

    if (youtubeMatch && youtubeMatch[1]) {
      // Extract the YouTube video ID from the match
      const videoId = youtubeMatch[1];
      const newMessage = message
        .replace(youtubeLinkRegex, '')
        .replace(/\s*$/, '');

      extractedMedia.youtubeLink = {id: videoId, newMessage};
    }

    if (Object.keys(extractedMedia).length === 0) {
      // If no match found, return the original message
      return {
        spotifyLink: {id: null, newMessage: message},
        youtubeLink: {id: null, newMessage: message},
      };
    }

    return extractedMedia;
  };

  const {spotifyLink, youtubeLink} =
    selectedLetter && selectedLetter.message
      ? extractMediaLinks(selectedLetter.message)
      : {
          spotifyLink: {id: null, newMessage: null},
          youtubeLink: {id: null, newMessage: null},
          originalMessage: null,
        };

  const extracted_data = spotifyLink != null ? spotifyLink : youtubeLink;

  const {id: linkId, newMessage: message} = extracted_data;

  const [showSpotify, setShowSpotify] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(152);

  useEffect(() => {
    function adjustIframeHeight() {
      if (window.innerWidth < 768) {
        setIframeHeight(152);
      } else {
        setIframeHeight(280);
      }
    }

    window.addEventListener('resize', adjustIframeHeight);
    adjustIframeHeight();

    return () => {
      window.removeEventListener('resize', adjustIframeHeight);
    };
  }, []);

  const handleCloseModal = () => {
    toggleDetailsModal();
    setShowSpotify(false);
    setShowYoutube(false);
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
                      .callFunction(state => {
                        state.elements.cursor.remove();
                      })
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
                      .callFunction(state => {
                        state.elements.cursor.remove();
                      })
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
                          .callFunction(state => {
                            state.elements.cursor.remove();
                          })
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
                    <Typewriter
                      options={{delay: 40, loop: false}}
                      onInit={typewriter => {
                        typewriter
                          .typeString(message)
                          .pauseFor(500)
                          .callFunction(() => {
                            if (spotifyLink == null) {
                              setShowYoutube(true);
                            } else {
                              setShowSpotify(true);
                            }
                          })
                          .start();
                      }}
                    />
                  </span>
                </div>
              </div>
              {showSpotify && linkId && (
                <div>
                  <iframe
                    title="spotify-preview"
                    style={{border: '12px'}}
                    src={`https://open.spotify.com/embed/track/${linkId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              )}
              {showYoutube && linkId && (
                <div>
                  <iframe
                    width="100%"
                    height={iframeHeight}
                    src={`https://www.youtube-nocookie.com/embed/${linkId}&amp;controls=0`}
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
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
