import React, {useRef} from 'react';
import {BsX, BsFillSendFill} from 'react-icons/bs';

function AddModal({
  showAddModal,
  toggleAddModal,
  newLetter,
  handleAddLetter,
  setNewLetter,
}) {
  const fromInputRef = useRef(null);

  const handleSubmit = () => {
    handleAddLetter(); // Call handleAddLetter function when the user submits the message
    // Optionally, clear the form fields
    setNewLetter({from: '', to: '', message: ''});
    // Optionally, close the modal after submitting the message
    toggleAddModal();
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
                onClick={handleSubmit} // Call handleSubmit function when the user clicks the "Submit" button
              >
                Submit
                <BsFillSendFill className="submit-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default AddModal;
