import React from "react";
import { BsX } from "react-icons/bs";
import { BsMailboxFlag } from "react-icons/bs";
import Typewriter from "typewriter-effect";
import { Tooltip } from "react-tooltip";
import tc from "thousands-counter";
import js_ago from "js-ago";
import { FaEarlybirds } from "react-icons/fa";
import { BsBookmarkHeartFill } from "react-icons/bs";
import { FaUserTie } from "react-icons/fa";
import { PiShootingStarFill } from "react-icons/pi";
import { PiHeartBreakFill } from "react-icons/pi";
import { useState, useEffect } from "react";
import { render_url, api_key } from "../data/keys";
import { adminId, targetDate } from "../data/target_letters";
import GraphemeSplitter from "grapheme-splitter";
import axios from "axios";

const stringSplitter = (string) => {
  const splitter = new GraphemeSplitter();
  return splitter.splitGraphemes(string);
};

function DetailsModal({
  showDetailsModal,
  toggleDetailsModal,
  selectedLetter,
}) {
  let letterId;
  let letterDate;
  let letterTime;

  let early_bird;
  let eleven_eleven;
  let twelve_fifty_one;
  const hasOpenedUrl = localStorage.getItem("hasOpenedUrl");

  if (selectedLetter) {
    letterDate = new Date(selectedLetter.timestamp);
    letterTime = new Date(selectedLetter.timestamp);
    letterId = selectedLetter._id;
    if (letterDate < targetDate && letterId !== adminId) {
      early_bird = true;
    }
    if (letterId === adminId && !hasOpenedUrl) {
      // window.open('https://twoepidemic.com/h65p1hjab?key=0f5e28f15ad6525e5be830e529cabd5e', '_blank');
      // localStorage.setItem('hasOpenedUrl', 'true');
    }
    if (!hasOpenedUrl) {
      // window.open('https://twoepidemic.com/h65p1hjab?key=0f5e28f15ad6525e5be830e529cabd5e', '_blank');
      // localStorage.setItem('hasOpenedUrl', 'true');
    }
  }

  if (letterTime != null) {
    let hours = letterTime.getHours();
    let minutes = letterTime.getMinutes();
    if (hours === 23 && minutes === 11) {
      eleven_eleven = true;
    } else if (hours === 0 && minutes === 51) {
      twelve_fifty_one = true;
    }
  }

  const [ip, setIP] = useState("");

  const getData = async () => {
    try {
      const res = await axios.get("https://api.ipify.org/?format=json");
      setIP(res.data.ip);
    } catch (error) {
      console.error("Error fetching address:", error);
      return "blocked";
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const MAX_STORAGE_SIZE = 1000;

  const clearStorageIfNeeded = () => {
    const storedData = localStorage.getItem("readLetters");
    if (storedData) {
      const readLetters = JSON.parse(storedData);
      // console.log('Read letters:', readLetters.length);
      if (readLetters.length >= MAX_STORAGE_SIZE) {
        // console.log('Reached max storage size, clearing localStorage');
        localStorage.removeItem("readLetters");
      }
    } else {
      // console.log('No readLetters found in localStorage');
    }
  };

  useEffect(() => {
    clearStorageIfNeeded();
  }, []);

  const incrementReads = async () => {
    if (selectedLetter && !selectedLetter.preview) {
      // Check if the letter ID is already in localStorage
      const readLetters = JSON.parse(localStorage.getItem("readLetters")) || [];

      if (readLetters.includes(selectedLetter._id)) {
        // console.log('Letter already read in this session');
        return;
      }

      const storedData = localStorage.getItem("readLetters");
      if (storedData) {
        const readLetters = JSON.parse(storedData);
        // console.log('Read letters:', readLetters.length);
        if (readLetters.length >= MAX_STORAGE_SIZE) {
          // console.log('Reached max storage size, clearing localStorage');
          localStorage.removeItem("readLetters");
        }
      } else {
        // console.log('No readLetters found in localStorage');
      }

      try {
        const response = await fetch(
          `${render_url}/${selectedLetter._id}/read`,
          {
            method: "POST",
            headers: {
              "x-api-key": api_key,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update reads count");
        }

        // Update localStorage to mark the letter as read
        readLetters.push(selectedLetter._id);
        localStorage.setItem("readLetters", JSON.stringify(readLetters));

        // console.log('Read count incremented');
      } catch (error) {
        // console.error('Error updating reads count:', error);
      }
    }
  };

  useEffect(() => {
    if (ip) {
      incrementReads();
    }
    // eslint-disable-next-line
  }, [ip]);

  function formatReadsCount(readsCount) {
    const parsedReadsCount = parseInt(readsCount);
    return parsedReadsCount === 1
      ? `${parsedReadsCount} read`
      : `${tc(parsedReadsCount, 2)} reads`;
  }

  const formatTimestamp = (timestamp) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(timestamp).toLocaleString("en-US", options);
  };

  const extractMediaLinks = (message) => {
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
        .replace(spotifyLinkRegex, "")
        .replace(/\s*$/, "");

      extractedMedia.spotifyLink = { id: trackId, newMessage };
    }

    if (youtubeMatch && youtubeMatch[1]) {
      // Extract the YouTube video ID from the match
      const videoId = youtubeMatch[1];
      const newMessage = message
        .replace(youtubeLinkRegex, "")
        .replace(/\s*$/, "");

      extractedMedia.youtubeLink = { id: videoId, newMessage };
    }

    if (Object.keys(extractedMedia).length === 0) {
      // If no match found, return the original message
      return {
        spotifyLink: { id: null, newMessage: message },
        youtubeLink: { id: null, newMessage: message },
      };
    }

    return extractedMedia;
  };

  const { spotifyLink, youtubeLink } =
    selectedLetter && selectedLetter.message
      ? extractMediaLinks(selectedLetter.message)
      : {
          spotifyLink: { id: null, newMessage: null },
          youtubeLink: { id: null, newMessage: null },
          originalMessage: null,
        };

  const extracted_data = spotifyLink != null ? spotifyLink : youtubeLink;

  const { id: linkId, newMessage: message } = extracted_data;

  const [showSpotify, setShowSpotify] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(152);

  useEffect(() => {
    function adjustIframeHeight() {
      if (window.innerWidth < 768) {
        setIframeHeight(152);
      } else {
        setIframeHeight(250);
      }
    }

    window.addEventListener("resize", adjustIframeHeight);
    adjustIframeHeight();

    return () => {
      window.removeEventListener("resize", adjustIframeHeight);
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
              <div className="letter-info" style={{ marginBottom: "5px" }}>
                <Typewriter
                  options={{ delay: 50, loop: false, stringSplitter }}
                  onInit={(typewriter) => {
                    typewriter
                      .typeString(
                        `<strong>From:</strong> ${selectedLetter.from}`
                      )
                      .callFunction((state) => {
                        state.elements.cursor.remove();
                      })
                      .start();
                  }}
                />
              </div>
              <div className="letter-info">
                <Typewriter
                  options={{ delay: 50, loop: false, stringSplitter }}
                  onInit={(typewriter) => {
                    typewriter
                      .typeString(`<strong>To:</strong> ${selectedLetter.to}`)
                      .callFunction((state) => {
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
                      options={{ delay: 70, loop: false }}
                      onInit={(typewriter) => {
                        typewriter
                          .typeString(formatTimestamp(selectedLetter.timestamp))
                          .callFunction((state) => {
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
                      options={{ delay: 40, loop: false, stringSplitter }}
                      onInit={(typewriter) => {
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
                    style={{ border: "12px" }}
                    src={`https://open.spotify.com/embed/${linkId}?utm_source=generator&theme=1`}
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
                    src={`https://www.youtube-nocookie.com/embed/${linkId}&autoplay=1;&controls=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                  ></iframe>
                </div>
              )}
              <div className="reads-text">
                <br />
                <>
                  <div
                    data-tooltip-id="badges"
                    data-tooltip-html={`${
                      early_bird
                        ? "<strong>This open letter is an Early Bird! <br/> It was among the first letters to be shared.</strong>"
                        : ""
                    } ${letterId === adminId ? "Admin" : ""} ${
                      eleven_eleven ? "<strong>11:11 PM</strong>" : ""
                    } ${twelve_fifty_one ? "<strong>12:51 AM</strong>" : ""}
                    `}
                    data-tooltip-place="bottom"
                  >
                    {early_bird && (
                      <>
                        <FaEarlybirds size="15px" />
                        &nbsp;
                        <BsBookmarkHeartFill size="15px" />
                      </>
                    )}

                    {letterId === adminId && (
                      <>
                        &nbsp;
                        <FaUserTie size="15px" />
                      </>
                    )}

                    {eleven_eleven && (
                      <>
                        &nbsp;
                        <PiShootingStarFill size="15px" />
                      </>
                    )}

                    {twelve_fifty_one && (
                      <>
                        &nbsp;
                        <PiHeartBreakFill size="15px" />
                      </>
                    )}
                  </div>
                  <Tooltip id="badges" arrowColor="transparent" />
                </>
                <span>
                  {js_ago(new Date(selectedLetter.timestamp), {
                    format: "long",
                  })}{" "}
                  ~ {formatReadsCount(selectedLetter.reads)}
                </span>
                {letterId !== adminId && (
                  <div className="las la-eye fade-icon custom-eye-size"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default DetailsModal;
