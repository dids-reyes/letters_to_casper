import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CiGlobe } from 'react-icons/ci';
import { DefaultAvatarIcon } from './SkyProfileModal';

export const GLOBAL_CHAT_TTL_MS = 10 * 60 * 1000;
export const PRIVATE_CHAT_TTL_MS = 30 * 60 * 1000;

export function isChatMessageFresh(message, clock = Date.now()) {
  const ttl = message?.sessionId ? PRIVATE_CHAT_TTL_MS : GLOBAL_CHAT_TTL_MS;
  return clock - message.createdAt < ttl;
}
export const MOODS = ['bored', 'heartbroken', 'sleepy', 'alone', 'depressed', 'anxious', 'peaceful'];
export const MOOD_EMOJIS = {
  bored: '🥱',
  heartbroken: '💔',
  sleepy: '😴',
  alone: '🥺',
  depressed: '😞',
  anxious: '😰',
  peaceful: '😌',
  lonely: '🥺', // legacy alias for backward compatibility
};
export const VALID_MOODS = MOODS;

export function formatChatTimestamp(createdAt, now = Date.now()) {
  const elapsed = Math.max(0, now - Number(createdAt || now));
  if (elapsed < 60000) return 'just now';
  return `${Math.floor(elapsed / 60000)}m ago`;
}

export function defaultAnonymousUsername(id) {
  if (!id && id !== 0) return 'soul000';
  const str = String(id).trim();
  let prefix = 'soul';
  let rawId = str;

  if (str.toLowerCase().startsWith('soul')) {
    prefix = str.slice(0, 4);
    rawId = str.slice(4);
  }

  // Strip leading/trailing non-alphanumeric chars
  const cleanId = rawId.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
  let identifier = cleanId || rawId.replace(/[^a-zA-Z0-9]/g, '');

  if (!identifier) {
    identifier = '000';
  } else {
    // Limit to max 8 characters
    if (identifier.length > 8) {
      identifier = identifier.slice(0, 8);
    }
    // Pad to minimum 3 characters
    if (identifier.length < 3) {
      identifier = identifier.padStart(3, '0');
    }
  }

  return `${prefix}${identifier}`;
}

export const soulName = person => {
  const name = person?.username || person?.soul;
  if (name) {
    if (name.toLowerCase().startsWith('soul')) {
      return defaultAnonymousUsername(name);
    }
    return name;
  }
  return person?.id ? defaultAnonymousUsername(person.id) : 'soul000';
};

