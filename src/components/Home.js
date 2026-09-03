import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AddModal from "./AddModal";
import Letter from "./Letter";
import DetailsModal from "./DetailsModal";
import { AiFillMessage } from "react-icons/ai";
import { FaRegHandPointUp } from "react-icons/fa";
import Lottie from "react-lottie-player";
import ghost1 from "../lotties/ghost1.json";
import under_construction from "../lotties/under_construction.json";
import empty from "../lotties/empty2.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Typewriter from "typewriter-effect";
import SmoothScroll from "smooth-scroll";
import {
  IoMailOpenOutline,
  IoMailUnreadOutline,
  IoNewspaperOutline,
} from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { TbChristmasTree } from "react-icons/tb";
import { RiAdvertisementLine } from "react-icons/ri";
import { Tooltip } from "react-tooltip";
import { render_url, api_key } from "../data/keys";
import tc from "thousands-counter";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/App.css";
import daysUntilChristmasPH from "./daysUntilChristmasPh";

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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    searchLetters();
  };

  const [scroll, setScroll] = useState(null);
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

  const handleAddLetter = async (letterData) => {
    try {
      const { from, to, message } = letterData;

      if (from.trim() === "" || to.trim() === "" || message.trim() === "") {
        return;
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
      };

      const response = await fetch(render_url, {
        method: "POST",
        headers: {
          "x-api-key": api_key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      setLetters((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, messageData],
      }));
      setNewLetter({ from: "", to: "", message: "" });

      if (!response.ok) {
        notify_error();
      } else {
        notify_success();
      }
    } catch (error) {
      notify_error();
      console.error("Error adding message:", error);
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

  useEffect(() => {
    setScroll(
      new SmoothScroll('a[href*="#"]', {
        speed: 800,
        speedAsDuration: true,
      })
    );
  }, []);

  const scrollToTop = () => {
    scroll.animateScroll(0);
  };

  const notify_error = () =>
    toast.error("Failed to Submit Letter", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

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

  const searchLetters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${render_url}?search=${searchTerm}`, {
        headers: {
          "x-api-key": api_key,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to search letters");
      }
      const data = await response.json();
      setSearchedLetters(data);
      setLoading(0);
    } catch (error) {
      console.error("Error searching letters:", error);
      setLoading(0);
    }
  };

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

  return (
    <div className="app">
      <div
        className={`home-toolbar${isHeaderCompact ? " is-compact" : ""}`}
      >
        <Header searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
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
          </div>
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
              <div className="featured-card" onClick={fetchFeatured}>
                <div
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 20,
                    padding: 5,
                    margin: 5,
                    backgroundColor: isFeatured
                      ? "rgba(55, 114, 255, 0.8)"
                      : "#fefbf0",
                  }}
                >
                  <p className="card-text">
                    <strong>‎ </strong>
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontFamily: "monospace",
                      color: isFeatured ? "#fff" : "#000000",
                    }}
                  >
                    <strong>Featured</strong>
                  </p>
                  <p className="card-text">‎ </p>
                </div>
              </div>
            )}
            {searchedResults.length > 0 && searchTerm !== "" ? (
              searchedResults.map((letter, index) => (
                <Letter
                  key={index}
                  letter={letter}
                  toggleDetailsModal={toggleDetailsModal}
                  setSelectedLetter={setSelectedLetter}
                />
              ))
            ) : searchTerm === "" ? (
              letters.messages.length > 0 ? (
                letters.messages.map((letter, index) => (
                  <Letter
                    key={index}
                    letter={letter}
                    toggleDetailsModal={toggleDetailsModal}
                    setSelectedLetter={setSelectedLetter}
                  />
                ))
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
      <button className="fab" onClick={scrollToTop}>
        <a data-scroll href="#logo-ltc">
          <FaRegHandPointUp />
        </a>
      </button>

      <Footer />
    </div>
  );
}

export default Home;
