import React, {useState, useEffect, useContext, useCallback} from 'react';
import {AuthContext} from '../AuthContext';
import Lottie from 'react-lottie-player';
import locked from '../lotties/locked.json';
import logo from '../lotties/ltc_logo_1.webp';
import axios from 'axios';
import {Link} from 'react-router-dom';
import { render_base_url as render_url, api_key } from '../data/keys';
import '../styles/AdminPortal.css';
import {getOptimizedPhotoUrl} from '../data/cloudinary';
import {IoAddCircleOutline, IoCalendarOutline, IoCheckmarkCircleOutline, IoFlameOutline, IoImageOutline, IoLocationOutline, IoMailUnreadOutline, IoSearchOutline, IoShieldCheckmarkOutline, IoStarOutline, IoTrashOutline, IoWarningOutline} from 'react-icons/io5';

function AdminPortal() {
  const {isLoggedIn, adminName, sessionToken, logout} = useContext(AuthContext);
  const canManageFeatured = adminName.toLowerCase() === 'didsirwynreyes';

  const adminHeaders = useCallback(extraHeaders => ({
    'x-api-key': api_key,
    Authorization: `Bearer ${sessionToken}`,
    ...extraHeaders,
  }), [sessionToken]);

  const [letters, setLetters] = useState({
    messages: [],
    counts: {approved: 0, unapproved: 0},
  });
  const [loading, setLoading] = useState(0);
  const [activeSection, setActiveSection] = useState('review');
  const [featuredLetters, setFeaturedLetters] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredQuery, setFeaturedQuery] = useState('');
  const [featuredResults, setFeaturedResults] = useState([]);
  const [featuredSearching, setFeaturedSearching] = useState(false);
  const [featuredActionId, setFeaturedActionId] = useState('');
  const [featuredError, setFeaturedError] = useState('');
  const [featuredToRemove, setFeaturedToRemove] = useState(null);

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
    if (!sessionToken) return undefined;
    const fetchLetters = async () => {
      setLoading(1);
      try {
        const response = await fetch(`${render_url}/api/messages/unapproved`, {
          headers: adminHeaders(),
        });
        if (response.status === 401) {
          logout();
          return;
        }
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
  }, [adminHeaders, logout, sessionToken]);

  useEffect(() => {
    if (!sessionToken) return undefined;
    const fetchFeaturedLetters = async () => {
      setFeaturedLoading(true);
      try {
        const response = await fetch(`${render_url}/api/messages/featured/manage`, {
          headers: adminHeaders(),
        });
        if (response.status === 401) {
          logout();
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch featured letters');
        const data = await response.json();
        setFeaturedLetters(data.messages || []);
      } catch (error) {
        console.error('Error fetching featured letters:', error);
        setFeaturedError('Couldn’t load featured letters.');
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeaturedLetters();
  }, [adminHeaders, logout, sessionToken]);

  useEffect(() => {
    if (!sessionToken) return undefined;
    const query = featuredQuery.trim();
    if (query.length < 2) {
      setFeaturedResults([]);
      setFeaturedSearching(false);
      return undefined;
    }
    const controller = new AbortController();
    setFeaturedSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${render_url}/api/messages/featured/search?q=${encodeURIComponent(query)}`,
          {headers: adminHeaders(), signal: controller.signal},
        );
        if (response.status === 401) {
          logout();
          return;
        }
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setFeaturedResults(data.messages || []);
        setFeaturedSearching(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setFeaturedError('Couldn’t search letters right now.');
          setFeaturedSearching(false);
        }
      }
    }, 500);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [adminHeaders, featuredQuery, logout, sessionToken]);

  const updateFeaturedLetter = async (letter, action) => {
    if (!canManageFeatured) return;
    setFeaturedActionId(letter._id);
    setFeaturedError('');
    try {
      const response = await fetch(`${render_url}/api/messages/featured/${action}`, {
        method: 'POST',
        headers: adminHeaders({'Content-Type': 'application/json'}),
        body: JSON.stringify({letterId: letter._id}),
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) throw new Error(`Failed to ${action} featured letter`);
      if (action === 'add') {
        const data = await response.json();
        setFeaturedLetters(current => [
          data.message,
          ...current.filter(item => item._id !== data.message._id),
        ]);
      } else {
        setFeaturedLetters(current => current.filter(item => item._id !== letter._id));
        setFeaturedToRemove(null);
      }
    } catch (error) {
      setFeaturedError(`Couldn’t ${action === 'add' ? 'feature' : 'remove'} this letter.`);
    } finally {
      setFeaturedActionId('');
    }
  };

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
    const approvableLetters = selectedLetters.filter(id =>
      letters.some(letter => letter._id === id && !letter.burnRequested),
    );
    if (!approvableLetters.length) {
      alert('Please select at least one letter to approve.');
      return;
    }

    try {
      const response = await fetch(`${render_url}/api/messages/approve`, {
        method: 'POST',
        headers: {
          ...adminHeaders({'Content-Type': 'application/json'}),
        },
        body: JSON.stringify({letterIds: approvableLetters}),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to approve letters');
      }

      const updatedLetters = letters.filter(
        letter => !approvableLetters.includes(letter._id),
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
          ...adminHeaders({'Content-Type': 'application/json'}),
        },
        body: JSON.stringify({letterIds: selectedLetters}),
      });

      if (response.status === 401) {
        logout();
        return;
      }

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
          <span className="admin-identity">
            <IoShieldCheckmarkOutline />
            <span className="admin-identity__copy">
              <small>Signed in as</small>
              <strong>{adminName || 'Admin'}</strong>
            </span>
          </span>
        </div>
        <div className="admin-portal-header__intro">
          <div><span>Letter review</span><h1>Pending letters</h1><p>Review the queue and decide what joins the collection.</p></div>
          <div className="admin-portal-count"><IoMailUnreadOutline /><strong>{letters.length}</strong><span>Waiting</span></div>
        </div>
      </header>
      <nav className="admin-workspace-tabs" aria-label="Admin portal sections">
        <button className={activeSection === 'review' ? 'is-active' : ''} onClick={() => setActiveSection('review')}>
          <IoMailUnreadOutline /> Review Queue <span>{letters.length || 0}</span>
        </button>
        <button className={activeSection === 'featured' ? 'is-active' : ''} onClick={() => setActiveSection('featured')}>
          <IoStarOutline /> Featured Letters <span>{featuredLetters.length}</span>
        </button>
      </nav>
      {activeSection === 'review' && <>
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
                    {letter.burnRequested && <span className="letter-burn-badge"><IoFlameOutline /> Burned by author</span>}
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
      </>}
      {activeSection === 'featured' && (
        <section className="featured-manager">
          <header className="featured-manager__header">
            <div><span>Collection curation</span><h2>Featured letters</h2><p>Choose the letters highlighted in the public Featured collection.</p></div>
            <div className="featured-manager__count"><IoStarOutline /><strong>{featuredLetters.length}</strong><span>Featured</span></div>
          </header>

          <div className="featured-search">
            <IoSearchOutline aria-hidden="true" />
            <input value={featuredQuery} onChange={event => setFeaturedQuery(event.target.value)} placeholder="Search sender, recipient, or message" aria-label="Search approved letters" />
            {featuredSearching && <span className="featured-search__spinner" aria-label="Searching" />}
          </div>
          {featuredError && <p className="featured-manager__error" role="alert">{featuredError}</p>}
          {!canManageFeatured && <p className="featured-manager__access-note"><IoShieldCheckmarkOutline /> You have view-only access to Featured Letters.</p>}

          {featuredQuery.trim().length >= 2 && !featuredSearching && (
            <div className="featured-search-results">
              <h3>Search results</h3>
              {featuredResults.length ? featuredResults.map(letter => {
                const isAlreadyFeatured = featuredLetters.some(item => item._id === letter._id);
                return (
                  <article key={letter._id} className="featured-letter-row">
                    <div><span>From <strong>{letter.from}</strong> to <strong>{letter.to}</strong></span><p>{letter.message}</p></div>
                    <button title={!canManageFeatured ? 'Only the featured manager can add letters' : ''} disabled={!canManageFeatured || isAlreadyFeatured || featuredActionId === letter._id} onClick={() => updateFeaturedLetter(letter, 'add')}>
                      {isAlreadyFeatured ? <><IoCheckmarkCircleOutline /> Featured</> : <><IoAddCircleOutline /> Add</>}
                    </button>
                  </article>
                );
              }) : <p className="featured-manager__empty">No approved letters matched your search.</p>}
            </div>
          )}

          <div className="featured-current">
            <h3>Currently featured</h3>
            {featuredLoading ? <p className="featured-manager__empty">Loading featured letters…</p> : featuredLetters.length ? (
              <div className="featured-current__grid">
                {featuredLetters.map(letter => (
                  <article key={letter._id} className="featured-letter-card">
                    <span className="featured-letter-card__badge"><IoStarOutline /> Featured</span>
                    <div className="featured-letter-card__names"><span>From <strong>{letter.from}</strong></span><span>To <strong>{letter.to}</strong></span></div>
                    <p>{letter.message}</p>
                    <footer><span><IoCalendarOutline /> {formatReviewTimestamp(letter.timestamp)}</span><button title={!canManageFeatured ? 'Only the featured manager can remove letters' : ''} disabled={!canManageFeatured || featuredActionId === letter._id} onClick={() => setFeaturedToRemove(letter)}><IoTrashOutline /> Remove</button></footer>
                  </article>
                ))}
              </div>
            ) : <p className="featured-manager__empty">No letters are featured yet. Search above to add one.</p>}
          </div>
        </section>
      )}
      {featuredToRemove && (
        <div className="admin-delete-overlay" onClick={() => {
          if (!featuredActionId) setFeaturedToRemove(null);
        }}>
          <section
            className="admin-delete-dialog featured-remove-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="featured-remove-title"
            onClick={event => event.stopPropagation()}
          >
            <span className="featured-remove-dialog__icon" aria-hidden="true"><IoStarOutline /></span>
            <span className="featured-remove-dialog__eyebrow">Featured collection</span>
            <h2 id="featured-remove-title">Remove this featured letter?</h2>
            <p>It will remain publicly available, but it will no longer appear in the Featured collection.</p>
            <div className="featured-remove-dialog__letter">
              <span>From <strong>{featuredToRemove.from}</strong></span>
              <span>To <strong>{featuredToRemove.to}</strong></span>
            </div>
            <div className="admin-delete-dialog__actions">
              <button type="button" className="admin-delete-dialog__cancel" onClick={() => setFeaturedToRemove(null)} disabled={featuredActionId === featuredToRemove._id}>Keep featured</button>
              <button type="button" className="featured-remove-dialog__confirm" onClick={() => updateFeaturedLetter(featuredToRemove, 'remove')} disabled={featuredActionId === featuredToRemove._id}>
                <IoTrashOutline /> {featuredActionId === featuredToRemove._id ? 'Removing…' : 'Remove from Featured'}
              </button>
            </div>
          </section>
        </div>
      )}
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
