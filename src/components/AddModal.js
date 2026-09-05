import React, {useMemo, useRef, useState, useEffect} from 'react';
import {BsCheck2, BsClipboard, BsX} from 'react-icons/bs';
import {RiMailSendLine} from 'react-icons/ri';
import {VscPreview} from 'react-icons/vsc';
import {
  IoContractOutline,
  IoExpandOutline,
  IoImageOutline,
  IoShareSocialOutline,
  IoShieldCheckmarkOutline,
  IoTrashOutline,
} from 'react-icons/io5';
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
  const [showSubmissionNotice, setShowSubmissionNotice] = useState(false);
  const [showShareCelebration, setShowShareCelebration] = useState(false);
  const [siteShareStatus, setSiteShareStatus] = useState('');
  const [submittedBurnKey, setSubmittedBurnKey] = useState('');
  const [burnKeyCopied, setBurnKeyCopied] = useState(false);
  const [showBurnKeyHint, setShowBurnKeyHint] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStatus, setSubmitStatus] = useState('Preparing…');
  const [activeLinkIcon, setActiveLinkIcon] = useState('youtube');
  const [focusWriterMode, setFocusWriterMode] = useState(false);
  const photoInputRef = useRef(null);
  const focusTextareaRef = useRef(null);

  useEffect(() => {
    if (!showAddModal) {
      setFocusWriterMode(false);
      return undefined;
    }

    setActiveLinkIcon('youtube');
    const iconTimer = window.setInterval(() => {
      setActiveLinkIcon(current =>
        current === 'youtube' ? 'spotify' : 'youtube',
      );
    }, 5000);

    return () => window.clearInterval(iconTimer);
  }, [showAddModal]);

  useEffect(() => {
    if (!focusWriterMode) return undefined;

    focusTextareaRef.current?.focus();
    const leaveFocusMode = event => {
      if (event.key === 'Escape') setFocusWriterMode(false);
    };
    document.addEventListener('keydown', leaveFocusMode);
    return () => document.removeEventListener('keydown', leaveFocusMode);
  }, [focusWriterMode]);

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
      setSubmittedBurnKey(submitted.burnKey || '');
      setBurnKeyCopied(false);
      setShowBurnKeyHint(false);
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
      setShowSubmissionNotice(true);
      displayDirectLinkAds();
    }
  };

  const copyBurnKey = async () => {
    if (!submittedBurnKey) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(submittedBurnKey);
      } else {
        const copyField = document.createElement('textarea');
        copyField.value = submittedBurnKey;
        copyField.setAttribute('readonly', '');
        copyField.style.position = 'fixed';
        copyField.style.opacity = '0';
        document.body.appendChild(copyField);
        copyField.select();
        document.execCommand('copy');
        document.body.removeChild(copyField);
      }
      setBurnKeyCopied(true);
      setShowBurnKeyHint(false);
    } catch (error) {
      setBurnKeyCopied(false);
    }
  };

  const finishSubmissionNotice = () => {
    setShowSubmissionNotice(false);
    setShowShareCelebration(true);
    setSiteShareStatus('');
  };

  const shareWebsite = async () => {
    const shareData = {
      title: 'Letters to Casper',
      text: 'A quiet place for words we carry. Read a letter or leave one of your own.',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setSiteShareStatus('Thanks for sharing the warmth.');
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url);
        setSiteShareStatus('Website link copied. Share it with someone who may need it.');
      } else {
        const copyField = document.createElement('textarea');
        copyField.value = shareData.url;
        copyField.setAttribute('readonly', '');
        copyField.style.position = 'fixed';
        copyField.style.opacity = '0';
        document.body.appendChild(copyField);
        copyField.select();
        document.execCommand('copy');
        document.body.removeChild(copyField);
        setSiteShareStatus('Website link copied. Share it with someone who may need it.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setSiteShareStatus('Sharing is unavailable right now.');
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
                    <span className="compose-short-field">
                      <input
                        autoComplete="off"
                        required
                        type="text"
                        id="from"
                        placeholder="Your name, nickname, or initial"
                        className="form-control"
                        value={newLetter.from}
                        maxLength="20"
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
                      <small className="character-count">
                        {newLetter.from.length}/20
                      </small>
                    </span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="to" className="label-top-left">
                      To:
                    </label>
                    <span className="compose-short-field">
                      <input
                        autoComplete="off"
                        required
                        type="text"
                        id="to"
                        placeholder="Who is this letter for?"
                        className="form-control error full-width"
                        value={newLetter.to}
                        maxLength="20"
                        onChange={event =>
                          setNewLetter({...newLetter, to: event.target.value})
                        }
                      />
                      <small className="character-count">
                        {newLetter.to.length}/20
                      </small>
                    </span>
                  </div>
                  <div className="form-group message-form-group">
                    <div className="compose-message-label">
                      <label htmlFor="message" className="label-top-left">
                        Message:
                      </label>
                      <button
                        type="button"
                        className="compose-focus-toggle"
                        onClick={() => setFocusWriterMode(true)}
                      >
                        <IoExpandOutline aria-hidden="true" />
                        <span>Focus mode</span>
                      </button>
                    </div>
                    <span className="compose-message-field">
                      <textarea
                        style={{overflow: 'auto', resize: 'none'}}
                        autoComplete="off"
                        required
                        id="message"
                        placeholder="Write what you’ve been wanting to say…"
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
                        {activeLinkIcon === 'youtube' ? (
                          <FaYoutube
                            key="youtube"
                            className="compose-link-icon--youtube"
                          />
                        ) : (
                          <FaSpotify
                            key="spotify"
                            className="compose-link-icon--spotify"
                          />
                        )}
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
              {focusWriterMode && (
                <section
                  className="compose-focus-writer"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="focus-writer-title"
                >
                  <header className="compose-focus-writer__header">
                    <div>
                      <span>Just you and your words</span>
                      <h2 id="focus-writer-title">Focus writing</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFocusWriterMode(false)}
                      aria-label="Exit focus writing mode"
                    >
                      <IoContractOutline aria-hidden="true" />
                      <span>Return to letter</span>
                    </button>
                  </header>
                  <div className="compose-focus-writer__paper">
                    <textarea
                      ref={focusTextareaRef}
                      value={newLetter.message}
                      maxLength="500"
                      placeholder="Write freely. Take all the time you need…"
                      onChange={event =>
                        setNewLetter({
                          ...newLetter,
                          message: event.target.value,
                        })
                      }
                    />
                    <small>{newLetter.message.length}/500</small>
                  </div>
                  <p className="compose-focus-writer__hint">
                    Your words are kept when you return. Press Esc to exit.
                  </p>
                </section>
              )}
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
      {showSubmissionNotice && (
        <div
          className="submit-confirm-overlay submission-notice-overlay"
          onClick={() => {
            if (!submittedBurnKey) setShowSubmissionNotice(false);
          }}
        >
          <div
            className="submit-confirm-dialog submission-notice-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-notice-title"
            aria-describedby="submission-notice-description"
            onClick={event => event.stopPropagation()}
          >
            <span
              className="submit-confirm-icon submission-notice-icon"
              aria-hidden="true"
            >
              <IoShieldCheckmarkOutline size="24px" />
            </span>
            <span className="submission-notice-eyebrow">Letter received</span>
            <h2 id="submission-notice-title">Your letter is awaiting review</h2>
            <p id="submission-notice-description">
              Thank you for sharing it. Every letter goes through an automatic
              safety check before it can appear publicly.
            </p>
            <ul className="submit-confirm-notes submission-notice-notes">
              <li>Possible spam, abuse, and harmful content are flagged for review.</li>
              <li>Once approved, you can open your letter and share its link.</li>
            </ul>
            {submittedBurnKey && (
              <div className="submission-burn-key">
                <div>
                  <span>Your private burn key</span>
                  <strong>{submittedBurnKey}</strong>
                </div>
                <button
                  type="button"
                  onClick={copyBurnKey}
                  aria-label="Copy burn key"
                  aria-describedby={showBurnKeyHint && !burnKeyCopied ? 'burn-key-copy-hint' : undefined}
                >
                  {burnKeyCopied ? <BsCheck2 /> : <BsClipboard />}
                </button>
                {showBurnKeyHint && !burnKeyCopied && (
                  <span id="burn-key-copy-hint" className="submission-burn-key-hint" role="tooltip">
                    Copy this burn key first
                  </span>
                )}
                <p>Save this somewhere private or put it in your notes. It is shown only once and lets you remove your letter after it is approved.</p>
                {burnKeyCopied && <small role="status">Burn key copied</small>}
              </div>
            )}
            <p className="submission-notice-footnote">
              Check back soon by searching for the name used in your letter.
            </p>
            <button
              type="button"
              className={`submission-notice-done${submittedBurnKey && !burnKeyCopied ? ' is-locked' : ''}`}
              aria-disabled={submittedBurnKey && !burnKeyCopied}
              onClick={() => {
                if (submittedBurnKey && !burnKeyCopied) {
                  setShowBurnKeyHint(true);
                  return;
                }
                finishSubmissionNotice();
              }}
              autoFocus
            >
              {submittedBurnKey ? 'I’ve saved my key' : 'Got it'}
            </button>
          </div>
        </div>
      )}
      {showShareCelebration && (
        <div className="submit-confirm-overlay share-celebration-overlay">
          <section
            className="share-celebration-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-celebration-title"
          >
            <div className="share-celebration-achievement" aria-hidden="true">
              <img
                src={`${process.env.PUBLIC_URL}/android-chrome-512x512.png`}
                alt=""
              />
            </div>
            <span className="submission-notice-eyebrow">Thank you for sharing</span>
            <h2 id="share-celebration-title">Your words made it here.</h2>
            <p>
              Help more people find a place for the words they carry. Tell a
              friend, share Letters to Casper, and follow along for what comes next.
            </p>
            <button type="button" className="share-celebration-primary" onClick={shareWebsite}>
              <IoShareSocialOutline /> Share Letters to Casper
            </button>
            {siteShareStatus && <span className="share-celebration-status" role="status">{siteShareStatus}</span>}
            <button type="button" className="share-celebration-finish" onClick={() => setShowShareCelebration(false)}>
              Close
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default AddModal;
