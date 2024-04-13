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
import {Tooltip} from 'react-tooltip';
import '../App.css';

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

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const render_url = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(1); // State to track loading state

  useEffect(() => {
    const fetchLetters = async () => {
      setLoading(1);
      try {
        const response = await fetch(render_url);
        if (!response.ok) {
          throw new Error('Failed to fetch letters');
        }
        const data = await response.json();
        setLetters(data); // Update the letters state with the fetched data
        setTimeout(() => {
          setLoading(0); // Delay setting loading to 0 by 1.5 seconds
        }, 3000);
      } catch (error) {
        console.error('Error fetching letters:', error);
        setLoading(2);
      }
    };

    fetchLetters();
  }, [render_url]); // Empty dependency array ensures the effect runs only once when the component mounts

  const handleAddLetter = async () => {
    try {
      const {from, to, message} = newLetter;

      if (from.trim() === '' || to.trim() === '' || message.trim() === '') {
        // Handle empty fields here if needed
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
      };

      const response = await fetch(render_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        notify_error();
      }

      // Update the state correctly by spreading the current state and updating the messages array
      setLetters(prevState => ({
        ...prevState,
        messages: [...prevState.messages, messageData],
      }));
      setNewLetter({from: '', to: '', message: ''});
      notify_success();

      // fetchLetters();
    } catch (error) {
      notify_error();
      console.error('Error adding message:', error);
    }
  };

  const toggleDetailsModal = () => {
    setShowDetailsModal(!showDetailsModal);
  };

  const scroll = new SmoothScroll('a[href*="#"]', {
    speed: 800, // Adjust the scrolling speed as needed
    speedAsDuration: true, // Use speed as the duration for the scroll animation
  });

  const scrollToTop = () => {
    scroll.animateScroll(0); // Scroll to the top of the page
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
      theme: 'light',
    });

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  const filteredLetters = letters.messages.filter(letter => {
    const {from, to, message} = letter;
    const lowerCasedSearchTerm = searchTerm.toLowerCase();
    return (
      from.toLowerCase().includes(lowerCasedSearchTerm) ||
      to.toLowerCase().includes(lowerCasedSearchTerm) ||
      message.toLowerCase().includes(lowerCasedSearchTerm)
    );
  });

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
            opacity: 0.5,
          }}
        >
          <span> {letters.counts.approved}</span>
          &nbsp;
          <div
            data-tooltip-id="al"
            data-tooltip-content="Approved Letters"
            data-tooltip-place="left"
            data-tooltip-variant="info"
          >
            <IoMailOpenOutline size={19} />
          </div>
          <Tooltip id="al" />
          &nbsp; &nbsp; &nbsp; &nbsp;
          <span> {letters.counts.unapproved}</span>
          &nbsp;
          <div
            data-tooltip-id="pl"
            data-tooltip-content="Pending Letters for Approval"
            data-tooltip-place="right"
            data-tooltip-variant="info"
          >
            <IoMailUnreadOutline size={20} />
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
      {loading === 1 ? ( // Render loading spinner or message if data is being fetched
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
                  .typeString('Please wait while we load all letters...')
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
        <div className="letters-container">
          {filteredLetters.length > 0 ? (
            filteredLetters.map((letter, index) => (
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
          )}
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
