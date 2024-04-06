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
      'This will Post your written Message Publicly, if you wish to delete your entry, you will need to request a deletion of your Post to letters2casper@gmail.com. Are you sure you want to proceed?',
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
        <div className="modal-dialog">
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
                  type="text"
                  id="from"
                  placeholder="Juan Dela Cruz | jdc | tagapagbantay"
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
                />
              </div>
              <div className="form-group">
                <label htmlFor="to">To:</label>
                <input
                  type="text"
                  id="to"
                  placeholder="TOTGA | LOML"
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
                <textarea
                  id="message"
                  placeholder="Hi... Hello... Goodbye..."
                  className="form-control big-textarea error"
                  value={newLetter.message}
                  maxLength="100"
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
                onClick={handleSubmit} // Call handleSubmit function when the user clicks the "Submit" button
              >
                <strong>POST</strong>
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
