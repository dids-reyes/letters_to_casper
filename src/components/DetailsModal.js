import {AiOutlinePushpin} from "react-icons/ai";
import React from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { BsReply, BsX } from "react-icons/bs";
import { BsMailboxFlag } from "react-icons/bs";
import Typewriter from "typewriter-effect";
import { Tooltip } from "react-tooltip";
import tc from "thousands-counter";
import js_ago from "js-ago";
import { FaArrowLeft, FaArrowRight, FaEarlybirds } from "react-icons/fa";
import { BsBookmarkHeartFill } from "react-icons/bs";
import { FaUserTie } from "react-icons/fa";
import { PiShootingStarFill } from "react-icons/pi";
import { PiHeartBreakFill } from "react-icons/pi";
import { TbHeart, TbMoodSad } from "react-icons/tb";
import { RiMailSendLine } from "react-icons/ri";
import { MdAlternateEmail } from "react-icons/md";
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
import PinLetterDialog from "./PinLetterDialog";
import ReplyComposer, {replyDraftKey} from "./ReplyComposer";
import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { render_url, api_key } from "../data/keys";
import { adminId, targetDate } from "../data/target_letters";
import stringSplitter from "../data/splitLetterCharacters";
import { toast } from "react-toastify";
import { getOptimizedPhotoUrl } from "../data/cloudinary";
import { displayDirectLinkAds } from "../data/direct_link";
import { getGoogleMapsLocationUrl } from "../data/locationMap";
import usePinTooltipOnboarding from "../hooks/usePinTooltipOnboarding";
import SensitiveMessage from "./SensitiveMessage";
// Translation remains disabled until explicitly re-enabled.
const TRANSLATION_ENABLED = false;

const LetterMessageTypewriter = React.memo(function LetterMessageTypewriter({
  message,
  letterKey,
  onComplete,
}) {
  return (
    <Typewriter
      options={{ delay: 40, loop: false, stringSplitter }}
      onInit={(typewriter) => {
        typewriter
          .typeString(message)
          .pauseFor(500)
          .callFunction(() => onComplete(letterKey))
          .start();
      }}
    />
  );
}, (previous, next) => (
  previous.message === next.message && previous.letterKey === next.letterKey
));

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

const loadImageFromUrl = (url) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("Unable to load QR artwork"));
  image.src = url;
});

