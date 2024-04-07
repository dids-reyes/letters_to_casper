// DetailsModal.js
import React from 'react';
import {BsX} from 'react-icons/bs';
import {BsMailboxFlag} from 'react-icons/bs';
import '../App.css';

function DetailsModal({showDetailsModal, toggleDetailsModal, selectedLetter}) {
  const formatTimestamp = timestamp => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return new Date(timestamp).toLocaleString('en-US', options);
  };

  return (
    showDetailsModal &&
    selectedLetter && (
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
                <label htmlFor="timestamp">
                  <BsMailboxFlag size="25px" />
                </label>
                <span className="timestamp-text">
                  {formatTimestamp(selectedLetter.timestamp)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default DetailsModal;
