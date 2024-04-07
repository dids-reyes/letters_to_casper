// DetailsModal.js
import React from 'react';
import {BsX} from 'react-icons/bs';
import {BsMailboxFlag} from 'react-icons/bs';
import '../App.css';

function DetailsModal({showDetailsModal, toggleDetailsModal, selectedLetter}) {
  const formatTimestamp = timestamp => {
    const options = {
      weekday: 'long',
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
                <div className="letter-info">
                  <strong>From:</strong> {selectedLetter.from}
                </div>
              </div>
              <div className="form-group">
                <div className="letter-info">
                  <strong>To:</strong> {selectedLetter.to}
                </div>
              </div>
              <div>
                <label htmlFor="timestamp">
                  <BsMailboxFlag size="25px" />
                </label>
                <span className="timestamp-text">
                  {formatTimestamp(selectedLetter.timestamp)}
                </span>
              </div>
              <div className="form-group">
                <div className="letter-text">
                  <p>{selectedLetter.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default DetailsModal;
