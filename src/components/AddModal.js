import React, {useRef} from 'react';
import {BsX} from 'react-icons/bs';
import {RiMailSendLine} from 'react-icons/ri';

function AddModal({
  showAddModal,
  toggleAddModal,
  newLetter,
  handleAddLetter,
  setNewLetter,
}) {
  const fromInputRef = useRef(null);

  const handleSubmit = () => {
    const confirmAction = window.confirm(
      'When Approved this will post and display your letter Publicly. Are you sure you want to proceed?',
    );
    if (confirmAction) {
      handleAddLetter(); // Call handleAddLetter function when the user submits the message
      // Optionally, clear the form fields
      setNewLetter({from: '', to: '', message: ''});
      // Optionally, close the modal after submitting the message
      toggleAddModal();
    } else {
      // Handle cancel action
    }
  };

  return (
    showAddModal && (
      <div className="modal">
        <div className="modal-add-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" onClick={toggleAddModal}>
                <BsX className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="from">From:</label>
                <input
                  required
                  type="text"
                  id="from"
                  placeholder="Name or Alias (e.g., JaneSmith | Jane | J)"
                  className="form-control error"
                  value={newLetter.from}
                  maxLength="15"
                  onChange={event =>
                    setNewLetter({
                      ...newLetter,
                      from: event.target.value,
                    })
                  }
                  ref={fromInputRef}
                  onInvalid={e =>
                    e.target.setCustomValidity(
                      'Please enter a value for this field',
                    )
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="to">To:</label>
                <input
                  type="text"
                  id="to"
                  placeholder="Name or Alias (e.g., JohnDoe | John)"
                  className="form-control error"
                  value={newLetter.to}
                  maxLength="15"
                  onChange={event =>
                    setNewLetter({...newLetter, to: event.target.value})
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message:</label>
                <span>
                  <textarea
                    id="message"
                    placeholder={`Hi... 

Hello...

Goodbye...`}
                    className="big-textarea"
                    value={newLetter.message}
                    maxLength="600"
                    onChange={event =>
                      setNewLetter({
                        ...newLetter,
                        message: event.target.value,
                      })
                    }
                  ></textarea>
                  <small className="character-count">
                    Characters: {newLetter.message.length}/600
                  </small>
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary submit-button"
                onClick={handleSubmit} // Call handleSubmit function when the user clicks the "Submit" button
              >
                <strong>SUBMIT LETTER</strong>
                <RiMailSendLine className="submit-icon" size="20px" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default AddModal;
