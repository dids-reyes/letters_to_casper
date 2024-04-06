import React, {useState, useEffect} from 'react';
import {BsChatSquareDotsFill} from 'react-icons/bs';
import Header from './components/Header';
import AddModal from './components/AddModal';
import Letter from './components/Letter';
import DetailsModal from './components/DetailsModal';
import {TbMessageCircleHeart} from 'react-icons/tb';
import './App.css';

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

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await fetch(render_url);
        if (!response.ok) {
          throw new Error('Failed to fetch letters');
        }
        const data = await response.json();
        setLetters(data); // Update the letters state with the fetched data
      } catch (error) {
        console.error('Error fetching letters:', error);
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
            <TbMessageCircleHeart className="button-icon" />
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
        <DetailsModal
          showDetailsModal={showDetailsModal}
          toggleDetailsModal={toggleDetailsModal}
          selectedLetter={selectedLetter}
        />
      </div>
    </div>
  );
}

export default App;