const qrPreloadCache = new Map();
const preloadQrImage = (url) => {
  if (!url) return;
  if (qrPreloadCache.has(url)) return;

  const image = new Image();
  qrPreloadCache.set(url, image);
  image.onload = () => {
    // Keep a small set of decoded images alive so opening QR immediately after
    // Share can reuse the exact letter-specific artwork.
    while (qrPreloadCache.size > 12) {
      qrPreloadCache.delete(qrPreloadCache.keys().next().value);
    }
  };
  image.onerror = () => qrPreloadCache.delete(url);
  image.src = url;
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
  onReplyPublished = () => {},
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
  const onReplyPublishedRef = useRef(onReplyPublished);
  onReplyPublishedRef.current = onReplyPublished;

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
    const reactionTarget = activeContextLetter;
    if (!reactionTarget?._id || reactionTarget.preview || savingEcho) return;
    setSavingEcho(true);
    try {
      const response = await fetch(`${render_url}/${reactionTarget._id}/echo`, {
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
      if (result.selected === "") delete saved[reactionTarget._id];
      else saved[reactionTarget._id] = result.selected ?? reaction;
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
  const [completedLetterKey, setCompletedLetterKey] = useState("");
  const [sensitiveMessageRevealed, setSensitiveMessageRevealed] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [translatedMessage, setTranslatedMessage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const hasLetterAttachment = Boolean(
    spotifyTrackId || youtubeVideoId || selectedLetter?.photo?.url
  );
  const messageBodyRef = useRef(null);
  useEffect(() => {
    setSensitiveMessageRevealed(false);
  }, [selectedLetter?._id, showDetailsModal]);
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
      setCompletedLetterKey("");
      return;
    }
    if (readMode && opened) {
      setShowAttachments(true);
      setCompletedLetterKey(getLetterId(selectedLetter));
    } else {
      setShowAttachments(false);
      setCompletedLetterKey("");
    }
  }, [showDetailsModal, selectedLetter, readMode, opened]);

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

  const AD_INTERVAL = 20;
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
  const [readBoundary, setReadBoundary] = useState(null);
  const readBoundaryTimerRef = useRef(null);

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

  const showReadBoundary = useCallback((boundary) => {
    setReadBoundary(boundary);
    if (readBoundaryTimerRef.current) clearTimeout(readBoundaryTimerRef.current);
    readBoundaryTimerRef.current = setTimeout(() => {
      setReadBoundary(null);
      readBoundaryTimerRef.current = null;
    }, 2000);
  }, []);

  const dismissReadBoundary = useCallback(() => {
    if (readBoundaryTimerRef.current) clearTimeout(readBoundaryTimerRef.current);
    readBoundaryTimerRef.current = null;
    setReadBoundary(null);
  }, []);

  useEffect(() => {
    return () => {
      if (foldTipTimerRef.current) clearTimeout(foldTipTimerRef.current);
      if (foldTipFadeTimerRef.current) clearTimeout(foldTipFadeTimerRef.current);
      if (readBoundaryTimerRef.current) clearTimeout(readBoundaryTimerRef.current);
    };
  }, []);

  useEffect(() => {
    dismissFoldTip();
  }, [selectedLetter?._id, dismissFoldTip]);

  useEffect(() => {
    if (!showDetailsModal) return undefined;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (readMode) document.body.style.touchAction = "none";

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
    if (closingRef.current || (showAdLock && !fromAdLock) || isTransitioningRef.current) return;
    if (!canGoNext) {
      showReadBoundary("end");
      return;
    }
    dismissReadBoundary();

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
  }, [showAdLock, showReadTip, dismissReadTip, canGoNext, currentIndex, letterList, selectedLetter, setSelectedLetter, navigate, onFetchMore, showReadBoundary, dismissReadBoundary]);

  const goToPrev = useCallback((fromAdLock = false) => {
    setNavDirection("prev");
    if (closingRef.current || (showAdLock && !fromAdLock) || isTransitioningRef.current) return;
    if (!canGoPrev) {
      showReadBoundary("beginning");
      return;
    }
    dismissReadBoundary();

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
  }, [showAdLock, showReadTip, dismissReadTip, canGoPrev, currentIndex, letterList, selectedLetter, setSelectedLetter, navigate, showReadBoundary, dismissReadBoundary]);

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
  const replyComposerNavigationLockedRef = useRef(false);
  const horizontalReplyNavigationRef = useRef(null);
  const lastHorizontalWheelTime = useRef(0);
  const pointerDragStartRef = useRef(null);
  const didHorizontalPointerDragRef = useRef(false);

  const handlePointerDown = (event) => {
    if (
      (event.pointerType && event.pointerType !== "mouse") ||
      event.button !== 0 ||
      replyComposerNavigationLockedRef.current
    ) return;
    const target = event.target instanceof Element ? event.target : null;
    if (
      !target?.closest(".letter-modal") ||
      target.closest("button, a, input, textarea, select, [contenteditable='true']")
    ) return;
    pointerDragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    didHorizontalPointerDragRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const start = pointerDragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (event.cancelable) event.preventDefault();
    }
  };

  const finishPointerDrag = (event) => {
    const start = pointerDragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    pointerDragStartRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;

    const navigation = horizontalReplyNavigationRef.current;
    const handled = deltaX < 0 ? navigation?.forward() : navigation?.back();
    if (handled) didHorizontalPointerDragRef.current = true;
  };

  const cancelPointerDrag = (event) => {
    if (pointerDragStartRef.current?.pointerId === event.pointerId) {
      pointerDragStartRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  const handleTouchStart = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (
      showAdLock ||
      replyComposerNavigationLockedRef.current ||
      target?.closest("[role='dialog']")
    ) {
      touchStartY.current = null;
      touchStartX.current = null;
      touchInsideScrollable.current = false;
      return;
    }
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchInsideScrollable.current = Boolean(e.target.closest(".letter-paper__body--scrollable"));
  };

  const handleTouchMove = (e) => {
    if (replyComposerNavigationLockedRef.current) return;
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
    if (replyComposerNavigationLockedRef.current) {
      touchStartY.current = null;
      touchStartX.current = null;
      return;
    }
    if (showAdLock || touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartY.current = null;
    touchStartX.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (replyThreadIndex >= 0) {
        const navigation = horizontalReplyNavigationRef.current;
        if (deltaX < 0) navigation?.forward();
        else navigation?.back();
        return;
      }
      if (replyParentLetter) {
        if (deltaX > 0 && !showReplyParent) {
          slideToReplyParent();
          return;
        }
        if (deltaX < 0 && showReplyParent) {
          slideBackToFeedReply();
          return;
        }
      }
      if (deltaX < 0) {
        if (replyViewingIndex === -1 && activeReplies.length > 0) {
          slideToReply(0);
          return;
        } else if (replyViewingIndex >= 0 && replyViewingIndex < activeReplies.length - 1) {
          slideToReply(replyViewingIndex + 1);
          return;
        }
      } else if (deltaX > 0) {
        if (replyViewingIndex > 0) {
          slideToReply(replyViewingIndex - 1);
          return;
        } else if (replyViewingIndex === 0) {
          slideToParent();
          return;
        }
      }
    }

    if (!readMode) return;

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
    if (!showDetailsModal) return undefined;

    const onWheel = (e) => {
      if (replyComposerNavigationLockedRef.current) return;
      const isHorizontalGesture =
        Math.abs(e.deltaX) >= 24 &&
        Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.15;
      if (isHorizontalGesture) {
        const navigation = horizontalReplyNavigationRef.current;
        if (navigation) {
          if (e.cancelable) e.preventDefault();
          const now = Date.now();
          if (now - lastHorizontalWheelTime.current < 550) return;
          const handled = e.deltaX > 0
            ? navigation.forward()
            : navigation.back();
          if (handled) lastHorizontalWheelTime.current = now;
        }
        return;
      }
      if (!readMode) return;
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


  const isReplyLetter = Boolean(selectedLetter?.is_reply || selectedLetter?.type === "reply" || selectedLetter?.parent_letter_id);
  const [replyParentLetter, setReplyParentLetter] = useState(null);
  const [showReplyParent, setShowReplyParent] = useState(false);
  const [showReplyParentCue, setShowReplyParentCue] = useState(true);
  const [replyThread, setReplyThread] = useState([]);
  const [replyThreadIndex, setReplyThreadIndex] = useState(-1);
  const [replyThreadBoundary, setReplyThreadBoundary] = useState("");
  const [showReplyThreadCues, setShowReplyThreadCues] = useState(false);
  // Location is revealed after the visitor explicitly accepts the ad step.
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasClickedAd, setHasClickedAd] = useState(false);
  const [showLocationAdConfirm, setShowLocationAdConfirm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showLetterActionChooser, setShowLetterActionChooser] = useState(false);
  const [showReplyInfoDialog, setShowReplyInfoDialog] = useState(false);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [replyPaymentNotice, setReplyPaymentNotice] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesError, setRepliesError] = useState("");
  const [isReplyPreviewing, setIsReplyPreviewing] = useState(false);
  const [replyPreviewData, setReplyPreviewData] = useState(null);
  const [replyViewingIndex, setReplyViewingIndex] = useState(-1);
  const [showReplySwipeTip, setShowReplySwipeTip] = useState(false);
  const [isReplySwipeTipFading, setIsReplySwipeTipFading] = useState(false);
  const replySwipeTipTimerRef = useRef(null);
  const replySwipeTipFadeTimerRef = useRef(null);
  const replyThreadBoundaryTimerRef = useRef(null);
  const replyThreadCueTimerRef = useRef(null);
  replyComposerNavigationLockedRef.current = showReplyComposer && !isReplyPreviewing;

  useLayoutEffect(() => {
    setShowReplyParent(false);
    setReplyParentLetter(null);
    setReplyThread([]);
    setReplyThreadIndex(-1);
    setReplyThreadBoundary("");
    setShowReplyThreadCues(false);
    if (!showDetailsModal || !isReplyLetter || !selectedLetter?.parent_letter_id) return undefined;

    const embeddedParent = selectedLetter.parent_letter || selectedLetter.parentLetter;
    if (embeddedParent?._id) {
      setReplyParentLetter(embeddedParent);
      return undefined;
    }

    let active = true;
    fetch(`${render_url}/public/${encodeURIComponent(selectedLetter.parent_letter_id)}`, {
      headers: {"x-api-key": api_key},
    })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Parent letter unavailable")))
      .then(data => {
        if (active && data?.message) setReplyParentLetter(data.message);
      })
      .catch(() => {
        // The existing association control remains available if the parent cannot be loaded.
      });
    return () => { active = false; };
  }, [showDetailsModal, isReplyLetter, selectedLetter?._id, selectedLetter?.parent_letter_id, selectedLetter?.parent_letter, selectedLetter?.parentLetter]);

  const selectedLetterId = getLetterId(selectedLetter);

  useEffect(() => {
    if (!showDetailsModal || selectedLetter?.preview || !selectedLetterId) return undefined;
    let active = true;
    fetch(`${render_url}/${encodeURIComponent(selectedLetterId)}/thread`, {
      headers: {"x-api-key": api_key},
    })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Thread unavailable")))
      .then(data => {
        if (!active || !Array.isArray(data?.letters) || data.letters.length < 2 || data.active_index < 0) return;
        setReplyThread(data.letters);
        setReplyThreadIndex(data.active_index);
        setShowReplyThreadCues(true);
        window.clearTimeout(replyThreadCueTimerRef.current);
        replyThreadCueTimerRef.current = window.setTimeout(() => setShowReplyThreadCues(false), 3000);
      })
      .catch(() => {
        // The existing direct parent navigation remains available as a fallback.
      });
    return () => { active = false; };
  }, [showDetailsModal, selectedLetterId, selectedLetter?.preview]);

  useEffect(() => {
    if (!opened || !isReplyLetter || !replyParentLetter) {
      setShowReplyParentCue(false);
      return undefined;
    }
    setShowReplyParentCue(true);
    const timer = setTimeout(() => setShowReplyParentCue(false), 3000);
    return () => clearTimeout(timer);
  }, [isReplyLetter, opened, replyParentLetter, showReplyParent]);

  useEffect(() => {
    setIsRevealed(false);
    setHasClickedAd(false);
    setShowLocationAdConfirm(false);
    setIsReplyPreviewing(false);
    setReplyPreviewData(null);
    setReplyViewingIndex(-1);
    setShowReplySwipeTip(false);
    setIsReplySwipeTipFading(false);
  }, [selectedLetter?._id, selectedLetter?.replies]);
  const pinTooltipEligible = Boolean(
    showDetailsModal &&
    opened &&
    selectedLetter?._id &&
    !selectedLetter.preview &&
    !isReplyLetter &&
    !(
      selectedLetter.is_pinned &&
      selectedLetter.pin_expires_at &&
      new Date(selectedLetter.pin_expires_at).getTime() > Date.now()
    ) &&
    (!selectedLetter.sensitiveContent || sensitiveMessageRevealed) &&
    completedLetterKey === getLetterId(selectedLetter)
  );
  const {
    isMounted: mountPinOnboarding,
    isOpen: showPinOnboarding,
    dismiss: dismissPinOnboarding,
  } = usePinTooltipOnboarding({
    ready: pinTooltipEligible,
    letterKey: getLetterId(selectedLetter),
  });
  useEffect(() => {
    if (!showPinOnboarding) return undefined;

    const dismissOnOutsidePress = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        target.closest("#pin-letter-action") ||
        target.closest(".pin-letter-onboarding-tooltip")
      ) {
        return;
      }
      dismissPinOnboarding();
    };

    document.addEventListener("pointerdown", dismissOnOutsidePress);
    return () => document.removeEventListener("pointerdown", dismissOnOutsidePress);
  }, [dismissPinOnboarding, showPinOnboarding]);
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

  const loadReplies = useCallback(async () => {
    if (!selectedLetter?._id || (selectedLetter.preview && !selectedLetter.isReplyPreview) || selectedLetter.is_reply || selectedLetter.type === "reply") return;
    setRepliesLoading(true);
    setRepliesError("");
    try {
      const response = await fetch(`${render_url}/${encodeURIComponent(getLetterId(selectedLetter))}/replies`, {headers: {"x-api-key": api_key}});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to load replies.");
      const published = Array.isArray(data.replies) ? data.replies : [];
      const filtered = published.filter(reply => reply.published !== false && reply.payment_status !== "unpaid");
      if (selectedLetter.previewReply) {
        const hasPreview = filtered.some(r => r._id === selectedLetter.previewReply._id);
        setReplies(hasPreview ? filtered : [...filtered, selectedLetter.previewReply]);
      } else {
        setReplies(filtered);
      }
    } catch (error) {
      const embedded = Array.isArray(selectedLetter.replies) ? selectedLetter.replies : [];
      const filtered = embedded.filter(reply => reply.published !== false && reply.payment_status !== "unpaid");
      if (selectedLetter.previewReply) {
        const hasPreview = filtered.some(r => r._id === selectedLetter.previewReply._id);
        setReplies(hasPreview ? filtered : [...filtered, selectedLetter.previewReply]);
      } else {
        setReplies(filtered);
      }
      if (!embedded.length && !selectedLetter.previewReply) setRepliesError("Replies couldn’t be loaded right now.");
    } finally {
      setRepliesLoading(false);
    }
  }, [selectedLetter]);

  useEffect(() => {
    const base = Array.isArray(selectedLetter?.replies) ? selectedLetter.replies.filter(reply => reply.published !== false) : [];
    if (selectedLetter?.previewReply) {
      const hasPreview = base.some(r => r._id === selectedLetter.previewReply._id);
      setReplies(hasPreview ? base : [...base, selectedLetter.previewReply]);
    } else {
      setReplies(base);
    }
    setShowReplies(false);
  }, [selectedLetter?._id, selectedLetter?.replies, selectedLetter?.previewReply]);

  useEffect(() => {
    if (showDetailsModal && selectedLetter?._id && (!selectedLetter.preview || selectedLetter.isReplyPreview) && !isReplyLetter) loadReplies();
  }, [isReplyLetter, loadReplies, selectedLetter?._id, selectedLetter?.preview, selectedLetter?.isReplyPreview, showDetailsModal]);

  useEffect(() => {
    if (!showDetailsModal || !selectedLetter?._id) return;
    const params = new URLSearchParams(location.search);
    const requestedReply = params.get("reply");
    if (!requestedReply) return;
    setOpened(true);
    setShowReplies(true);
    loadReplies();
  }, [loadReplies, location.search, selectedLetter?._id, showDetailsModal]);

  useEffect(() => {
    if (!showDetailsModal || !selectedLetter?._id) return undefined;
    const params = new URLSearchParams(location.search);
    if (params.get("status") === "reply_cancelled") {
      setReplyPaymentNotice({
        type: "cancelled",
        title: "Payment canceled",
        message: "Your reply was not published. Your draft is still saved.",
      });
      params.delete("status");
      navigate({pathname: location.pathname, search: params.toString() ? `?${params}` : ""}, {replace: true});
      return undefined;
    }
    const token = params.get("reply_payment");
    if (params.get("status") !== "reply_success" || !token) return undefined;
    let active = true;
    let timer;
    let attempts = 0;
    const clearReturnParams = () => {
      params.delete("status");
      params.delete("reply_payment");
      navigate({pathname: location.pathname, search: params.toString() ? `?${params}` : ""}, {replace: true});
    };
    const verify = async () => {
      attempts += 1;
      try {
        const response = await fetch(new URL(`/api/reply-payment-status/${encodeURIComponent(token)}`, render_url).href, {method: "POST", headers: {"x-api-key": api_key}});
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok && data.status === "published") {
          try { localStorage.removeItem(replyDraftKey(getLetterId(selectedLetter))); } catch { /* storage unavailable */ }
          setReplyPaymentNotice({
            type: "success",
            title: "Reply sent",
            message: "Your payment was confirmed and your reply is now published.",
          });
          setShowReplyComposer(false);
          setShowReplies(false);
          setIsReplyPreviewing(false);
          setReplyPreviewData(null);
          setReplyViewingIndex(-1);
          await onReplyPublishedRef.current();
          clearReturnParams();
          return;
        }
      } catch { /* Retry while PayMongo confirmation is propagating. */ }
      if (active && attempts < 10) timer = window.setTimeout(verify, 3000);
      else if (active) {
        setReplyPaymentNotice({
          type: "error",
          title: "Payment not confirmed",
          message: "We couldn’t confirm the payment yet. Your draft is still saved.",
        });
        clearReturnParams();
      }
    };
    verify();
    return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [location.pathname, location.search, navigate, selectedLetter, showDetailsModal]);

  const triggerReplySwipeTip = useCallback((duration = 2000) => {
    if (replySwipeTipTimerRef.current) clearTimeout(replySwipeTipTimerRef.current);
    if (replySwipeTipFadeTimerRef.current) clearTimeout(replySwipeTipFadeTimerRef.current);

    setShowReplySwipeTip(true);
    setIsReplySwipeTipFading(false);

    replySwipeTipTimerRef.current = setTimeout(() => {
      setIsReplySwipeTipFading(true);
      replySwipeTipFadeTimerRef.current = setTimeout(() => {
        setShowReplySwipeTip(false);
        setIsReplySwipeTipFading(false);
        replySwipeTipFadeTimerRef.current = null;
      }, 400);
      replySwipeTipTimerRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (replySwipeTipTimerRef.current) clearTimeout(replySwipeTipTimerRef.current);
      if (replySwipeTipFadeTimerRef.current) clearTimeout(replySwipeTipFadeTimerRef.current);
    };
  }, []);

  const handleReplyPreview = useCallback((draftData) => {
    const fullDraftReply = {
      _id: "preview-draft-reply",
      alias: draftData.alias || "Anonymous",
      to: draftData.to || selectedLetter?.from || "Anonymous",
      message: draftData.link
        ? `${draftData.message}\n\n${draftData.link}`
        : draftData.message,
      timestamp: new Date().toISOString(),
      photo: draftData.photoPreviewUrl ? { url: draftData.photoPreviewUrl } : undefined,
      published: true,
      isPreview: true,
      reads: 0,
    };
    setReplyPreviewData(fullDraftReply);
    setIsReplyPreviewing(true);
    setReplyViewingIndex(-1);
    setShowReplies(false);
    triggerReplySwipeTip();
  }, [selectedLetter?.from, triggerReplySwipeTip]);

  const exitReplyPreview = useCallback(() => {
    if (replySwipeTipTimerRef.current) clearTimeout(replySwipeTipTimerRef.current);
    if (replySwipeTipFadeTimerRef.current) clearTimeout(replySwipeTipFadeTimerRef.current);
    setShowReplySwipeTip(false);
    setIsReplySwipeTipFading(false);
    setIsReplyPreviewing(false);
    setReplyPreviewData(null);
    setReplyViewingIndex(-1);
    setOutgoingLetter(null);
    setSlideDirection(null);
    isTransitioningRef.current = false;
  }, []);

  const activeReplies = useMemo(() => {
    if (isReplyPreviewing && replyPreviewData) {
      return [replyPreviewData];
    }
    const published = Array.isArray(replies)
      ? replies.filter(r => r.published !== false && r.payment_status !== "unpaid")
      : [];
    if (published.length > 0) return published;
    if (Array.isArray(selectedLetter?.replies)) {
      return selectedLetter.replies.filter(r => r.published !== false && r.payment_status !== "unpaid");
    }
    return [];
  }, [isReplyPreviewing, replyPreviewData, replies, selectedLetter?.replies]);

  useEffect(() => {
    if (opened && activeReplies.length > 0 && !showReplies) {
      triggerReplySwipeTip(replyViewingIndex >= 0 ? 1000 : 2000);
    }
  }, [opened, activeReplies.length, showReplies, replyViewingIndex, triggerReplySwipeTip]);

  const formatReplyAsLetter = useCallback((reply, parent) => {
    const parentId = getLetterId(parent);
    return {
      _id: reply._id || "reply-preview",
      from: reply.alias || reply.from || "Anonymous",
      to: reply.to || parent?.from || "Anonymous",
      message: reply.message || "",
      timestamp: reply.timestamp || new Date().toISOString(),
      photo: reply.photo,
      loc: reply.loc || {},
      echoes: normalizeEchoes(reply.echoes),
      parent_letter_id: parentId,
      parent_association: {
        available: true,
        from: parent?.from || "Anonymous",
        to: parent?.to || "Anonymous",
      },
      is_reply: true,
      type: "reply",
      reads: Math.max(1, Number(reply.reads) || 1),
      preview: Boolean(reply.isPreview || selectedLetter?.preview || isReplyPreviewing),
      isPreview: Boolean(reply.isPreview || isReplyPreviewing),
    };
  }, [isReplyPreviewing, selectedLetter?.preview]);

  const activeReplyLetter = replyViewingIndex >= 0 && activeReplies[replyViewingIndex]
    ? formatReplyAsLetter(activeReplies[replyViewingIndex], selectedLetter)
    : null;
  const activeThreadLetter = replyThreadIndex >= 0 ? replyThread[replyThreadIndex] : null;
  const activeContextLetter = activeThreadLetter || activeReplyLetter || (
    showReplyParent && replyParentLetter ? replyParentLetter : selectedLetter
  );
  const activeContextLetterId = getLetterId(activeContextLetter);
  const activeContextLoveEchoes = Math.max(0, Number(activeContextLetter?.echoes?.love) || 0);
  const activeContextSadEchoes = Math.max(0, Number(activeContextLetter?.echoes?.sad) || 0);
  const letterLocationMap = getGoogleMapsLocationUrl(activeContextLetter?.loc);
  const hasLocation = Boolean(letterLocationMap);

  useEffect(() => {
    setEchoes({love: activeContextLoveEchoes, sad: activeContextSadEchoes});
    setShowEchoPicker(false);
    setShowEchoBreakdown(false);
    setPendingEcho("");
    try {
      const saved = JSON.parse(localStorage.getItem("letterEchoes") || "{}");
      setSelectedEcho(saved[activeContextLetterId] || "");
    } catch (error) {
      setSelectedEcho("");
    }
  }, [activeContextLetterId, activeContextLoveEchoes, activeContextSadEchoes]);

  const slideTimerRef = useRef(null);
  const showThreadBoundary = useCallback((boundary) => {
    setReplyThreadBoundary(boundary);
    window.clearTimeout(replyThreadBoundaryTimerRef.current);
    replyThreadBoundaryTimerRef.current = window.setTimeout(() => setReplyThreadBoundary(""), 1800);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(replyThreadBoundaryTimerRef.current);
    window.clearTimeout(replyThreadCueTimerRef.current);
  }, []);

  const slideThreadTo = useCallback((targetIndex) => {
    if (!replyThread[targetIndex] || targetIndex === replyThreadIndex) return false;
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    setCompletedLetterKey("");
    setShowAttachments(false);
    setOutgoingLetter(replyThread[replyThreadIndex]);
    setSlideDirection(targetIndex > replyThreadIndex ? "left" : "right");
    setReplyThreadIndex(targetIndex);
    setReplyThreadBoundary("");
    setShowReplyThreadCues(false);
    window.clearTimeout(replyThreadCueTimerRef.current);
    slideTimerRef.current = setTimeout(() => {
      setOutgoingLetter(null);
      setSlideDirection(null);
      slideTimerRef.current = null;
    }, 500);
    return true;
  }, [replyThread, replyThreadIndex]);
  const slideToReply = useCallback((targetIndex = 0) => {
    if (!activeReplies[targetIndex]) return;

    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    setCompletedLetterKey("");
    setShowAttachments(false);
    const currentLetter = replyViewingIndex >= 0 && activeReplies[replyViewingIndex]
      ? formatReplyAsLetter(activeReplies[replyViewingIndex], selectedLetter)
      : selectedLetter;

    setOutgoingLetter(currentLetter);
    setSlideDirection("left");
    setReplyViewingIndex(targetIndex);

    slideTimerRef.current = setTimeout(() => {
      setOutgoingLetter(null);
      setSlideDirection(null);
      slideTimerRef.current = null;
    }, 500);
  }, [activeReplies, formatReplyAsLetter, replyViewingIndex, selectedLetter]);

  const slideToParent = useCallback(() => {
    if (replyViewingIndex < 0) return;

    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    setCompletedLetterKey("");
    setShowAttachments(false);
    const currentReplyLetter = formatReplyAsLetter(activeReplies[replyViewingIndex], selectedLetter);

    setOutgoingLetter(currentReplyLetter);
    setSlideDirection("right");
    setReplyViewingIndex(-1);

    slideTimerRef.current = setTimeout(() => {
      setOutgoingLetter(null);
      setSlideDirection(null);
      slideTimerRef.current = null;
    }, 500);
  }, [activeReplies, formatReplyAsLetter, replyViewingIndex, selectedLetter]);

  const slideToReplyParent = useCallback(() => {
    if (!replyParentLetter || showReplyParent) return;
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    setCompletedLetterKey("");
    setShowAttachments(false);
    setOutgoingLetter(selectedLetter);
    setSlideDirection("right");
    setShowReplyParent(true);
    slideTimerRef.current = setTimeout(() => {
      setOutgoingLetter(null);
      setSlideDirection(null);
      slideTimerRef.current = null;
    }, 500);
  }, [replyParentLetter, selectedLetter, showReplyParent]);

  const slideBackToFeedReply = useCallback(() => {
    if (!showReplyParent) return;
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    setCompletedLetterKey("");
    setShowAttachments(false);
    setOutgoingLetter(replyParentLetter);
    setSlideDirection("left");
    setShowReplyParent(false);
    slideTimerRef.current = setTimeout(() => {
      setOutgoingLetter(null);
      setSlideDirection(null);
      slideTimerRef.current = null;
    }, 500);
  }, [replyParentLetter, showReplyParent]);

  horizontalReplyNavigationRef.current = {
    forward: () => {
      if (replyThreadIndex >= 0) {
        if (replyThreadIndex < replyThread.length - 1) return slideThreadTo(replyThreadIndex + 1);
        showThreadBoundary("latest");
        return true;
      }
      if (replyParentLetter && showReplyParent) {
        slideBackToFeedReply();
        return true;
      }
      if (!replyParentLetter && replyViewingIndex < activeReplies.length - 1) {
        slideToReply(replyViewingIndex + 1);
        return true;
      }
      return false;
    },
    back: () => {
      if (replyThreadIndex >= 0) {
        if (replyThreadIndex > 0) return slideThreadTo(replyThreadIndex - 1);
        showThreadBoundary("start");
        return true;
      }
      if (replyParentLetter && !showReplyParent) {
        slideToReplyParent();
        return true;
      }
      if (!replyParentLetter && replyViewingIndex >= 0) {
        if (replyViewingIndex === 0) slideToParent();
        else slideToReply(replyViewingIndex - 1);
        return true;
      }
      return false;
    },
  };

  const [showQrCode, setShowQrCode] = useState(false);
  const [showQrAdConfirm, setShowQrAdConfirm] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const shareTargetLetter = activeContextLetter;
  const shareTargetMedia = extractMediaLinks(shareTargetLetter?.message || "");
  const shareTargetSpotifyId = shareTargetMedia?.spotifyLink?.id || null;
  const shareTargetYoutubeId = shareTargetMedia?.youtubeLink?.id || null;
  const shareTargetMessage = shareTargetMedia?.newMessage || shareTargetLetter?.message || "";
  const shareTargetHasAttachment = Boolean(
    shareTargetSpotifyId || shareTargetYoutubeId || shareTargetLetter?.photo?.url
  );
  const letterPaperRef = useRef(null);
  const handleDownloadImage = async (includeAttachments = false) => {
    if (isDownloadingImage || !letterPaperRef.current) return;
    setIsDownloadingImage(true);
    try {
      const {default: downloadLetterImage} = await import('../utils/downloadLetterImage');
      await downloadLetterImage(letterPaperRef.current, {
        id: shareTargetLetter._id, from: shareTargetLetter.from, to: shareTargetLetter.to,
        message: showTranslation && shareTargetLetter === selectedLetter ? translatedMessage : shareTargetMessage,
        date: formatTimestamp(shareTargetLetter.timestamp),
        includeAttachments,
        photoUrl: shareTargetLetter.photo?.url ? getOptimizedPhotoUrl(shareTargetLetter.photo.url) : null,
        media: shareTargetSpotifyId ? {
          provider: 'Spotify',
          url: `https://open.spotify.com/track/${shareTargetSpotifyId}`,
        } : (shareTargetYoutubeId ? {
          provider: 'YouTube',
          url: `https://youtu.be/${shareTargetYoutubeId}`,
          thumbnail: `https://i.ytimg.com/vi/${encodeURIComponent(shareTargetYoutubeId)}/hqdefault.jpg`,
        } : null),
      });
    } catch {
      toast.error("Image preparation failed or timed out. Please try again, or choose Letter only if the attachment won’t load.", {position: "top-center"});
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const letterShareUrl =
    shareTargetLetter?._id && !shareTargetLetter.preview
      ? `${window.location.origin}/letters/${shareTargetLetter._id}`
      : "";
  const letterPinUrl =
    shareTargetLetter?._id && !shareTargetLetter.preview
      ? (typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null"
          ? `${window.location.origin}/letters/${shareTargetLetter._id}`
          : `https://letterstocasper.com/letters/${shareTargetLetter._id}`)
      : "";
  const isLetterPinned = Boolean(
    shareTargetLetter?.is_pinned &&
    shareTargetLetter.pin_expires_at &&
    new Date(shareTargetLetter.pin_expires_at).getTime() > Date.now()
  );
  const letterQrUrl = letterShareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&ecc=H&data=${encodeURIComponent(
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
    if (!isRevealed) setShowLocationAdConfirm(true);
  };

  const confirmLocationAd = () => {
    setShowLocationAdConfirm(false);
    setHasClickedAd(true);
    displayDirectLinkAds();
  };

  const handleCopyLetterLink = async () => {
    if (!shareTargetLetter?._id || shareTargetLetter.preview) return;

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

      fetch(`${render_url}/${shareTargetLetter._id}/copy-link`, {
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

    const qrUrlForDownload = letterQrUrl;
    const letterIdForDownload = getLetterId(shareTargetLetter);
    setIsDownloadingQr(true);
    const temporaryUrls = [];
    try {
      const downloadQrUrl = qrUrlForDownload.replace("size=240x240&margin=12", "size=720x720&margin=36");
      const [qrResponse, logoResponse] = await Promise.all([
        fetch(downloadQrUrl),
        fetch("/ltc_favicon.png"),
      ]);
      if (!qrResponse.ok || !logoResponse.ok) {
        throw new Error("Unable to download QR artwork");
      }

      const [qrBlob, logoBlob] = await Promise.all([
        qrResponse.blob(),
        logoResponse.blob(),
      ]);
      const qrObjectUrl = URL.createObjectURL(qrBlob);
      const logoObjectUrl = URL.createObjectURL(logoBlob);
      temporaryUrls.push(qrObjectUrl, logoObjectUrl);
      const [qrImage, logoImage] = await Promise.all([
        loadImageFromUrl(qrObjectUrl),
        loadImageFromUrl(logoObjectUrl),
      ]);

      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 720;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to prepare QR image");

      context.drawImage(qrImage, 0, 0, 720, 720);
      const plateSize = 136;
      const platePosition = (720 - plateSize) / 2;
      context.fillStyle = "#ffffff";
      context.beginPath();
      if (typeof context.roundRect === "function") {
        context.roundRect(platePosition, platePosition, plateSize, plateSize, 18);
      } else {
        context.rect(platePosition, platePosition, plateSize, plateSize);
      }
      context.fill();

      const logoSize = 94;
      const logoPosition = (720 - logoSize) / 2;
      context.drawImage(logoImage, logoPosition, logoPosition, logoSize, logoSize);

      const brandedQrBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("Unable to export QR image")),
          "image/png"
        );
      });
      const downloadUrl = URL.createObjectURL(brandedQrBlob);
      temporaryUrls.push(downloadUrl);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `letter-to-casper-${letterIdForDownload}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

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
      temporaryUrls.forEach(url => URL.revokeObjectURL(url));
      setIsDownloadingQr(false);
    }
  };

  const confirmQrDownloadAd = () => {
    setShowQrAdConfirm(false);
    displayDirectLinkAds();
    handleDownloadQr();
  };

  const handleCloseModal = () => {
    if (isReplyPreviewing) {
      exitReplyPreview();
      return;
    }
    if (closingRef.current) return;
    dismissFoldTip();
    closingRef.current = true;
    setIsClosing(true);
  };

  const handleOverlayClick = (event) => {
    if (didHorizontalPointerDragRef.current) {
      didHorizontalPointerDragRef.current = false;
      return;
    }
    if (event && event.target !== event.currentTarget) {
      return;
    }
    if (isReplyPreviewing) {
      exitReplyPreview();
      return;
    }
    if (opened) {
      triggerFoldTip();
    }
    return;
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
    setShowLocationAdConfirm(false);
    setShowShareDialog(false);
    setShowPinModal(false);
    setShowLetterActionChooser(false);
    setShowReplyInfoDialog(false);
    setShowReplyComposer(false);
    setShowReplies(false);
    setShowQrCode(false);
    setShowQrAdConfirm(false);
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
    const timer = setTimeout(finishCloseModal, (reduced || selectedLetter?.preview) ? 120 : 1380);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClosing, selectedLetter?.preview]);

  const closeShareDialog = () => {
    setShowShareDialog(false);
    setShowQrCode(false);
    setShowQrAdConfirm(false);
    setIsDownloadingQr(false);
  };

  useEffect(() => {
    if (!showDetailsModal) return;
    const onKeyDown = (event) => {
      if (closingRef.current) return;
      if (event.key === "Escape") {
        if (isReplyPreviewing) {
          exitReplyPreview();
          return;
        }
        if (showLetterActionChooser) {
          setShowLetterActionChooser(false);
          return;
        }
        if (showReplyInfoDialog) {
          setShowReplyInfoDialog(false);
          return;
        }
        if (showReplyComposer) {
          if (document.querySelector('.letter-modal-overlay.is-preview-letter')) {
            return;
          }
          setShowReplyComposer(false);
          return;
        }
        if (showReplies) {
          setShowReplies(false);
          return;
        }
        if (showPinModal) {
          setShowPinModal(false);
          return;
        }
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
        if (readMode) {
          if (opened) {
            triggerFoldTip();
          }
          return;
        }
        handleCloseModal();
        return;
      }
      if (!showPhotoViewer && !showShareDialog && !showPinModal && !showLetterActionChooser && !showReplyInfoDialog && !showReplyComposer && !showAdLock) {
        if (event.key === "ArrowRight") {
          if (replyViewingIndex === -1 && activeReplies.length > 0) {
            slideToReply(0);
          } else if (replyViewingIndex >= 0 && replyViewingIndex < activeReplies.length - 1) {
            slideToReply(replyViewingIndex + 1);
          }
        } else if (event.key === "ArrowLeft") {
          if (replyViewingIndex > 0) {
            slideToReply(replyViewingIndex - 1);
          } else if (replyViewingIndex === 0) {
            slideToParent();
          }
        }
      }
      if (readMode && !showPhotoViewer && !showShareDialog && !showPinModal && !showLetterActionChooser && !showReplyInfoDialog && !showReplyComposer) {
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
  }, [showDetailsModal, showPhotoViewer, showShareDialog, showPinModal, showLetterActionChooser, showReplyInfoDialog, showReplyComposer, showReplies, readMode, showAdLock, goToNext, goToPrev, isReplyPreviewing, exitReplyPreview, replyViewingIndex, activeReplies, slideToReply, slideToParent, opened, triggerFoldTip]);

  const formatReadsCount = (readsCount) => {
    const parsed = parseInt(readsCount) || 0;
    const formatted = tc(parsed, 2);
    const label = parsed === 1 ? "read" : "reads";
    return `${formatted} ${label}`;
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
          <SensitiveMessage sensitive={letter.sensitiveContent === true} interactive={false}>
            <span>{lMessage}</span>
          </SensitiveMessage>
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
          {letter._id && (!letter.preview || isReplyPreviewing) && (
            <>
              <span
                className="letter-paper__pin"
                role="img"
                aria-label={letter.is_pinned && new Date(letter.pin_expires_at).getTime() > Date.now() ? "Pinned letter" : "Pin letter"}
              >
                {letter.is_pinned && new Date(letter.pin_expires_at).getTime() > Date.now()
                  ? <AiOutlinePushpin aria-hidden="true" />
                  : <RiMailSendLine aria-hidden="true" />}
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
            <span>{formatReadsCount(lReads)}</span>
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
          <SensitiveMessage sensitive={letter.sensitiveContent === true} interactive={false}>
            <span>{lMessage}</span>
          </SensitiveMessage>
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
          {letter._id && !letter.preview && (
            <>
              <span
                className="letter-paper__pin"
                role="img"
                aria-label={letter.is_pinned && new Date(letter.pin_expires_at).getTime() > Date.now() ? "Pinned letter" : "Pin letter"}
              >
                {letter.is_pinned && new Date(letter.pin_expires_at).getTime() > Date.now()
                  ? <AiOutlinePushpin aria-hidden="true" />
                  : <RiMailSendLine aria-hidden="true" />}
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
            <span>{formatReadsCount(lReads)}</span>
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

  const renderActivePaper = () => {
    const isReplyActive = replyViewingIndex >= 0;
    const activeLetter = activeContextLetter;

    const activeMedia = extractMediaLinks(activeLetter?.message || "");
    const activeSpotifyTrackId = activeMedia?.spotifyLink?.id || null;
    const activeYoutubeVideoId = activeMedia?.youtubeLink?.id || null;
    const activeMessage = activeMedia?.newMessage || activeLetter?.message || "";
    const activeHasAttachment = Boolean(activeSpotifyTrackId || activeYoutubeVideoId || activeLetter?.photo?.url);

    return (
      <div className="letter-paper" ref={letterPaperRef}>
        <div className="letter-paper__head">
          <div className="letter-info" style={{ marginBottom: "4px" }}>
            {readMode || isReplyActive || isReplyPreviewing ? (
              <span>
                <strong>From:</strong> {activeLetter.from}
              </span>
            ) : (
              <Typewriter
                key={`${getLetterId(activeLetter)}-from`}
                options={{ delay: 50, loop: false, stringSplitter }}
                onInit={(typewriter) => {
                  typewriter
                    .typeString(
                      `<strong>From:</strong> ${activeLetter.from}`
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
            {readMode || isReplyActive || isReplyPreviewing ? (
              <span>
                <strong>To:</strong> {activeLetter.to}
              </span>
            ) : (
              <Typewriter
                key={`${getLetterId(activeLetter)}-to`}
                options={{ delay: 50, loop: false, stringSplitter }}
                onInit={(typewriter) => {
                  typewriter
                    .typeString(`<strong>To:</strong> ${activeLetter.to}`)
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
            <span>{formatTimestamp(activeLetter.timestamp)}</span>
          </span>
        </div>
        <Tooltip id="timezone_tooltip" />

        {TRANSLATION_ENABLED && !isReplyActive && detectedLanguage && (!activeLetter.sensitiveContent || sensitiveMessageRevealed) && (
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

        <div ref={messageBodyRef} className={`letter-paper__body letter-text${activeHasAttachment ? " letter-paper__body--scrollable" : ""}`} tabIndex={0} role="region" aria-label="Letter message">
          <SensitiveMessage
            sensitive={activeLetter.sensitiveContent === true}
            revealed={sensitiveMessageRevealed}
            onReveal={() => setSensitiveMessageRevealed(true)}
          >
            {showTranslation && !isReplyActive ? (
              <span>{translatedMessage}</span>
            ) : readMode || isReplyActive || isReplyPreviewing || completedLetterKey === getLetterId(activeLetter) ? (
              <span>{activeMessage}</span>
            ) : (
              <LetterMessageTypewriter
                key={`${getLetterId(activeLetter)}-message`}
                message={activeMessage}
                letterKey={getLetterId(activeLetter)}
                onComplete={(completedKey) => {
                  setShowAttachments(true);
                  setCompletedLetterKey(completedKey);
                }}
              />
            )}
          </SensitiveMessage>
        </div>

        {((showAttachments && !isReplyActive) || isReplyActive) && activeSpotifyTrackId && (
          <div className="letter-paper__media">
            <iframe
              title="spotify-preview"
              style={{ border: "12px" }}
              src={`https://open.spotify.com/embed/track/${activeSpotifyTrackId}?utm_source=generator&theme=1`}
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            ></iframe>
          </div>
        )}
        {((showAttachments && !isReplyActive) || isReplyActive) && !activeSpotifyTrackId && activeYoutubeVideoId && (
          <div className="letter-paper__media letter-paper__media--youtube">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeYoutubeVideoId}?autoplay=1&mute=0&playsinline=1&controls=0&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
        )}
        {((showAttachments && !isReplyActive) || isReplyActive) && activeLetter.photo?.url && (
          <figure className="letter-paper__photo">
            <img
              src={getOptimizedPhotoUrl(activeLetter.photo.url)}
              alt={`Attached to the letter from ${activeLetter.from} to ${activeLetter.to}`}
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
          {!isReplyActive && hasBadge && (
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
          {activeLetter?._id && (!activeLetter.preview || isReplyPreviewing) && (
            (!isReplyActive && isLetterPinned) ? (
              <>
                <button
                  type="button"
                  className="letter-paper__pin"
                  data-tooltip-id="pinned_letter_tooltip"
                  data-tooltip-content={formatPinTimeRemaining(activeLetter.pin_expires_at)}
                  data-tooltip-place="bottom"
                  aria-label="Pinned letter remaining time: open delivery and reply options"
                  onClick={() => setShowLetterActionChooser(true)}
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
                      render={() => formatPinTimeRemaining(activeLetter.pin_expires_at)}
                    />,
                    document.body
                  )}
                <span className="letter-meta-sep">·</span>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="letter-paper__pin"
                  id="pin-letter-action"
                  onClick={() => {
                    dismissPinOnboarding();
                    setShowLetterActionChooser(true);
                  }}
                  aria-label="Pin this letter, or open delivery and reply options"
                >
                  <RiMailSendLine aria-hidden="true" />
                </button>
                {mountPinOnboarding && typeof document !== "undefined" &&
                  createPortal(
                    <Tooltip
                      anchorSelect="#pin-letter-action"
                      place="bottom"
                      offset={11}
                      positionStrategy="fixed"
                      isOpen={showPinOnboarding}
                      clickable={true}
                      className="pin-letter-onboarding-tooltip"
                      classNameArrow="pin-letter-onboarding-tooltip__arrow"
                      role="status"
                    >
                      <span className="pin-letter-onboarding-tooltip__copy">
                        Email this letter directly to them, anonymously.
                      </span>
                      <button
                        type="button"
                        className="pin-letter-onboarding-tooltip__close"
                        aria-label="Dismiss Pin Letter tip"
                        onClick={(event) => {
                          event.stopPropagation();
                          dismissPinOnboarding();
                        }}
                      >
                        ×
                      </button>
                    </Tooltip>,
                    document.body
                  )}
                <span className="letter-meta-sep">·</span>
              </>
            )
          )}

          <span className="letter-paper__age" title={js_ago(new Date(activeLetter.timestamp), {format: "long"})}>
            {shortLetterAge(activeLetter.timestamp)}
          </span>
          <span className="letter-meta-sep">·</span>
          <span className="letter-paper__reads">
            <IoEyeOutline className="letter-paper__reads-eye" />
            <span>{formatReadsCount(
              getLetterId(activeLetter) === getLetterId(selectedLetter)
                ? displayedReads
                : Math.max(1, Number(activeLetter.reads) || 1)
            )}</span>
          </span>

          {(hasLocation ||
            (!activeLetter.preview && activeLetter._id)) && (
          <>
            <span className="letter-meta-sep">·</span>
            <span className="letter-paper__actions">
              {hasLocation && (
                isRevealed ? (
                  <a
                    className="letter-paper__locate"
                    href={letterLocationMap}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IoLocationOutline size="12px" />
                    <span>View on Map</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="letter-paper__locate"
                    onClick={handleLocateClick}
                  >
                    <IoLocationOutline size="12px" />
                    <span>Locate</span>
                  </button>
                )
              )}
              {hasLocation &&
                !activeLetter.preview &&
                activeLetter._id && (
                  <span className="letter-meta-sep">·</span>
                )}
              {!activeLetter.preview && activeLetter._id && (
                <button
                  type="button"
                  className="letter-paper__share"
                  onClick={() => {
                    preloadQrImage(letterQrUrl);
                    setShowShareDialog(true);
                  }}
                  aria-label="Share this letter"
                  title="Share letter"
                >
                  <IoShareSocialOutline size="12px" />
                  <span>Share</span>
                </button>
              )}
              {!activeLetter.preview && activeLetter._id && (
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
};

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
        className={`letter-modal-overlay${readMode ? " is-read-mode" : ""}${isClosing ? " is-folding-closed" : ""}${selectedLetter?.preview ? " is-preview-letter" : ""}${replyPaymentNotice?.type === "success" ? " is-reply-payment-success" : ""}`}
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={cancelPointerDrag}
      >
        <div className={`read-mode-stage${!readMode ? " letter-stage--modal" : ""}`}>
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
                  aria-label={isReplyPreviewing ? "Back to Editing" : "Close letter"}
                  title={isReplyPreviewing ? "Back to Editing" : "Fold and close letter"}
                  disabled={isClosing}
                >
                  <svg className="letter-fold-corner" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                    <path d="M 0 0 L 48 48 Q 24 42 3 47 Q 7 24 0 0 Z" />
                  </svg>
                </button>
              )}
              {opened && showFoldTip && (
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
          {readMode && opened && prerenderLetter && (
            <div
              className="read-mode-prerender-wrapper"
              aria-hidden="true"
              tabIndex={-1}
            >
              {renderPrerenderPaper(prerenderLetter)}
            </div>
          )}
          {opened && isReplyPreviewing && activeReplies.length > 0 && !showReplies && showReplySwipeTip && (
            <div
              className={`read-mode-tip reply-swipe-tip ${replyViewingIndex < 0 ? "reply-swipe-tip--to-reply" : "reply-swipe-tip--to-parent"}${isReplySwipeTipFading ? " is-fading-out" : ""}`}
              role="status"
              id={isReplyPreviewing ? "reply-preview-replies-cue" : "letter-replies-cue"}
              onClick={(e) => {
                e.stopPropagation();
                if (replySwipeTipTimerRef.current) clearTimeout(replySwipeTipTimerRef.current);
                if (replySwipeTipFadeTimerRef.current) clearTimeout(replySwipeTipFadeTimerRef.current);
                setShowReplySwipeTip(false);
                setIsReplySwipeTipFading(false);
                if (replyViewingIndex < 0) {
                  slideToReply(0);
                } else {
                  slideToParent();
                }
              }}
            >
              <div className="read-mode-tip__content">
                {replyViewingIndex < 0 ? (
                  <>
                    <span>
                      {activeReplies.length === 1 ? "Swipe to Read Reply" : "Swipe to Read Replies"}
                    </span>
                    <FaArrowRight className="read-mode-tip__arrow reply-navigation-arrow--right" aria-hidden="true" />
                  </>
                ) : (
                  <FaArrowLeft className="read-mode-tip__arrow reply-navigation-arrow--left" aria-hidden="true" />
                )}
              </div>
            </div>
          )}
        </div>

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

        {readMode && opened && readBoundary && (
          <div
            className={`read-mode-boundary-tip is-${readBoundary}`}
            role="status"
            aria-live="polite"
          >
            {readBoundary === "beginning"
              ? "This is where the letters begin"
              : "No more letters beyond this point"}
          </div>
        )}

        {opened && isReplyPreviewing && (
          <button
            type="button"
            className="reply-preview-banner reply-preview-banner__btn"
            aria-label="Back to Editing"
            onClick={(e) => {
              e.stopPropagation();
              exitReplyPreview();
            }}
          >
            <span>Back to Editing</span>
          </button>
        )}

        {opened && isReplyLetter && !replyParentLetter && (
          <>
            <button
              type="button"
              className="letter-reply-association"
              data-tooltip-id="reply-association-tooltip"
              data-tooltip-content={selectedLetter.parent_association?.available
                ? `This is a reply to the letter from ${selectedLetter.parent_association.from} to ${selectedLetter.parent_association.to}.`
                : "This is a reply to a letter that is no longer publicly available."}
              data-tooltip-place="right"
              aria-label="Show the letter this reply is associated with"
              onClick={() => {
                if (selectedLetter.parent_association?.available && selectedLetter.parent_letter_id) navigate(`/letters/${selectedLetter.parent_letter_id}`);
              }}
            >
              <BsReply /><span>Reply</span>
            </button>
            <Tooltip id="reply-association-tooltip" place="right" openOnClick />
          </>
        )}

        {opened && replyThreadIndex >= 0 && !showReplies && replyThreadBoundary && (
          <aside
            className={`read-mode-tip reply-swipe-tip reply-thread-tip ${replyThreadBoundary === "start" ? "reply-swipe-tip--to-parent" : "reply-swipe-tip--to-reply"}`}
            role="status"
            aria-label="Reply thread boundary"
          >
            <div className="read-mode-tip__content">
              <span>{replyThreadBoundary === "start" ? "Start of thread" : "Latest reply"}</span>
            </div>
          </aside>
        )}
        {opened && replyThreadIndex > 0 && !showReplies && showReplyThreadCues && !replyThreadBoundary && (
          <button
            type="button"
            className="read-mode-tip reply-swipe-tip reply-swipe-tip--to-parent reply-thread-arrow-tip"
            aria-label="View previous letter in reply thread"
            onClick={(event) => { event.stopPropagation(); slideThreadTo(replyThreadIndex - 1); }}
          >
            <FaArrowLeft className="read-mode-tip__arrow reply-navigation-arrow--left" aria-hidden="true" />
          </button>
        )}
        {opened && replyThreadIndex >= 0 && replyThreadIndex < replyThread.length - 1 && !showReplies && showReplyThreadCues && !replyThreadBoundary && (
          <button
            type="button"
            className="read-mode-tip reply-swipe-tip reply-swipe-tip--to-reply reply-thread-arrow-tip"
            aria-label="View next letter in reply thread"
            onClick={(event) => { event.stopPropagation(); slideThreadTo(replyThreadIndex + 1); }}
          >
            <FaArrowRight className="read-mode-tip__arrow reply-navigation-arrow--right" aria-hidden="true" />
          </button>
        )}
        {opened && isReplyLetter && replyThreadIndex < 0 && replyParentLetter && !showReplies && showReplyParentCue && (
          <div
            className={`read-mode-tip reply-swipe-tip ${showReplyParent ? "reply-swipe-tip--to-reply" : "reply-swipe-tip--to-parent"}`}
            role="status"
            aria-label={showReplyParent ? "Return to reply" : "View the letter this replies to"}
            onClick={(event) => {
              event.stopPropagation();
              setShowReplyParentCue(false);
              if (showReplyParent) slideBackToFeedReply();
              else slideToReplyParent();
            }}
          >
            <div className="read-mode-tip__content">
              {showReplyParent
                ? <FaArrowRight className="read-mode-tip__arrow reply-navigation-arrow--right" aria-hidden="true" />
                : <FaArrowLeft className="read-mode-tip__arrow reply-navigation-arrow--left" aria-hidden="true" />}
            </div>
          </div>
        )}

        {opened && showReplies && (
          <aside className="letter-replies-drawer" aria-label="Replies to this letter" onClick={event => event.stopPropagation()}>
            <div className="letter-replies-drawer__association"><BsReply /><span>Replying to <strong>{selectedLetter.to || "this letter"}</strong></span></div>
            <div className="letter-replies-drawer__head"><h2>Replies</h2><button type="button" onClick={() => setShowReplies(false)} aria-label="Close replies"><BsX /></button></div>
            {repliesLoading && <p role="status">Loading replies…</p>}
            {!repliesLoading && repliesError && <p role="alert">{repliesError}</p>}
            {!repliesLoading && !repliesError && replies.length === 0 && <p>Payment is still being confirmed. This reply will appear shortly.</p>}
            <div className="letter-replies-list">
              {replies.map(reply => (
                <article
                  key={reply._id}
                  id={`reply-${reply._id}`}
                  className={`${new URLSearchParams(location.search).get("reply") === String(reply._id) ? "is-targeted" : ""}${reply.isPreview ? " is-preview-reply" : ""}`}
                >
                  {reply.isPreview && <span className="reply-preview-badge">Your preview reply</span>}
                  {reply.photo?.url && (
                    <div className="reply-photo">
                      <img src={reply.photo.url} alt="Attached reply" />
                    </div>
                  )}
                  <p>{reply.message}</p>
                  <footer><span>{reply.alias || "Anonymous"}</span>{reply.timestamp && <time dateTime={reply.timestamp}>{shortLetterAge(reply.timestamp)}</time>}</footer>
                </article>
              ))}
            </div>
          </aside>
        )}

        {showLetterActionChooser && (
          <div className="letter-action-chooser-overlay" onClick={(event) => {event.stopPropagation(); setShowLetterActionChooser(false);}}>
            <section className="letter-action-chooser" role="dialog" aria-modal="true" aria-labelledby="letter-action-chooser-title" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="letter-action-chooser__close" onClick={() => setShowLetterActionChooser(false)} aria-label="Close letter options"><BsX /></button>
              <h2 id="letter-action-chooser-title">Choose an action</h2>
              <div className="letter-action-chooser__options">
                <button type="button" onClick={() => {setShowLetterActionChooser(false); setShowPinModal(true);}}>
                  <MdAlternateEmail aria-hidden="true" />
                  <span><strong>Email or Pin</strong><small>Make sure your words are felt</small></span>
                </button>
                <button type="button" onClick={() => {
                  setShowLetterActionChooser(false);
                  setShowReplyInfoDialog(true);
                }}>
                  <BsReply aria-hidden="true" />
                  <span><strong>Reply to the letter</strong><small>Write and send a reply</small></span>
                </button>
              </div>
            </section>
          </div>
        )}

        {showReplyInfoDialog && (
          <div
            className="reply-info-overlay"
            onClick={(event) => {
              event.stopPropagation();
              setShowReplyInfoDialog(false);
            }}
          >
            <section
              className="reply-info-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reply-info-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="reply-info-dialog__close"
                onClick={() => setShowReplyInfoDialog(false)}
                aria-label="Close reply information"
              >
                <BsX />
              </button>
              <h2 id="reply-info-title">How replies work</h2>
              <p className="reply-info-dialog__intro">
                Replies stay linked to the letter they answer. When someone opens either letter, the connected letters sit beside it so they can swipe left or right through the conversation.
              </p>

              <div className="reply-link-demo" aria-label="An original letter connected to its reply">
                <div className="reply-link-demo__track">
                  <article className="reply-link-demo__paper">
                    <strong>Original letter</strong>
                    <span />
                    <span />
                    <span />
                  </article>
                  <FaArrowRight className="reply-link-demo__arrow" aria-hidden="true" />
                  <article className="reply-link-demo__paper">
                    <strong>Reply</strong>
                    <span />
                    <span />
                    <span />
                  </article>
                </div>
              </div>

              <p className="reply-info-dialog__detail">
                If the conversation continues, each reply remains part of the same swipeable thread.
              </p>
              <div className="reply-info-dialog__actions">
                <button type="button" onClick={() => setShowReplyInfoDialog(false)}>Not now</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyInfoDialog(false);
                    if (isReplyPreviewing) exitReplyPreview();
                    setShowReplyComposer(true);
                  }}
                >
                  Write a reply
                </button>
              </div>
              <p className="reply-info-dialog__paid-note">
                This feature is paid to keep replies genuine and spam-free.
              </p>
            </section>
          </div>
        )}

        {showReplyComposer && (
          <ReplyComposer
            letter={activeContextLetter}
            onClose={() => {
              setShowReplyComposer(false);
              exitReplyPreview();
            }}
            onPreview={handleReplyPreview}
            isHidden={isReplyPreviewing}
          />
        )}

        {replyPaymentNotice && (
          <div className="reply-payment-result-overlay" onClick={(event) => {event.stopPropagation();}}>
            <section
              className={`reply-payment-result reply-payment-result--${replyPaymentNotice.type}`}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="reply-payment-result-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="reply-payment-result-title">{replyPaymentNotice.title}</h2>
              <p>{replyPaymentNotice.message}</p>
              <button type="button" onClick={() => {
                const wasSuccessful = replyPaymentNotice.type === "success";
                setReplyPaymentNotice(null);
                if (wasSuccessful) {
                  toggleDetailsModal();
                  navigate("/", {replace: true});
                }
              }}>Close</button>
            </section>
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

        {showPinModal && (
          <div onClick={(e) => e.stopPropagation()}>
            <PinLetterDialog
              onClose={() => setShowPinModal(false)}
              defaultUrl={letterPinUrl}
              letters={letters}
              hideUrlInput={true}
            />
          </div>
        )}

        {showLocationAdConfirm && (
          <div
            className="letter-location-ad-overlay"
            onClick={(event) => {
              event.stopPropagation();
              setShowLocationAdConfirm(false);
            }}
          >
            <section
              className="letter-location-ad-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="letter-location-ad-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="letter-location-ad-title-row">
                <IoLocationOutline aria-hidden="true" />
                <h2 id="letter-location-ad-title">
                  Watch an ad to see letter origin?
                </h2>
              </div>
              <p>The origin will be available when you return to this letter.</p>
              <div className="letter-location-ad-actions">
                <button type="button" onClick={() => setShowLocationAdConfirm(false)}>
                  Not now
                </button>
                <button type="button" onClick={confirmLocationAd} autoFocus>
                  Yes
                </button>
              </div>
            </section>
          </div>
        )}

        {showQrAdConfirm && (
          <div
            className="letter-location-ad-overlay"
            onClick={(event) => {
              event.stopPropagation();
              setShowQrAdConfirm(false);
            }}
          >
            <section
              className="letter-location-ad-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="letter-qr-ad-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="letter-location-ad-title-row">
                <IoQrCodeOutline aria-hidden="true" />
                <h2 id="letter-qr-ad-title">Watch an ad to download this QR code?</h2>
              </div>
              <p>Your download will begin after the ad opens.</p>
              <div className="letter-location-ad-actions">
                <button type="button" onClick={() => setShowQrAdConfirm(false)}>
                  Not now
                </button>
                <button type="button" onClick={confirmQrDownloadAd} autoFocus>
                  Yes
                </button>
              </div>
            </section>
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
                  <button type="button" onClick={() => handleDownloadImage(true)} disabled={isDownloadingImage || !shareTargetHasAttachment}><strong>With attachments</strong><small>{shareTargetHasAttachment ? 'Include photo and link previews' : 'This letter has no attachments'}</small></button>
                  {isDownloadingImage && <span className="letter-image-progress" role="status"><span className="letter-image-spinner" aria-hidden="true" />Preparing your image…</span>}
                </div>
              )}

              {showQrCode && (
                <div className="letter-share-dialog__qr">
                  <div className="letter-share-dialog__qr-code">
                    <img
                      key={letterQrUrl}
                      className="letter-share-dialog__qr-image"
                      src={letterQrUrl}
                      alt="QR code for this letter"
                      width="240"
                      height="240"
                      referrerPolicy="no-referrer"
                    />
                    <span className="letter-share-dialog__qr-mark" aria-hidden="true">
                      <img src="/ltc_favicon.png" alt="" />
                    </span>
                  </div>
                  <span>Scan to open this letter</span>
                  <button
                    type="button"
                    className="letter-share-dialog__download"
                    onClick={() => setShowQrAdConfirm(true)}
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

        {showPhotoViewer && activeContextLetter.photo?.url && (
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
              src={getOptimizedPhotoUrl(activeContextLetter.photo.url, 1800)}
              alt={`Attached to the letter from ${activeContextLetter.from} to ${activeContextLetter.to}`}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}
      </div>
    )
  );
}

export default DetailsModal;
