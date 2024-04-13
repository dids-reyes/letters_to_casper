import React, {useRef, useState, useEffect} from 'react';
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
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    // Enable or disable the submit button based on the form fields
    const shouldDisableSubmit =
      !newLetter.from || !newLetter.to || !newLetter.message;
    setIsSubmitDisabled(shouldDisableSubmit);
  }, [newLetter]);

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
          <div>
            <div className="modal-header">
              <button type="button" className="close" onClick={toggleAddModal}>
                <BsX className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="from">From:</label>
                <input
                  autoComplete="off"
                  required
                  type="text"
                  id="from"
                  placeholder="e.g., Christoph | Chris | C"
                  className="form-control error"
                  value={newLetter.from}
                  maxLength="30"
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
                  autoComplete="off"
                  required
                  type="text"
                  id="to"
                  placeholder="e.g., Emily Brown | Em | E"
                  className="form-control error"
                  value={newLetter.to}
                  maxLength="30"
                  onChange={event =>
                    setNewLetter({...newLetter, to: event.target.value})
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message:</label>
                <span>
                  <textarea
                    autoComplete="off"
                    required
                    id="message"
                    placeholder={`Hi... 

Hello...

Goodbye...

https://open.spotify.com/track/`}
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
                className={`${
                  isSubmitDisabled ? 'disabled-button' : 'submit-button'
                }`}
                onClick={handleSubmit} // Call handleSubmit function when the user clicks the "Submit" button
                disabled={isSubmitDisabled} // Disable the button if any field is empty
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
