import React, {useMemo, useRef, useState, useEffect} from 'react';
import {BsX} from 'react-icons/bs';
import {RiMailSendLine} from 'react-icons/ri';
import {VscPreview} from 'react-icons/vsc';
import DetailsModal from './DetailsModal';
import { displayDirectLinkAds } from '../data/direct_link';
import {Tooltip} from 'react-tooltip';

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
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    const shouldDisableSubmit =
      !newLetter.from ||
      !newLetter.to ||
      !newLetter.message ||
      newLetter.message.length < 10;
    setIsSubmitDisabled(shouldDisableSubmit);
  }, [newLetter]);

  const handleSubmit = () => {
    if (!isSubmitDisabled) {
      setShowSubmitConfirm(true);
    }
  };

  const confirmSubmit = () => {
    const updatedLetter = {
      ...newLetter,
      message: newLetter.link
        ? `${newLetter.message}\n\n${newLetter.link}`
        : newLetter.message,
    };

    setShowSubmitConfirm(false);
    handleAddLetter(updatedLetter);
    setNewLetter({from: '', to: '', message: ''});
    toggleAddModal();
    displayDirectLinkAds();
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const previewLetter = useMemo(
    () => ({
      from: newLetter.from,
      to: newLetter.to,
      message: newLetter.link
        ? `${newLetter.message}\n\n${newLetter.link}`
        : newLetter.message,
      approve: newLetter.approve,
      timestamp: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
      }),
      preview: true,
    }),
    [
      newLetter.from,
      newLetter.to,
      newLetter.message,
      newLetter.link,
      newLetter.approve,
    ],
  );

  return (
    <>
      {showAddModal &&
        !showPreview && ( // Show AddModal only if it's not hidden and Preview is not shown
          <div className="modal compose-modal">
            <div
              className="modal-add-dialog compose-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="compose-title"
            >
              <div className="compose-content">
                <div className="modal-header">
                  <div className="compose-heading">
                    <span className="compose-heading-icon">
                      <RiMailSendLine size="22px" />
                    </span>
                    <div>
                      <h2 id="compose-title">Write your letter</h2>
                      <p>Share what your heart has been holding.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="close"
                    onClick={toggleAddModal}
                    aria-label="Close letter form"
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
                  <div className="form-group message-form-group">
                    <label htmlFor="message" className="label-top-left">
                      Message:
                    </label>
                    <span className="compose-message-field">
                      <textarea
                        style={{overflow: 'auto', resize: 'none'}}
                        autoComplete="off"
                        required
                        id="message"
                        placeholder={`Hi... 

Hello...

Goodbye...`}
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
                        {newLetter.message.length}/500
                      </small>
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="link" className="label-top-left">
                      Link:
                    </label>
                    <input
                      data-tooltip-id="link_tooltip"
                      data-tooltip-html="On YouTube/Spotify, tap Share → Copy Link<br />then paste it here"
                      data-tooltip-place="left-center"
                      data-tooltip-delay-show={0}
                      data-tooltip-variant="info"
                      autoComplete="off"
                      type="text"
                      id="link"
                      placeholder="Optional: Paste a link from YT or Spotify"
                      className="form-control error full-width"
                      value={newLetter.link || ''}
                      onChange={event =>
                        setNewLetter({...newLetter, link: event.target.value})
                      }
                    />
                    <Tooltip id="link_tooltip" />
                  </div>

                </div>
                <div className="modal-footer">
                  {!showPreview && !isSubmitDisabled && (
                    <button
                      type="button"
                      className="preview-button"
                      onClick={togglePreview}
                    >
                      <strong>Preview</strong>
                      <VscPreview className="preview-icon" size="18px" />
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${
                      isSubmitDisabled ? 'disabled-button' : 'submit-button'
                    }`}
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                  >
                    <strong>Submit Letter</strong>
                    <RiMailSendLine className="submit-icon" size="18px" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      {showPreview && ( // Show DetailsModal only if Preview is shown
        <DetailsModal
          selectedLetter={previewLetter}
          toggleDetailsModal={togglePreview}
          showDetailsModal={true}
        />
      )}
      {showSubmitConfirm && (
        <div
          className="submit-confirm-overlay"
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div
            className="submit-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="submit-confirm-title"
            aria-describedby="submit-confirm-description"
            onClick={event => event.stopPropagation()}
          >
            <span className="submit-confirm-icon" aria-hidden="true">
              <RiMailSendLine size="23px" />
            </span>
            <h2 id="submit-confirm-title">Submit this letter?</h2>
            <p id="submit-confirm-description">
              Your letter will be sent for review before it appears on the
              site.
            </p>
            <ul className="submit-confirm-notes">
              <li>Once approved, the letter becomes publicly readable.</li>
              <li>Only the general city it was sent from may be shown.</li>
            </ul>
            <div className="submit-confirm-actions">
              <button
                type="button"
                className="submit-confirm-cancel"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="submit-confirm-send"
                onClick={confirmSubmit}
              >
                Submit letter
                <RiMailSendLine size="17px" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddModal;
