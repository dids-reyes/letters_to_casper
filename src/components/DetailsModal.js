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
import {
  IoCopyOutline,
  IoDownloadOutline,
  IoExpandOutline,
  IoLanguageOutline,
  IoQrCodeOutline,
  IoShareSocialOutline,
} from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { render_url, api_key } from "../data/keys";
import { adminId, targetDate } from "../data/target_letters";
import GraphemeSplitter from "grapheme-splitter";
import { toast } from "react-toastify";
import { getOptimizedPhotoUrl } from "../data/cloudinary";
const languageCodes = {
  albanian: "sq", arabic: "ar", azeri: "az", bengali: "bn",
  bulgarian: "bg", cebuano: "ceb", croatian: "hr", czech: "cs",
  danish: "da", dutch: "nl", estonian: "et", farsi: "fa",
  finnish: "fi", french: "fr", german: "de", hausa: "ha",
  hindi: "hi", hungarian: "hu", icelandic: "is", indonesian: "id",
  italian: "it", kazakh: "kk", kyrgyz: "ky", latin: "la",
  latvian: "lv", lithuanian: "lt", macedonian: "mk", mongolian: "mn",
  nepali: "ne", norwegian: "no", pashto: "ps", polish: "pl",
  portuguese: "pt", romanian: "ro", russian: "ru", serbian: "sr",
  slovak: "sk", slovene: "sl", somali: "so", spanish: "es",
  swahili: "sw", swedish: "sv", tagalog: "tl", turkish: "tr",
  ukrainian: "uk", urdu: "ur", uzbek: "uz", vietnamese: "vi",
  welsh: "cy",
};

const philippineLanguageNames = new Set([
  "bicolano",
  "bikol",
  "cebuano",
  "filipino",
  "hiligaynon",
  "ilocano",
  "kapampangan",
  "pangasinan",
  "tagalog",
  "waray",
]);

const philippineLanguageWords = new Set([
  // Cebuano
  "amping", "dili", "gyud", "imong", "kaayo", "mao", "nimo", "ngano", "unsa",
  // Ilocano
  "adu", "agyaman", "haan", "kayat", "ken", "manen", "nak", "sika",
  // Hiligaynon
  "gid", "indi", "palangga", "salamat", "sang", "saon", "subong",
  // Waray
  "diri", "gud", "hain", "hira", "kasingkasing", "waray",
  // Bikol
  "dai", "marhay", "ngonian", "oragon", "pirmi",
  // Kapampangan and Pangasinan
  "ali", "kaluguran", "kening", "masanting", "neka", "walay",
]);

const hasPhilippineLanguageSignals = text => {
  const words = String(text || "").toLocaleLowerCase("en").match(/\p{L}+/gu) || [];
  return new Set(words.filter(word => philippineLanguageWords.has(word))).size >= 2;
};

const detectForeignLanguage = (languageDetector, text) => {
  const cleanText = String(text || "").replace(/https?:\/\/\S+/g, " ").trim();
  if (cleanText.replace(/[^\p{L}]/gu, "").length < 20) return null;
  if (hasPhilippineLanguageSignals(cleanText)) return null;

  const scriptLanguages = [
    [/\p{Script=Hiragana}|\p{Script=Katakana}/gu, "japanese", "ja"],
    [/\p{Script=Hangul}/gu, "korean", "ko"],
    [/\p{Script=Han}/gu, "chinese", "zh-CN"],
    [/\p{Script=Thai}/gu, "thai", "th"],
    [/\p{Script=Greek}/gu, "greek", "el"],
    [/\p{Script=Hebrew}/gu, "hebrew", "he"],
  ];
  const letterCount = cleanText.match(/\p{L}/gu)?.length || 0;
  const scriptMatch = scriptLanguages.find(([pattern]) => {
    const scriptCharacterCount = cleanText.match(pattern)?.length || 0;
    return scriptCharacterCount >= 4 && scriptCharacterCount / letterCount >= 0.15;
  });
  if (scriptMatch) return { name: scriptMatch[1], code: scriptMatch[2] };

  const matches = languageDetector.detect(cleanText, 3);
  if (!matches.length) return null;

  const [name, confidence] = matches[0];
  const likelyEnglishOrPhilippineLanguage = matches.some(
    ([candidate, score]) =>
      (candidate === "english" || philippineLanguageNames.has(candidate)) &&
      confidence - score < 0.055
  );
  const code = languageCodes[name];
  if (
    philippineLanguageNames.has(name) ||
    likelyEnglishOrPhilippineLanguage ||
    !code ||
    confidence < 0.12
  ) return null;
  return { name, code };
};