export function MoodPicker({ value, onChange, disabled, id = 'sky-mood', showEmoji = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClickOutside = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [open]);

  const selectMood = mood => {
    onChange(mood);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="sky-mood">
      <button
        type="button"
        id={`${id}-btn`}
        className="sky-mood-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className="sky-mood-value" aria-hidden="true">
          <span>{value || 'Status'}</span>
          {showEmoji && value && (
            <span className="sky-mood-emoji" aria-hidden="true">{MOOD_EMOJIS[value]}</span>
          )}
          <svg
            className="sky-mood-chevron"
            width="8"
            height="5"
            viewBox="0 0 8 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 1L4 4L7 1"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Accessible select for screen readers and tests */}
      <label htmlFor={id} className="sky-visually-hidden">
        <span id={`${id}-label`}>Feeling</span>
        <select
          id={id}
          aria-labelledby={`${id}-label`}
          value={value || ''}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          tabIndex={-1}
        >
          <option value="">Status</option>
          {MOODS.map(mood => (
            <option key={mood} value={mood}>
              {mood} {MOOD_EMOJIS[mood]}
            </option>
          ))}
          <option value="lonely" hidden>
            alone {MOOD_EMOJIS.alone}
          </option>
          {!MOODS.includes(value) && value && value !== 'lonely' && (
            <option value={value}>
              {value} {MOOD_EMOJIS[value] || ''}
            </option>
          )}
        </select>
      </label>

      {/* Anchored dropdown popover positioned on that part, not in the center */}
      {open && (
        <ul className="sky-mood-menu" role="listbox" aria-label="Status options">
          <li
            role="option"
            aria-selected={!value}
            className={`sky-mood-option ${!value ? 'is-selected' : ''}`}
            onClick={() => selectMood('')}
          >
            <span>Status</span>
          </li>
          {MOODS.map(mood => (
            <li
              key={mood}
              role="option"
              aria-selected={value === mood}
              className={`sky-mood-option ${value === mood ? 'is-selected' : ''}`}
              onClick={() => selectMood(mood)}
            >
              <span className="sky-mood-option-name">{mood}</span>
              <span className="sky-mood-option-emoji" aria-hidden="true">{MOOD_EMOJIS[mood]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SkyChat({ messages, session, connected, send, leave, clock }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const list = useRef(null);
  const pinned = useRef(true);
  const leaveTrigger = useRef(null);
  const cancelLeave = useRef(null);
  const sessionId = session?.sessionId || null;
  const visible = messages.filter(m => (m.sessionId || null) === sessionId && isChatMessageFresh(m, clock));
  const lastId = visible[visible.length - 1]?.id;
  useEffect(() => { if (pinned.current && list.current) list.current.scrollTop = list.current.scrollHeight; }, [lastId]);
  useEffect(() => {
    if (!session) setConfirmingLeave(false);
  }, [session]);
  useEffect(() => {
    if (!confirmingLeave) return undefined;
    cancelLeave.current?.focus();
    const closeOnEscape = event => {
      if (event.key === 'Escape') setConfirmingLeave(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [confirmingLeave]);

  const closeLeaveConfirmation = () => {
    setConfirmingLeave(false);
    requestAnimationFrame(() => leaveTrigger.current?.focus());
  };

  const confirmLeave = () => {
    setConfirmingLeave(false);
    leave();
  };

  return <section className="sky-chat" aria-label={session ? 'Private chat' : 'Global chat'}>
    <div className="sky-chat-heading"><strong className="sky-chat-title">
      <span>{session ? `With ${session.peer.soul?.toLowerCase().startsWith('soul') ? defaultAnonymousUsername(session.peer.soul) : session.peer.soul}` : 'Global Chat'}</span>
      {!session && <CiGlobe className="sky-chat-title-icon" aria-hidden="true" />}
    </strong>
      {session && <button ref={leaveTrigger} type="button" onClick={() => setConfirmingLeave(true)}>Leave chat</button>}
      <small>Messages fade after {session ? '30' : '10'} minutes</small>
    </div>
    <div className="sky-chat-messages" ref={list} role="log" aria-live="polite" onScroll={() => {
      const el = list.current; pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    }}>
      {visible.map(m => {
        const rawName = m.username || m.soul || 'soul';
        const displayName = rawName.toLowerCase().startsWith('soul') ? defaultAnonymousUsername(rawName) : rawName;
        return (
          <p key={m.id} className="sky-chat-message">
            <span className="sky-chat-avatar" aria-hidden="true">
              {m.avatar ? (
                <img src={m.avatar} alt="" className="sky-chat-avatar-img" />
              ) : (
                <DefaultAvatarIcon size={12} className="sky-chat-avatar-placeholder" />
              )}
            </span>
            <span className="sky-chat-content">
              <span className="sky-chat-identity">
                <strong>{displayName}</strong>
              </span>
              <span className="sky-chat-separator" aria-hidden="true">:</span>{' '}
              <span className="sky-chat-text">{m.text}</span>
              <small className="sky-chat-time">{formatChatTimestamp(m.createdAt, clock)}</small>
            </span>
          </p>
        );
      })}
    </div>
    <form onSubmit={e => {
      e.preventDefault();
      if (!text.trim() || busy) return;
      setBusy(true); setError('');
      send({ text, sessionId }, (ok, reason) => { setBusy(false); if (ok) { setText(''); pinned.current = true; } else setError(reason); });
    }}>
      <input aria-label={session ? 'Private message' : 'Global message'} value={text} maxLength={400} onChange={e => setText(e.target.value)} placeholder={connected ? (session ? 'Say something kind…' : 'Send a message across the sky...') : 'Waiting for the shared sky…'} disabled={!connected} />
      <button disabled={!connected || busy || !text.trim()}>Send</button>
    </form>
    {error && <small role="alert">{error}</small>}
    {confirmingLeave && typeof document !== 'undefined' && createPortal(
      <div className="sky-leave-chat-overlay" onClick={closeLeaveConfirmation}>
        <section
          className="sky-leave-chat-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sky-leave-chat-title"
          aria-describedby="sky-leave-chat-description"
          onClick={event => event.stopPropagation()}
        >
          <h2 id="sky-leave-chat-title">Leave this chat?</h2>
          <p id="sky-leave-chat-description">
            This will end the private conversation for both of you.
          </p>
          <div className="sky-leave-chat-actions">
            <button ref={cancelLeave} type="button" onClick={closeLeaveConfirmation}>
              Cancel
            </button>
            <button type="button" className="sky-leave-chat-confirm" onClick={confirmLeave}>
              Leave chat
            </button>
          </div>
        </section>
      </div>,
      document.body
    )}
  </section>;
}
