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
import tc from 'thousands-counter';
import InfiniteScroll from 'react-infinite-scroll-component';
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
  const [loading, setLoading] = useState(1);

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
    searchLetters(); // Trigger the search function when the search term changes
  };

  let render_url;
  let api_key = process.env.REACT_APP_API_KEY;

  if (process.env.NODE_ENV === 'development') {
    render_url = 'http://localhost:8000/api/messages';
  } else {
    render_url = process.env.REACT_APP_API_URL;
  }

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
        setLoading(0); // Reset loading state after successfully fetching more data
      }, 1500);
    } catch (error) {
      console.error('Error fetching more letters:', error);
      setLoading(2); // Set loading state to indicate error
    }
  };

  useEffect(() => {
    const fetchLetters = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setLoading(1);
      try {
        const response = await fetch(`${render_url}?offset=0&limit=150`, {
          // Fetch the first batch of 20 letters
          headers: {
            'x-api-key': api_key,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch letters');
        }
        const data = await response.json();
        setLetters(data); // Update the letters state with the fetched data
        setLoading(0);
      } catch (error) {
        console.error('Error fetching letters:', error);
        setLoading(2);
      }
    };

    fetchLetters();
  }, [render_url, api_key]);

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
          'x-api-key': api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        notify_error();
      }

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

  useEffect(() => {
    setScroll(
      new SmoothScroll('a[href*="#"]', {
        speed: 800, // Adjust the scrolling speed as needed
        speedAsDuration: true, // Use speed as the duration for the scroll animation
      }),
    );
  }, []);

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
      theme: 'dark',
    });

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  // const [searchedLetters, setSearchedLetters] = useState([]);

  const [searchedLetters, setSearchedLetters] = useState({
    messages: [],
    counts: {approved: 0, unapproved: 0},
  });

  // Update the searchLetters function to update the searchedLetters state
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
      // setLetters(data);
      setSearchedLetters(data); // Update the searchedLetters state with the search results
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

  const [filteredLetters, setFilteredLetters] = useState([]); // Initialize filteredLetters state as an empty array

  useEffect(() => {
    // Filter letters based on search term when searchTerm or letters changes
    const filteredData =
      searchTerm === ''
        ? letters.messages // No search term, use all messages
        : letters.messages.filter(letter => {
            const {from, to, message} = letter;
            const lowerCasedSearchTerm = searchTerm.toLowerCase();
            return (
              from.toLowerCase().includes(lowerCasedSearchTerm) ||
              to.toLowerCase().includes(lowerCasedSearchTerm) ||
              message.toLowerCase().includes(lowerCasedSearchTerm)
            );
          });
    setFilteredLetters(filteredData); // Update filteredLetters state
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
            opacity: 0.5,
          }}
        >
          {/* <span> {letters.counts.approved}</span> */}
          <div
            data-tooltip-id="al"
            data-tooltip-content={
              letters.counts.approved >= 2
                ? `Open Letters: ${tc(letters.counts.approved)}`
                : `Open Letter: ${letters.counts.approved}`
            }
            data-tooltip-place="left"
            data-tooltip-variant="info"
          >
            <IoMailOpenOutline size={24} style={{color: '#0056b3'}} />
          </div>
          <Tooltip id="al" />
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <div
            data-tooltip-id="pl"
            data-tooltip-content={
              letters.counts.unapproved >= 2
                ? `Pending Letters: ${letters.counts.unapproved}`
                : `Pending Letter: ${letters.counts.unapproved}`
            }
            data-tooltip-place="right"
            data-tooltip-variant="info"
          >
            <IoMailUnreadOutline size={25} style={{color: '#0056b3'}} />
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
        <div className="letters-container">
          {searchedResults.length > 0 && searchTerm !== '' ? (
            // Render searched letters if filteredLetters has results and searchTerm is not empty
            searchedResults.map((letter, index) => (
              <Letter
                key={index}
                letter={letter}
                toggleDetailsModal={toggleDetailsModal}
                setSelectedLetter={setSelectedLetter}
              />
            ))
          ) : // Render based on the original logic (all letters if no search term)
          searchTerm === '' ? (
            // Render all letters if no search term
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
            // Render message if no search results found
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
