// DetailsModal.js
import React from 'react';
import {BsX} from 'react-icons/bs';
import {BsMailboxFlag} from 'react-icons/bs';
import Typewriter from 'typewriter-effect';
import {Tooltip} from 'react-tooltip';
import tc from 'thousands-counter';
import js_ago from 'js-ago';
import {FaEarlybirds} from 'react-icons/fa';
import {BsBookmarkHeartFill} from 'react-icons/bs';
import {useState, useEffect} from 'react';

function DetailsModal({showDetailsModal, toggleDetailsModal, selectedLetter}) {
  let render_url;
  let api_key = process.env.REACT_APP_API_KEY;

  if (process.env.NODE_ENV === 'development') {
    render_url = 'http://localhost:8000/api/messages';
  } else {
    render_url = process.env.REACT_APP_API_URL;
  }
  const targetDate = new Date(2024, 4, 31);
  let letterDate;
  if (selectedLetter) {
    letterDate = new Date(selectedLetter.timestamp);
  }

  const incrementReads = async () => {
    if (!selectedLetter.preview) {
      try {
        const response = await fetch(
          `${render_url}/${selectedLetter._id}/read`,
          {
            method: 'POST',
            headers: {
              'x-api-key': api_key,
              'Content-Type': 'application/json',
            },
          },
        );
        if (!response.ok) {
          throw new Error('Failed to update reads count');
        }
      } catch (error) {
        console.error('Error updating reads count:', error);
      }
    }
  };

  function formatReadsCount(readsCount) {
    const parsedReadsCount = parseInt(readsCount);
    return parsedReadsCount === 1
      ? `${parsedReadsCount} read`
      : `${tc(parsedReadsCount, 2)} reads`;
  }

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

    // Regular expression to find the Spotify link
    const spotifyLinkRegex = /https:\/\/open\.spotify\.com\/(.*)/;

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
          <div className="modal-content" onClick={incrementReads}>
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
                  data-tooltip-content="🇵🇭 Philippine Standard Time (UTC +08)"
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
                    src={`https://open.spotify.com/embed/${linkId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
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
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              <div className="reads-text">
                <br />
                {letterDate < targetDate && (
                  <>
                    <div
                      data-tooltip-id="early_bird"
                      data-tooltip-html="This open letter is an Early Bird! <br/>
It was among the first letters to be shared."
                      data-tooltip-place="bottom"
                      data-tooltip-variant="dark"
                    >
                      <FaEarlybirds size="15px" />
                      &nbsp;
                      <BsBookmarkHeartFill size="15px" />
                    </div>
                    <Tooltip id="early_bird" arrowColor="transparent" />
                  </>
                )}
                <Typewriter
                  options={{delay: 70, loop: false}}
                  onInit={typewriter => {
                    typewriter
                      .typeString(
                        `${js_ago(new Date(selectedLetter.timestamp), {
                          format: 'long',
                        })} ~ ${formatReadsCount(selectedLetter.reads)} 📖`,
                      )
                      .callFunction(state => {
                        state.elements.cursor.remove();
                      })
                      .start();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default DetailsModal;
