import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import OriginsView from "./OriginsView";
import Header from "./Header";
import Footer from "./Footer";
import AddModal from "./AddModal";
import Letter from "./Letter";
import AdComponent from "./AdComponent";
import AdsterraNativeBanner from "./AdsterraNativeBanner";
import DetailsModal from "./DetailsModal";
import Firefly3D from "./Firefly3D";
import { AiFillMessage } from "react-icons/ai";
import Lottie from "react-lottie-player";
import ghost1 from "../lotties/ghost1.json";
import under_construction from "../lotties/under_construction.json";
import empty from "../lotties/empty2.json";
import lettersToCasperLogo from "../lotties/ltc_logo_1.webp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MailboxLoading from "./MailboxLoading";
import {
  IoArrowUpOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoHelpCircleOutline,
  IoFlameOutline,
  IoHeartOutline,
  IoImageOutline,
  IoInformationCircleOutline,
  IoMailOpenOutline,
  IoMailUnreadOutline,
  IoNewspaperOutline,
  IoMoonOutline,
  IoLocationOutline,
  IoReaderOutline,
  IoSunnyOutline,
  IoShieldCheckmarkOutline,
  IoServerOutline,
} from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { TbChristmasTree } from "react-icons/tb";
import { RiAdvertisementLine } from "react-icons/ri";
import { render_url, api_key } from "../data/keys";
import tc from "thousands-counter";
import { useFeedVirtualizer } from "../hooks/useFeedVirtualizer";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/App.css";
import daysUntilChristmasPH from "./daysUntilChristmasPh";

const UI_ANNOUNCEMENT_KEY = "ltc-ui-update-announcement-v1";
const FIREFLY_ENABLED = false;
const CHRISTMAS_SNOWFLAKES = Array.from({length: 30}, (_, index) => ({
  left: (index * 37 + 11) % 101,
  size: 2.4 + ((index * 13) % 36) / 10,
  duration: 6.8 + ((index * 17) % 55) / 10,
  delay: -((index * 29) % 120) / 10,
  drift: -30 + ((index * 43) % 61),
  sway: -16 + ((index * 31) % 33),
  opacity: 0.58 + ((index * 19) % 37) / 100,
  blur: ((index * 7) % 10) / 10,
}));

const formatCountry = (country) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(country);
  } catch (error) {
    return country;
  }
};

export const READ_MODE_ENABLED = false;

