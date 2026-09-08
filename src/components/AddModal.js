import React, {useMemo, useRef, useState, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Tooltip} from 'react-tooltip';
import {BsCheck2, BsClipboard, BsX} from 'react-icons/bs';
import {RiMailSendLine} from 'react-icons/ri';
import {VscPreview} from 'react-icons/vsc';
import {
  IoContractOutline,
  IoCopyOutline,
  IoChevronDownOutline,
  IoExpandOutline,
  IoInformationCircleOutline,
  IoHelpCircleOutline,
  IoKeyOutline,
  IoMailOutline,
  IoImageOutline,
  IoShareSocialOutline,
  IoShieldCheckmarkOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import {FaSpotify, FaYoutube} from 'react-icons/fa';
import DetailsModal from './DetailsModal';
import { displayDirectLinkAds } from '../data/direct_link';
import {render_url, api_key} from '../data/keys';

const validateSongLink = rawLink => {
  const value = String(rawLink || '').trim();
  if (!value) return {valid: true, service: ''};
  if (/\s|\|/.test(value)) return {valid: false, message: 'Paste only the copied song link without extra text.'};

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (url.protocol !== 'https:') return {valid: false, message: 'The song link must start with https://'};

    if (host === 'youtu.be') {
      const videoId = url.pathname.split('/').filter(Boolean)[0];
      if (/^[A-Za-z0-9_-]{11}$/.test(videoId || '') && !url.searchParams.has('list')) {
        return {valid: true, service: 'youtube'};
      }
      return {valid: false, message: 'Use the Copy link option for one YouTube video, not a playlist or radio link.'};
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = url.pathname === '/watch' ? url.searchParams.get('v') : '';
      if (/^[A-Za-z0-9_-]{11}$/.test(videoId || '') && !url.searchParams.has('list')) {
        return {valid: true, service: 'youtube'};
      }
      return {valid: false, message: 'YouTube playlists and radio links are not supported. Copy the individual video link.'};
    }

    if (host === 'open.spotify.com') {
      const path = url.pathname.split('/').filter(Boolean);
      if (path.length === 2 && path[0] === 'track' && /^[A-Za-z0-9]{22}$/.test(path[1])) {
        return {valid: true, service: 'spotify'};
      }
      return {valid: false, message: 'Use the Copy link option for one Spotify song, not a playlist, album, or artist.'};
    }

    return {valid: false, message: 'Only individual YouTube video and Spotify song links are supported.'};
  } catch (error) {
    return {valid: false, message: 'This does not look like a complete YouTube or Spotify link.'};
  }
};

