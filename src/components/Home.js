import React, {useState, useEffect} from 'react';
import Header from './Header';
import Footer from './Footer';
import AddModal from './AddModal';
import Letter from './Letter';
import DetailsModal from './DetailsModal';
import {AiFillMessage} from 'react-icons/ai';
import {FaRegHandPointUp} from 'react-icons/fa';
import Lottie from 'react-lottie-player';
import ghost1 from '../lotties/ghost1.json';
import under_construction from '../lotties/under_construction.json';
import empty from '../lotties/empty2.json';
import {GiMailbox} from 'react-icons/gi';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Typewriter from 'typewriter-effect';
import SmoothScroll from 'smooth-scroll';
import {IoMailOpenOutline} from 'react-icons/io5';
import {IoMailUnreadOutline} from 'react-icons/io5';
import { CiLocationOn } from "react-icons/ci";
import { RiAdvertisementLine } from "react-icons/ri";
import {Tooltip} from 'react-tooltip';
import { render_url, api_key } from '../data/keys';
import tc from 'thousands-counter';
import InfiniteScroll from 'react-infinite-scroll-component';
import SideAd from './AdComponent';
import axios from 'axios';
import '../styles/App.css';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [letters, setLetters] = useState({
    messages: [],
    counts: {approved: 0, unapproved: 0},
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLetter, setNewLetter] = useState({
    from: '',
    to: '',
    message: '',
    approve: false,
  });
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(1);

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
    searchLetters();
  };

  const [scroll, setScroll] = useState(null);

  const fetchMoreData = async () => {
    try {
      const response = await fetch(
        `${render_url}?offset=${letters.messages.length}&limit=50`,
        {
          headers: {
            'x-api-key': api_key,
          },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch more letters');
      }
      const newData = await response.json();
      setTimeout(() => {
        setLetters(prevState => ({
          ...prevState,
          messages: [...prevState.messages, ...newData.messages],
        }));
        setLoading(0);
      }, 1500);
    } catch (error) {
      console.error('Error fetching more letters:', error);
      setLoading(2);
    }
  };

  useEffect(() => {
    const fetchLetters = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setLoading(1);
      try {
        const response = await fetch(`${render_url}?offset=0&limit=150`, {
          headers: {
            'x-api-key': api_key,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch letters');
        }
        const data = await response.json();
        setLetters(data);
        setLoading(0);
      } catch (error) {
        console.error('Error fetching letters:', error);
        setLoading(2);
      }
    };

    fetchLetters();
  }, []);

  const [public_ip, setIP] = useState('');

  const getData = async () => {
    try {
      const res = await axios.get('https://api.ipify.org/?format=json');
      setIP(res.data.ip);
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'blocked';
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchTopSenderLocations = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        const response = await fetch(`${render_url}/top-sender-locations`, {
          headers: {
            'x-api-key': api_key,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch top sender locations');
        }
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching top sender locations:', error);
      }
    };

    fetchTopSenderLocations();
  }, []);

  const locationsHtml = locations.join('<br />');

  const handleAddLetter = async () => {
    try {
      const {from, to, message} = newLetter;

      if (from.trim() === '' || to.trim() === '' || message.trim() === '') {
        return;
      }

      const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
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
        method: 'POST',
        headers: {
          'x-api-key': api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      setLetters(prevState => ({
        ...prevState,
        messages: [...prevState.messages, messageData],
      }));
      setNewLetter({from: '', to: '', message: ''});

      if (!response.ok) {
        notify_error();
      } else {
        notify_success();
      }
    } catch (error) {
      notify_error();
      console.error('Error adding message:', error);
    }
  };

  const toggleDetailsModal = () => {
    setShowDetailsModal(!showDetailsModal);
  };

  useEffect(() => {
    setScroll(
      new SmoothScroll('a[href*="#"]', {
        speed: 800,
        speedAsDuration: true,
      }),
    );
  }, []);

  const scrollToTop = () => {
    scroll.animateScroll(0);
  };

  const notify_success = () =>
    toast.success('Successfully Sent for Approval', {
      position: 'bottom-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });

  const notify_error = () =>
    toast.error('Letter Failed to Submit', {
      position: 'bottom-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  const [searchedLetters, setSearchedLetters] = useState({
    messages: [],
    counts: {approved: 0, unapproved: 0},
  });

  const searchLetters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${render_url}?search=${searchTerm}`, {
        headers: {
          'x-api-key': api_key,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to search letters');
      }
      const data = await response.json();
      setSearchedLetters(data);
      setLoading(0);
    } catch (error) {
      console.error('Error searching letters:', error);
      setLoading(0);
    }
  };

  const searchedResults = searchedLetters.messages.filter(letter => {
    const {from, to, message} = letter;
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
      searchTerm === ''
        ? letters.messages
        : letters.messages.filter(letter => {
            const {from, to, message} = letter;
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
      <Header searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
      <div className="add-button">
        <button className="btn btn-primary big-button" onClick={toggleAddModal}>
          <AiFillMessage className="button-icon" size="20px" />
          Leave a Letter
        </button>
        <div
          className="messages-count"
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '15px',
          }}
        >
          <div
            data-tooltip-id="al"
            data-tooltip-content={
              letters.counts.approved >= 2
                ? `Open Letters: ${tc(letters.counts.approved)}`
                : `Open Letter: ${letters.counts.approved}`
            }
            data-tooltip-place="bottom"
            data-tooltip-variant="info"
          >
            <IoMailOpenOutline
              size={24}
              style={{
                color: '#0056b3',
                animation: 'pulsate 1s ease-in-out infinite alternate',
              }}
            />
          </div>
          <Tooltip id="al" />

          &nbsp; &nbsp; 

          <div
            data-tooltip-id="loc"
            data-tooltip-html={`<b>Top 20 Letter Origins </b> <p>${locationsHtml}</p>`}
            data-tooltip-place="bottom"
            data-tooltip-variant="info"
          >
            <CiLocationOn
              size={24}
              style={{
                color: '#0056b3',
                animation: 'pulsate 1s ease-in-out infinite alternate',
              }}
            />
          </div>
          <Tooltip id="loc" />

          &nbsp; &nbsp; 

          <div
            data-tooltip-id="ads"
            data-tooltip-html={`<small>We're sorry to introduce ads 🥺<br/> but they're necesarry to maintain this service.<br/> We hope you understand.<br/><br/> However, displaying them alone won't be much help. <br/>
Show us your support by clicking on those ads<br/> they're not that annoying, we promise! 🥹</small>`}
            data-tooltip-place="bottom"
            data-tooltip-variant="info"
          >
            <RiAdvertisementLine
              size={24}
              style={{
                color: '#0056b3',
                animation: 'pulsate 1s ease-in-out infinite alternate',
              }}
            />
          </div>
          <Tooltip id="ads" />

          &nbsp; &nbsp; 
          <div
            data-tooltip-id="pl"
            data-tooltip-content={
              letters.counts.unapproved >= 2
                ? `Pending Letters: ${letters.counts.unapproved}`
                : `Pending Letter: ${letters.counts.unapproved}`
            }
            data-tooltip-place="bottom"
            data-tooltip-variant="info"
          >
            <IoMailUnreadOutline
              size={25}
              style={{
                color: '#0056b3',
                animation: 'pulsate 1s ease-in-out infinite alternate',
              }}
            />
          </div>
          <Tooltip id="pl" />
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
              style={{width: 300, height: 300}}
            />
          </center>
          <div>
            <Typewriter
              options={{delay: 20, loop: false}}
              onInit={typewriter => {
                typewriter
                  .typeString(
                    'Please wait while we load all letters... This may take up to 1 minute',
                  )
                  .pauseFor(3000)
                  .start();
              }}
            />
          </div>
          <br />
          <GiMailbox size="60px" />
        </div>
      ) : loading === 2 ? (
        <>
          <center>
            <Lottie
              loop
              animationData={under_construction}
              play
              style={{width: 300, height: 300}}
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
      <SideAd />
            {searchedResults.length > 0 && searchTerm !== '' ? (
              searchedResults.map((letter, index) => (
                <Letter
                  key={index}
                  letter={letter}
                  toggleDetailsModal={toggleDetailsModal}
                  setSelectedLetter={setSelectedLetter}
                />
              ))
            ) : searchTerm === '' ? (
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
                      style={{width: 300, height: 300}}
                    />
                  </center>
                </div>
              )
            ) : (
              <div>
                <p>No Search Results Found</p>
                <center>
                  <Lottie
                    loop
                    animationData={empty}
                    play
                    style={{width: 300, height: 300}}
                  />
                </center>
              </div>
            )}
            <InfiniteScroll
              style={{overflow: 'hidden'}}
              dataLength={filteredLetters.length}
              next={fetchMoreData}
              hasMore={
                filteredLetters.length === letters.counts.approved - 1
                  ? false
                  : true
              }
              loader={
                searchTerm === '' && (
                  <center>
                    <Lottie
                      loop
                      animationData={ghost1}
                      play
                      style={{width: 150, height: 150}}
                    />
                  </center>
                )
              }
              endMessage={<p style={{textAlign: 'center'}}>‎ </p>}
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
