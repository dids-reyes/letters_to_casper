// DetailsModal.js
import React from 'react';
import {BsX} from 'react-icons/bs';
import {BsMailboxFlag} from 'react-icons/bs';
import Typewriter from 'typewriter-effect';
import {Tooltip} from 'react-tooltip';

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
              <div className="letter-info">
                <p>
                  <Typewriter
                    options={{delay: 50, loop: false}}
                    onInit={typewriter => {
                      typewriter
                        .typeString(
                          `<strong>From:</strong> ${selectedLetter.from}`,
                        )
                        .start();
                    }}
                  />
                </p>
              </div>
              <div className="letter-info">
                <p>
                  <Typewriter
                    options={{delay: 50, loop: false}}
                    onInit={typewriter => {
                      typewriter
                        .typeString(`<strong>To:</strong> ${selectedLetter.to}`)
                        .start();
                    }}
                  />
                </p>
              </div>
              <div>
                <label htmlFor="timestamp">
                  <BsMailboxFlag size="25px" />
                </label>

                <a
                  href
                  data-tooltip-id="timezone_tooltip"
                  data-tooltip-content="Philippine Standard Time (UTC+08)"
                  data-tooltip-place="top"
                  data-tooltip-variant="info"
                >
                  <span className="timestamp-text">
                    <Typewriter
                      options={{delay: 70, loop: false}}
                      onInit={typewriter => {
                        typewriter
                          .typeString(formatTimestamp(selectedLetter.timestamp))
                          .start();
                      }}
                    />
                  </span>
                </a>
                <Tooltip id="timezone_tooltip" />
              </div>
              <div className="form-group">
                <div className="letter-text">
                  <p>
                    <Typewriter
                      options={{delay: 50, loop: false}}
                      onInit={typewriter => {
                        typewriter
                          .typeString(selectedLetter.message)
                          // .callFunction(() => {
                          //   console.log('String typed out!');
                          // })
                          // .pauseFor(1000)
                          // .deleteAll()
                          // .callFunction(() => {
                          //   console.log('All strings were deleted');
                          // })
                          .start();
                      }}
                    />
                  </p>
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