const EMAIL_NOTIFICATIONS_ENABLED = false;

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
  const [showPreviewSuggestion, setShowPreviewSuggestion] = useState(false);
  const [previewSuggestionShown, setPreviewSuggestionShown] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [retentionAgreed, setRetentionAgreed] = useState(false);
  const [showSubmissionNotice, setShowSubmissionNotice] = useState(false);
  const [showShareCelebration, setShowShareCelebration] = useState(false);
  const [siteShareStatus, setSiteShareStatus] = useState('');
  const [submittedBurnKey, setSubmittedBurnKey] = useState('');
  const [submittedLetterId, setSubmittedLetterId] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [emailAvailability, setEmailAvailability] = useState('checking');
  useEffect(() => {
    if (!showSubmissionNotice || !emailExpanded) return undefined;
    let active = true;
    const controller = new AbortController();
    const check = async () => {
      try {
        const response = await fetch(`${render_url}/notification-email/status`, {
          headers: {'x-api-key': api_key}, signal: controller.signal,
        });
        if (!response.ok) throw new Error('Unavailable');
        const result = await response.json();
        if (active) setEmailAvailability(result.available ? 'available' : 'unavailable');
      } catch {
        if (active) setEmailAvailability('unavailable');
      }
    };
    check();
    const timer = window.setInterval(check, 30000);
    return () => { active = false; controller.abort(); window.clearInterval(timer); };
  }, [showSubmissionNotice, emailExpanded]);
  const [notificationEmailStatus, setNotificationEmailStatus] = useState({type: 'idle', message: ''});
  const [savingNotificationEmail, setSavingNotificationEmail] = useState(false);
  const [burnKeyCopied, setBurnKeyCopied] = useState(false);
  const [showBurnKeyHint, setShowBurnKeyHint] = useState(false);
  const [showBurnKeyExplanation, setShowBurnKeyExplanation] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStatus, setSubmitStatus] = useState('Preparing…');
  const [activeLinkIcon, setActiveLinkIcon] = useState('youtube');
  const [focusWriterMode, setFocusWriterMode] = useState(false);
  const [showOptionalExtras, setShowOptionalExtras] = useState(false);
  const [showLinkGuide, setShowLinkGuide] = useState(false);
  const [linkGuidePage, setLinkGuidePage] = useState(0);
  const photoInputRef = useRef(null);
  const focusTextareaRef = useRef(null);
  const linkGuidePagesRef = useRef(null);
  const songLinkValidation = validateSongLink(newLetter.link);

  useEffect(() => {
    if (!showAddModal) {
      setFocusWriterMode(false);
      return undefined;
    }

    setActiveLinkIcon('youtube');
    setLinkGuidePage(0);
    setShowOptionalExtras(false);
    setShowPreviewSuggestion(false);
    setPreviewSuggestionShown(false);
    const iconTimer = window.setInterval(() => {
      setActiveLinkIcon(current =>
        current === 'youtube' ? 'spotify' : 'youtube',
      );
    }, 5000);

    return () => window.clearInterval(iconTimer);
  }, [showAddModal]);

  useEffect(() => {
    if (!showPreviewSuggestion) return undefined;
    const timer = window.setTimeout(() => setShowPreviewSuggestion(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showPreviewSuggestion]);

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
      newLetter.message.length < 10 ||
      !songLinkValidation.valid;
    setIsSubmitDisabled(shouldDisableSubmit);
  }, [newLetter, songLinkValidation.valid]);

  const openLinkGuide = () => {
    setLinkGuidePage(0);
    setShowLinkGuide(true);
  };

  const handleLinkGuideScroll = event => {
    const {clientWidth, scrollLeft} = event.currentTarget;
    if (clientWidth) setLinkGuidePage(Math.max(0, Math.min(2, Math.round(scrollLeft / clientWidth))));
  };

  const goToLinkGuidePage = page => {
    const pages = linkGuidePagesRef.current;
    pages?.scrollTo({left: pages.clientWidth * page, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };

  const handleSubmit = () => {
    if (!isSubmitDisabled) {
      if (!previewSuggestionShown && !showPreview) {
        setPreviewSuggestionShown(true);
        setShowPreviewSuggestion(true);
        return;
      }
      setShowPreviewSuggestion(false);
      setRetentionAgreed(false);
      setShowSubmitConfirm(true);
    }
  };

  const confirmSubmit = async () => {
    if (!retentionAgreed || isSubmitting) return;
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
      setSubmittedLetterId(submitted.letterId || '');
      setNotificationEmail('');
      setEmailExpanded(false);
      setEmailAvailability('checking');
      setNotificationEmailStatus({type: 'idle', message: ''});
      setBurnKeyCopied(false);
      setShowBurnKeyHint(false);
      setShowBurnKeyExplanation(false);
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

  const saveNotificationEmail = async () => {
    if (emailAvailability !== 'available') return false;
    const email = notificationEmail.trim();
    if (!email) return true;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setNotificationEmailStatus({type: 'error', message: 'Enter a valid email address.'});
      return false;
    }
    if (!submittedLetterId || !submittedBurnKey) {
      setNotificationEmailStatus({type: 'error', message: 'Notification signup is unavailable for this letter.'});
      return false;
    }

    setSavingNotificationEmail(true);
    setNotificationEmailStatus({type: 'idle', message: ''});
    try {
      const response = await fetch(`${render_url}/${submittedLetterId}/notification-email`, {
        method: 'POST',
        headers: {'x-api-key': api_key, 'Content-Type': 'application/json'},
        body: JSON.stringify({email, burnKey: submittedBurnKey}),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.code === 'EMAIL_UNAVAILABLE') setEmailAvailability('unavailable');
        throw new Error(result.error || 'Could not save your email.');
      }
      setNotificationEmailStatus({type: 'success', message: 'We’ll email you when your letter is approved.'});
      return true;
    } catch (error) {
      setNotificationEmailStatus({type: 'error', message: error.message});
      return false;
    } finally {
      setSavingNotificationEmail(false);
    }
  };

  const finishSubmissionNotice = () => {
    setShowSubmissionNotice(false);
    setShowShareCelebration(true);
    setSiteShareStatus('');
    displayDirectLinkAds();
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
    setPreviewSuggestionShown(true);
    setShowPreviewSuggestion(false);
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

                  <section className={`compose-optional-extras${showOptionalExtras ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="compose-optional-extras__toggle"
                      aria-expanded={showOptionalExtras}
                      aria-controls="compose-optional-extras-content"
                      onClick={() => setShowOptionalExtras(current => !current)}
                    >
                      <span>
                        <strong>Letter Attachments</strong>
                        <small>{newLetter.photoFile ? 'Photo attached' : newLetter.link ? songLinkValidation.valid ? 'Song link added' : 'Song link needs attention' : 'Add a song or photo'}</small>
                      </span>
                      <IoChevronDownOutline aria-hidden="true" />
                    </button>
                    <div id="compose-optional-extras-content" className="compose-optional-extras__content" hidden={!showOptionalExtras}>
                  <div className="form-group">
                    <div className="compose-link-label">
                      <label htmlFor="link" className="label-top-left">
                        Link <span className="compose-optional">Optional</span>
                      </label>
                      <button type="button" onClick={openLinkGuide}>
                        <IoInformationCircleOutline aria-hidden="true" />
                        <span>Tip · How to add a song</span>
                      </button>
                    </div>
                    <div
                      className={`compose-link-field${
                        newLetter.photoFile ? ' is-disabled' : ''
                      }${newLetter.link && !songLinkValidation.valid ? ' is-invalid' : ''}${newLetter.link && songLinkValidation.valid ? ' is-valid' : ''}`}
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
                        autoComplete="off"
                        type="text"
                        id="link"
                        placeholder="Paste a link from YouTube or Spotify"
                        className="form-control error full-width"
                        value={newLetter.link || ''}
                        disabled={Boolean(newLetter.photoFile)}
                        aria-invalid={Boolean(newLetter.link && !songLinkValidation.valid)}
                        aria-describedby={newLetter.link && !songLinkValidation.valid ? 'song-link-error' : undefined}
                        onChange={event =>
                          setNewLetter({...newLetter, link: event.target.value})
                        }
                      />
                    </div>
                    {newLetter.link && !songLinkValidation.valid && (
                      <small id="song-link-error" className="compose-link-error" role="alert">
                        {songLinkValidation.message}
                      </small>
                    )}
                    {newLetter.link && songLinkValidation.valid && (
                      <small className="compose-link-success">
                        {songLinkValidation.service === 'youtube' ? 'YouTube video' : 'Spotify song'} link ready
                      </small>
                    )}
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
                      <small>jpg, png or webp · up to 5 MB · Best at 4:3</small>
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
                  </section>

                </div>
                <div className="modal-footer">
                  {!showPreview && !isSubmitDisabled && (
                    <span className="preview-suggestion-anchor">
                      {showPreviewSuggestion && createPortal(
                        <Tooltip
                          id="compose-preview-tip"
                          anchorSelect="#compose-preview-button"
                          className="preview-suggestion-tooltip"
                          positionStrategy="fixed"
                          place="top"
                          offset={11}
                          isOpen={showPreviewSuggestion}
                        >
                          See how your letter looks before sending.
                        </Tooltip>,
                        document.body,
                      )}
                      <button
                        type="button"
                        id="compose-preview-button"
                        aria-describedby={showPreviewSuggestion ? 'compose-preview-tip' : undefined}
                        className="preview-button"
                        onClick={togglePreview}
                      >
                        <strong>Preview</strong>
                        <VscPreview className="preview-icon" size="18px" />
                      </button>
                    </span>
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
      {showLinkGuide && (
        <div className="song-link-guide-overlay" onClick={() => setShowLinkGuide(false)}>
          <section
            className="song-link-guide"
            role="dialog"
            aria-modal="true"
            aria-label="How to add a song"
            onClick={event => event.stopPropagation()}
          >
            <button type="button" className="song-link-guide__close" onClick={() => setShowLinkGuide(false)} aria-label="Close song link guide"><BsX /></button>
            <div className="song-link-guide__pages" ref={linkGuidePagesRef} onScroll={handleLinkGuideScroll}>
              {[0, 1, 2].map(page => (
                <section key={page} className="song-link-guide__page" aria-label={`Step ${page + 1} of 3`}>
            <span className="song-link-guide__eyebrow">Step {page + 1} of 3</span>
            <h3 >
              {page === 0 && 'Open the individual song'}
              {page === 1 && 'Tap the Share button'}
              {page === 2 && 'Choose Copy link'}
            </h3>
            <p>
              {page === 0 && 'Open the exact YouTube video or Spotify track you want to attach. Do not open a playlist, album, or radio mix.'}
              {page === 1 && 'On the song or video screen, find Share. On YouTube it uses an arrow; Spotify may place it inside the three-dot menu.'}
              {page === 2 && 'Tap Copy link, return here, and paste only that link into the field.'}
            </p>

            <div
              className={`song-link-guide__visual is-step-${page + 1}`}
              aria-hidden="true"
            >
              {page === 0 && (
                <><div className="song-guide-card is-youtube"><FaYoutube /><span /><strong>Individual video</strong><small>Not a playlist</small></div><div className="song-guide-card is-spotify"><FaSpotify /><span /><strong>Individual track</strong><small>Not an album</small></div></>
              )}
              {page === 1 && (
                <><div className="song-guide-screen"><span className="song-guide-screen__media" /><div><i /><i /><i /></div><button><IoShareSocialOutline /> Share</button></div><IoShareSocialOutline className="song-guide-focus-icon" /></>
              )}
              {page === 2 && (
                <><div className="song-guide-copy-sheet"><span>Share</span><button><IoCopyOutline /><strong>Copy link</strong></button></div><div className="song-guide-link-sample">youtu.be/video<span>✓</span></div></>
              )}
            </div>

                </section>
              ))}
            </div>

            <div className="song-link-guide__dots" aria-label={`Guide page ${linkGuidePage + 1} of 3`}>
              {[0, 1, 2].map(page => <button type="button" key={page} aria-label={`Go to step ${page + 1}`} aria-current={page === linkGuidePage ? 'step' : undefined} onClick={() => goToLinkGuidePage(page)} className={page === linkGuidePage ? 'is-active' : ''} />)}
            </div>
            <small className="song-link-guide__swipe-hint">Swipe to view each step</small>
          </section>
        </div>
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
            <label className="submit-retention-agreement">
              <input
                type="checkbox"
                checked={retentionAgreed}
                onChange={event => setRetentionAgreed(event.target.checked)}
                disabled={isSubmitting}
                required
              />
              <span>I agree that if my letter is featured, copies may be kept for legal and marketing purposes even after I burn it.</span>
            </label>
            <details className="submit-retention-details">
              <summary>Read more</summary>
              <div className="submit-retention-details__text" tabIndex={0} role="region" aria-label="Full letter retention agreement">
                I understand that burning my letter removes it from public view on the site. If my letter is selected as a featured letter, I agree that Letters to Casper may retain copies for legal recordkeeping and marketing purposes, even after I burn it.
              </div>
            </details>
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
                disabled={isSubmitting || !retentionAgreed}
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
                <div className="submission-burn-key__heading">
                  <span><IoKeyOutline size="14px" aria-hidden="true" />Your Burn Key</span>
                  <button
                    type="button"
                    aria-expanded={showBurnKeyExplanation}
                    onClick={() => setShowBurnKeyExplanation(current => !current)}
                  >
                    <IoHelpCircleOutline size="14px" aria-hidden="true" />
                    What’s this?
                  </button>
                </div>
                <div className="submission-burn-key__value">
                  <strong tabIndex={0} aria-label="Your burn key">{submittedBurnKey}</strong>
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
                </div>
                <p>Save this key so you can burn the letter if you ever change your mind.</p>
                {showBurnKeyExplanation && (
                  <p className="submission-burn-key__explanation">
                    Keep this private key safe. Once your letter is approved and published, this key will be sent only to you so you can permanently remove your message whenever you're ready to let it go.
                  </p>
                )}
                {burnKeyCopied && <small role="status">Burn key copied</small>}
              </div>
            )}
            {EMAIL_NOTIFICATIONS_ENABLED && <div className="submission-email-notice">
              <button type="button" className="submission-email-notice__heading" aria-expanded={emailExpanded} aria-controls="notification-email-content" onClick={() => setEmailExpanded(current => !current)}>
                <IoMailOutline size="15px" aria-hidden="true" />
                <strong>Notify me by email</strong>
                <IoChevronDownOutline size="12px" style={{transform: emailExpanded ? 'rotate(180deg)' : undefined}} aria-hidden="true" />
              </button>
              {emailExpanded && <div id="notification-email-content" className="submission-email-notice__content">
              <p>Want to know when it’s approved? Leave your email and we’ll notify you once.</p>
              <div className="submission-email-notice__field">
                <input
                  id="approval-notification-email"
                  aria-label="Your email address"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength="254"
                  placeholder="Your email address"
                  value={notificationEmail}
                  disabled={emailAvailability !== 'available' || savingNotificationEmail || notificationEmailStatus.type === 'success'}
                  onChange={event => {
                    setNotificationEmail(event.target.value);
                    if (notificationEmailStatus.type === 'error') {
                      setNotificationEmailStatus({type: 'idle', message: ''});
                    }
                  }}
                />
                <button type="button" onClick={saveNotificationEmail} disabled={emailAvailability !== 'available' || !notificationEmail.trim() || savingNotificationEmail || notificationEmailStatus.type === 'success'}>
                  {notificationEmailStatus.type === 'success' ? 'Saved' : emailAvailability === 'checking' ? 'Checking…' : emailAvailability === 'unavailable' ? 'Unavailable' : savingNotificationEmail ? 'Saving…' : 'Notify me'}
                </button>
              </div>
              {emailAvailability === 'unavailable' && notificationEmailStatus.type !== 'success' && <small role="status">Email notifications are temporarily unavailable. Please check back later.</small>}
              {notificationEmailStatus.message && <small className={`is-${notificationEmailStatus.type}`} role="status">{notificationEmailStatus.message}</small>}
              </div>}
            </div>}
            <p className="submission-notice-footnote">
              Check back soon to share it once approved.
            </p>
            <div className="submission-notice-actions">
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
              {submittedBurnKey && (
                <button
                  type="button"
                  className="submission-notice-skip"
                  onClick={finishSubmissionNotice}
                >
                  I Won’t Need It
                </button>
              )}
            </div>
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
