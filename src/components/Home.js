import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import OriginsView from "./OriginsView";
import FeedUpdates from "./FeedUpdates";
import Header from "./Header";
import Footer from "./Footer";
import AddModal from "./AddModal";
import BugReportModal from "./BugReportModal";
import PinLetterDialog from "./PinLetterDialog";
import BurnLetterDialog from "./BurnLetterDialog";
import NetworkNoticeDialog from "./NetworkNoticeDialog";
import PinPaymentReturn from "./PinPaymentReturn";
import { adminId } from "../data/target_letters";
import Letter from "./Letter";
import AdComponent from "./AdComponent";
import AdsterraNativeBanner from "./AdsterraNativeBanner";
import DetailsModal from "./DetailsModal";
import { AiFillMessage, AiOutlinePushpin } from "react-icons/ai";
import Lottie from "react-lottie-player";
import ghost1 from "../lotties/ghost1.json";
import under_construction from "../lotties/under_construction.json";
import empty from "../lotties/empty2.json";
import lettersToCasperLogo from "../lotties/ltc_logo_1.webp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import { PiStarFour } from "react-icons/pi";
import MailboxLoading from "./MailboxLoading";
import {
  IoAddOutline,
  IoArrowUpOutline,
  IoBugOutline,
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
import { useFeedVirtualizer } from "../hooks/useFeedVirtualizer";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/App.css";
import daysUntilChristmasPH from "./daysUntilChristmasPh";

const SHOW_SKY_NAV = process.env.REACT_APP_SHOW_SKY_NAV === "true";
const UI_ANNOUNCEMENT_KEY = "ltc-ui-update-announcement-v1";
export const PLDT_NOTICE_KEY = "ltc-pldt-network-notice-v1";
export const SHOW_PLDT_NOTICE =
  typeof process !== "undefined" && process.env?.REACT_APP_SHOW_PLDT_NOTICE === "false"
    ? false
    : true;
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

export const READ_MODE_ENABLED = true;

function Home({ initialReadMode = false, readModeEnabled = READ_MODE_ENABLED } = {}) {
  const navigate = useNavigate();
  const { messageId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [letters, setLetters] = useState({
    messages: [],
    counts: { approved: 0, unapproved: 0 },
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [showPinLetter, setShowPinLetter] = useState(false);
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
  const [showBurnLetter, setShowBurnLetter] = useState(false);
  const [showSkyConfirmation, setShowSkyConfirmation] = useState(false);
  const [skySoulCount, setSkySoulCount] = useState(0);
  const [showSkyPresence, setShowSkyPresence] = useState(false);
  const skySoulCountRef = useRef(0);
  const skyPresenceTimerRef = useRef(null);
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
  const [showPldtNotice, setShowPldtNotice] = useState(() => {
    if (!SHOW_PLDT_NOTICE) return false;
    try {
      const isPldtSeen = localStorage.getItem(PLDT_NOTICE_KEY) === "seen";
      if (isPldtSeen) return false;
      // If Dialog 1 is pending, hold off until Dialog 1 is dismissed
      const isUiAnnouncementPending =
        localStorage.getItem(UI_ANNOUNCEMENT_KEY) !== "seen";
      if (isUiAnnouncementPending) return false;
      return true;
    } catch (error) {
      return false;
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
      localStorage.removeItem("readModeTipDismissed");
    } catch (e) {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!SHOW_SKY_NAV) return undefined;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    let endpoint = process.env.REACT_APP_SKY_SOCKET_URL;
    if (!isLocalhost && endpoint && (endpoint.includes("localhost") || endpoint.includes("127.0.0.1"))) endpoint = "";
    if (!endpoint && process.env.NODE_ENV === "development") endpoint = "http://localhost:8000";
    if (!endpoint && process.env.NODE_ENV === "production") endpoint = process.env.REACT_APP_BASE_URL || "https://ltc-service.onrender.com";
    if (!endpoint) return undefined;

    const presenceSocket = io(endpoint, {
      autoConnect: false,
      transports: ["polling", "websocket"],
      auth: { observer: true },
    });
    const updateCount = value => {
      const nextCount = Math.max(0, Number(value) || 0);
      if (nextCount !== skySoulCountRef.current) {
        skySoulCountRef.current = nextCount;
        setSkySoulCount(nextCount);
        if (skyPresenceTimerRef.current) clearTimeout(skyPresenceTimerRef.current);
        setShowSkyPresence(nextCount > 0);
        if (nextCount > 0) {
          skyPresenceTimerRef.current = setTimeout(() => {
            setShowSkyPresence(false);
            skyPresenceTimerRef.current = null;
          }, 3000);
        }
      }
    };
    presenceSocket.on("sky_state", state => {
      const activeParticipants = Array.isArray(state?.participants)
        ? state.participants.filter(person => person.active !== false).length
        : 0;
      updateCount(state?.activeCount ?? activeParticipants);
    });
    presenceSocket.on("user_count", updateCount);
    presenceSocket.on("disconnect", () => updateCount(0));
    presenceSocket.on("connect_error", () => updateCount(0));
    presenceSocket.connect();
    return () => {
      if (skyPresenceTimerRef.current) clearTimeout(skyPresenceTimerRef.current);
      presenceSocket.removeAllListeners();
      presenceSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!showSkyConfirmation) return undefined;
    const dismiss = event => {
      if (event.key === "Escape") setShowSkyConfirmation(false);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [showSkyConfirmation]);

  const [showReadModeModal, setShowReadModeModal] = useState(false);
  const isReadModeActive = Boolean(readModeEnabled && showDetailsModal && readMode);

  const [showReadModeTooltip, setShowReadModeTooltip] = useState(false);
  const [isTooltipFading, setIsTooltipFading] = useState(false);
  const [highlightReadMode, setHighlightReadMode] = useState(false);
  const wasDetailsModalOpenRef = useRef(false);
  const wasLetterInReadModeRef = useRef(false);
  const tooltipTimerRef = useRef(null);
  const tooltipFadeTimerRef = useRef(null);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(() =>
    typeof window !== "undefined" ? window.scrollY === 0 : true
  );
  const speedDialTimerRef = useRef(null);

  const clearSpeedDialTimer = useCallback(() => {
    if (speedDialTimerRef.current) {
      clearTimeout(speedDialTimerRef.current);
      speedDialTimerRef.current = null;
    }
  }, []);

  const closeSpeedDial = useCallback(() => {
    clearSpeedDialTimer();
    setIsSpeedDialOpen(false);
    setHighlightReadMode(false);
  }, [clearSpeedDialTimer]);

  const toggleSpeedDial = useCallback(() => {
    const wasTriggeredByTooltip = showReadModeTooltip;
    if (showReadModeTooltip) {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      if (tooltipFadeTimerRef.current) clearTimeout(tooltipFadeTimerRef.current);
      setShowReadModeTooltip(false);
      setIsTooltipFading(false);
    }
    setIsSpeedDialOpen((prev) => {
      const next = !prev;
      clearSpeedDialTimer();
      if (next) {
        if (wasTriggeredByTooltip) {
          setHighlightReadMode(true);
        } else {
          setHighlightReadMode(false);
        }
        speedDialTimerRef.current = setTimeout(() => {
          setIsSpeedDialOpen(false);
          setHighlightReadMode(false);
        }, 15000);
      } else {
        setHighlightReadMode(false);
      }
      return next;
    });
  }, [showReadModeTooltip, clearSpeedDialTimer]);

  useEffect(() => {
    return () => {
      clearSpeedDialTimer();
    };
  }, [clearSpeedDialTimer]);

  useEffect(() => {
    if (!isSpeedDialOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeSpeedDial();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSpeedDialOpen, closeSpeedDial]);

  useEffect(() => {
    if (!readModeEnabled) {
      wasDetailsModalOpenRef.current = showDetailsModal;
      wasLetterInReadModeRef.current = Boolean(readMode);
      return;
    }

    if (showDetailsModal) {
      // If modal opens while tooltip was showing, dismiss immediately
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      if (tooltipFadeTimerRef.current) clearTimeout(tooltipFadeTimerRef.current);
      setShowReadModeTooltip(false);
      setIsTooltipFading(false);
      setHighlightReadMode(false);
      wasLetterInReadModeRef.current = Boolean(readMode);
    } else if (wasDetailsModalOpenRef.current && !showDetailsModal) {
      // Show tooltip only if user exited from a letter showing normally with typing effects
      if (!wasLetterInReadModeRef.current && !readMode) {
        setShowReadModeTooltip(true);
        setIsTooltipFading(false);

        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
        if (tooltipFadeTimerRef.current) clearTimeout(tooltipFadeTimerRef.current);

        tooltipTimerRef.current = setTimeout(() => {
          setIsTooltipFading(true);
          tooltipFadeTimerRef.current = setTimeout(() => {
            setShowReadModeTooltip(false);
            setIsTooltipFading(false);
          }, 400);
        }, 10000);
      }
    }

    wasDetailsModalOpenRef.current = showDetailsModal;
    if (!showDetailsModal) {
      wasLetterInReadModeRef.current = false;
    }
  }, [showDetailsModal, readModeEnabled, readMode]);

  useEffect(() => {
    if (readMode && showReadModeTooltip) {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      if (tooltipFadeTimerRef.current) clearTimeout(tooltipFadeTimerRef.current);
      setShowReadModeTooltip(false);
      setIsTooltipFading(false);
    }
  }, [readMode, showReadModeTooltip]);

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      if (tooltipFadeTimerRef.current) clearTimeout(tooltipFadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showDetailsModal) {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", nightShift ? "#14161a" : "#ffffff");
      }
    }
  }, [nightShift, showDetailsModal]);

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
        setIsAtTop(window.scrollY === 0);
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

  const handleClearSearch = () => {
    setSearchTerm("");
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

  const isFetchingMoreRef = useRef(false);

  const fetchMoreData = useCallback(async () => {
    if (isReadModeActive || isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
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
        setLetters((prevState) => {
          const existingIds = new Set(
            (prevState.messages || []).map((m) => String(m._id || ""))
          );
          const uniqueNew = (newData.messages || []).filter(
            (m) => m && m._id && !existingIds.has(String(m._id))
          );
          return {
            ...prevState,
            messages: [...prevState.messages, ...uniqueNew],
          };
        });
        setLoading(0);
        isFetchingMoreRef.current = false;
      }, 1500);
    } catch (error) {
      console.error("Error fetching more letters:", error);
      setLoading(2);
      isFetchingMoreRef.current = false;
    }
  }, [isReadModeActive, letters.messages.length]);

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

    // Sequence: trigger PLDT network advisory immediately after Dialog 1 is dismissed
    if (SHOW_PLDT_NOTICE) {
      try {
        if (localStorage.getItem(PLDT_NOTICE_KEY) !== "seen") {
          setShowPldtNotice(true);
        }
      } catch (error) {
        setShowPldtNotice(true);
      }
    }
  };

  const dismissPldtNotice = () => {
    try {
      localStorage.setItem(PLDT_NOTICE_KEY, "seen");
    } catch (error) {
      /* The dialog can still be dismissed when browser storage is unavailable. */
    }
    setShowPldtNotice(false);
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
    const approved = source.filter((letter) => letter.approve);

    const now = new Date();
    const pinnedLetters = [];
    const regularLetters = [];
    const seenIds = new Set();

    for (const letter of approved) {
      const id = String(letter._id || "");
      if (id && seenIds.has(id)) continue;
      if (id) seenIds.add(id);

      // The backend injects the admin letter (from 2023) into the offset=0 response.
      // If it is not actively pinned, ignore this legacy injection in the regular feed
      // so it does not appear prematurely at the very bottom of today's letters.
      if (
        !isSearchActive &&
        id === adminId &&
        !(letter.is_pinned && letter.pin_expires_at && new Date(letter.pin_expires_at) > now)
      ) {
        continue;
      }

      if (letter.is_pinned && letter.pin_expires_at && new Date(letter.pin_expires_at) > now) {
        pinnedLetters.push(letter);
      } else {
        regularLetters.push(letter);
      }
    }

    pinnedLetters.sort((a, b) => new Date(b.pinned_at || 0) - new Date(a.pinned_at || 0));
    const topPinned = pinnedLetters.slice(0, 7);
    const overflowPinned = pinnedLetters.slice(7);

    const rest = [...regularLetters, ...overflowPinned];
    rest.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    return [
      ...topPinned,
      ...rest,
    ];
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
    overscanRows: 4,
  });

  const goToFeedPage = page => {
    const nextPage = Math.max(0, Math.min(5, page));
    setFeedPage(nextPage);
    feedPagesRef.current?.scrollTo({
      left: feedPagesRef.current.clientWidth * nextPage,
      behavior: "smooth",
    });
  };

  const handleFeedScroll = event => {
    if (event.target !== event.currentTarget) return;
    const pageWidth = event.currentTarget.clientWidth;
    if (!pageWidth) return;
    setFeedPage(Math.max(0, Math.min(5, Math.round(event.currentTarget.scrollLeft / pageWidth))));
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
    <div className={`app${isReadModeActive ? " is-read-mode-active" : ""}`}>
      <div
        className={`home-toolbar${isHeaderCompact ? " is-compact" : ""}`}
      >
        <Header
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
          isCompact={isHeaderCompact}
        />
        <div className="add-button">
        <button className="btn btn-primary big-button" onClick={toggleAddModal}>
          <AiFillMessage className="button-icon" size="20px" />
          <span className="leave-letter-label">Leave a Letter</span>
        </button>
        <div className="information-panel">
          <nav className={`messages-count${SHOW_SKY_NAV ? " has-sky-nav" : ""}`} aria-label="Primary navigation">
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
            <span className="message-stat__label">Open</span>
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
            <span className="message-stat__label">Origins</span>
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
            }}
          >
            <IoFlameOutline size={21} />
            <span className="message-stat__label">Burn</span>
          </button>
          {SHOW_SKY_NAV && (
            <div className="sky-nav-item">
              <button
                type="button"
                className="message-stat toolbar-trigger sky-nav-trigger"
                aria-label="Enter Sky"
                aria-haspopup="dialog"
                aria-expanded={showSkyConfirmation}
                onClick={() => setShowSkyConfirmation(true)}
              >
                <PiStarFour size={21} />
                <span className="message-stat__label">Sky</span>
                {skySoulCount > 0 && showSkyPresence && (
                  <span className="sky-presence-tooltip" role="status">
                    {skySoulCount} {skySoulCount === 1 ? "soul is" : "souls are"} looking in the sky
                  </span>
                )}
              </button>
            </div>
          )}
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
            <span className="message-stat__label">Feed</span>
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
            <span className="message-stat__label">Pending</span>
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
            <span className="message-stat__label">{nightShift ? "Day" : "Night"}</span>
          </button>
          </nav>
          {countPopover && (
            <section id="letter-count-popover" ref={countPopoverRef}
              className={`letter-count-popover is-${countPopover}`} role="dialog"
              aria-labelledby="letter-count-title" aria-describedby="letter-count-description">
              <button type="button" className="letter-count-popover__close" aria-label="Close letter count" onClick={closeCountPopover}>×</button>
              <h2 id="letter-count-title">{countPopover === "opened" ? "Open Letters" : "Pending Letters for Approval"}</h2>
              <strong className="letter-count-popover__number">{Number(countPopover === "opened" ? letters.counts.approved : letters.counts.unapproved).toLocaleString()}</strong>
              <p id="letter-count-description">{countPopover === "opened"
                ? "Search through these letters, maybe someone wrote a letter for you."
                : "Once your letter is approved, you can browse it here or share it with others."}</p>
            </section>
          )}
          {SHOW_SKY_NAV && showSkyConfirmation && (
            <div className="ui-announcement-overlay sky-entry-backdrop" role="presentation" onMouseDown={event => {
              if (event.target === event.currentTarget) setShowSkyConfirmation(false);
            }}>
              <section className="sky-entry-dialog" role="dialog" aria-modal="true" aria-labelledby="sky-entry-title" aria-describedby="sky-entry-description" onMouseDown={event => event.stopPropagation()}>
                <div className="compact-dialog-heading">
                  <PiStarFour aria-hidden="true" />
                  <h2 id="sky-entry-title">Enter Sky</h2>
                </div>
                <p id="sky-entry-description">Step into the shared sky with the souls looking up right now.</p>
                <div className="sky-entry-actions">
                  <button type="button" onClick={() => setShowSkyConfirmation(false)}>Cancel</button>
                  <button type="button" autoFocus onClick={() => navigate("/sky")}>Proceed</button>
                </div>
              </section>
            </div>
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
                <section className="feed-report__page" aria-label="Network advisory, page 1 of 6">
                  <div className="feed-report__lead">
                    <span>Important Notice</span>
                    <h3>Connection issues?</h3>
                    <p>Some PLDT and Smart Communications customers may currently have difficulty connecting to our servers.</p>
                  </div>
                  <div className="feed-report__updates">
                    <article className="feed-report__story is-featured">
                      <IoServerOutline aria-hidden="true" />
                      <div>
                        <span className="feed-report__kicker">Nationwide network advisory</span>
                        <h4>PLDT and Smart Communications DNS issue</h4>
                        <p>Some customers may have trouble reaching our servers. Both networks are currently addressing the issue nationwide. In the meantime, switching networks or changing your DNS may help.</p>
                      </div>
                    </article>
                  </div>
                </section>

                <section className="feed-report__page" aria-label="About our advertisements, page 2 of 6">
                  <div className="feed-report__lead">
                    <span>Important Notice</span>
                    <h3>A note about our advertisements.</h3>
                    <p>Transparency matters to us. Here is what you should know about the ads shown across Letters to Casper, our stance on gambling, and why advertisements are present.</p>
                  </div>
                  <FeedUpdates>
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
                  </FeedUpdates>
                </section>

                <section className="feed-report__page" aria-label="Recent updates, page 3 of 6">
                  <div className="feed-report__lead">
                    <span>From the desk</span>
                    <h3>A gentler way to read, feel, and let go.</h3>
                    <p>We’re moving into a fresh phase. Every letter can now carry a little more life while keeping the experience quiet and personal.</p>
                  </div>
                  <FeedUpdates>
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
                  </FeedUpdates>
                </section>

                <section className="feed-report__page" aria-label="Recent updates, page 4 of 6">
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

                <section className="feed-report__page feed-report__page--care" aria-label="Community care and support, page 5 of 6">
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

                <section className="feed-report__page feed-report__page--christmas" aria-label="Christmas countdown, page 6 of 6">
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
                <div>{[0, 1, 2, 3, 4, 5].map(page => <button key={page} type="button" className={feedPage === page ? "is-active" : ""} onClick={() => goToFeedPage(page)} aria-label={`Go to update page ${page + 1}`} aria-current={feedPage === page ? "page" : undefined} />)}</div>
                <button type="button" onClick={() => goToFeedPage(feedPage + 1)} disabled={feedPage === 5} aria-label="Next update page"><IoChevronForwardOutline /></button>
              </nav>
            </div>
          )}
        </div>
      </div>
      </div>
      <BurnLetterDialog
        isOpen={showBurnLetter}
        onClose={() => setShowBurnLetter(false)}
        onBurnSuccess={burnedId => {
          setLetters(previous => ({
            ...previous,
            messages: previous.messages.filter(letter => letter._id !== burnedId),
            counts: {
              ...previous.counts,
              approved: Math.max(0, previous.counts.approved - 1),
              unapproved: previous.counts.unapproved + 1,
            },
          }));
        }}
        cachedMessages={letters.messages}
      />
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
      {SHOW_PLDT_NOTICE && (
        <NetworkNoticeDialog
          isOpen={showPldtNotice}
          onDismiss={dismissPldtNotice}
        />
      )}
      {readModeEnabled && showReadModeModal && (
        <div
          className="ui-announcement-overlay read-mode-dialog-overlay"
          onClick={() => setShowReadModeModal(false)}
        >
          <section
            className="read-mode-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="read-mode-dialog-title"
            aria-describedby="read-mode-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="compact-dialog-heading">
              <IoReaderOutline aria-hidden="true" />
              <h2 id="read-mode-dialog-title">Read Mode</h2>
            </div>
            <p id="read-mode-dialog-description">
              When Read Mode is enabled, typing effects are disabled and letters are displayed immediately. You can also swipe or scroll down to browse through letters.
            </p>
            <p className={`read-mode-dialog-status${readMode ? " is-active" : ""}`}>
              {readMode ? "● Read Mode is ON" : "○ Read Mode is OFF"}
            </p>
            <div className="read-mode-dialog-actions">
              <button
                type="button"
                className={`read-mode-dialog-toggle${readMode ? " is-active" : ""}`}
                onClick={() => {
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

      <PinPaymentReturn onConfirmed={fetchLetters} />
      {showPinLetter && <PinLetterDialog onClose={() => setShowPinLetter(false)} letters={letters.messages} />}
      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}

      <div
        className={`fab-stack speed-dial-container${isSpeedDialOpen ? " is-open" : ""}`}
        role="region"
        aria-label="Quick actions"
      >
        {/* Sub-action 1: Scroll to Top (Positioned directly above main trigger) */}
        <button
          type="button"
          className={`fab speed-dial-action scroll-top-fab scroll-top-action${isAtTop ? " is-disabled" : ""}`}
          onClick={() => {
            if (isAtTop) return;
            closeSpeedDial();
            scrollToTop();
          }}
          disabled={isAtTop}
          aria-disabled={isAtTop ? "true" : undefined}
          aria-label="Back to top"
          title={isAtTop ? "Already at top" : "Back to top"}
          tabIndex={isSpeedDialOpen ? 0 : -1}
        >
          <IoArrowUpOutline aria-hidden="true" />
        </button>

        {/* Sub-action 2: Read Mode (Radial spread: diagonally up-left) */}
        {readModeEnabled && (
          <button
            type="button"
            className={`fab speed-dial-action read-mode-fab read-mode-action${readMode ? " is-active" : ""}${highlightReadMode ? " is-highlighted" : ""}`}
            onClick={() => {
              setHighlightReadMode(false);
              closeSpeedDial();
              if (showReadModeTooltip) {
                if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
                if (tooltipFadeTimerRef.current) clearTimeout(tooltipFadeTimerRef.current);
                setShowReadModeTooltip(false);
                setIsTooltipFading(false);
              }
              setShowReadModeModal(true);
            }}
            aria-pressed={readMode}
            aria-label={`Read mode info and settings (${readMode ? "on" : "off"})`}
            title={`Read mode: ${readMode ? "On" : "Off"} (Click to learn more)`}
            tabIndex={isSpeedDialOpen ? 0 : -1}
          >
            <IoReaderOutline aria-hidden="true" />
          </button>
        )}

        <button type="button" className="fab speed-dial-action pin-letter-action"
          aria-label="Pin a letter" title="Pin a letter" tabIndex={isSpeedDialOpen ? 0 : -1}
          onClick={() => { closeSpeedDial(); setShowPinLetter(true); }}>
          <AiOutlinePushpin aria-hidden="true" />
        </button>

        {/* Sub-action 3: Bug Report (Radial spread: to the left) */}
        <button
          type="button"
          className="fab speed-dial-action bug-report-fab bug-report-action"
          aria-label="Report a bug"
          title="Report a bug"
          onClick={() => {
            closeSpeedDial();
            setShowBugReport(true);
          }}
          tabIndex={isSpeedDialOpen ? 0 : -1}
        >
          <IoBugOutline aria-hidden="true" />
        </button>

        {/* Main Trigger Button Wrapper with Relocated Onboarding Tooltip */}
        <div className="speed-dial-trigger-wrapper">
          <button
            type="button"
            className={`fab speed-dial-trigger${isSpeedDialOpen ? " is-open" : ""}`}
            onClick={toggleSpeedDial}
            aria-expanded={isSpeedDialOpen}
            aria-label={isSpeedDialOpen ? "Close quick actions menu" : "Open quick actions menu"}
            title={isSpeedDialOpen ? "Close quick actions" : "Quick actions"}
          >
            <IoAddOutline className="speed-dial-trigger-icon" aria-hidden="true" />
          </button>

          {showReadModeTooltip && (
            <aside
              className={`read-mode-onboarding-tooltip${isTooltipFading ? " is-fading-out" : ""}`}
              role="status"
              aria-label="Read Mode introduction"
              onClick={() => {
                if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
                if (tooltipFadeTimerRef.current) clearTimeout(tooltipFadeTimerRef.current);
                setShowReadModeTooltip(false);
                setIsTooltipFading(false);
                setHighlightReadMode(true);
                clearSpeedDialTimer();
                setIsSpeedDialOpen(true);
                speedDialTimerRef.current = setTimeout(() => {
                  setIsSpeedDialOpen(false);
                  setHighlightReadMode(false);
                }, 15000);
              }}
            >
              <span className="read-mode-tooltip-title">Access Read Mode here</span>
              <p className="read-mode-tooltip-text">
                Disable typing effects and scroll down to browse through letters.
              </p>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
