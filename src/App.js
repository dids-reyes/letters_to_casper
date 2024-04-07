import React, {useState, useEffect} from 'react';
import Header from './components/Header';
import AddModal from './components/AddModal';
import Letter from './components/Letter';
import DetailsModal from './components/DetailsModal';
import {BiSolidMessageSquareEdit} from 'react-icons/bi';
import {FaRegHandPointUp} from 'react-icons/fa';
import Lottie from 'react-lottie';
import ghost1 from './lotties/ghost1.json';
import under_construction from './lotties/under_construction.json';
import {GiMailbox} from 'react-icons/gi';
import './App.css';

function FloatingActionButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button className="fab" onClick={scrollToTop}>
      <FaRegHandPointUp />
    </button>
  );
}

function Footer() {
  return (
    <div className="footer">
      <p>
        If you want to request deletion of your post, contact us at{' '}
        <strong>letters2casper@gmail.com</strong>
      </p>
    </div>
  );
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [letters, setLetters] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLetter, setNewLetter] = useState({
    from: '',
    to: '',
    message: '',
  });
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  const render_url = 'https://ltc-service.onrender.com/api/messages';
  const [loading, setLoading] = useState(1); // State to track loading state

  useEffect(() => {
    const fetchLetters = async () => {
      setLoading(1); // Set loading state to true before fetching data
      try {
        const response = await fetch(render_url);
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
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts

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
        throw new Error('Failed to add message');
      }

      setLetters([...letters, messageData]);
      // If message added successfully, reset the newLetter state
      setNewLetter({from: '', to: '', message: ''});

      // Optionally, fetch updated letters from backend after successful addition
      // fetchLetters();
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const toggleDetailsModal = () => {
    setShowDetailsModal(!showDetailsModal);
  };

  return (
    <div className="container-fluid d-flex justify-content-center app-container">
      <div className="app">
        <Header
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
        />
        <div className="add-button">
          <button
            className="btn btn-primary big-button"
            onClick={toggleAddModal}
          >
            <BiSolidMessageSquareEdit className="button-icon" size="22px" />
            Leave a Message
          </button>
        </div>
        <AddModal
          showAddModal={showAddModal}
          toggleAddModal={toggleAddModal}
          newLetter={newLetter}
          handleAddLetter={handleAddLetter}
          setNewLetter={setNewLetter}
        />
        {loading === 1 ? ( // Render loading spinner or message if data is being fetched
          <>
            <Lottie
              options={{
                animationData: ghost1,
                loop: true,
                autoplay: true,
              }}
              height={300}
              width={300}
            />
            <p>Please wait while we load all Letters...</p>
            <GiMailbox size="60px" />
          </>
        ) : loading === 2 ? (
          <>
            <Lottie
              options={{
                animationData: under_construction,
                loop: true,
                autoplay: true,
              }}
              height={300}
              width={300}
            />
            <p>
              Our service is temporarily unavailable as we're making
              improvements behind the scenes.
              <br />
              Please bear with us while we work to enhance your experience.{' '}
              <br />
              Thank you for your continued support!
            </p>
          </>
        ) : loading === 0 ? (
          <div className="letters-container">
            {letters
              .filter(letter => {
                const {from, to, message} = letter;
                const lowerCasedSearchTerm = searchTerm.toLowerCase();
                return (
                  from.toLowerCase().includes(lowerCasedSearchTerm) ||
                  to.toLowerCase().includes(lowerCasedSearchTerm) ||
                  message.toLowerCase().includes(lowerCasedSearchTerm)
                );
              })
              .map((letter, index) => (
                <Letter
                  key={index}
                  letter={letter}
                  toggleDetailsModal={toggleDetailsModal}
                  setSelectedLetter={setSelectedLetter}
                />
              ))}
          </div>
        ) : null}
        <DetailsModal
          showDetailsModal={showDetailsModal}
          toggleDetailsModal={toggleDetailsModal}
          selectedLetter={selectedLetter}
        />
      </div>
      <Footer />
      <FloatingActionButton />
    </div>
  );
}

export default App;
