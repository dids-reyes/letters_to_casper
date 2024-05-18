import React, {useRef, useState, useEffect} from 'react';
import {BsX} from 'react-icons/bs';
import {RiMailSendLine} from 'react-icons/ri';
import {VscPreview} from 'react-icons/vsc';
import DetailsModal from './DetailsModal';

function AddModal({
  showAddModal,
  toggleAddModal,
  newLetter,
  handleAddLetter,
  setNewLetter,
}) {
  const fromInputRef = useRef(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const shouldDisableSubmit =
      !newLetter.from ||
      !newLetter.to ||
      !newLetter.message ||
      newLetter.message.length < 10;
    setIsSubmitDisabled(shouldDisableSubmit);
  }, [newLetter]);

  const handleSubmit = () => {
    const confirmAction = window.confirm(
      'When approved, your letter will be public. Proceed?',
    );
    if (confirmAction) {
      handleAddLetter();
      setNewLetter({from: '', to: '', message: ''});
      toggleAddModal();
    } else {
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
  });

  return (
    <>
      {showAddModal &&
        !showPreview && ( // Show AddModal only if it's not hidden and Preview is not shown
          <div className="modal">
            <div className="modal-add-dialog">
              <div>
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
                    <label htmlFor="from" className="label-top-left">
                      From:
                    </label>
                    <input
                      autoComplete="off"
                      required
                      type="text"
                      id="from"
                      placeholder="e.g. Christoph | Chris | C"
                      className="form-control"
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
                    <label htmlFor="to" className="label-top-left">
                      To:
                    </label>
                    <input
                      autoComplete="off"
                      required
                      type="text"
                      id="to"
                      placeholder="e.g. Emily Brown | Em | E"
                      className="form-control error full-width"
                      value={newLetter.to}
                      maxLength="30"
                      onChange={event =>
                        setNewLetter({...newLetter, to: event.target.value})
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="label-top-left">
                      Message:
                    </label>
                    <span>
                      <textarea
                        style={{overflow: 'auto', resize: 'none'}}
                        autoComplete="off"
                        required
                        id="message"
                        placeholder={`Hi... 

Hello...

Goodbye...

link/url (Spotify, YouTube)`}
                        className="big-textarea full-width"
                        value={newLetter.message}
                        maxLength="500"
                        onChange={event =>
                          setNewLetter({
                            ...newLetter,
                            message: event.target.value,
                          })
                        }
                      ></textarea>
                      <small className="character-count">
                        Characters: {newLetter.message.length}/500
                      </small>
                    </span>
                  </div>
                </div>
                <div className="modal-footer">
                  {!showPreview && !isSubmitDisabled && (
                    <button className="preview-button" onClick={togglePreview}>
                      <strong>PREVIEW</strong>
                      &nbsp;
                      <VscPreview className="preview-icon" size="18px" />
                    </button>
                  )}
                  &nbsp;
                  <button
                    className={`${
                      isSubmitDisabled ? 'disabled-button' : 'submit-button'
                    }`}
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                  >
                    <strong>SUBMIT LETTER</strong>
                    <RiMailSendLine className="submit-icon" size="18px" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      {showPreview && ( // Show DetailsModal only if Preview is shown
        <DetailsModal
          selectedLetter={{...newLetter, timestamp: timestamp, preview: true}}
          toggleDetailsModal={togglePreview}
          showDetailsModal={true}
        />
      )}
    </>
  );
}

export default AddModal;
