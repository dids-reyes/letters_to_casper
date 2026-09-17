import {AiOutlinePushpin} from "react-icons/ai";
import React from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
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
import { TbHeart, TbMoodSad } from "react-icons/tb";
import {
  IoCopyOutline,
  IoDownloadOutline,
  IoExpandOutline,
  IoEyeOutline,
  IoHeartOutline,
  IoLanguageOutline,
  IoLocationOutline,
  IoQrCodeOutline,
  IoShareSocialOutline,
} from "react-icons/io5";
import AdsterraBanner from "./AdsterraBanner";
import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { render_url, api_key } from "../data/keys";
import { adminId, targetDate } from "../data/target_letters";
import stringSplitter from "../data/splitLetterCharacters";
import { toast } from "react-toastify";
import { getOptimizedPhotoUrl } from "../data/cloudinary";
// Translation remains disabled until explicitly re-enabled.
const TRANSLATION_ENABLED = false;

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

const shortLetterAge = timestamp => {
  const time = new Date(timestamp).getTime();
  if (!Number.isFinite(time)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  const units = [[31536000, "y"], [2592000, "mo."], [604800, "w"], [86400, "d"], [3600, "h"], [60, "min."]];
  const unit = units.find(([duration]) => seconds >= duration);
  if (!unit) return "just now";
  const count = Math.floor(seconds / unit[0]);
  const label = unit[1] === "mo." && count > 1 ? "mos." : unit[1];
  const space = ["min.", "mo."].includes(unit[1]) ? " " : "";
  return `${count}${space}${label} ago`;
};

export const formatPinTimeRemaining = (expiresAt) => {
  if (!expiresAt) return "Pinned";
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return "Pinned · Expired";
  }

  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const totalHours = Math.floor(diffMs / (60 * 60 * 1000));
  const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (totalDays >= 30) {
    const months = Math.floor(totalDays / 30);
    const remainingDays = totalDays % 30;
    const monthStr = `${months} month${months === 1 ? "" : "s"}`;
    if (remainingDays > 0) {
      return `Pinned · ${monthStr}, ${remainingDays} day${remainingDays === 1 ? "" : "s"} left`;
    }
    return `Pinned · ${monthStr} left`;
  }

  if (totalDays >= 1) {
    const remainingHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const dayStr = `${totalDays} day${totalDays === 1 ? "" : "s"}`;
    if (remainingHours > 0) {
      return `Pinned · ${dayStr}, ${remainingHours} hour${remainingHours === 1 ? "" : "s"} left`;
    }
    return `Pinned · ${dayStr} left`;
  }

  if (totalHours >= 1) {
    const remainingMinutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
    const hourStr = `${totalHours} hour${totalHours === 1 ? "" : "s"}`;
    if (remainingMinutes > 0) {
      return `Pinned · ${hourStr}, ${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"} left`;
    }
    return `Pinned · ${hourStr} left`;
  }

  if (totalMinutes >= 1) {
    return `Pinned · ${totalMinutes} min${totalMinutes === 1 ? "" : "s"} left`;
  }

  return "Pinned · Less than a minute left";
};

const echoOptions = [
  {id: "love", label: "Love", icon: TbHeart},
  {id: "sad", label: "Sad", icon: TbMoodSad},
];

const normalizeEchoes = echoes => echoOptions.reduce((totals, option) => ({
  ...totals,
  [option.id]: Math.max(0, Number(echoes?.[option.id]) || 0),
}), {});

const getLetterId = (letter) => {
  if (!letter) return "";
  if (typeof letter._id === "string") return letter._id;
  if (letter._id?.$oid) return letter._id.$oid;
  return String(letter._id || "");
};

export const viewedLetterIds = new Set();
export let unbilledNewLettersCount = 0;

export const resetSessionViewedLetters = () => {
  viewedLetterIds.clear();
  unbilledNewLettersCount = 0;
};

export const getLetterKey = (letter, index) => {
  const id = getLetterId(letter);
  if (id) return id;
  if (typeof index === "number" && index >= 0) return `letter-idx-${index}`;
  return null;
};

