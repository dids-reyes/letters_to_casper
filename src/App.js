import React, { useState, useEffect, useRef } from 'react';
import { BsChatSquareDotsFill, BsX, BsFillSendFill } from 'react-icons/bs';
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
  const fromInputRef = useRef(null);

  useEffect(() => {
    if (showAddModal) {
      fromInputRef.current.focus();
    }
  }, [showAddModal]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  const handleAddLetter = () => {
    const { from, to, message } = newLetter;

    // Check if any field is empty
    if (from.trim() === '' || to.trim() === '' || message.trim() === '') {
      // Highlight the empty fields in red
      if (from.trim() === '') {
        document.getElementById('from').classList.add('error');
      } else {
        document.getElementById('from').classList.remove('error');
      }

      if (to.trim() === '') {
        document.getElementById('to').classList.add('error');
      } else {
        document.getElementById('to').classList.remove('error');
      }

      if (message.trim() === '') {
        document.getElementById('message').classList.add('error');
      } else {
        document.getElementById('message').classList.remove('error');
      }

      return; // Don't proceed further if any field is empty
    }

    // Clear the error styling
    document.getElementById('from').classList.remove('error');
    document.getElementById('to').classList.remove('error');
    document.getElementById('message').classList.remove('error');

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
    });
    const updatedLetter = { ...newLetter, timestamp };
    setLetters([...letters, updatedLetter]);
    setNewLetter({ from: '', to: '', message: '' });
    setSelectedLetter(null);
    toggleAddModal();
  };

  const toggleDetailsModal = () => {
    setShowDetailsModal(!showDetailsModal);
  };

  const handleDeleteLetter = (index) => {
    const updatedLetters = [...letters];
    updatedLetters.splice(index, 1);
    setLetters(updatedLetters);
  };

  return (
    <div className="container-fluid d-flex justify-content-center app-container">
      <div className="app">
        <div className="header">
          <h1 className="app-title">Letters to Casper</h1>
          <div className="search-bar">
            <input
              type="text"
              className="form-control search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search letters"
            />
          </div>
        </div>
        <div className="add-button">
          <button className="btn btn-primary big-button" onClick={toggleAddModal}>
            <BsChatSquareDotsFill className="button-icon" />
            Leave a Message
          </button>
        </div>
        {showAddModal && (
          <div className="modal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button
                    type="button"
                    className="close"
                    onClick={toggleAddModal}
                  >
                    <BsX className="close-icon" />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="from">From:</label>
                    <input
                      type="text"
                      id="from"
                      className="form-control error"
                      value={newLetter.from}
                      onChange={(event) =>
                        setNewLetter({
                          ...newLetter,
                          from: event.target.value,
                        })
                      }
                      ref={fromInputRef}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="to">To:</label>
                    <input
                      type="text"
                      id="to"
                      className="form-control error"
                      value={newLetter.to}
                      onChange={(event) =>
                        setNewLetter({ ...newLetter, to: event.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message:</label>
                    <textarea
                      id="message"
                      className="form-control big-textarea error"
                      value={newLetter.message}
                      onChange={(event) =>
                        setNewLetter({
                          ...newLetter,
                          message: event.target.value,
                        })
                      }
                    ></textarea>
                    <small className="character-count">
                      Characters: {newLetter.message.length}
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-primary submit-button"
                    onClick={handleAddLetter}
                  >
                    Submit
                    <BsFillSendFill className="submit-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="letters-container">
          {letters
            .filter((letter) => {
              const { from, to, message } = letter;
              const lowerCasedSearchTerm = searchTerm.toLowerCase();
              return (
                from.toLowerCase().includes(lowerCasedSearchTerm) ||
                to.toLowerCase().includes(lowerCasedSearchTerm) ||
                message.toLowerCase().includes(lowerCasedSearchTerm)
              );
            })
            .map((letter, index) => (
              <div
                className="letter-card"
                key={index}
                onClick={() => {
                  setSelectedLetter(letter);
                  toggleDetailsModal();
                }}
              >
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{letter.from}</h5>
                    <p className="card-preview">
                      {letter.message.length > 50
                        ? `${letter.message.substring(0, 50)}...`
                        : letter.message}
                    </p>
                  </div>
                </div>
                <div
                  className="delete-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteLetter(index);
                  }}
                >
                  <BsX className="delete-icon" />
                </div>
              </div>
            ))}
        </div>
      </div>
      {showDetailsModal && selectedLetter && (
        <div className="modal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  onClick={toggleDetailsModal}
                >
                  <BsX className="close-icon" />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="from">From:</label>
                  <input
                    type="text"
                    id="from"
                    className="form-control"
                    value={selectedLetter.from}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="to">To:</label>
                  <input
                    type="text"
                    id="to"
                    className="form-control"
                    value={selectedLetter.to}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message:</label>
                  <textarea
                    id="message"
                    className="form-control big-textarea"
                    value={selectedLetter.message}
                    disabled
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="timestamp">Timestamp:</label>
                  <input
                    type="text"
                    id="timestamp"
                    className="form-control"
                    value={selectedLetter.timestamp}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
