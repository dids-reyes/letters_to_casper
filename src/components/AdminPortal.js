import React, {useState, useEffect, useContext} from 'react';
import {AuthContext} from '../AuthContext';
import Lottie from 'react-lottie-player';
import locked from '../lotties/locked.json';
import logo from '../lotties/ltc_logo_1.webp';
import axios from 'axios';
import {Link} from 'react-router-dom';
import { render_base_url as render_url, api_key } from '../data/keys';
import '../styles/AdminPortal.css';
import {getOptimizedPhotoUrl} from '../data/cloudinary';
import {IoCalendarOutline, IoCheckmarkCircleOutline, IoImageOutline, IoLocationOutline, IoMailUnreadOutline, IoShieldCheckmarkOutline, IoTrashOutline, IoWarningOutline} from 'react-icons/io5';

function AdminPortal() {
  const {isLoggedIn} = useContext(AuthContext);

  const [letters, setLetters] = useState({
    messages: [],
    counts: {approved: 0, unapproved: 0},
  });
  const [loading, setLoading] = useState(0);

  const formatReviewTimestamp = timestamp =>
    new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatReviewLocation = letter =>
    [letter.loc?.city, letter.loc?.region, letter.loc?.country]
      .filter(value => value && value !== 'Unknown')
      .join(', ');

  useEffect(() => {
    const fetchLetters = async () => {
      setLoading(1);
      try {
        const response = await fetch(`${render_url}/api/messages/unapproved`, {
          headers: {
            'x-api-key': api_key,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch letters');
        }
        const data = await response.json();
        setLetters(data.messages);
        setLoading(0);
      } catch (error) {
        console.error('Error fetching letters:', error);
        setLoading(2);
      }
    };

    fetchLetters();
  }, []);

  const [selectedLetters, setSelectedLetters] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSelectChange = event => {
    const newSelectedLetters = [...selectedLetters];
    const letterId = event.target.value;
    const isSelected = event.target.checked;

    if (isSelected) {
      newSelectedLetters.push(letterId);
    } else {
      const index = newSelectedLetters.indexOf(letterId);
      newSelectedLetters.splice(index, 1);
    }

    setSelectedLetters(newSelectedLetters);
  };

  const handleApproveLetters = async () => {
    if (!selectedLetters.length) {
      alert('Please select at least one letter to approve.');
      return;
    }

    try {
      const response = await fetch(`${render_url}/api/messages/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': api_key,
        },
        body: JSON.stringify({letterIds: selectedLetters}),
      });

      if (!response.ok) {
        throw new Error('Failed to approve letters');
      }

      const updatedLetters = letters.filter(
        letter => !selectedLetters.includes(letter._id),
      );
      setLetters(updatedLetters);
      setSelectedLetters([]);
    } catch (error) {
      console.error('Error approving letters:', error);
      alert('An error occurred while approving letters.');
    }
  };

  const handleDeleteLetters = async () => {
    if (!selectedLetters.length) {
      alert('Please select at least one letter to delete.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      const response = await fetch(`${render_url}/api/messages/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': api_key,
        },
        body: JSON.stringify({letterIds: selectedLetters}),
      });

      if (!response.ok) {
        throw new Error('Failed to delete letters');
      }

      const updatedLetters = letters.filter(
        letter => !selectedLetters.includes(letter._id),
      );
      setLetters(updatedLetters);
      setSelectedLetters([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting letters:', error);
      setDeleteError('The selected letters couldn’t be deleted. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirm = () => {
    if (!selectedLetters.length) return;
    setDeleteError('');
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setDeleteError('');
  };

  useEffect(() => {
    if (!showDeleteConfirm) return undefined;
    const handleDialogKeyDown = event => {
      if (event.key === 'Escape' && !isDeleting) {
        setShowDeleteConfirm(false);
        setDeleteError('');
      }
    };
    document.addEventListener('keydown', handleDialogKeyDown);
    return () => document.removeEventListener('keydown', handleDialogKeyDown);
  }, [showDeleteConfirm, isDeleting]);

  const [ip, setIP] = useState('');

  // TODO: Grab IP and apply rate limiting to prevent brute-force / submit IP to project Honeypot
  const getData = async () => {
    try {
      const res = await axios.get('https://api.ipify.org/?format=json');
      setIP(res.data.ip);
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'blocked';
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (!isLoggedIn) {
    return (
      <main className="admin-locked">
        <div className="admin-locked__card">
          <Lottie loop animationData={locked} play className="admin-locked__animation" />
          <span><IoShieldCheckmarkOutline /> Restricted area</span>
          <h1>Admin access required</h1>
          <p>This workspace is available only to authorized Letters to Casper administrators.</p>
          <small>Request recorded from {ip || 'your current connection'}</small>
          <Link to="/">Return home</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-portal">
      <div className="admin-portal__letters" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <header className="admin-portal-header">
        <div className="admin-portal-header__brand">
          <img className="admin-portal-logo" src={logo} alt="Letters to Casper" />
          <span><IoShieldCheckmarkOutline /> Admin workspace</span>
        </div>
        <div className="admin-portal-header__intro">
          <div><span>Letter review</span><h1>Pending letters</h1><p>Review the queue and decide what joins the collection.</p></div>
          <div className="admin-portal-count"><IoMailUnreadOutline /><strong>{letters.length}</strong><span>Waiting</span></div>
        </div>
      </header>
      {loading === 1 && <p className="admin-portal-status">Loading letters…</p>}
      {loading === 2 && <p className="admin-portal-status is-error">Couldn’t load the review queue.</p>}

      <div className="letter-actions">
        <span className="letter-actions__selection">{selectedLetters.length ? `${selectedLetters.length} selected` : 'Select letters to begin'}</span>
        <button
          className="letter-action-button approve-button"
          disabled={!selectedLetters.length}
          onClick={handleApproveLetters}
        >
          <IoCheckmarkCircleOutline />
          Approve{selectedLetters.length > 0 && ` (${selectedLetters.length})`}
        </button>
        <button
          className="letter-action-button delete-button"
          disabled={!selectedLetters.length}
          onClick={openDeleteConfirm}
        >
          <IoTrashOutline />
          Delete{selectedLetters.length > 0 && ` (${selectedLetters.length})`}
        </button>
      </div>
      {letters.length > 0 && (
        <ul className="letter-review-list">
          {letters.map(letter => (
            <li key={letter._id} className="letter-item">
              <input
                type="checkbox"
                id={`letter-${letter._id}`}
                value={letter._id}
                checked={selectedLetters.includes(letter._id)}
                onChange={handleSelectChange}
              />
              <label htmlFor={`letter-${letter._id}`}>
                <div className="letter-review-box">
                  <div className="letter-review-box__head">
                    <span><strong>From</strong>{letter.from}</span>
                    <span><strong>To</strong>{letter.to}</span>
                    {letter.photo?.url && <span className="letter-photo-badge"><IoImageOutline /> Photo</span>}
                  </div>
                  <div className="letter-review-box__meta">
                    <span><IoCalendarOutline />{formatReviewTimestamp(letter.timestamp)}</span>
                    {formatReviewLocation(letter) && (
                      <span><IoLocationOutline />{formatReviewLocation(letter)}</span>
                    )}
                  </div>
                  <p>{letter.message}</p>
                  {letter.photo?.url && (
                    <img
                      className="letter-review-photo"
                      src={getOptimizedPhotoUrl(letter.photo.url, 800)}
                      alt={`Attachment from ${letter.from}`}
                      loading="lazy"
                    />
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
      {letters.length === 0 && !loading && <div className="admin-portal-empty"><IoCheckmarkCircleOutline /><strong>Queue cleared</strong><p>No letters are waiting for review.</p></div>}
      {showDeleteConfirm && (
        <div className="admin-delete-overlay" onClick={closeDeleteConfirm}>
          <section
            className="admin-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-delete-title"
            aria-describedby="admin-delete-description"
            onClick={event => event.stopPropagation()}
          >
            <span className="admin-delete-dialog__icon" aria-hidden="true">
              <IoWarningOutline />
            </span>
            <span className="admin-delete-dialog__eyebrow">Permanent action</span>
            <h2 id="admin-delete-title">
              Delete {selectedLetters.length}{' '}
              {selectedLetters.length === 1 ? 'letter' : 'letters'}?
            </h2>
            <p id="admin-delete-description">
              These selected review requests will be permanently removed from
              the queue. This action cannot be undone.
            </p>
            <div className="admin-delete-dialog__summary">
              <IoTrashOutline />
              <span>
                <strong>{selectedLetters.length}</strong>
                {selectedLetters.length === 1
                  ? ' selected letter'
                  : ' selected letters'}
              </span>
            </div>
            {deleteError && (
              <p className="admin-delete-dialog__error" role="alert">
                {deleteError}
              </p>
            )}
            <div className="admin-delete-dialog__actions">
              <button
                type="button"
                className="admin-delete-dialog__cancel"
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
              >
                Keep letters
              </button>
              <button
                type="button"
                className="admin-delete-dialog__confirm"
                onClick={handleDeleteLetters}
                disabled={isDeleting}
              >
                <IoTrashOutline />
                {isDeleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminPortal;