const splitTranslationText = (text, maxBytes = 450) => {
  const chunks = [];
  let current = "";
  for (const section of String(text).split(/(\s+)/)) {
    for (const character of section) {
      if (new Blob([current + character]).size > maxBytes && current) {
        chunks.push(current);
        current = "";
      }
      current += character;
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

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

  const MAX_STORAGE_SIZE = 1000;
  const readRequestsInFlight = useRef(new Set());
  const [displayedReads, setDisplayedReads] = useState(0);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setDisplayedReads(parseInt(selectedLetter?.reads, 10) || 0);
  }, [selectedLetter?._id, selectedLetter?.reads]);

  const getReadLetters = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("readLetters") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      localStorage.removeItem("readLetters");
      return [];
    }
  };

  const getReaderId = () => {
    const storageKey = "lettersToCasperReaderId";
    let readerId = localStorage.getItem(storageKey);
    if (!readerId) {
      readerId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(storageKey, readerId);
    }
    return readerId;
  };

  const incrementReads = async () => {
    if (selectedLetter && !selectedLetter.preview) {
      const letterIdToCount = selectedLetter._id;
      let readLetters = getReadLetters();

      if (readLetters.length >= MAX_STORAGE_SIZE) {
        localStorage.removeItem("readLetters");
        readLetters = [];
      }

      if (
        readLetters.includes(letterIdToCount) ||
        readRequestsInFlight.current.has(letterIdToCount)
      ) {
        return;
      }

      readRequestsInFlight.current.add(letterIdToCount);

      try {
        const response = await fetch(
          `${render_url}/${letterIdToCount}/read`,
          {
            method: "POST",
            headers: {
              "x-api-key": api_key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ readerId: getReaderId() }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update reads count");
        }

        const result = await response.json().catch(() => ({}));
        readLetters.push(letterIdToCount);
        localStorage.setItem("readLetters", JSON.stringify(readLetters));
        setDisplayedReads((current) => {
          const serverReads = parseInt(result.reads, 10);
          if (!Number.isNaN(serverReads)) return serverReads;
          return result.counted === false ? current : current + 1;
        });
      } catch (error) {
        console.error("Error updating reads count:", error);
      } finally {
        readRequestsInFlight.current.delete(letterIdToCount);
      }
    }
  };

  useEffect(() => {
    if (showDetailsModal && opened && selectedLetter?._id) {
      incrementReads();
    }
    // eslint-disable-next-line
  }, [showDetailsModal, opened, selectedLetter?._id]);

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
      const videoId = youtubeMatch[1].split(/[?&]/)[0];
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
  const [showPhoto, setShowPhoto] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(152);
  const [translatedMessage, setTranslatedMessage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  useEffect(() => {
    let isCurrentLetter = true;
    setTranslatedMessage("");
    setIsTranslating(false);
    setShowTranslation(false);
    setDetectedLanguage(null);

    if (message) {
      import("languagedetect")
        .then(({ default: LanguageDetect }) => {
          if (!isCurrentLetter) return;
          const detector = new LanguageDetect();
          setDetectedLanguage(detectForeignLanguage(detector, message));
        })
        .catch(() => {
          if (isCurrentLetter) setDetectedLanguage(null);
        });
    }

    return () => {
      isCurrentLetter = false;
    };
  }, [selectedLetter?._id, message]);

  const handleTranslate = async () => {
    if (showTranslation && translatedMessage) {
      setShowTranslation(false);
      return;
    }
    if (translatedMessage) {
      setShowTranslation(true);
      return;
    }
    if (!detectedLanguage || isTranslating) return;

    setIsTranslating(true);
    try {
      const chunks = splitTranslationText(message);
      const translations = await Promise.all(
        chunks.map(async (chunk) => {
          const params = new URLSearchParams({
            q: chunk,
            langpair: `${detectedLanguage.code}|en`,
            mt: "1",
          });
          const response = await fetch(
            `https://api.mymemory.translated.net/get?${params.toString()}`
          );
          if (!response.ok) throw new Error("Translation service unavailable");
          const result = await response.json();
          if (!result?.responseData?.translatedText) {
            throw new Error("No translation returned");
          }
          return result.responseData.translatedText;
        })
      );
      setTranslatedMessage(translations.join(""));
      setShowTranslation(true);
    } catch (error) {
      toast.error("This letter couldn’t be translated right now.", {
        position: "top-center",
        autoClose: 2800,
      });
    } finally {
      setIsTranslating(false);
    }
  };

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

  // Location is gated behind an ad view: first click opens the ad, and on
  // returning to the tab the link becomes the actual map.
  const adLink =
    "https://www.profitableratecpmnetwork.com/rxyce75in3?key=945fab619a2a948227fecaaf9d93f787";
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasClickedAd, setHasClickedAd] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

  const letterShareUrl =
    selectedLetter?._id && !selectedLetter.preview
      ? `${window.location.origin}/letters/${selectedLetter._id}`
      : "";
  const letterQrUrl = letterShareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(
        letterShareUrl
      )}`
    : "";

  useEffect(() => {
    const revealLocationAfterAd = () => {
      if (
        document.visibilityState === "visible" &&
        hasClickedAd &&
        !isRevealed
      ) {
        setIsRevealed(true);
      }
    };

    document.addEventListener("visibilitychange", revealLocationAfterAd);
    window.addEventListener("focus", revealLocationAfterAd);
    return () => {
      document.removeEventListener("visibilitychange", revealLocationAfterAd);
      window.removeEventListener("focus", revealLocationAfterAd);
    };
  }, [hasClickedAd, isRevealed]);

  const handleLocateClick = () => {
    if (!isRevealed) {
      setHasClickedAd(true);
    }
  };

  const handleCopyLetterLink = async () => {
    if (!selectedLetter?._id || selectedLetter.preview) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(letterShareUrl);
      } else {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = letterShareUrl;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        const copied = document.execCommand("copy");
        temporaryInput.remove();
        if (!copied) throw new Error("Unable to copy link");
      }

      toast.info("Link copied — ready to share.", {
        position: "top-center",
        autoClose: 2500,
      });
      setShowShareDialog(false);
      setShowQrCode(false);
    } catch (error) {
      toast.error("Couldn’t copy the link. Please try again.", {
        position: "top-center",
        autoClose: 2500,
      });
    }
  };

  const handleDownloadQr = async () => {
    if (!letterQrUrl || isDownloadingQr) return;

    setIsDownloadingQr(true);
    try {
      const response = await fetch(letterQrUrl);
      if (!response.ok) throw new Error("Unable to download QR code");

      const qrBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(qrBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `letter-to-casper-${selectedLetter._id}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.info("QR code downloaded — ready to share.", {
        position: "top-center",
        autoClose: 2500,
      });
    } catch (error) {
      toast.error("Couldn’t download the QR code. Please try again.", {
        position: "top-center",
        autoClose: 2500,
      });
    } finally {
      setIsDownloadingQr(false);
    }
  };

  const handleCloseModal = () => {
    toggleDetailsModal();
    setShowSpotify(false);
    setShowYoutube(false);
    setShowPhoto(false);
    setShowPhotoViewer(false);
    setOpened(false);
    setIsRevealed(false);
    setHasClickedAd(false);
    setShowShareDialog(false);
    setShowQrCode(false);
    setIsDownloadingQr(false);
    setTranslatedMessage("");
    setIsTranslating(false);
    setShowTranslation(false);
  };

  const closeShareDialog = () => {
    setShowShareDialog(false);
    setShowQrCode(false);
    setIsDownloadingQr(false);
  };

  useEffect(() => {
    if (!showDetailsModal) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (showPhotoViewer) {
        setShowPhotoViewer(false);
        return;
      }
      if (showShareDialog) {
        closeShareDialog();
        return;
      }
      handleCloseModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetailsModal, showPhotoViewer, showShareDialog]);

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
            <div className="letter-paper">
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

              {detectedLanguage && (
                <div className="letter-paper__translation-control">
                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    aria-pressed={showTranslation}
                  >
                    <IoLanguageOutline aria-hidden="true" />
                    <span>
                      {isTranslating
                        ? "Translating…"
                        : showTranslation
                          ? "Show original"
                          : "Translate to English"}
                    </span>
                  </button>
                  <small>{detectedLanguage.name}</small>
                </div>
              )}

              <div className="letter-paper__body letter-text">
                {showTranslation ? (
                  <span>{translatedMessage}</span>
                ) : (
                  <Typewriter
                    options={{ delay: 40, loop: false, stringSplitter }}
                    onInit={(typewriter) => {
                      typewriter
                        .typeString(message)
                        .pauseFor(500)
                        .callFunction(() => {
                          setShowPhoto(Boolean(selectedLetter.photo?.url));
                          if (spotifyLink == null) {
                            setShowYoutube(true);
                          } else {
                            setShowSpotify(true);
                          }
                        })
                        .start();
                    }}
                  />
                )}
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
                    src={`https://www.youtube-nocookie.com/embed/${linkId}?autoplay=1&mute=0&playsinline=1&controls=0&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              {showPhoto && selectedLetter.photo?.url && (
                <figure className="letter-paper__photo">
                  <img
                    src={getOptimizedPhotoUrl(selectedLetter.photo.url)}
                    alt={`Attached to the letter from ${selectedLetter.from} to ${selectedLetter.to}`}
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhotoViewer(true)}
                    aria-label="View attached photo full screen"
                  >
                    <IoExpandOutline />
                    <span>View full screen</span>
                  </button>
                </figure>
              )}

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
                  {formatReadsCount(displayedReads)}
                </span>

                {(hasLocation ||
                  (!selectedLetter.preview && selectedLetter._id)) && (
                  <>
                    <span className="letter-meta-sep">·</span>
                    <span className="letter-paper__actions">
                      {hasLocation && (
                        <a
                          className={`letter-paper__locate${
                            isRevealed ? " is-revealed" : ""
                          }`}
                          href={isRevealed ? letterLocationMap : adLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleLocateClick}
                        >
                          <CiLocationOn size="12px" />
                          <span>{isRevealed ? "View on Map" : "Locate"}</span>
                        </a>
                      )}
                      {hasLocation &&
                        !selectedLetter.preview &&
                        selectedLetter._id && (
                          <span className="letter-meta-sep">·</span>
                        )}
                      {!selectedLetter.preview && selectedLetter._id && (
                        <button
                          type="button"
                          className="letter-paper__share"
                          onClick={() => setShowShareDialog(true)}
                          aria-label="Share this letter"
                          title="Share letter"
                        >
                          <IoShareSocialOutline size="12px" />
                          <span>Share</span>
                        </button>
                      )}
                    </span>
                  </>
                )}
              </div>

            </div>
          )}
        </div>

        {showShareDialog && (
          <div
            className="letter-share-dialog-overlay"
            onClick={(event) => {
              event.stopPropagation();
              closeShareDialog();
            }}
          >
            <section
              className="letter-share-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="letter-share-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="letter-share-dialog__close"
                onClick={closeShareDialog}
                aria-label="Close share options"
              >
                <BsX />
              </button>

              <span className="letter-share-dialog__eyebrow">Send it onward</span>
              <h2 id="letter-share-title">Share this letter</h2>
              <p>Choose how you would like to pass this letter along.</p>

              <div className="letter-share-dialog__options">
                <button type="button" onClick={handleCopyLetterLink}>
                  <span className="letter-share-dialog__option-icon">
                    <IoCopyOutline />
                  </span>
                  <span>
                    <strong>Copy link</strong>
                    <small>Paste it anywhere</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={showQrCode ? "is-selected" : ""}
                  onClick={() => setShowQrCode(true)}
                >
                  <span className="letter-share-dialog__option-icon">
                    <IoQrCodeOutline />
                  </span>
                  <span>
                    <strong>Share as QR</strong>
                    <small>Let someone scan it</small>
                  </span>
                </button>
              </div>

              {showQrCode && (
                <div className="letter-share-dialog__qr">
                  <img
                    src={letterQrUrl}
                    alt="QR code for this letter"
                    width="240"
                    height="240"
                    referrerPolicy="no-referrer"
                  />
                  <span>Scan to open this letter</span>
                  <button
                    type="button"
                    className="letter-share-dialog__download"
                    onClick={handleDownloadQr}
                    disabled={isDownloadingQr}
                  >
                    <IoDownloadOutline />
                    <span>
                      {isDownloadingQr ? "Downloading…" : "Download QR"}
                    </span>
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {showPhotoViewer && selectedLetter.photo?.url && (
          <div
            className="letter-photo-viewer"
            role="dialog"
            aria-modal="true"
            aria-label="Full-screen letter attachment"
            onClick={(event) => {
              event.stopPropagation();
              setShowPhotoViewer(false);
            }}
          >
            <button
              type="button"
              className="letter-photo-viewer__close"
              onClick={() => setShowPhotoViewer(false)}
              aria-label="Close full-screen photo"
            >
              <BsX />
            </button>
            <img
              src={getOptimizedPhotoUrl(selectedLetter.photo.url, 1800)}
              alt={`Attached to the letter from ${selectedLetter.from} to ${selectedLetter.to}`}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}
      </div>
    )
  );
}

export default DetailsModal;
