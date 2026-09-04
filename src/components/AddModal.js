import React, {useMemo, useRef, useState, useEffect} from 'react';
import {BsX} from 'react-icons/bs';
import {RiMailSendLine} from 'react-icons/ri';
import {VscPreview} from 'react-icons/vsc';
import {IoImageOutline, IoTrashOutline} from 'react-icons/io5';
import {FaSpotify, FaYoutube} from 'react-icons/fa';
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
  const [photoError, setPhotoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStatus, setSubmitStatus] = useState('Preparing…');
  const photoInputRef = useRef(null);

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

  const confirmSubmit = async () => {
    const updatedLetter = {
      ...newLetter,
      message: newLetter.link
        ? `${newLetter.message}\n\n${newLetter.link}`
        : newLetter.message,
    };

    setIsSubmitting(true);
    setSubmitProgress(5);
    setSubmitStatus('Preparing letter…');
    const submitted = await handleAddLetter(updatedLetter, progress => {
      setSubmitProgress(progress.percent);
      setSubmitStatus(progress.label);
    });

    if (submitted) {
      setSubmitProgress(100);
      setSubmitStatus('Letter sent');
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    setIsSubmitting(false);

    if (submitted) {
      setShowSubmitConfirm(false);
      if (newLetter.photoPreviewUrl) URL.revokeObjectURL(newLetter.photoPreviewUrl);
      setNewLetter({from: '', to: '', message: ''});
      toggleAddModal();
      displayDirectLinkAds();
    }
  };

  const handlePhotoChange = event => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Choose an image smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    if (newLetter.photoPreviewUrl) URL.revokeObjectURL(newLetter.photoPreviewUrl);
    setPhotoError('');
    setNewLetter({
      ...newLetter,
      link: '',
      photoFile: file,
      photoPreviewUrl: URL.createObjectURL(file),
    });
  };

  const removePhoto = () => {
    if (newLetter.photoPreviewUrl) URL.revokeObjectURL(newLetter.photoPreviewUrl);
    if (photoInputRef.current) photoInputRef.current.value = '';
    setPhotoError('');
    const {photoFile, photoPreviewUrl, ...letterWithoutPhoto} = newLetter;
    setNewLetter(letterWithoutPhoto);
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
      photo: newLetter.photoPreviewUrl
        ? {url: newLetter.photoPreviewUrl}
        : undefined,
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
      newLetter.photoPreviewUrl,
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
                      Link <span className="compose-optional">Optional</span>
                    </label>
                    <div
                      className={`compose-link-field${
                        newLetter.photoFile ? ' is-disabled' : ''
                      }`}
                    >
                      <span className="compose-link-icons" aria-hidden="true">
                        <FaYoutube className="compose-link-icon--youtube" />
                        <FaSpotify className="compose-link-icon--spotify" />
                      </span>
                      <input
                        data-tooltip-id="link_tooltip"
                        data-tooltip-html="On YouTube/Spotify, tap Share → Copy Link<br />then paste it here"
                        data-tooltip-place="left-center"
                        data-tooltip-delay-show={0}
                        data-tooltip-variant="info"
                        autoComplete="off"
                        type="text"
                        id="link"
                        placeholder="Paste a link from YouTube or Spotify"
                        className="form-control error full-width"
                        value={newLetter.link || ''}
                        disabled={Boolean(newLetter.photoFile)}
                        onChange={event =>
                          setNewLetter({...newLetter, link: event.target.value})
                        }
                      />
                    </div>
                    <Tooltip id="link_tooltip" />
                    {newLetter.photoFile && (
                      <small className="compose-field-note">
                        Remove the photo to attach a song.
                      </small>
                    )}
                  </div>

                  <div className="form-group compose-photo-group">
                    <div className="compose-photo-label">
                      <label htmlFor="letter-photo" className="label-top-left">
                        Photo <span>Optional</span>
                      </label>
                      <small>JPG, PNG or WebP · up to 5 MB · Best at 4:3</small>
                    </div>

                    {newLetter.photoPreviewUrl ? (
                      <div className="compose-photo-preview">
                        <img
                          src={newLetter.photoPreviewUrl}
                          alt="Letter attachment preview"
                        />
                        <span className="compose-photo-preview__details">
                          <strong>Photo attached</strong>
                          <small title={newLetter.photoFile?.name}>
                            {newLetter.photoFile?.name}
                          </small>
                        </span>
                        <button
                          type="button"
                          onClick={removePhoto}
                          aria-label="Remove attached photo"
                        >
                          <IoTrashOutline />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`compose-photo-picker${
                          newLetter.link ? ' is-disabled' : ''
                        }`}
                        htmlFor="letter-photo"
                      >
                        <IoImageOutline size="21px" />
                        <span>
                          <strong>Attach a photo</strong>
                          <small>
                            {newLetter.link
                              ? 'Remove the song link first'
                              : 'It will appear beneath your letter'}
                          </small>
                        </span>
                      </label>
                    )}
                    <input
                      ref={photoInputRef}
                      id="letter-photo"
                      className="compose-photo-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={Boolean(newLetter.link)}
                      onChange={handlePhotoChange}
                    />
                    {photoError && (
                      <small className="compose-photo-error" role="alert">
                        {photoError}
                      </small>
                    )}
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
                    disabled={isSubmitDisabled || isSubmitting}
                  >
                    <strong>
                      {isSubmitting ? `${submitStatus} ${submitProgress}%` : 'Submit Letter'}
                    </strong>
                    <RiMailSendLine className="submit-icon" size="18px" />
                  </button>
                </div>
                {isSubmitting && (
                  <div
                    className="compose-submit-progress"
                    role="progressbar"
                    aria-label={submitStatus}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={submitProgress}
                  >
                    <span style={{width: `${submitProgress}%`}} />
                  </div>
                )}
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
                disabled={isSubmitting}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="submit-confirm-send"
                onClick={confirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? `${submitStatus} ${submitProgress}%`
                  : 'Submit letter'}
                <RiMailSendLine size="17px" />
              </button>
            </div>
            {isSubmitting && (
              <div
                className="compose-submit-progress"
                role="progressbar"
                aria-label={submitStatus}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={submitProgress}
              >
                <span style={{width: `${submitProgress}%`}} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AddModal;
