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
import { CiLocationOn } from "react-icons/ci";
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

  if (selectedLetter) {
    letterDate = new Date(selectedLetter.timestamp);
    letterTime = new Date(selectedLetter.timestamp);
    letterId = selectedLetter._id;
    if (letterDate < targetDate && letterId !== adminId) {
      early_bird = true;
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

  // Envelope-opening intro animation
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!showDetailsModal || !selectedLetter) {
      setOpened(false);
      return;
    }
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setOpened(true);
      return;
    }
    setOpened(false);
    const timer = setTimeout(() => setOpened(true), 1450);
    return () => clearTimeout(timer);
  }, [showDetailsModal, selectedLetter]);


  const letterCity = selectedLetter?.loc?.city || "";
  const hasLocation = Boolean(letterCity) && letterCity !== "Unknown";
  const letterLocationMap = hasLocation
    ? "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(letterCity)
    : null;

  const handleCloseModal = () => {
    toggleDetailsModal();
    setShowSpotify(false);
    setShowYoutube(false);
    setOpened(false);
  };

  useEffect(() => {
    if (!showDetailsModal) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") handleCloseModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetailsModal]);

  const formatReadsCount = (readsCount) => {
    const parsed = parseInt(readsCount) || 0;
    return parsed === 1 ? "1 read" : `${tc(parsed, 2)} reads`;
  };

  const hasBadge =
    early_bird ||
    letterId === adminId ||
    eleven_eleven ||
    twelve_fifty_one;

  return (
    showDetailsModal &&
    selectedLetter && (
      <div className="letter-modal-overlay" onClick={handleCloseModal}>
        <div className="letter-modal" onClick={(e) => e.stopPropagation()}>
          {opened && (
            <button
              type="button"
              className="letter-modal__close"
              onClick={handleCloseModal}
              aria-label="Close letter"
            >
              <BsX className="close-icon" />
            </button>
          )}

          {opened && (
            <span className="letter-modal__heart" aria-hidden="true">
              <svg viewBox="0 0 32 30" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 27C16 27 3 19.5 3 10.5C3 5.8 6.7 3 10.3 3C13 3 15.2 4.6 16 6.6C16.8 4.6 19 3 21.7 3C25.3 3 29 5.8 29 10.5C29 19.5 16 27 16 27Z"
                  fill="none"
                  stroke="#c8a86a"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}

          {!opened ? (
            <div className="letter-envelope" aria-hidden="true">
              <div className="letter-envelope__back" />
              <div className="letter-envelope__note" />
              <div className="letter-envelope__front" />
              <div className="letter-envelope__flap" />
              <span className="letter-envelope__seal">♥</span>
              <span className="letter-envelope__hint">opening a letter…</span>
            </div>
          ) : (
            <div className="letter-paper" onClick={incrementReads}>
              <div className="letter-paper__head">
                <div className="letter-info" style={{ marginBottom: "4px" }}>
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
              </div>

              <hr className="letter-paper__rule" />

              <div
                className="letter-paper__date"
                data-tooltip-id="timezone_tooltip"
                data-tooltip-content="🇵🇭 Philippine Standard Time (UTC +08)"
                data-tooltip-place="top"
                data-tooltip-variant="info"
              >
                <BsMailboxFlag className="letter-paper__date-icon" size="15px" />
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

              <div className="letter-paper__body letter-text">
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
              </div>

              {showSpotify && linkId && (
                <div className="letter-paper__media">
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
                <div className="letter-paper__media">
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

              <div className="letter-paper__ghost" aria-hidden="true">
                <svg viewBox="0 0 64 58" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 55 V27 a20 20 0 0 1 40 0 V55 l-6.5 -6 -6.5 6 -7 -6 -6.5 6 -7 -6 Z"
                    fill="#f4efe1"
                    stroke="#b7b6a8"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="22" cy="29" r="2.6" fill="#7c7b70" />
                  <circle cx="38" cy="29" r="2.6" fill="#7c7b70" />
                  <path
                    d="M26 36 q4 3.4 8 0"
                    stroke="#7c7b70"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M53 10 c1.5 -1.8 4.4 -1.7 4.4 1 c0 2.4 -4.4 5 -4.4 5 s-4.4 -2.6 -4.4 -5 c0 -2.7 2.9 -2.8 4.4 -1 Z"
                    fill="#e7a9b3"
                  />
                </svg>
              </div>

              <div className="letter-paper__meta">
                {hasBadge && (
                  <>
                    <span
                      className="letter-paper__badges"
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
                    </span>
                    <Tooltip id="badges" arrowColor="transparent" />
                    <span className="letter-meta-sep">·</span>
                  </>
                )}

                <span>
                  {js_ago(new Date(selectedLetter.timestamp), {
                    format: "long",
                  })}
                </span>
                <span className="letter-meta-sep">·</span>
                <span className="letter-paper__reads">
                  <i className="las la-eye fade-icon letter-paper__reads-eye" />
                  {formatReadsCount(selectedLetter.reads)}
                </span>

                {hasLocation && (
                  <>
                    <span className="letter-meta-sep">·</span>
                    <a
                      className="letter-paper__locate"
                      href={letterLocationMap}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <CiLocationOn size="12px" />
                      <span>Written in {letterCity}</span>
                    </a>
                  </>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    )
  );
}

export default DetailsModal;
