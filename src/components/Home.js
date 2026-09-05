import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AddModal from "./AddModal";
import Letter from "./Letter";
import AdComponent from "./AdComponent";
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
import Typewriter from "typewriter-effect";
import {
  IoArrowUpOutline,
  IoHelpCircleOutline,
  IoFlameOutline,
  IoInformationCircleOutline,
  IoMailOpenOutline,
  IoMailUnreadOutline,
  IoNewspaperOutline,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { TbChristmasTree } from "react-icons/tb";
import { RiAdvertisementLine } from "react-icons/ri";
import { render_url, api_key } from "../data/keys";
import tc from "thousands-counter";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/App.css";
import daysUntilChristmasPH from "./daysUntilChristmasPh";

const UI_ANNOUNCEMENT_KEY = "ltc-ui-update-announcement-v1";
const FIREFLY_ENABLED = false;

const formatCountry = (country) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(country);
  } catch (error) {
    return country;
  }
};

function Home() {
  const navigate = useNavigate();
  const { messageId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [letters, setLetters] = useState({
    messages: [],
    counts: { approved: 0, unapproved: 0 },
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showOrigins, setShowOrigins] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      if (scrollFrame.current !== null) {
        return;
      }

      scrollFrame.current = window.requestAnimationFrame(() => {
        setIsHeaderCompact((isCompact) =>
          isCompact ? window.scrollY > 60 : window.scrollY > 160
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
    if (!FIREFLY_ENABLED || loading !== 0) return undefined;

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
  }, [loading]);

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
      await new Promise((resolve) => setTimeout(resolve, 3000));
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

  const [public_ip, setIP] = useState("");

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
        ip: public_ip,
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

  const [filteredLetters, setFilteredLetters] = useState([]);

  useEffect(() => {
    const filteredData =
      searchTerm === ""
        ? letters.messages
        : letters.messages.filter((letter) => {
            const { from, to, message } = letter;
            const lowerCasedSearchTerm = searchTerm.toLowerCase();
            return (
              from.toLowerCase().includes(lowerCasedSearchTerm) ||
              to.toLowerCase().includes(lowerCasedSearchTerm) ||
              message.toLowerCase().includes(lowerCasedSearchTerm)
            );
          });
    setFilteredLetters(filteredData);
  }, [letters.messages, searchTerm]);

  const renderLettersWithAds = (items) => {
    const approvedLetters = items.filter((letter) => letter.approve);
    const leadingCards = searchTerm === "" ? 1 : 0;
    const firstAdAfter =
      Math.round((60 + leadingCards) / letterGridColumns) *
        letterGridColumns -
      leadingCards;
    const followingAdInterval =
      Math.round(60 / letterGridColumns) * letterGridColumns;

    return approvedLetters.flatMap((letter, index) => {
      const letterNumber = index + 1;
      const letterCard = (
        <Letter
          key={letter._id || `letter-${index}`}
          letter={letter}
          toggleDetailsModal={toggleDetailsModal}
          setSelectedLetter={setSelectedLetter}
        />
      );

      const shouldInsertAd =
        letterNumber >= firstAdAfter &&
        (letterNumber - firstAdAfter) % followingAdInterval === 0;

      if (!shouldInsertAd) {
        return [letterCard];
      }

      return [
        letterCard,
        <div
          className="letter-ad-slot"
          key={`letter-ad-${letterNumber}`}
          aria-label="Advertisement"
        >
          <AdComponent />
        </div>,
      ];
    });
  };

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
          <div
            className="message-stat"
          >
            <IoMailOpenOutline size={21} />
            <span>{tc(letters.counts.approved)} Open</span>
          </div>
          <button
            type="button"
            className="message-stat toolbar-trigger"
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
            aria-expanded={showAnnouncements}
            aria-controls="announcements-panel"
            onClick={() => {
              setShowAnnouncements(!showAnnouncements);
              setShowOrigins(false);
            }}
          >
            <IoNewspaperOutline size={21} />
            <span>Feed</span>
          </button>
          <div
            className="message-stat"
            aria-label={`${letters.counts.unapproved} pending letters`}
          >
            <IoMailUnreadOutline size={21} />
            <span>{letters.counts.unapproved}</span>
          </div>
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
            <div
              id="origins-panel"
              className="announcements-panel origins-panel"
              role="region"
              aria-label="Top letter origins"
            >
              <div className="announcements-header">
                <strong>Top Letter Origins</strong>
                <button
                  type="button"
                  aria-label="Close letter origins"
                  onClick={() => setShowOrigins(false)}
                >
                  &times;
                </button>
              </div>
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
            </div>
          )}
          {showAnnouncements && (
            <div
              id="announcements-panel"
              className="announcements-panel feed-panel"
              role="region"
              aria-label="Announcements"
            >
              <button
                type="button"
                className="announcement-close"
                aria-label="Close feed"
                onClick={() => setShowAnnouncements(false)}
              >
                &times;
              </button>
              <div className="announcement-item">
                <IoInformationCircleOutline size={21} />
                <div>
                  <strong>A fresh look is on the way</strong>
                  <p>
                    We’re thoughtfully refreshing the Letters to Casper
                    experience. You may notice a few changes while the work is
                    still ongoing.
                  </p>
                </div>
              </div>
              <Link
                to="/seek_help"
                className="announcement-item announcement-item--link"
                onClick={() => setShowAnnouncements(false)}
              >
                <IoHelpCircleOutline size={21} />
                <div>
                  <strong>It’s okay to seek help</strong>
                  <p>
                    If you’re not feeling okay or need mental health support,
                    visit our Seek Help page for services and resources.
                  </p>
                  <span className="announcement-item__action">
                    View support resources →
                  </span>
                </div>
              </Link>
              <div className="announcement-item">
                <RiAdvertisementLine size={21} />
                <div>
                  <strong>About our ads</strong>
                  <p>
                    Ads help keep Letters to Casper running. We don't promote
                    gambling and don't control the specific ads shown.
                  </p>
                </div>
              </div>
              {daysLeftXmas !== 0 && (
                <div className="announcement-item">
                  <TbChristmasTree size={21} />
                  <div>
                    <strong>Christmas countdown</strong>
                    <p>{daysLeftXmas} days until Christmas.</p>
                  </div>
                </div>
              )}
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
        <div className="load-letters">
          <center>
            <Lottie
              loop
              animationData={ghost1}
              play
              style={{ width: 300, height: 300 }}
            />
          </center>
          <div>
            <Typewriter
              options={{ delay: 20, loop: false, cursor: ""}}
              onInit={(typewriter) => {
                typewriter
                  .typeString(
                    `Opening up the mailbox... <br/>things take just a bit longer to load up at first.`
                  )
                  .pauseFor(3000)
                  .start();
              }}
            />
          </div>
          <div>
            <Typewriter
              options={{ delay: 20, loop: false, cursor: ""}}
              onInit={(typewriter) => {
                typewriter
                  .pauseFor(7000)
                  .typeString(
                    `<br/><br/>Please wait about a minute while we get the site ready.`
                  )
                  .pauseFor(3000)
                  .start();
              }}
            />
          </div>
          <br />
        </div>
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
        <div>
          <div className="letters-container">
            {searchTerm !== "" ? null : (
              <div
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
            )}
            {isSearching ? (
              <div className="letter-search-loading" role="status" aria-live="polite">
                <span className="letter-search-spinner" aria-hidden="true" />
                <strong>Searching letters…</strong>
                <p>Waiting for the closest matches.</p>
              </div>
            ) : searchedResults.length > 0 && searchTerm !== "" ? (
              renderLettersWithAds(searchedResults)
            ) : searchTerm === "" ? (
              letters.messages.length > 0 ? (
                renderLettersWithAds(letters.messages)
              ) : (
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
              )
            ) : (
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
            )}
            <InfiniteScroll
              style={{ overflow: "hidden" }}
              dataLength={filteredLetters.length}
              next={isFeatured ? null : fetchMoreData}
              hasMore={
                filteredLetters.length === letters.counts.approved - 1
                  ? false
                  : true
              }
              loader={
                searchTerm === "" &&
                !isFeatured && (
                  <center>
                    <Lottie
                      loop
                      animationData={ghost1}
                      play
                      style={{ width: 150, height: 150 }}
                    />
                  </center>
                )
              }
              endMessage={<p style={{ textAlign: "center" }}>‎ </p>}
              scrollThreshold={1}
            />
          </div>
          <h4>‎ </h4>
        </div>
      ) : null}
      <DetailsModal
        showDetailsModal={showDetailsModal}
        toggleDetailsModal={toggleDetailsModal}
        selectedLetter={selectedLetter}
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
