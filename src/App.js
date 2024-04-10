import React, {useState, useEffect} from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AddModal from './components/AddModal';
import Letter from './components/Letter';
import DetailsModal from './components/DetailsModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import {AiFillMessage} from 'react-icons/ai';
import {FaRegHandPointUp} from 'react-icons/fa';
import Lottie from 'react-lottie';
import ghost1 from './lotties/ghost1.json';
import under_construction from './lotties/under_construction.json';
import {GiMailbox} from 'react-icons/gi';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Route, Routes, useLocation} from 'react-router-dom';
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

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [letters, setLetters] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLetter, setNewLetter] = useState({
    from: '',
    to: '',
    message: '',
    approve: false,
  });
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const location = useLocation(); // Hook to get the current route location

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
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
        setLoading(0);
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

      setLetters([...letters, messageData]);
      // If message added successfully, reset the newLetter state
      setNewLetter({from: '', to: '', message: ''});
      notify_success();

      // Optionally, fetch updated letters from backend after successful addition
      // fetchLetters();
    } catch (error) {
      notify_error();
      console.error('Error adding message:', error);
    }
  };

  const toggleDetailsModal = () => {
    setShowDetailsModal(!showDetailsModal);
  };

  return (
    <div className="container-fluid d-flex justify-content-center app-container">
      {location.pathname !== '/privacy_policy' && (
        <>
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
                <AiFillMessage className="button-icon" size="20px" />
                Leave a Letter
              </button>
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
        </>
      )}
      <Routes>
        <Route path="/privacy_policy" element={<PrivacyPolicy />} />
      </Routes>
      <FloatingActionButton />
    </div>
  );
}

export default App;