function Home({ initialReadMode = false, readModeEnabled = READ_MODE_ENABLED } = {}) {
  const navigate = useNavigate();
  const { messageId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [letters, setLetters] = useState({
    messages: [],
    counts: { approved: 0, unapproved: 0 },
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [feedPage, setFeedPage] = useState(0);
  const [showOrigins, setShowOrigins] = useState(false);
  const closeOrigins = useCallback(() => setShowOrigins(false), []);
  const [countPopover, setCountPopover] = useState("");
  const countPopoverRef = useRef(null);
  const countTriggerRef = useRef(null);
  const closeCountPopover = () => {
    setCountPopover("");
    countTriggerRef.current?.focus();
  };
  const toggleCountPopover = (kind, event) => {
    countTriggerRef.current = event.currentTarget;
    setCountPopover(current => current === kind ? "" : kind);
    setShowOrigins(false);
    setShowAnnouncements(false);
  };
  useEffect(() => {
    if (!countPopover) return;
    const panel = countPopoverRef.current;
    const trigger = countTriggerRef.current;
    const positionArrow = () => {
      const box = panel.getBoundingClientRect();
      const anchor = trigger.getBoundingClientRect();
      panel.style.setProperty('--count-arrow', `${Math.max(15, Math.min(box.width - 15, anchor.left + anchor.width / 2 - box.left))}px`);
    };
    positionArrow();
    panel.querySelector('button')?.focus();
    const dismissOutside = event => {
      if (!panel.contains(event.target) && !trigger.contains(event.target)) setCountPopover("");
    };
    const dismissEscape = event => {
      if (event.key === 'Escape') { setCountPopover(""); trigger.focus(); }
    };
    const observer = new ResizeObserver(positionArrow);
    observer.observe(panel);
    observer.observe(trigger);
    window.addEventListener('resize', positionArrow);
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissEscape);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', positionArrow);
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissEscape);
    };
  }, [countPopover]);

  const [newLetter, setNewLetter] = useState({
    from: "",
    to: "",
    message: "",
    approve: false,
  });
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(1);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [fireflyVisit, setFireflyVisit] = useState(null);
  const [showBurnLetter, setShowBurnLetter] = useState(false);
  const [burnKey, setBurnKey] = useState("");
  const [burnStatus, setBurnStatus] = useState({type: "idle", message: ""});
  const [isBurning, setIsBurning] = useState(false);
  const [letterGridColumns, setLetterGridColumns] = useState(() => {
    if (window.innerWidth > 1200) return 6;
    if (window.innerWidth > 900) return 4;
    return 3;
  });
  const [showUiAnnouncement, setShowUiAnnouncement] = useState(() => {
    try {
      return localStorage.getItem(UI_ANNOUNCEMENT_KEY) !== "seen";
    } catch (error) {
      return true;
    }
  });
  const [nightShift, setNightShift] = useState(() => {
    try {
      const saved = localStorage.getItem("nightShift");
      if (saved !== null) return saved === "true";
      return !!(
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch (e) {
      return false;
    }
  });
  const [isLateNight, setIsLateNight] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 23 || hour < 5;
  });
  const [nightTipDismissed, setNightTipDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("nightModeTipDismissed") === "true";
    } catch (error) {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("night-shift", nightShift);
    try {
      localStorage.setItem("nightShift", String(nightShift));
    } catch (e) {
      /* storage unavailable */
    }
  }, [nightShift]);

  const [readMode, setReadMode] = useState(() => Boolean(readModeEnabled && initialReadMode));

  useEffect(() => {
    try {
      localStorage.removeItem("readMode");
    } catch (e) {
      /* storage unavailable */
    }
  }, []);

  const [showReadModeModal, setShowReadModeModal] = useState(false);
  const isReadModeActive = Boolean(readModeEnabled && showDetailsModal && readMode);

  const [readModeTipDismissed, setReadModeTipDismissed] = useState(() => {
    try {
      return localStorage.getItem("readModeTipDismissed") === "true";
    } catch (e) {
      return false;
    }
  });

  const dismissReadModeTip = useCallback(() => {
    setReadModeTipDismissed(true);
    try {
      localStorage.setItem("readModeTipDismissed", "true");
    } catch (e) {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!showReadModeModal) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowReadModeModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showReadModeModal]);

  useEffect(() => {
    const updateLateNight = () => {
      const hour = new Date().getHours();
      setIsLateNight(hour >= 23 || hour < 5);
    };
    const intervalId = window.setInterval(updateLateNight, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  const dismissNightModeTip = () => {
    setNightTipDismissed(true);
    try {
      sessionStorage.setItem("nightModeTipDismissed", "true");
    } catch (error) {
      /* storage unavailable */
    }
  };
  const scrollFrame = useRef(null);
  const feedPagesRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollFrame.current !== null) {
        return;
      }

      scrollFrame.current = window.requestAnimationFrame(() => {
        const isDesktop = typeof window !== "undefined" && window.innerWidth > 768;
        const exitCompactThreshold = isDesktop ? 25 : 60;
        setIsHeaderCompact((isCompact) =>
          isCompact ? window.scrollY > exitCompactThreshold : window.scrollY > 160
        );
        scrollFrame.current = null;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollFrame.current !== null) {
        window.cancelAnimationFrame(scrollFrame.current);
        scrollFrame.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!FIREFLY_ENABLED || loading !== 0 || isReadModeActive) return undefined;

    let scheduleTimer;
    let visitTimer;
    let cancelled = false;
    const isTestingLocally = process.env.NODE_ENV !== "production";

    const scheduleVisit = (firstVisit = false) => {
      const delay = isTestingLocally
        ? firstVisit ? 1200 : 3500
        : firstVisit
          ? 12000 + Math.random() * 18000
          : 45000 + Math.random() * 50000;
      scheduleTimer = window.setTimeout(beginVisit, delay);
    };

    const beginVisit = () => {
      if (cancelled) return;
      const visibleCards = Array.from(
        document.querySelectorAll(".letters-container .letter-card")
      ).map((card) => card.getBoundingClientRect()).filter(
        (rect) => rect.bottom > 80 && rect.top < window.innerHeight - 55
      );

      if (visibleCards.length === 0) {
        scheduleVisit(false);
        return;
      }

      const card = visibleCards[Math.floor(Math.random() * visibleCards.length)];
      const entersFromLeft = Math.random() > 0.5;
      const startX = entersFromLeft ? -36 : window.innerWidth + 36;
      const startY = 80 + Math.random() * Math.max(100, window.innerHeight - 180);
      const restX = card.left + (Math.random() > 0.5 ? card.width * 0.18 : card.width * 0.78);
      const restY = card.top + 5;
      const exitX = entersFromLeft ? window.innerWidth + 40 : -40;
      const exitY = 55 + Math.random() * Math.max(100, window.innerHeight - 140);
      const duration = isTestingLocally ? 8200 : 9800;

      setFireflyVisit({
        id: Date.now(), startX, startY, restX, restY, exitX, exitY,
        direction: entersFromLeft ? 1 : -1,
        curveOneX: window.innerWidth * (entersFromLeft ? 0.24 : 0.76),
        curveOneY: Math.max(50, restY - 85 - Math.random() * 70),
        curveTwoX: restX + (entersFromLeft ? -45 : 45),
        curveTwoY: restY + 35 + Math.random() * 40,
        duration,
      });

      visitTimer = window.setTimeout(() => {
        setFireflyVisit(null);
        scheduleVisit(false);
      }, duration);
    };

    scheduleVisit(true);
    return () => {
      cancelled = true;
      window.clearTimeout(scheduleTimer);
      window.clearTimeout(visitTimer);
    };
  }, [loading, isReadModeActive]);

  useEffect(() => {
    const updateLetterGridColumns = () => {
      const nextColumns =
        window.innerWidth > 1200 ? 6 : window.innerWidth > 900 ? 4 : 3;
      setLetterGridColumns(nextColumns);
    };

    window.addEventListener("resize", updateLetterGridColumns, {
      passive: true,
    });
    return () => window.removeEventListener("resize", updateLetterGridColumns);
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const [isFeatured, setIsFeatured] = useState(false);
  const [goBackToNotFeatured, setGoBackToNotFeatured] = useState(false);
  const [daysLeftXmas, setDaysLeftXmas] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newDaysLeft = daysUntilChristmasPH();
      setDaysLeftXmas(newDaysLeft);
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  const fetchFeatured = async () => {
    if (isFeatured) {
      // Re-fetch the initial letters
      fetchLetters();
      setIsFeatured(false);
      return;
    }

    try {
      const response = await fetch(`${render_url}/featured`, {
        headers: {
          "x-api-key": api_key,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch featured letters");
      }
      const data = await response.json();
      setLoading(0);
      setLetters(data);
      setIsFeatured(true);
      setGoBackToNotFeatured(true);
    } catch (error) {
      console.error("Error fetching featured letters:", error);
      setLoading(2);
    }
  };

  const fetchMoreData = async () => {
    if (isReadModeActive) return;
    try {
      const response = await fetch(
        `${render_url}?offset=${letters.messages.length}&limit=50`,
        {
          headers: {
            "x-api-key": api_key,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch more letters");
      }
      const newData = await response.json();
      setTimeout(() => {
        setLetters((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, ...newData.messages],
        }));
        setLoading(0);
      }, 1500);
    } catch (error) {
      console.error("Error fetching more letters:", error);
      setLoading(2);
    }
  };

  const fetchLetters = async () => {
    if (goBackToNotFeatured) {
      setGoBackToNotFeatured(false);
    } else {
      setLoading(1);
    }
    try {
      const response = await fetch(`${render_url}?offset=0&limit=150`, {
        headers: {
          "x-api-key": api_key,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch letters");
      }
      const data = await response.json();
      setLetters(data);
      setLoading(0);
    } catch (error) {
      console.error("Error fetching letters:", error);
      setLoading(2);
    }
  };

  useEffect(() => {
    fetchLetters();
    // eslint-disable-next-line
  }, []);

  const [locations, setLocations] = useState([]);
  const [internationalOrigins, setInternationalOrigins] = useState([]);

  useEffect(() => {
    const fetchTopSenderLocations = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        const response = await fetch(`${render_url}/top-sender-locations`, {
          headers: {
            "x-api-key": api_key,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch top sender locations");
        }
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching top sender locations:", error);
      }
    };

    fetchTopSenderLocations();
  }, []);

  useEffect(() => {
    const fetchInternationalOrigins = async () => {
      try {
        const response = await fetch(`${render_url}/international-origins`, {
          headers: {
            "x-api-key": api_key,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setInternationalOrigins(data);
      } catch (error) {
        console.error("Error fetching international origins:", error);
      }
    };

    fetchInternationalOrigins();
  }, []);

  const getResponseError = async (response, stage) => {
    let serverMessage = "";

    try {
      const body = await response.clone().json();
      serverMessage = body?.error?.message || body?.error || body?.message || "";
    } catch (error) {
      try {
        serverMessage = await response.text();
      } catch (readError) {
        serverMessage = "";
      }
    }

    return `${stage} failed (HTTP ${response.status}${
      response.statusText ? ` ${response.statusText}` : ""
    })${serverMessage ? `: ${serverMessage}` : ""}`;
  };

  const handleAddLetter = async (letterData, onProgress = () => {}) => {
    try {
      const { from, to, message, photoFile } = letterData;

      if (from.trim() === "" || to.trim() === "" || message.trim() === "") {
        return false;
      }

      let photo;
      if (photoFile) {
        onProgress({percent: 12, label: "Reading photo…"});
        const photoDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Could not read the selected photo"));
          reader.readAsDataURL(photoFile);
        });

        onProgress({percent: 28, label: "Uploading photo…"});

        const uploadResponse = await fetch(
          `${render_url}/photo-upload`,
          {
            method: "POST",
            headers: {
              "x-api-key": api_key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({file: photoDataUrl}),
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(
            await getResponseError(uploadResponse, "Photo upload")
          );
        }

        const uploadResult = await uploadResponse.json();
        photo = uploadResult.photo;
        onProgress({percent: 82, label: "Photo optimized…"});
      } else {
        onProgress({percent: 70, label: "Preparing letter…"});
      }

      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });

      const messageData = {
        from,
        to,
        message,
        approve: false,
        timestamp,
        ...(photo ? {photo} : {}),
      };

      const response = await fetch(render_url, {
        method: "POST",
        headers: {
          "x-api-key": api_key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      onProgress({percent: 92, label: "Saving letter…"});

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Letter submission"));
      } else {
        const submission = await response.json();
        setLetters((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, messageData],
        }));
        setNewLetter({ from: "", to: "", message: "" });
        onProgress({percent: 100, label: "Letter sent"});
        notify_success();
        return submission;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Unknown error while submitting the letter";
      notify_error(errorMessage);
      console.error("Error adding message:", error);
      return false;
    }
  };

  const handleBurnLetter = async event => {
    event.preventDefault();
    const normalizedKey = burnKey.trim();
    if (!normalizedKey) {
      setBurnStatus({type: "error", message: "Enter the private burn key for your letter."});
      return;
    }

    setIsBurning(true);
    setBurnStatus({type: "idle", message: ""});
    try {
      const response = await fetch(`${render_url}/burn`, {
        method: "POST",
        headers: {"x-api-key": api_key, "Content-Type": "application/json"},
        body: JSON.stringify({burnKey: normalizedKey}),
      });
      if (!response.ok) throw new Error(await getResponseError(response, "Burn request"));
      const result = await response.json();
      setLetters(previous => ({
        ...previous,
        messages: previous.messages.filter(letter => letter._id !== result.letterId),
        counts: {
          ...previous.counts,
          approved: Math.max(0, previous.counts.approved - 1),
          unapproved: previous.counts.unapproved + 1,
        },
      }));
      setBurnKey("");
      setBurnStatus({type: "success", message: "Your letter has been burned and is no longer public."});
    } catch (error) {
      setBurnStatus({type: "error", message: error.message || "The letter could not be burned."});
    } finally {
      setIsBurning(false);
    }
  };

  const toggleDetailsModal = () => {
    if (showDetailsModal && messageId) {
      navigate("/");
    }
    setShowDetailsModal(!showDetailsModal);
  };

  useEffect(() => {
    if (!messageId) {
      setShowDetailsModal(false);
      return;
    }

    const currentSelectedId =
      typeof selectedLetter?._id === "string"
        ? selectedLetter._id
        : selectedLetter?._id?.$oid
        ? selectedLetter._id.$oid
        : String(selectedLetter?._id || "");
    if (selectedLetter && currentSelectedId === String(messageId)) {
      return;
    }

    const fetchLinkedLetter = async () => {
      try {
        const response = await fetch(
          `${render_url}/public/${encodeURIComponent(messageId)}`,
          {
            headers: {
              "x-api-key": api_key,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Letter not found");
        }

        const data = await response.json();
        setSelectedLetter(data.message);
        setShowDetailsModal(true);
      } catch (error) {
        console.error("Error fetching linked letter:", error);
        setSelectedLetter(null);
        setShowDetailsModal(false);
        toast.error("This letter could not be found or is not available.");
      }
    };

    fetchLinkedLetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId]);

  const scrollToTop = () => {
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const dismissUiAnnouncement = () => {
    try {
      localStorage.setItem(UI_ANNOUNCEMENT_KEY, "seen");
    } catch (error) {
      /* The dialog can still be dismissed when browser storage is unavailable. */
    }
    setShowUiAnnouncement(false);
  };

  const notify_error = (details) =>
    toast.error(
      <div>
        <strong>Failed to submit letter</strong>
        {details && <div className="submission-error-details">{details}</div>}
      </div>,
      {
      position: "top-center",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      }
    );

  const notify_success = () =>
    toast.success("Successfully Sent for Approval", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  const [searchedLetters, setSearchedLetters] = useState({
    messages: [],
    counts: { approved: 0, unapproved: 0 },
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      setIsSearching(false);
      setSearchedLetters({messages: [], counts: {approved: 0, unapproved: 0}});
      return undefined;
    }

    const controller = new AbortController();
    setIsSearching(true);
    const debounceTimer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${render_url}?search=${encodeURIComponent(query)}`,
          {
            headers: {"x-api-key": api_key},
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("Failed to search letters");
        const data = await response.json();
        setSearchedLetters(data);
        setIsSearching(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error searching letters:", error);
          setSearchedLetters({messages: [], counts: {approved: 0, unapproved: 0}});
          setIsSearching(false);
        }
      }
    }, 600);

    return () => {
      window.clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchTerm]);

  const searchedResults = searchedLetters.messages.filter((letter) => {
    const { from, to, message } = letter;
    const lowerCasedSearchTerm = searchTerm.toLowerCase();
    return (
      from.toLowerCase().includes(lowerCasedSearchTerm) ||
      to.toLowerCase().includes(lowerCasedSearchTerm) ||
      message.toLowerCase().includes(lowerCasedSearchTerm)
    );
  });

  const isSearchActive = searchTerm.trim() !== "";
  const activeLetters = useMemo(() => {
    const source = isSearchActive ? searchedResults : letters.messages;
    return source.filter((letter) => letter.approve);
  }, [isSearchActive, searchedResults, letters.messages]);

  const feedItems = useMemo(() => {
    if (activeLetters.length === 0) return [];

    const warmthScores = activeLetters.map((letter) => {
      const reads = Math.max(0, Number(letter.reads) || 0);
      const reactions = ["love", "sad"].reduce(
        (total, key) => total + Math.max(0, Number(letter.echoes?.[key]) || 0),
        0
      );
      return Math.log2(reads + 1) + reactions * 3;
    });
    const maxWarmthScore = Math.max(0, ...warmthScores);

    const items = [];
    if (!isSearchActive) {
      items.push({ type: "featured", key: "featured-card" });
    }

    const leadingCards = isSearchActive ? 0 : 1;
    const firstAdAfter =
      Math.round((60 + leadingCards) / letterGridColumns) *
        letterGridColumns -
      leadingCards;
    const followingAdInterval =
      Math.round(60 / letterGridColumns) * letterGridColumns;

    activeLetters.forEach((letter, index) => {
      const letterNumber = index + 1;
      items.push({
        type: "letter",
        key: letter._id || `letter-${index}`,
        letter,
        maxWarmthScore,
      });

      const shouldInsertAd =
        letterNumber >= firstAdAfter &&
        (letterNumber - firstAdAfter) % followingAdInterval === 0;

      if (shouldInsertAd) {
        const adIntervalIndex =
          (letterNumber - firstAdAfter) / followingAdInterval;
        items.push({
          type: "ad",
          key: `letter-ad-${letterNumber}`,
          variant: adIntervalIndex % 2 === 0 ? "adcomponent" : "adsterra",
        });
      }
    });

    return items;
  }, [activeLetters, isSearchActive, letterGridColumns]);

  const feedContainerRef = useRef(null);
  const hasMoreLetters =
    !isFeatured &&
    !isSearchActive &&
    letters.messages.length < letters.counts.approved;

  const {
    virtualItems,
    topSpacerHeight,
    bottomSpacerHeight,
  } = useFeedVirtualizer({
    items: feedItems,
    columns: letterGridColumns,
    isSuspended: isReadModeActive,
    containerRef: feedContainerRef,
    onNearEnd: fetchMoreData,
    hasMore: hasMoreLetters,
    overscanRows: 2,
  });

  const goToFeedPage = page => {
    const nextPage = Math.max(0, Math.min(4, page));
    setFeedPage(nextPage);
    feedPagesRef.current?.scrollTo({
      left: feedPagesRef.current.clientWidth * nextPage,
      behavior: "smooth",
    });
  };

  const handleFeedScroll = event => {
    const pageWidth = event.currentTarget.clientWidth;
    if (!pageWidth) return;
    setFeedPage(Math.max(0, Math.min(4, Math.round(event.currentTarget.scrollLeft / pageWidth))));
  };

  const christmasCountdownMatch = typeof daysLeftXmas === "string"
    ? daysLeftXmas.match(/^(\d+) days?, (\d+) hours?, (\d+) minutes?, (\d+) seconds?/)
    : null;
  const christmasCountdownParts = christmasCountdownMatch
    ? [
        [christmasCountdownMatch[1], "Days"],
        [christmasCountdownMatch[2], "Hours"],
        [christmasCountdownMatch[3], "Minutes"],
        [christmasCountdownMatch[4], "Seconds"],
      ]
    : null;

  return (
    <div className="app">
      <div
        className={`home-toolbar${isHeaderCompact ? " is-compact" : ""}`}
      >
        <Header
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          isCompact={isHeaderCompact}
        />
        <div className="add-button">
        <button className="btn btn-primary big-button" onClick={toggleAddModal}>
          <AiFillMessage className="button-icon" size="20px" />
          <span className="leave-letter-label">Leave a Letter</span>
        </button>
        <div className="information-panel">
          <div className="messages-count" aria-label="Letter information">
          <button
            type="button"
            className="message-stat message-stat--count count-popover-trigger"
            aria-label={`${letters.counts.approved} open letters`}
            aria-haspopup="dialog"
            aria-expanded={countPopover === "opened"}
            aria-controls={countPopover === "opened" ? "letter-count-popover" : undefined}
            onClick={event => toggleCountPopover("opened", event)}
          >
            <IoMailOpenOutline size={21} />
            <span className="message-stat__count">{tc(letters.counts.approved)}</span>
          </button>
          <button
            type="button"
            className="message-stat toolbar-trigger"
            aria-label="Open letter origins"
            aria-expanded={showOrigins}
            aria-controls="origins-panel"
            onClick={() => {
              setShowOrigins(!showOrigins);
              setShowAnnouncements(false);
            }}
          >
            <CiLocationOn size={21} />
            <span>Origins</span>
          </button>
          <button
            type="button"
            className="message-stat toolbar-trigger burn-letter-trigger"
            aria-label="Burn one of your letters"
            aria-expanded={showBurnLetter}
            onClick={() => {
              setShowBurnLetter(true);
              setShowOrigins(false);
              setShowAnnouncements(false);
              setBurnStatus({type: "idle", message: ""});
            }}
          >
            <IoFlameOutline size={21} />
            <span>Burn</span>
          </button>
          <button
            type="button"
            className="message-stat toolbar-trigger"
            aria-label="Open updates feed"
            aria-expanded={showAnnouncements}
            aria-controls="announcements-panel"
            onClick={() => {
              if (!showAnnouncements) setFeedPage(0);
              setShowAnnouncements(!showAnnouncements);
              setShowOrigins(false);
            }}
          >
            <IoNewspaperOutline size={21} />
            <span>Feed</span>
          </button>
          <button
            type="button"
            className="message-stat message-stat--count count-popover-trigger"
            aria-label={`${letters.counts.unapproved} pending letters`}
            aria-haspopup="dialog"
            aria-expanded={countPopover === "pending"}
            aria-controls={countPopover === "pending" ? "letter-count-popover" : undefined}
            onClick={event => toggleCountPopover("pending", event)}
          >
            <IoMailUnreadOutline size={21} />
            <span className="message-stat__count">{tc(letters.counts.unapproved)}</span>
          </button>
          <button
            type="button"
            className="message-stat toolbar-trigger night-shift-toggle"
            aria-pressed={nightShift}
            aria-label="Toggle night shift"
            onClick={() => setNightShift((value) => !value)}
          >
            {nightShift ? (
              <IoSunnyOutline size={21} />
            ) : (
              <IoMoonOutline size={21} />
            )}
          </button>
          </div>
          {countPopover && (
            <section id="letter-count-popover" ref={countPopoverRef}
              className={`letter-count-popover is-${countPopover}`} role="dialog"
              aria-labelledby="letter-count-title" aria-describedby="letter-count-description">
              <button type="button" className="letter-count-popover__close" aria-label="Close letter count" onClick={closeCountPopover}>×</button>
              <span className="letter-count-popover__icon" aria-hidden="true">
                {countPopover === "opened" ? <IoMailOpenOutline /> : <IoMailUnreadOutline />}
              </span>
              <h2 id="letter-count-title">{countPopover === "opened" ? "Number of Open Letters" : "Number of Pending Letters for Approval"}</h2>
              <strong className="letter-count-popover__number">{Number(countPopover === "opened" ? letters.counts.approved : letters.counts.unapproved).toLocaleString()}</strong>
              <p id="letter-count-description">{countPopover === "opened"
                ? "Search through these letters, maybe someone wrote a letter for you."
                : "Once your letter is approved and published, you can share it with others."}</p>
            </section>
          )}
          {isLateNight && !nightShift && !nightTipDismissed && (
            <aside className="night-mode-suggestion" role="status">
              <button
                type="button"
                className="night-mode-suggestion__close"
                onClick={dismissNightModeTip}
                aria-label="Dismiss Night Mode suggestion"
              >
                ×
              </button>
              <strong>Still up?</strong>
              <span>Night Mode may feel easier on your eyes.</span>
              <button
                type="button"
                className="night-mode-suggestion__action"
                onClick={() => setNightShift(true)}
              >
                Turn on Night Mode
              </button>
            </aside>
          )}
          {showOrigins && (
            <OriginsView onClose={closeOrigins}>
              <h2>Top Letter Origins</h2>
              <p className="origins-caption">
                Ranked from the most letters to the least
              </p>
              {locations.length > 0 ? (
                <ol className="origins-list">
                  {locations.map((location, index) => (
                    <li key={`${location}-${index}`}>
                      <span className="origin-rank">#{index + 1}</span>
                      <span>{location}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="announcements-empty">Origins are loading...</p>
              )}
              {internationalOrigins.length > 0 && (
                <div className="international-origins">
                  <strong>Letters from around the world</strong>
                  <ul>
                    {internationalOrigins.map((origin, index) => (
                      <li key={`${origin.country}-${origin.city}-${index}`}>
                        <span>
                          {origin.city
                            ? `${origin.city}, ${formatCountry(origin.country)}`
                            : formatCountry(origin.country)}
                        </span>
                        <span>{origin.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </OriginsView>
          )}
          {showAnnouncements && (
            <div
              id="announcements-panel"
              className="announcements-panel feed-panel"
              role="region"
              aria-label="Letters to Casper update report"
            >
              <button
                type="button"
                className="announcement-close"
                aria-label="Close feed"
                onClick={() => setShowAnnouncements(false)}
              >
                &times;
              </button>
              <header className="feed-report__masthead">
                <h2>Feed</h2>
                <div><time dateTime="2026-09">September 2026</time><span>Issue 01</span></div>
              </header>

              <div className="feed-report__pages" ref={feedPagesRef} onScroll={handleFeedScroll}>
                <section className="feed-report__page" aria-label="About our advertisements, page 1 of 5">
                  <div className="feed-report__lead">
                    <span>Important Notice</span>
                    <h3>A note about our advertisements.</h3>
                    <p>Transparency matters to us. Here is what you should know about the ads shown across Letters to Casper, our stance on gambling, and why advertisements are present.</p>
                  </div>
                  <div className="feed-report__updates">
                    <article className="feed-report__story is-featured">
                      <IoShieldCheckmarkOutline aria-hidden="true" />
                      <div>
                        <span className="feed-report__kicker">Zero endorsement</span>
                        <h4>We do not promote gambling</h4>
                        <p>We explicitly do not promote, endorse, or encourage gambling in any form. Letters to Casper does not partner with or recommend any betting, casino, or gambling services.</p>
                      </div>
                    </article>
                    <article className="feed-report__story">
                      <RiAdvertisementLine aria-hidden="true" />
                      <div>
                        <span className="feed-report__kicker">Third-party networks</span>
                        <h4>Ads shown are not controlled by us</h4>
                        <p>Advertisements are delivered automatically by external third-party ad networks. Because they are automated, we do not directly control or select which specific ads appear.</p>
                      </div>
                    </article>
                    <article className="feed-report__story">
                      <IoServerOutline aria-hidden="true" />
                      <div>
                        <span className="feed-report__kicker">Site sustenance</span>
                        <h4>Why ads are present</h4>
                        <p>We don't endorse the ads on your screen. They are only here to keep our servers running and our platform free for the community.</p>
                      </div>
                    </article>
                  </div>
                </section>

                <section className="feed-report__page" aria-label="Recent updates, page 2 of 5">
                  <div className="feed-report__lead">
                    <span>From the desk</span>
                    <h3>A gentler way to read, feel, and let go.</h3>
                    <p>We’re moving into a fresh phase. Every letter can now carry a little more life while keeping the experience quiet and personal.</p>
                  </div>
                  <div className="feed-report__updates">
                    {readModeEnabled && (
                      <article className="feed-report__story is-featured">
                        <IoReaderOutline aria-hidden="true" />
                        <div>
                          <span className="feed-report__kicker">Newest addition · Read Mode</span>
                          <h4>A calmer way to browse</h4>
                          <p>Turn on Read Mode to view letters immediately without typing delays, and swipe or scroll up and down to browse continuously.</p>
                        </div>
                      </article>
                    )}
                    <article className="feed-report__story">
                      <IoHeartOutline aria-hidden="true" />
                      <div><span className="feed-report__kicker">New · Reactions</span><h4>Leave a feeling behind</h4><p>Respond with Love or Sad. Your choice is remembered.</p></div>
                    </article>
                    <article className="feed-report__story">
                      <IoFlameOutline aria-hidden="true" />
                      <div><span className="feed-report__kicker">New · Burn keys</span><h4>Your letter, your choice</h4><p>New letters receive a private key you can use to remove your letter after approval whenever you’re ready to let it go.</p></div>
                    </article>
                    <article className="feed-report__story is-wide">
                      <IoInformationCircleOutline aria-hidden="true" />
                      <div><span className="feed-report__kicker">Design note</span><h4>Letters that quietly glow</h4><p>Borders respond to their warmth: gold for reads, pink for Love, and blue for Sad.</p></div>
                    </article>
                  </div>
                </section>

                <section className="feed-report__page" aria-label="Recent updates, page 3 of 5">
                  <div className="feed-report__lead">
                    <span>More ways to share</span>
                    <h3>Give your words a place and a picture.</h3>
                    <p>A few thoughtful additions now make letters feel closer to the moments and places behind them.</p>
                  </div>
                  <div className="feed-report__updates">
                    <article className="feed-report__story is-featured">
                      <IoImageOutline aria-hidden="true" />
                      <div><span className="feed-report__kicker">Now available · Photos</span><h4>Attach a memory</h4><p>You can optionally add one photo to a new letter. Preview it before sending and open it full screen while reading.</p></div>
                    </article>
                    <article className="feed-report__story is-wide">
                      <IoLocationOutline aria-hidden="true" />
                      <div><span className="feed-report__kicker">Explore · Origins</span><h4>See where it came from</h4><p>When location is available, use Locate on an open letter to view its general origin on the map.</p></div>
                    </article>
                  </div>
                </section>

                <section className="feed-report__page feed-report__page--care" aria-label="Community care and support, page 4 of 5">
                  <div className="feed-report__lead">
                    <span>Community care</span>
                    <h3>A little support can make the page feel lighter.</h3>
                    <p>Resources are here when you need help, while ads quietly help keep Letters to Casper available to everyone.</p>
                  </div>
                  <div className="feed-report__updates">
                    <Link className="feed-report__story is-featured feed-report__story--link" to="/seek_help" onClick={() => setShowAnnouncements(false)}>
                      <IoHelpCircleOutline aria-hidden="true" />
                      <div><span className="feed-report__kicker">Seek Help resources</span><h4>You do not have to carry it alone</h4><p>Find mental-health services and support options gathered for moments when you or someone you care about may need them.</p><strong className="feed-report__story-action">View support resources →</strong></div>
                    </Link>
                    <article className="feed-report__story is-wide">
                      <RiAdvertisementLine aria-hidden="true" />
                      <div><span className="feed-report__kicker">Supporting the site</span><h4>How ads help this quiet corner</h4><p>Advertising helps cover hosting, storage, and the services behind every letter, allowing the collection to remain free to read and use.</p></div>
                    </article>
                  </div>
                </section>

                <section className="feed-report__page feed-report__page--christmas" aria-label="Christmas countdown, page 5 of 5">
                  <div className="feed-report__snow" aria-hidden="true">
                    {CHRISTMAS_SNOWFLAKES.map((flake, index) => (
                      <i
                        key={index}
                        style={{
                          "--snow-left": `${flake.left}%`,
                          "--snow-size": `${flake.size}px`,
                          "--snow-duration": `${flake.duration}s`,
                          "--snow-delay": `${flake.delay}s`,
                          "--snow-drift": `${flake.drift}px`,
                          "--snow-sway": `${flake.sway}px`,
                          "--snow-opacity": flake.opacity,
                          "--snow-blur": `${flake.blur}px`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="feed-report__holiday-mark" aria-hidden="true"><TbChristmasTree /></div>
                  <span className="feed-report__kicker">A seasonal note</span>
                  <h3>{daysLeftXmas === 0 ? "Christmas is here." : "Christmas is getting closer."}</h3>
                  {daysLeftXmas === 0 ? (
                    <p>May today bring a little warmth to every letter waiting to be read.</p>
                  ) : christmasCountdownParts ? (
                    <div className="feed-report__countdown" aria-label={daysLeftXmas}>
                      {christmasCountdownParts.map(([value, label]) => (
                        <span key={label}><strong>{value}</strong><small>{label}</small></span>
                      ))}
                    </div>
                  ) : (
                    <strong className="feed-report__christmas-message">{daysLeftXmas}</strong>
                  )}
                  {daysLeftXmas !== 0 && <p>A small countdown for a season filled with words, memories, and people we hold close.</p>}
                  <small>More announcements and special features can appear on pages like this soon.</small>
                </section>
              </div>

              <nav className="feed-report__pagination" aria-label="Feed pages">
                <button type="button" onClick={() => goToFeedPage(feedPage - 1)} disabled={feedPage === 0} aria-label="Previous update page"><IoChevronBackOutline /></button>
                <div>{[0, 1, 2, 3, 4].map(page => <button key={page} type="button" className={feedPage === page ? "is-active" : ""} onClick={() => goToFeedPage(page)} aria-label={`Go to update page ${page + 1}`} aria-current={feedPage === page ? "page" : undefined} />)}</div>
                <button type="button" onClick={() => goToFeedPage(feedPage + 1)} disabled={feedPage === 4} aria-label="Next update page"><IoChevronForwardOutline /></button>
              </nav>
            </div>
          )}
        </div>
      </div>
      </div>
      {showBurnLetter && (
        <div
          className="burn-letter-overlay"
          onClick={() => {
            if (burnStatus.type !== "success") setShowBurnLetter(false);
          }}
        >
          <section
            className={`burn-letter-dialog${burnStatus.type === "success" ? " is-success" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="burn-letter-title"
            onClick={event => event.stopPropagation()}
          >
            {burnStatus.type !== "success" && (
              <button type="button" className="burn-letter-close" aria-label="Close" onClick={() => setShowBurnLetter(false)}>×</button>
            )}
            {burnStatus.type === "success" ? (
              <div className="burn-letter-success" role="status">
                <div className="burn-letter-animation" aria-hidden="true">
                  <span className="burn-letter-paper" />
                  <IoFlameOutline className="burn-letter-flame" />
                  <i /><i /><i /><i />
                  <span className="burn-letter-achievement">
                    <img src={`${process.env.PUBLIC_URL}/android-chrome-512x512.png`} alt="" />
                  </span>
                </div>
                <span className="burn-letter-eyebrow">Letter burned</span>
                <h2 id="burn-letter-title">Your letter is gone.</h2>
                <p>The letter has turned to ashes. You’re choosing to let go, move forward, and make space for what comes next.</p>
                <button type="button" onClick={() => setShowBurnLetter(false)}>Move Forward</button>
              </div>
            ) : (
              <>
                <span className="burn-letter-icon" aria-hidden="true"><IoFlameOutline /></span>
                <span className="burn-letter-eyebrow">Your letter, your choice</span>
                <h2 id="burn-letter-title">Burn a letter you wrote</h2>
                <p>Ready to let go? Enter your secret key to burn this letter and leave the memory behind.</p>
                <form onSubmit={handleBurnLetter}>
                  <label htmlFor="burn-letter-key">Secret burn key</label>
                  <input
                    id="burn-letter-key"
                    type="text"
                    value={burnKey}
                    onChange={event => setBurnKey(event.target.value)}
                    placeholder="LTC-••••-••••-••••-••••"
                    autoComplete="off"
                    spellCheck="false"
                    disabled={isBurning}
                  />
                  {burnStatus.message && <p className={`burn-letter-status is-${burnStatus.type}`} role="status">{burnStatus.message}</p>}
                  <button type="submit" disabled={isBurning}>
                    <IoFlameOutline /> {isBurning ? "Burning letter…" : "Burn my letter"}
                  </button>
                </form>
                <small>Burning removes the letter you wrote.</small>
              </>
            )}
          </section>
        </div>
      )}
      <ToastContainer
        containerId="notify"
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover={false}
        transition="bounce"
        draggable
        theme="light"
      />
      <ToastContainer />
      <AddModal
        showAddModal={showAddModal}
        toggleAddModal={toggleAddModal}
        newLetter={newLetter}
        handleAddLetter={handleAddLetter}
        setNewLetter={setNewLetter}
      />
      {FIREFLY_ENABLED && loading === 0 && fireflyVisit && (
        <div
          key={fireflyVisit.id}
          className="easter-firefly"
          aria-hidden="true"
          style={{
            "--firefly-start-x": `${fireflyVisit.startX}px`,
            "--firefly-start-y": `${fireflyVisit.startY}px`,
            "--firefly-curve-one-x": `${fireflyVisit.curveOneX}px`,
            "--firefly-curve-one-y": `${fireflyVisit.curveOneY}px`,
            "--firefly-curve-two-x": `${fireflyVisit.curveTwoX}px`,
            "--firefly-curve-two-y": `${fireflyVisit.curveTwoY}px`,
            "--firefly-rest-x": `${fireflyVisit.restX}px`,
            "--firefly-rest-y": `${fireflyVisit.restY}px`,
            "--firefly-exit-x": `${fireflyVisit.exitX}px`,
            "--firefly-exit-y": `${fireflyVisit.exitY}px`,
            "--firefly-duration": `${fireflyVisit.duration}ms`,
          }}
        >
          <Firefly3D duration={fireflyVisit.duration} direction={fireflyVisit.direction} />
        </div>
      )}
      {loading === 1 ? (
        <MailboxLoading />
      ) : loading === 2 ? (
        <>
          <center>
            <Lottie
              loop
              animationData={under_construction}
              play
              style={{ width: 300, height: 300 }}
            />
          </center>
          <p>
            Our service is temporarily unavailable as we're making improvements
            behind the scenes.
            <br />
            Please bear with us while we work to enhance your experience. <br />
            Thank you for your continued support!
          </p>
        </>
      ) : loading === 0 ? (
        <div
          className={`feed-main-container${
            isReadModeActive ? " feed-main-container--suspended" : ""
          }`}
        >
          <div className="letters-container" ref={feedContainerRef}>
            {isSearching ? (
              <div className="letter-search-loading" role="status" aria-live="polite">
                <span className="letter-search-spinner" aria-hidden="true" />
                <strong>Searching letters…</strong>
                <p>Waiting for the closest matches.</p>
              </div>
            ) : isSearchActive && feedItems.length === 0 ? (
              <div>
                <p>
                  <br />
                  <br />
                  <br />
                  <br />
                  <br />
                  <strong>No results found</strong>
                </p>
                <center>
                  <Lottie
                    loop
                    animationData={empty}
                    play
                    style={{ width: 300, height: 300 }}
                  />
                </center>
              </div>
            ) : !isSearchActive && feedItems.length === 0 ? (
              <div>
                <p>No Letters Found</p>
                <center>
                  <Lottie
                    loop
                    animationData={empty}
                    play
                    style={{ width: 300, height: 300 }}
                  />
                </center>
              </div>
            ) : (
              <>
                {topSpacerHeight > 0 && (
                  <div
                    className="letters-virtual-spacer"
                    style={{ height: topSpacerHeight }}
                    aria-hidden="true"
                  />
                )}
                {virtualItems.map((item) => {
                  if (item.type === "featured") {
                    return (
                      <div
                        key={item.key}
                        className={`letter-card letter-card--featured${
                          isFeatured ? " is-active" : ""
                        }`}
                        onClick={fetchFeatured}
                      >
                        <span className="letter-card__featured-badge">★ Featured</span>
                        <p className="letter-card__featured-text">
                          {isFeatured
                            ? "Showing featured letters — tap to go back"
                            : "Tap to read the featured letters"}
                        </p>
                      </div>
                    );
                  }
                  if (item.type === "ad") {
                    return (
                      <div
                        className="letter-ad-slot"
                        key={item.key}
                        aria-label="Advertisement"
                      >
                        {item.variant === "adcomponent" ? (
                          <AdComponent />
                        ) : (
                          <AdsterraNativeBanner />
                        )}
                      </div>
                    );
                  }
                  return (
                    <Letter
                      key={item.key}
                      letter={item.letter}
                      toggleDetailsModal={toggleDetailsModal}
                      setSelectedLetter={setSelectedLetter}
                      maxWarmthScore={item.maxWarmthScore}
                    />
                  );
                })}
                {bottomSpacerHeight > 0 && (
                  <div
                    className="letters-virtual-spacer"
                    style={{ height: bottomSpacerHeight }}
                    aria-hidden="true"
                  />
                )}
                {hasMoreLetters && (
                  <div className="feed-infinite-loader" aria-hidden="true">
                    <center>
                      <Lottie
                        loop
                        animationData={ghost1}
                        play
                        style={{ width: 150, height: 150 }}
                      />
                    </center>
                  </div>
                )}
              </>
            )}
          </div>
          <h4>‎ </h4>
        </div>
      ) : null}
      <DetailsModal
        showDetailsModal={showDetailsModal}
        toggleDetailsModal={toggleDetailsModal}
        selectedLetter={selectedLetter}
        readMode={readModeEnabled && readMode}
        letters={activeLetters}
        setSelectedLetter={setSelectedLetter}
        onFetchMore={
          isFeatured || isSearchActive || isReadModeActive
            ? null
            : fetchMoreData
        }
      />
      {showUiAnnouncement && (
        <div
          className="ui-announcement-overlay"
        >
          <section
            className="ui-announcement-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ui-announcement-title"
            aria-describedby="ui-announcement-message"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="ui-announcement-icon ui-announcement-logo" aria-hidden="true">
              <img src={lettersToCasperLogo} alt="" />
            </span>
            <span className="ui-announcement-eyebrow">A new chapter</span>
            <h2 id="ui-announcement-title">
              Some letters stay. Some help us let go.
            </h2>
            <p id="ui-announcement-message">
              We’re moving into a new phase, and maybe you are, too. Your letter
              can stay for as long as you want, but if it no longer belongs in
              your story, you can choose to burn it and move forward.
            </p>
            <div className="ui-announcement-highlights">
              <div>
                <IoFlameOutline aria-hidden="true" />
                <span><strong>Leave it, or let it go</strong>Save your private key and use it only if you no longer want the letter to remain.</span>
              </div>
              <div>
                <IoInformationCircleOutline aria-hidden="true" />
                <span><strong>A gentler experience</strong>Enjoy a refreshed design, cleaner mobile layout, and smoother ways to read and share.</span>
              </div>
            </div>
            <button
              type="button"
              className="ui-announcement-action"
              onClick={dismissUiAnnouncement}
            >
              Move on
            </button>
          </section>
        </div>
      )}
      {readModeEnabled && showReadModeModal && (
        <div
          className="ui-announcement-overlay read-mode-dialog-overlay"
          onClick={() => setShowReadModeModal(false)}
        >
          <section
            className="ui-announcement-dialog read-mode-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="read-mode-dialog-title"
            aria-describedby="read-mode-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="ui-announcement-icon" aria-hidden="true">
              <IoReaderOutline size={20} />
            </span>
            <span className="ui-announcement-eyebrow">Reading Experience</span>
            <h2 id="read-mode-dialog-title">Read Mode</h2>
            <p id="read-mode-dialog-description">
              When Read Mode is enabled, typing effects are disabled and letters are displayed immediately. You can also swipe or scroll down to browse through letters.
            </p>
            <div className="read-mode-dialog-status">
              <span className={`read-mode-dialog-badge${readMode ? " is-active" : ""}`}>
                {readMode ? "● Read Mode is ON" : "○ Read Mode is OFF"}
              </span>
            </div>
            <div className="read-mode-dialog-actions">
              <button
                type="button"
                className={`read-mode-dialog-toggle${readMode ? " is-active" : ""}`}
                onClick={() => {
                  dismissReadModeTip();
                  setReadMode((prev) => !prev);
                }}
              >
                {readMode ? "Turn Off Read Mode" : "Turn On Read Mode"}
              </button>
              <button
                type="button"
                className="read-mode-dialog-close"
                onClick={() => setShowReadModeModal(false)}
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      {readModeEnabled && !isHeaderCompact && !readMode && !readModeTipDismissed && (
        <aside className="read-mode-suggestion" role="status" aria-label="Read Mode introduction">
          <button
            type="button"
            className="read-mode-suggestion__close"
            onClick={dismissReadModeTip}
            aria-label="Dismiss Read Mode suggestion"
          >
            ×
          </button>
          <strong>Read Mode</strong>
          <span>Disable typing delays and swipe through letters smoothly.</span>
          <button
            type="button"
            className="read-mode-suggestion__action"
            onClick={() => {
              dismissReadModeTip();
              setShowReadModeModal(true);
            }}
          >
            Try Read Mode
          </button>
        </aside>
      )}

      {readModeEnabled && (
        <button
          type="button"
          className={`fab read-mode-fab${!isHeaderCompact ? " is-visible" : ""}${readMode ? " is-active" : ""}`}
          onClick={() => {
            dismissReadModeTip();
            setShowReadModeModal(true);
          }}
          aria-pressed={readMode}
          aria-label={`Read mode info and settings (${readMode ? "on" : "off"})`}
          title={`Read mode: ${readMode ? "On" : "Off"} (Click to learn more)`}
        >
          <IoReaderOutline aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        className={`fab${isHeaderCompact ? " is-visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        <IoArrowUpOutline aria-hidden="true" />
      </button>

      <Footer />
    </div>
  );
}

export default Home;
