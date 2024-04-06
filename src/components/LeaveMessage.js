import {useState, useRef} from 'react';
import {TbMessageCircleHeart} from 'react-icons/tb';
import {BsX, BsFillSendFill, BsXLg} from 'react-icons/bs';
import '../App.css';

export default function LeaveMessage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [letters, setLetters] = useState([]);
  const [newLetter, setNewLetter] = useState({
    from: '',
    to: '',
    message: '',
  });
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const fromInputRef = useRef(null);

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  const handleAddLetter = () => {
    const {from, to, message} = newLetter;

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
    const updatedLetter = {...newLetter, timestamp};
    setLetters([...letters, updatedLetter]);
    setNewLetter({from: '', to: '', message: ''});
    setSelectedLetter(null);
    toggleAddModal();
  };

  return (
    <div className="add-button">
      <button className="btn btn-primary big-button" onClick={toggleAddModal}>
        <TbMessageCircleHeart className="button-icon" />
        Leave a Message
      </button>
      {showAddModal && (
        <div className="modal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close-icon"
                  onClick={toggleAddModal}
                >
                  <BsXLg className="close-icon" />
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
                    onChange={event =>
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
                    onChange={event =>
                      setNewLetter({...newLetter, to: event.target.value})
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message:</label>
                  <textarea
                    id="message"
                    className="form-control big-textarea error"
                    value={newLetter.message}
                    onChange={event =>
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
    </div>
  );
}