export const extractMediaLinks = (rawMessage) => {
  if (!rawMessage || typeof rawMessage !== "string") {
    return {
      spotifyLink: null,
      youtubeLink: null,
      newMessage: rawMessage || "",
    };
  }

  const spotifyLinkRegex =
    /https?:\/\/open\.spotify\.com\/(?:(?:[a-zA-Z-]+)\/)?(?:embed\/)?(?:track\/)?([A-Za-z0-9]{22})(?:\?[^\s\n\r"']*)?|https?:\/\/open\.spotify\.com\/(?:[a-zA-Z-]+\/)?(?:embed\/)?track\/([A-Za-z0-9]+)(?:\?[^\s\n\r"']*)?/i;

  const youtubeLinkRegex =
    /https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^\s\n\r"']*[?&])?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})(?:\S*)?/i;

  const spotifyMatch = rawMessage.match(spotifyLinkRegex);
  const youtubeMatch = rawMessage.match(youtubeLinkRegex);

  let spotifyId = null;
  let youtubeId = null;

  if (spotifyMatch) {
    spotifyId = (spotifyMatch[1] || spotifyMatch[2] || "").trim();
  }
  if (youtubeMatch) {
    youtubeId = (youtubeMatch[1] || "").trim();
  }

  // Mutual exclusivity: if only spotify is added, only spotify is shown.
  // If only youtube is added, only youtube is shown.
  // If both exist, prioritize whichever appears first.
  if (spotifyId && youtubeId) {
    if (rawMessage.indexOf(spotifyMatch[0]) < rawMessage.indexOf(youtubeMatch[0])) {
      youtubeId = null;
    } else {
      spotifyId = null;
    }
  }

  let cleanedMessage = rawMessage;
  if (spotifyId && spotifyMatch) {
    cleanedMessage = cleanedMessage.replace(spotifyMatch[0], "").trimEnd();
  } else if (youtubeId && youtubeMatch) {
    cleanedMessage = cleanedMessage.replace(youtubeMatch[0], "").trimEnd();
  }

  return {
    spotifyLink: spotifyId ? { id: spotifyId, newMessage: cleanedMessage } : null,
    youtubeLink: youtubeId ? { id: youtubeId, newMessage: cleanedMessage } : null,
    newMessage: cleanedMessage,
  };
};

function DetailsModal({
  showDetailsModal,
  toggleDetailsModal,
  selectedLetter,
  readMode = false,
  letters = [],
  setSelectedLetter = () => {},
  onFetchMore = () => {},
  initialOpened = false,
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
    letterId = getLetterId(selectedLetter);
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
  const [echoes, setEchoes] = useState(() => normalizeEchoes());
  const [selectedEcho, setSelectedEcho] = useState("");
  const [pendingEcho, setPendingEcho] = useState("");
  const [showEchoPicker, setShowEchoPicker] = useState(false);
  const [showEchoBreakdown, setShowEchoBreakdown] = useState(false);
  const [savingEcho, setSavingEcho] = useState(false);
  const [opened, setOpened] = useState(() => Boolean(initialOpened));
  const [isClosing, setIsClosing] = useState(false);
  const closingRef = useRef(false);
  const closeCompletedRef = useRef(false);

  useLayoutEffect(() => {
    closingRef.current = false;
    closeCompletedRef.current = false;
    setIsClosing(false);
  }, [showDetailsModal, selectedLetter?._id]);

  useEffect(() => {
    setDisplayedReads(parseInt(selectedLetter?.reads, 10) || 0);
  }, [selectedLetter?._id, selectedLetter?.reads]);

  useEffect(() => {
    setEchoes(normalizeEchoes(selectedLetter?.echoes));
    setShowEchoPicker(false);
    setShowEchoBreakdown(false);
    setPendingEcho("");
    try {
      const saved = JSON.parse(localStorage.getItem("letterEchoes") || "{}");
      setSelectedEcho(saved[selectedLetter?._id] || "");
    } catch (error) {
      localStorage.removeItem("letterEchoes");
      setSelectedEcho("");
    }
  }, [selectedLetter?._id, selectedLetter?.echoes]);

  const getReadLetters = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("readLettersByDeviceV2") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      localStorage.removeItem("readLettersByDeviceV2");
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
        localStorage.removeItem("readLettersByDeviceV2");
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
        localStorage.setItem("readLettersByDeviceV2", JSON.stringify(readLetters));
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

  const echoTotal = Object.values(echoes).reduce((total, count) => total + count, 0);
  const DominantReactionIcon = echoes.sad > echoes.love ? TbMoodSad : IoHeartOutline;

  const saveEcho = async (reaction, remove = false) => {
    if (!selectedLetter?._id || selectedLetter.preview || savingEcho) return;
    setSavingEcho(true);
    try {
      const response = await fetch(`${render_url}/${selectedLetter._id}/echo`, {
        method: "POST",
        headers: {
          "x-api-key": api_key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({reaction, remove, readerId: getReaderId()}),
      });
      if (!response.ok) throw new Error("Failed to leave an echo");
      const result = await response.json();
      setEchoes(normalizeEchoes(result.echoes));
      setSelectedEcho(result.selected ?? reaction);
      const saved = JSON.parse(localStorage.getItem("letterEchoes") || "{}");
      if (result.selected === "") delete saved[selectedLetter._id];
      else saved[selectedLetter._id] = result.selected ?? reaction;
      localStorage.setItem("letterEchoes", JSON.stringify(saved));
      setShowEchoPicker(false);
      toast.info(result.selected === "" ? "Your reaction was removed." : "Your reaction was added.", {
        position: "top-center",
        autoClose: 1800,
      });
    } catch (error) {
      toast.error("Your reaction couldn’t be saved right now.", {
        position: "top-center",
        autoClose: 2400,
      });
    } finally {
      setSavingEcho(false);
    }
  };

  const toggleEchoPicker = () => {
    setShowEchoBreakdown(false);
    setShowEchoPicker(current => !current);
  };

  const requestEcho = reaction => {
    if (savingEcho) return;
    if (selectedEcho) {
      setShowEchoPicker(false);
      setPendingEcho(reaction);
      return;
    }
    saveEcho(reaction);
  };

  const confirmEchoSwitch = async () => {
    const reaction = pendingEcho;
    if (!reaction) return;
    await saveEcho(reaction, reaction === selectedEcho);
    setPendingEcho("");
  };

  useEffect(() => {
    if (showDetailsModal && opened && selectedLetter?._id && !closingRef.current) {
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

  const media = useMemo(() => {
    return extractMediaLinks(selectedLetter?.message);
  }, [selectedLetter?.message]);

  const spotifyTrackId = media?.spotifyLink?.id || null;
  const youtubeVideoId = media?.youtubeLink?.id || null;
  const message = media?.newMessage || selectedLetter?.message || "";

  const [showAttachments, setShowAttachments] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [translatedMessage, setTranslatedMessage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const hasLetterAttachment = Boolean(
    spotifyTrackId || youtubeVideoId || selectedLetter?.photo?.url
  );
  const messageBodyRef = useRef(null);
  useEffect(() => {
    const body = messageBodyRef.current;
    if (!body || !showDetailsModal || !opened) return undefined;
    const mobile =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia('(max-width: 600px)')
        : { matches: false };
    let followTyping = true;
    body.scrollTop = 0;
    const onScroll = () => {
      followTyping = body.scrollHeight - body.clientHeight - body.scrollTop <= 32;
    };
    const observer = new MutationObserver(() => {
      if (mobile.matches && followTyping && !showTranslation) {
        body.scrollTop = body.scrollHeight;
      }
    });
    body.addEventListener('scroll', onScroll, {passive: true});
    observer.observe(body, {childList: true, characterData: true, subtree: true});
    return () => {
      observer.disconnect();
      body.removeEventListener('scroll', onScroll);
    };
  }, [showDetailsModal, opened, selectedLetter?._id, showTranslation, hasLetterAttachment]);

  const [detectedLanguage, setDetectedLanguage] = useState(null);

  useEffect(() => {
    let isCurrentLetter = true;
    setTranslatedMessage("");
    setIsTranslating(false);
    setShowTranslation(false);
    setDetectedLanguage(null);

    if (TRANSLATION_ENABLED && message) {
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
    if (!TRANSLATION_ENABLED || !detectedLanguage || isTranslating) return;

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

  // Envelope-opening intro animation
  useEffect(() => {
    if (!showDetailsModal || !selectedLetter) {
      setOpened(false);
      return;
    }
    if (initialOpened) {
      setOpened(true);
      return;
    }
    if (isTransitioningRef.current) {
      setOpened(true);
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
  }, [showDetailsModal, selectedLetter, readMode, initialOpened]);

  // Attachment reveal state synchronization
  useEffect(() => {
    if (!showDetailsModal || !selectedLetter) {
      setShowAttachments(false);
      return;
    }
    if (readMode) {
      setShowAttachments(true);
    } else {
      setShowAttachments(false);
    }
  }, [showDetailsModal, selectedLetter, readMode]);

  const navigate = useNavigate();
  const approvedLetters = useMemo(() => (Array.isArray(letters) ? letters : []), [letters]);
  const letterList = useMemo(() => {
    if (!selectedLetter) return approvedLetters;
    const targetId = getLetterId(selectedLetter);
    const exists = approvedLetters.some((l) => getLetterId(l) === targetId);
    if (!exists) {
      return [selectedLetter, ...approvedLetters];
    }
    return approvedLetters;
  }, [approvedLetters, selectedLetter]);

  const targetId = getLetterId(selectedLetter);
  const currentIndex = letterList.findIndex((l) => getLetterId(l) === targetId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < letterList.length - 1;

  const [navDirection, setNavDirection] = useState("next");

  const nextCandidate = canGoNext ? letterList[currentIndex + 1] : null;
  const prevCandidate = canGoPrev ? letterList[currentIndex - 1] : null;

  const nextKey = nextCandidate ? getLetterKey(nextCandidate, currentIndex + 1) : null;
  const prevKey = prevCandidate ? getLetterKey(prevCandidate, currentIndex - 1) : null;

  const isNextUnread = Boolean(nextCandidate && nextKey && !viewedLetterIds.has(nextKey));
  const isPrevUnread = Boolean(prevCandidate && prevKey && !viewedLetterIds.has(prevKey));

  let prerenderLetter = null;
  if (readMode) {
    if (navDirection === "prev") {
      if (isPrevUnread) {
        prerenderLetter = prevCandidate;
      } else if (isNextUnread) {
        prerenderLetter = nextCandidate;
      }
    } else {
      if (isNextUnread) {
        prerenderLetter = nextCandidate;
      } else if (isPrevUnread) {
        prerenderLetter = prevCandidate;
      }
    }
  }

  const AD_INTERVAL = 10;
  const [outgoingLetter, setOutgoingLetter] = useState(null);
  const [slideDirection, setSlideDirection] = useState(null);
  const isTransitioningRef = useRef(false);
  const lastWheelNavTime = useRef(0);
  const goToNextRef = useRef(null);
  const goToPrevRef = useRef(null);

  const [showAdLock, setShowAdLock] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [pendingNavDirection, setPendingNavDirection] = useState(null);
  useEffect(() => {
    if (!showDetailsModal || !selectedLetter) return;
    const letterKey = getLetterKey(selectedLetter, currentIndex);
    if (!letterKey) return;

    if (!viewedLetterIds.has(letterKey)) {
      viewedLetterIds.add(letterKey);
      unbilledNewLettersCount += 1;
    }
  }, [showDetailsModal, selectedLetter, currentIndex]);

  const [showReadTip, setShowReadTip] = useState(() => {
    try {
      return localStorage.getItem("hasSeenReadModeTip") !== "true";
    } catch (e) {
      return true;
    }
  });

  const dismissReadTip = useCallback(() => {
    setShowReadTip(false);
    try {
      localStorage.setItem("hasSeenReadModeTip", "true");
    } catch (e) {
      /* storage unavailable */
    }
  }, []);

  const [showFoldTip, setShowFoldTip] = useState(false);
  const [isFoldTipFading, setIsFoldTipFading] = useState(false);
  const foldTipTimerRef = useRef(null);
  const foldTipFadeTimerRef = useRef(null);

  const isTouchDevice = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches
    );
  }, []);

  const dismissFoldTip = useCallback(() => {
    if (foldTipTimerRef.current) clearTimeout(foldTipTimerRef.current);
    if (foldTipFadeTimerRef.current) clearTimeout(foldTipFadeTimerRef.current);
    setShowFoldTip(false);
    setIsFoldTipFading(false);
  }, []);

  const triggerFoldTip = useCallback(() => {
    if (closingRef.current) return;
    setShowFoldTip(true);
    setIsFoldTipFading(false);

    if (foldTipTimerRef.current) clearTimeout(foldTipTimerRef.current);
    if (foldTipFadeTimerRef.current) clearTimeout(foldTipFadeTimerRef.current);

    foldTipTimerRef.current = setTimeout(() => {
      setIsFoldTipFading(true);
      foldTipFadeTimerRef.current = setTimeout(() => {
        setShowFoldTip(false);
        setIsFoldTipFading(false);
      }, 400);
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (foldTipTimerRef.current) clearTimeout(foldTipTimerRef.current);
      if (foldTipFadeTimerRef.current) clearTimeout(foldTipFadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    dismissFoldTip();
  }, [selectedLetter?._id, dismissFoldTip]);

  useEffect(() => {
    if (!showDetailsModal || !readMode) return undefined;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouchAction;
    };
  }, [showDetailsModal, readMode]);

  // Adapt mobile status bar / notification area theme-color to the dim overlay
  useEffect(() => {
    if (!showDetailsModal) return undefined;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    const previousThemeColor = metaThemeColor.getAttribute("content") || "#ffffff";
    const isNightShift = document.documentElement.classList.contains("night-shift");
    const dimThemeColor = readMode
      ? (isNightShift ? "#08090a" : "#4e4c4a")
      : (isNightShift ? "#060607" : "#82807f");

    metaThemeColor.setAttribute("content", dimThemeColor);

    return () => {
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", previousThemeColor);
      }
    };
  }, [showDetailsModal, readMode]);

  useEffect(() => {
    if (!showAdLock) {
      setAdCountdown(5);
      return undefined;
    }

    setAdCountdown(5);
    let remaining = 5;
    let timerId = null;

    const isUserActive = () => {
      if (
        typeof document !== "undefined" &&
        (document.hidden || document.visibilityState === "hidden")
      ) {
        return false;
      }
      return true;
    };

    const stopTimer = () => {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    const startTimer = () => {
      if (timerId !== null || remaining <= 0) return;
      if (!isUserActive()) return;

      timerId = window.setInterval(() => {
        if (!isUserActive()) {
          stopTimer();
          return;
        }

        remaining -= 1;
        if (remaining <= 0) {
          stopTimer();
          setAdCountdown(0);
        } else {
          setAdCountdown(remaining);
        }
      }, 1000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startTimer();
      } else {
        stopTimer();
      }
    };

    startTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", startTimer);
    window.addEventListener("blur", stopTimer);

    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", startTimer);
      window.removeEventListener("blur", stopTimer);
    };
  }, [showAdLock]);

  const goToNext = useCallback((fromAdLock = false) => {
    setNavDirection("next");
    if (closingRef.current || (showAdLock && !fromAdLock) || isTransitioningRef.current || !canGoNext) return;

    if (showReadTip) {
      dismissReadTip();
    }

    const nextIndex = currentIndex + 1;
    const nextLetter = letterList[nextIndex];
    if (!nextLetter) return;

    const nextLetterKey = getLetterKey(nextLetter, nextIndex);
    const isUnseen = nextLetterKey && !viewedLetterIds.has(nextLetterKey);

    if (isUnseen) {
      if (unbilledNewLettersCount >= AD_INTERVAL) {
        unbilledNewLettersCount = 0;
        setPendingNavDirection("next");
        setShowAdLock(true);
        return;
      }
      viewedLetterIds.add(nextLetterKey);
      unbilledNewLettersCount += 1;
    }

    isTransitioningRef.current = true;
    setOutgoingLetter(selectedLetter);
    setSlideDirection("next");

    setSelectedLetter(nextLetter);
    navigate(`/letters/${getLetterId(nextLetter)}`, { replace: true });

    setShowTranslation(false);
    setTranslatedMessage("");
    setIsRevealed(false);
    setHasClickedAd(false);

    if (currentIndex + 1 >= letterList.length - 4 && onFetchMore) {
      onFetchMore();
    }

    setTimeout(() => {
      setOutgoingLetter(null);
      setSlideDirection(null);
      isTransitioningRef.current = false;
    }, 520);
  }, [showAdLock, showReadTip, dismissReadTip, canGoNext, currentIndex, letterList, selectedLetter, setSelectedLetter, navigate, onFetchMore]);

  const goToPrev = useCallback((fromAdLock = false) => {
    setNavDirection("prev");
    if (closingRef.current || (showAdLock && !fromAdLock) || isTransitioningRef.current || !canGoPrev) return;

    if (showReadTip) {
      dismissReadTip();
    }

    const prevIndex = currentIndex - 1;
    const prevLetter = letterList[prevIndex];
    if (!prevLetter) return;

    const prevLetterKey = getLetterKey(prevLetter, prevIndex);
    const isUnseen = prevLetterKey && !viewedLetterIds.has(prevLetterKey);

    if (isUnseen) {
      if (unbilledNewLettersCount >= AD_INTERVAL) {
        unbilledNewLettersCount = 0;
        setPendingNavDirection("prev");
        setShowAdLock(true);
        return;
      }
      viewedLetterIds.add(prevLetterKey);
      unbilledNewLettersCount += 1;
    }

    isTransitioningRef.current = true;
    setOutgoingLetter(selectedLetter);
    setSlideDirection("prev");

    setSelectedLetter(prevLetter);
    navigate(`/letters/${getLetterId(prevLetter)}`, { replace: true });

    setShowTranslation(false);
    setTranslatedMessage("");
    setIsRevealed(false);
    setHasClickedAd(false);

    setTimeout(() => {
      setOutgoingLetter(null);
      setSlideDirection(null);
      isTransitioningRef.current = false;
    }, 520);
  }, [showAdLock, showReadTip, dismissReadTip, canGoPrev, currentIndex, letterList, selectedLetter, setSelectedLetter, navigate]);

  goToNextRef.current = goToNext;
  goToPrevRef.current = goToPrev;

  const handleContinueReading = useCallback(() => {
    setShowAdLock(false);
    if (pendingNavDirection === "next") {
      setPendingNavDirection(null);
      goToNext(true);
    } else if (pendingNavDirection === "prev") {
      setPendingNavDirection(null);
      goToPrev(true);
    }
  }, [pendingNavDirection, goToNext, goToPrev]);

  const touchStartY = useRef(null);
  const touchStartX = useRef(null);
  const touchInsideScrollable = useRef(false);

  const handleTouchStart = (e) => {
    if (!readMode || showAdLock) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchInsideScrollable.current = Boolean(e.target.closest(".letter-paper__body--scrollable"));
  };

  const handleTouchMove = (e) => {
    if (!readMode) return;
    if (showAdLock) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (touchStartY.current !== null && e.touches && e.touches[0]) {
      const diffY = e.touches[0].clientY - touchStartY.current;
      if (diffY < -15) {
        setNavDirection("next");
      } else if (diffY > 15) {
        setNavDirection("prev");
      }
    }
    if (!touchInsideScrollable.current) {
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!readMode || showAdLock || touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartY.current = null;

    if (Math.abs(deltaY) < 15 && Math.abs(deltaX) < 15) {
      if (
        !e.target.closest(".letter-modal") &&
        !e.target.closest(".read-mode-tip") &&
        !e.target.closest(".read-mode-ad-lock-overlay")
      ) {
        triggerFoldTip();
        return;
      }
    }

    if (Math.abs(deltaY) < 45 || Math.abs(deltaY) < Math.abs(deltaX) * 1.2) {
      return;
    }

    if (touchInsideScrollable.current && messageBodyRef.current) {
      const scrollEl = messageBodyRef.current;
      const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 5;
      const atTop = scrollEl.scrollTop <= 5;
      if (deltaY < 0 && !atBottom) return;
      if (deltaY > 0 && !atTop) return;
    }

    if (deltaY < -45) {
      goToNext();
    } else if (deltaY > 45) {
      goToPrev();
    }
  };

  useEffect(() => {
    if (!showDetailsModal || !readMode) return undefined;

    const onWheel = (e) => {
      if (e.cancelable) e.preventDefault();
      if (showAdLock) return;

      if (e.deltaY > 0) {
        setNavDirection("next");
      } else if (e.deltaY < 0) {
        setNavDirection("prev");
      }

      const targetEl =
        e.target && typeof e.target.closest === "function" ? e.target : null;
      const scrollable = targetEl
        ? targetEl.closest(".letter-paper__body--scrollable, .letter-paper")
        : null;
      if (scrollable && scrollable.scrollHeight > scrollable.clientHeight + 4) {
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >=
          scrollable.scrollHeight - 6;
        const atTop = scrollable.scrollTop <= 6;

        if (e.deltaY > 0 && !atBottom) {
          scrollable.scrollTop += e.deltaY;
          return;
        }
        if (e.deltaY < 0 && !atTop) {
          scrollable.scrollTop += e.deltaY;
          return;
        }
      }

      if (Math.abs(e.deltaY) < 30) return;

      const now = Date.now();
      if (isTransitioningRef.current || now - lastWheelNavTime.current < 550) return;

      if (e.deltaY > 0) {
        lastWheelNavTime.current = now;
        if (goToNextRef.current) goToNextRef.current();
      } else if (e.deltaY < 0) {
        lastWheelNavTime.current = now;
        if (goToPrevRef.current) goToPrevRef.current();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [showDetailsModal, readMode, showAdLock]);


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
  const location = useLocation();
  const handledEmailShare = useRef('');
  useEffect(() => {
    const id = selectedLetter?._id;
    if (!showDetailsModal || !id || selectedLetter.preview) return;
    if (new URLSearchParams(location.search).get('share') !== '1') return;
    if (handledEmailShare.current === id) return;
    handledEmailShare.current = id;
    setOpened(true);
    setShowShareDialog(true);
  }, [showDetailsModal, selectedLetter?._id, selectedLetter?.preview, location.search]);

  const [showQrCode, setShowQrCode] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const letterPaperRef = useRef(null);
  const handleDownloadImage = async (includeAttachments = false) => {
    if (isDownloadingImage || !letterPaperRef.current) return;
    setIsDownloadingImage(true);
    try {
      const {default: downloadLetterImage} = await import('../utils/downloadLetterImage');
      await downloadLetterImage(letterPaperRef.current, {
        id: selectedLetter._id, from: selectedLetter.from, to: selectedLetter.to,
        message: showTranslation ? translatedMessage : message,
        date: formatTimestamp(selectedLetter.timestamp),
        includeAttachments,
        photoUrl: selectedLetter.photo?.url ? getOptimizedPhotoUrl(selectedLetter.photo.url) : null,
        media: spotifyTrackId ? {
          provider: 'Spotify',
          url: `https://open.spotify.com/track/${spotifyTrackId}`,
        } : (youtubeVideoId ? {
          provider: 'YouTube',
          url: `https://youtu.be/${youtubeVideoId}`,
          thumbnail: `https://i.ytimg.com/vi/${encodeURIComponent(youtubeVideoId)}/hqdefault.jpg`,
        } : null),
      });
    } catch {
      toast.error("Image preparation failed or timed out. Please try again, or choose Letter only if the attachment won’t load.", {position: "top-center"});
    } finally {
      setIsDownloadingImage(false);
    }
  };

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

      fetch(`${render_url}/${selectedLetter._id}/copy-link`, {
        method: "POST",
        headers: {"x-api-key": api_key},
      }).catch(error => console.error("Error recording link copy:", error));
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
    if (closingRef.current) return;
    dismissFoldTip();
    closingRef.current = true;
    setIsClosing(true);
  };

  const handleOverlayClick = () => {
    if (!readMode) {
      handleCloseModal();
      return;
    }
    if (opened) {
      triggerFoldTip();
    }
  };

  const finishCloseModal = () => {
    if (!closingRef.current || closeCompletedRef.current) return;
    dismissFoldTip();
    closeCompletedRef.current = true;
    toggleDetailsModal();
    setShowAttachments(false);
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
    setOutgoingLetter(null);
    setSlideDirection(null);
    isTransitioningRef.current = false;
    setShowAdLock(false);
    setAdCountdown(5);
    setPendingNavDirection(null);
  };

  // A bounded fallback also cleans up if the browser cancels the animation.
  useEffect(() => {
    if (!isClosing) return undefined;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(finishCloseModal, reduced ? 120 : 1380);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClosing]);

  const closeShareDialog = () => {
    setShowShareDialog(false);
    setShowQrCode(false);
    setIsDownloadingQr(false);
  };

  useEffect(() => {
    if (!showDetailsModal) return;
    const onKeyDown = (event) => {
      if (closingRef.current) return;
      if (event.key === "Escape") {
        if (showPhotoViewer) {
          setShowPhotoViewer(false);
          return;
        }
        if (showShareDialog) {
          closeShareDialog();
          return;
        }
        if (showAdLock) {
          return;
        }
        handleCloseModal();
        return;
      }
      if (readMode && !showPhotoViewer && !showShareDialog) {
        if (showAdLock) return;
        if (event.key === "ArrowDown" || event.key === "PageDown") {
          event.preventDefault();
          goToNext();
        } else if (event.key === "ArrowUp" || event.key === "PageUp") {
          event.preventDefault();
          goToPrev();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetailsModal, showPhotoViewer, showShareDialog, readMode, showAdLock, goToNext, goToPrev]);

  const formatReadsCount = (readsCount) => {
    const parsed = parseInt(readsCount) || 0;
    return parsed === 1 ? "1 read" : `${tc(parsed, 2)} reads`;
  };

  const hasBadge =
    early_bird ||
    letterId === adminId ||
    eleven_eleven ||
    twelve_fifty_one;

  const renderOutgoingPaper = (letter) => {
    if (!letter) return null;
    const lDate = new Date(letter.timestamp);
    const lTime = new Date(letter.timestamp);
    const lId = letter._id;
    const isEarly = lDate < targetDate && lId !== adminId;
    let isEleven = false;
    let isTwelve = false;
    if (lTime != null) {
      const hours = lTime.getHours();
      const minutes = lTime.getMinutes();
      if (hours === 23 && minutes === 11) isEleven = true;
      else if (hours === 0 && minutes === 51) isTwelve = true;
    }
    const lHasBadge = isEarly || lId === adminId || isEleven || isTwelve;
    const lMedia = extractMediaLinks(letter.message || "");
    const lSpotifyTrackId = lMedia.spotifyLink?.id || null;
    const lYoutubeVideoId = lMedia.youtubeLink?.id || null;
    const lMessage = lMedia.newMessage || letter.message;
    const lHasAttachment = Boolean(lSpotifyTrackId || lYoutubeVideoId || letter.photo?.url);
    const lCity = letter.loc?.city || "";
    const lHasLoc = Boolean(lCity) && lCity !== "Unknown";
    const lReads = parseInt(letter.reads, 10) || 0;
    const lEchoes = normalizeEchoes(letter.echoes);
    const lEchoTotal = Object.values(lEchoes).reduce((a, b) => a + b, 0);
    const LDominantIcon = lEchoes.sad > lEchoes.love ? TbMoodSad : IoHeartOutline;

    return (
      <div className="letter-paper" aria-hidden="true">
        <div className="letter-paper__head">
          <div className="letter-info" style={{ marginBottom: "4px" }}>
            <span><strong>From:</strong> {letter.from}</span>
          </div>
          <div className="letter-info">
            <span><strong>To:</strong> {letter.to}</span>
          </div>
        </div>

        <div className="letter-paper__date">
          <BsMailboxFlag className="letter-paper__date-icon" size="15px" />
          <span className="timestamp-text">
            <span>{formatTimestamp(letter.timestamp)}</span>
          </span>
        </div>

        <div className={`letter-paper__body letter-text${lHasAttachment ? " letter-paper__body--scrollable" : ""}`}>
          <span>{lMessage}</span>
        </div>

        {lSpotifyTrackId && (
          <div className="letter-paper__media">
            <iframe
              title="spotify-preview-outgoing"
              style={{ border: "12px" }}
              src={`https://open.spotify.com/embed/track/${lSpotifyTrackId}?utm_source=generator&theme=1`}
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            ></iframe>
          </div>
        )}
        {!lSpotifyTrackId && lYoutubeVideoId && (
          <div className="letter-paper__media letter-paper__media--youtube">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${lYoutubeVideoId}?autoplay=0&mute=1&playsinline=1&controls=0&rel=0`}
              title="YouTube video player outgoing"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
        )}
        {letter.photo?.url && (
          <figure className="letter-paper__photo">
            <img
              src={getOptimizedPhotoUrl(letter.photo.url)}
              alt=""
              loading="lazy"
            />
          </figure>
        )}

        <div className="letter-paper__meta">
          {lHasBadge && (
            <>
              <span className="letter-paper__badges">
                {isEarly && (
                  <>
                    <FaEarlybirds size="15px" />
                    <BsBookmarkHeartFill size="15px" />
                  </>
                )}
                {lId === adminId && <FaUserTie size="15px" />}
                {isEleven && <PiShootingStarFill size="15px" />}
                {isTwelve && <PiHeartBreakFill size="15px" />}
              </span>
              <span className="letter-meta-sep">·</span>
            </>
          )}
          {letter.is_pinned && new Date(letter.pin_expires_at).getTime() > Date.now() && (
            <>
              <span className="letter-paper__pin" role="img" aria-label="Pinned letter">
                <AiOutlinePushpin aria-hidden="true" />
              </span>
              <span className="letter-meta-sep">·</span>
            </>
          )}
          <span className="letter-paper__age">
            {shortLetterAge(letter.timestamp)}
          </span>
          <span className="letter-meta-sep">·</span>
          <span className="letter-paper__reads">
            <IoEyeOutline className="letter-paper__reads-eye" />
            {formatReadsCount(lReads)}
          </span>

          {(lHasLoc || (!letter.preview && letter._id)) && (
            <>
              <span className="letter-meta-sep">·</span>
              <span className="letter-paper__actions">
                {lHasLoc && (
                  <span className="letter-paper__locate">
                    <IoLocationOutline size="12px" />
                    <span>Locate</span>
                  </span>
                )}
                {lHasLoc && !letter.preview && letter._id && (
                  <span className="letter-meta-sep">·</span>
                )}
                {!letter.preview && letter._id && (
                  <span className="letter-paper__share">
                    <IoShareSocialOutline size="12px" />
                    <span>Share</span>
                  </span>
                )}
                {!letter.preview && letter._id && (
                  <>
                    <span className="letter-meta-sep">·</span>
                    <span className="letter-reaction-cluster">
                      {lEchoTotal > 0 && (
                        <span className="letter-echo-summary">
                          <span>{lEchoTotal}</span>
                        </span>
                      )}
                      <span className="letter-echo-control">
                        <span className="letter-paper__echo">
                          <LDominantIcon />
                        </span>
                      </span>
                    </span>
                  </>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderPrerenderPaper = (letter) => {
    if (!letter) return null;
    const lDate = new Date(letter.timestamp);
    const lTime = new Date(letter.timestamp);
    const lId = letter._id;
    const isEarly = lDate < targetDate && lId !== adminId;
    let isEleven = false;
    let isTwelve = false;
    if (lTime != null) {
      const hours = lTime.getHours();
      const minutes = lTime.getMinutes();
      if (hours === 23 && minutes === 11) isEleven = true;
      else if (hours === 0 && minutes === 51) isTwelve = true;
    }
    const lHasBadge = isEarly || lId === adminId || isEleven || isTwelve;
    const lMedia = extractMediaLinks(letter.message || "");
    const lSpotifyTrackId = lMedia.spotifyLink?.id || null;
    const lYoutubeVideoId = lMedia.youtubeLink?.id || null;
    const lMessage = lMedia.newMessage || letter.message;
    const lHasAttachment = Boolean(lSpotifyTrackId || lYoutubeVideoId || letter.photo?.url);
    const lCity = letter.loc?.city || "";
    const lHasLoc = Boolean(lCity) && lCity !== "Unknown";
    const lReads = parseInt(letter.reads, 10) || 0;
    const lEchoes = normalizeEchoes(letter.echoes);
    const lEchoTotal = Object.values(lEchoes).reduce((a, b) => a + b, 0);
    const LDominantIcon = lEchoes.sad > lEchoes.love ? TbMoodSad : IoHeartOutline;

    return (
      <div className="letter-paper letter-paper--prerender" aria-hidden="true" tabIndex={-1}>
        <div className="letter-paper__head">
          <div className="letter-info" style={{ marginBottom: "4px" }}>
            <span><strong>From:</strong> {letter.from}</span>
          </div>
          <div className="letter-info">
            <span><strong>To:</strong> {letter.to}</span>
          </div>
        </div>

        <div className="letter-paper__date">
          <BsMailboxFlag className="letter-paper__date-icon" size="15px" />
          <span className="timestamp-text">
            <span>{formatTimestamp(letter.timestamp)}</span>
          </span>
        </div>

        <div className={`letter-paper__body letter-text${lHasAttachment ? " letter-paper__body--scrollable" : ""}`}>
          <span>{lMessage}</span>
        </div>

        {lSpotifyTrackId && (
          <div className="letter-paper__media">
            <iframe
              title="spotify-preview-prerender"
              tabIndex={-1}
              style={{ border: "12px" }}
              src={`https://open.spotify.com/embed/track/${lSpotifyTrackId}?utm_source=generator&theme=1`}
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
            ></iframe>
          </div>
        )}
        {!lSpotifyTrackId && lYoutubeVideoId && (
          <div className="letter-paper__media letter-paper__media--youtube">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${lYoutubeVideoId}?autoplay=0&mute=1&playsinline=1&controls=0&rel=0`}
              title="YouTube video player prerender"
              tabIndex={-1}
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="eager"
            ></iframe>
          </div>
        )}
        {letter.photo?.url && (
          <figure className="letter-paper__photo">
            <img
              src={getOptimizedPhotoUrl(letter.photo.url)}
              alt=""
              loading="eager"
              decoding="async"
            />
          </figure>
        )}

        <div className="letter-paper__meta">
          {lHasBadge && (
            <>
              <span className="letter-paper__badges">
                {isEarly && (
                  <>
                    <FaEarlybirds size="15px" />
                    <BsBookmarkHeartFill size="15px" />
                  </>
                )}
                {lId === adminId && <FaUserTie size="15px" />}
                {isEleven && <PiShootingStarFill size="15px" />}
                {isTwelve && <PiHeartBreakFill size="15px" />}
              </span>
              <span className="letter-meta-sep">·</span>
            </>
          )}
          {letter.is_pinned && new Date(letter.pin_expires_at).getTime() > Date.now() && (
            <>
              <span className="letter-paper__pin" role="img" aria-label="Pinned letter">
                <AiOutlinePushpin aria-hidden="true" />
              </span>
              <span className="letter-meta-sep">·</span>
            </>
          )}
          <span className="letter-paper__age">
            {shortLetterAge(letter.timestamp)}
          </span>
          <span className="letter-meta-sep">·</span>
          <span className="letter-paper__reads">
            <IoEyeOutline className="letter-paper__reads-eye" />
            {formatReadsCount(lReads)}
          </span>

          {(lHasLoc || (!letter.preview && letter._id)) && (
            <>
              <span className="letter-meta-sep">·</span>
              <span className="letter-paper__actions">
                {lHasLoc && (
                  <span className="letter-paper__locate">
                    <IoLocationOutline size="12px" />
                    <span>Locate</span>
                  </span>
                )}
                {lHasLoc && !letter.preview && letter._id && (
                  <span className="letter-meta-sep">·</span>
                )}
                {!letter.preview && letter._id && (
                  <span className="letter-paper__share">
                    <IoShareSocialOutline size="12px" />
                    <span>Share</span>
                  </span>
                )}
                {!letter.preview && letter._id && (
                  <>
                    <span className="letter-meta-sep">·</span>
                    <span className="letter-reaction-cluster">
                      {lEchoTotal > 0 && (
                        <span className="letter-echo-summary">
                          <span>{lEchoTotal}</span>
                        </span>
                      )}
                      <span className="letter-echo-control">
                        <span className="letter-paper__echo">
                          <LDominantIcon />
                        </span>
                      </span>
                    </span>
                  </>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderActivePaper = () => (
    <div className="letter-paper" ref={letterPaperRef}>
      <div className="letter-paper__head">
        <div className="letter-info" style={{ marginBottom: "4px" }}>
          {readMode ? (
            <span>
              <strong>From:</strong> {selectedLetter.from}
            </span>
          ) : (
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
          )}
        </div>
        <div className="letter-info">
          {readMode ? (
            <span>
              <strong>To:</strong> {selectedLetter.to}
            </span>
          ) : (
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
          )}
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
          {readMode ? (
            <span>{formatTimestamp(selectedLetter.timestamp)}</span>
          ) : (
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
          )}
        </span>
      </div>
      <Tooltip id="timezone_tooltip" />

      {TRANSLATION_ENABLED && detectedLanguage && (
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

      <div ref={messageBodyRef} className={`letter-paper__body letter-text${hasLetterAttachment ? " letter-paper__body--scrollable" : ""}`} tabIndex={0} role="region" aria-label="Letter message">
        {showTranslation ? (
          <span>{translatedMessage}</span>
        ) : readMode ? (
          <span>{message}</span>
        ) : (
          <Typewriter
            options={{ delay: 40, loop: false, stringSplitter }}
            onInit={(typewriter) => {
              typewriter
                .typeString(message)
                .pauseFor(500)
                .callFunction(() => {
                  setShowAttachments(true);
                })
                .start();
            }}
          />
        )}
      </div>

      {showAttachments && spotifyTrackId && (
        <div className="letter-paper__media">
          <iframe
            title="spotify-preview"
            style={{ border: "12px" }}
            src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=1`}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          ></iframe>
        </div>
      )}
      {showAttachments && !spotifyTrackId && youtubeVideoId && (
        <div className="letter-paper__media letter-paper__media--youtube">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=0&playsinline=1&controls=0&rel=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          ></iframe>
        </div>
      )}
      {showAttachments && selectedLetter.photo?.url && (
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
                  <BsBookmarkHeartFill size="15px" />
                </>
              )}
              {letterId === adminId && (
                <>
                  <FaUserTie size="15px" />
                </>
              )}
              {eleven_eleven && (
                <>
                  <PiShootingStarFill size="15px" />
                </>
              )}
              {twelve_fifty_one && (
                <>
                  <PiHeartBreakFill size="15px" />
                </>
              )}
            </span>
            <Tooltip id="badges" arrowColor="transparent" />
            <span className="letter-meta-sep">·</span>
          </>
        )}
        {selectedLetter.is_pinned && new Date(selectedLetter.pin_expires_at).getTime() > Date.now() && (
          <>
            <button
              type="button"
              className="letter-paper__pin"
              data-tooltip-id="pinned_letter_tooltip"
              data-tooltip-content={formatPinTimeRemaining(selectedLetter.pin_expires_at)}
              data-tooltip-place="bottom"
              aria-label="Pinned letter remaining time"
            >
              <AiOutlinePushpin aria-hidden="true" />
            </button>
            {typeof document !== "undefined" &&
              createPortal(
                <Tooltip
                  id="pinned_letter_tooltip"
                  place="bottom"
                  positionStrategy="fixed"
                  openOnClick={true}
                  closeEvents={{ click: true }}
                  globalCloseEvents={{ clickOutsideAnchor: true, escape: true }}
                  arrowColor="transparent"
                  className="pinned-letter-tooltip"
                  render={() => formatPinTimeRemaining(selectedLetter.pin_expires_at)}
                />,
                document.body
              )}
            <span className="letter-meta-sep">·</span>
          </>
        )}

        <span className="letter-paper__age" title={js_ago(new Date(selectedLetter.timestamp), {format: "long"})}>
          {shortLetterAge(selectedLetter.timestamp)}
        </span>
        <span className="letter-meta-sep">·</span>
        <span className="letter-paper__reads">
          <IoEyeOutline className="letter-paper__reads-eye" />
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
                  <IoLocationOutline size="12px" />
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
              {!selectedLetter.preview && selectedLetter._id && (
                <>
                  <span className="letter-meta-sep">·</span>
                  <span className="letter-reaction-cluster">
                    {echoTotal > 0 && (
                      <span className="letter-echo-summary">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEchoPicker(false);
                            setShowEchoBreakdown(current => !current);
                          }}
                          aria-expanded={showEchoBreakdown}
                          aria-label={`${echoTotal} ${echoTotal === 1 ? "reaction" : "reactions"}; show breakdown`}
                        >
                          {echoTotal}
                        </button>
                        {showEchoBreakdown && (
                          <div className="letter-echo-breakdown" role="tooltip">
                            {echoOptions.filter(option => echoes[option.id] > 0).map(option => {
                              const EchoIcon = option.icon;
                              return (
                                <span key={option.id}>
                                  <EchoIcon />
                                  <span>{option.label}</span>
                                  <strong>{echoes[option.id]}</strong>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </span>
                    )}
                    <span className="letter-echo-control">
                      <button
                        type="button"
                        className={`letter-paper__echo${selectedEcho ? ` is-reacted is-reacted--${selectedEcho}` : ""}`}
                        onClick={toggleEchoPicker}
                        aria-expanded={showEchoPicker}
                        aria-pressed={Boolean(selectedEcho)}
                        aria-label={selectedEcho
                          ? `Your ${selectedEcho} reaction is selected. Change or remove reaction`
                          : "React to this letter"}
                      >
                        <DominantReactionIcon />
                      </button>
                      {showEchoPicker && (
                        <div className="letter-echo-picker" role="menu" aria-label="Choose a reaction">
                          {echoOptions.map(option => {
                            const ReactionIcon = option.icon;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                role="menuitem"
                                aria-label={option.label}
                                className={`letter-echo-picker__btn letter-echo-picker__btn--${option.id}${selectedEcho === option.id ? " is-selected" : ""}`}
                                disabled={savingEcho}
                                onClick={() => requestEcho(option.id)}
                              >
                                <ReactionIcon />
                                <span>{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </span>
                  </span>
                </>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );

  const renderEnvelope = (closing = false) => (
    <div className={`letter-envelope${closing ? " letter-envelope--closing" : ""}`} aria-hidden="true">
      <div className="letter-envelope__back" />
      <div className="letter-envelope__pocket">
        <div className="letter-envelope__note" />
      </div>
      <div className="letter-envelope__front" />
      <div className="letter-envelope__flap" />
      {!closing && <span className="letter-envelope__hint">opening a letter…</span>}
    </div>
  );

  const closingEnvelope = isClosing && (
    <div className="letter-close-scene" aria-hidden="true">
      {renderEnvelope(true)}
    </div>
  );

  return (
    showDetailsModal &&
    selectedLetter && (
      <div
        className={`letter-modal-overlay${readMode ? " is-read-mode" : ""}${isClosing ? " is-folding-closed" : ""}`}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget &&
              ["letter-close-fade", "letter-close-reduced"].includes(event.animationName)) {
            finishCloseModal();
          }
        }}
        onClick={handleOverlayClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {readMode ? (
          <div className="read-mode-stage">
            {outgoingLetter && (
              <div
                className={`read-mode-card-wrapper is-exiting-${slideDirection}`}
                aria-hidden="true"
              >
                <div className="letter-modal" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="letter-modal__close"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <svg className="letter-fold-corner" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                      <path d="M 0 0 L 48 48 Q 24 42 3 47 Q 7 24 0 0 Z" />
                    </svg>
                  </button>
                  {renderOutgoingPaper(outgoingLetter)}
                </div>
              </div>
            )}
            <div
              className={`read-mode-card-wrapper${slideDirection ? ` is-entering-${slideDirection}` : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="letter-modal">
                {opened && (
                  <button
                    type="button"
                    className={`letter-modal__close${showFoldTip ? " is-hinted" : ""}`}
                    onClick={handleCloseModal}
                    aria-label="Close letter"
                    title="Fold and close letter"
                    disabled={isClosing}
                  >
                    <svg className="letter-fold-corner" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                      <path d="M 0 0 L 48 48 Q 24 42 3 47 Q 7 24 0 0 Z" />
                    </svg>
                  </button>
                )}
                {readMode && opened && showFoldTip && (
                  <aside
                    className={`read-mode-fold-tip${isFoldTipFading ? " is-fading-out" : ""}`}
                    role="status"
                    aria-label="Close letter hint"
                    onClick={handleCloseModal}
                  >
                    <span className="read-mode-fold-tip__text">
                      {isTouchDevice ? "Tap the folded corner to close" : "Click the folded corner to close"}
                    </span>
                  </aside>
                )}
                {!opened ? (
                  renderEnvelope()
                ) : (
                  renderActivePaper()
                )}
                {closingEnvelope}
              </div>
            </div>
            {opened && prerenderLetter && (
              <div
                className="read-mode-prerender-wrapper"
                aria-hidden="true"
                tabIndex={-1}
              >
                {renderPrerenderPaper(prerenderLetter)}
              </div>
            )}
          </div>
        ) : (
          <div className="letter-modal" onClick={(e) => e.stopPropagation()}>
            {opened && (
              <button
                type="button"
                className="letter-modal__close"
                onClick={handleCloseModal}
                aria-label="Close letter"
                  title="Fold and close letter"
                  disabled={isClosing}
              >
                <svg className="letter-fold-corner" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                      <path d="M 0 0 L 48 48 Q 24 42 3 47 Q 7 24 0 0 Z" />
                    </svg>
              </button>
            )}

            {!opened ? (
              renderEnvelope()
            ) : (
              renderActivePaper()
            )}
            {closingEnvelope}
          </div>
        )}

        {readMode && opened && showReadTip && (
          <div
            className="read-mode-tip"
            role="status"
            onClick={(e) => {
              e.stopPropagation();
              dismissReadTip();
            }}
          >
            <div className="read-mode-tip__content">
              <span className="read-mode-tip__arrow" aria-hidden="true">↓</span>
              <span>Scroll or swipe down to read more letters</span>
            </div>
            <button
              type="button"
              className="read-mode-tip__close"
              onClick={(e) => {
                e.stopPropagation();
                dismissReadTip();
              }}
              aria-label="Dismiss tip"
            >
              ✕
            </button>
          </div>
        )}

        {readMode && showAdLock && (
          <div
            className="read-mode-ad-lock-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Reading break"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="read-mode-ad-lock-dialog">
              <div className="read-mode-ad-lock-header">
                <span className="read-mode-ad-lock-eyebrow">Reading intermission</span>
                <h3>Take a brief pause</h3>
                <p>You’ve read {AD_INTERVAL} letters. Take a short breath while keeping Letters to Casper supported.</p>
              </div>
              <div className="read-mode-ad-lock-banner">
                <AdsterraBanner width={300} height={250} />
              </div>
              <div className="read-mode-ad-lock-footer">
                <button
                  type="button"
                  className="read-mode-ad-lock-btn"
                  disabled={adCountdown > 0}
                  onClick={handleContinueReading}
                >
                  {adCountdown > 0 ? `Resuming in ${adCountdown}s…` : "Continue reading"}
                </button>
              </div>
            </div>
          </div>
        )}

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
                  onClick={() => {setShowQrCode(true); setShowImageOptions(false);}}
                >
                  <span className="letter-share-dialog__option-icon">
                    <IoQrCodeOutline />
                  </span>
                  <span>
                    <strong>Share as QR</strong>
                    <small>Let someone scan it</small>
                  </span>
                </button>
                <button type="button" onClick={() => {setShowImageOptions(value => !value); setShowQrCode(false);}} disabled={isDownloadingImage} aria-expanded={showImageOptions} aria-controls="letter-image-options">
                  <span className="letter-share-dialog__option-icon"><IoDownloadOutline /></span>
                  <span><strong>{isDownloadingImage ? "Preparing image…" : "Download image"}</strong><small>Save the letter as a PNG</small></span>
                </button>
              </div>

              {showImageOptions && (
                <div id="letter-image-options" className="letter-image-options" role="group" aria-label="Choose image contents">
                  <button type="button" onClick={() => handleDownloadImage(false)} disabled={isDownloadingImage}><strong>Letter only</strong><small>Paper, message, and footer</small></button>
                  <button type="button" onClick={() => handleDownloadImage(true)} disabled={isDownloadingImage || !hasLetterAttachment}><strong>With attachments</strong><small>{hasLetterAttachment ? 'Include photo and link previews' : 'This letter has no attachments'}</small></button>
                  {isDownloadingImage && <span className="letter-image-progress" role="status"><span className="letter-image-spinner" aria-hidden="true" />Preparing your image…</span>}
                </div>
              )}

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

        {pendingEcho && (
          <div
            className="letter-share-dialog-overlay"
            onClick={(event) => {
              event.stopPropagation();
              if (!savingEcho) setPendingEcho("");
            }}
          >
            <section
              className={`letter-share-dialog letter-reaction-confirm-dialog letter-reaction-confirm-dialog--${pendingEcho}${pendingEcho === selectedEcho ? " is-undo" : ""}`}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="reaction-confirm-title"
              onClick={event => event.stopPropagation()}
            >
              <span className="letter-share-dialog__eyebrow">
                {pendingEcho === selectedEcho ? "Remove reaction" : "Change reaction"}
              </span>
              <div
                className={`letter-reaction-confirm-dialog__icon letter-reaction-confirm-dialog__icon--${pendingEcho}`}
                aria-hidden="true"
              >
                {pendingEcho === "sad" ? <TbMoodSad /> : <TbHeart />}
              </div>
              <h2 id="reaction-confirm-title">
                {pendingEcho === selectedEcho ? "Undo your reaction?" : "Switch your reaction?"}
              </h2>
              <p>
                {pendingEcho === selectedEcho
                  ? `Your ${pendingEcho === "sad" ? "Sad" : "Love"} reaction will be removed from this letter.`
                  : `Your previous reaction will be replaced with ${pendingEcho === "sad" ? "Sad" : "Love"}.`}
              </p>
              <div className="letter-reaction-confirm-dialog__actions">
                <button
                  type="button"
                  className="is-cancel"
                  onClick={() => setPendingEcho("")}
                  disabled={savingEcho}
                >
                  Keep current
                </button>
                <button
                  type="button"
                  className={`is-confirm is-confirm--${pendingEcho}`}
                  onClick={confirmEchoSwitch}
                  disabled={savingEcho}
                >
                  {savingEcho
                    ? "Saving…"
                    : pendingEcho === selectedEcho
                    ? "Undo reaction"
                    : "Switch reaction"}
                </button>
              </div>
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
