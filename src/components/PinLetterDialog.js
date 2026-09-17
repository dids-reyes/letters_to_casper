import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {AiOutlinePushpin} from 'react-icons/ai';
import {createPortal} from 'react-dom';
import {render_url, api_key} from '../data/keys';
import './PinLetterDialog.css';

export function letterIdFromUrl(value) {
  try {
    const url = new URL(value.trim());
    const allowed = ['https://letterstocasper.com', 'https://www.letterstocasper.com', window.location.origin];
    if (!allowed.includes(url.origin) || url.username || url.password) return null;
    return url.pathname.match(/^\/letters?\/([a-f0-9]{24})\/?$/i)?.[1] || null;
  } catch { return null; }
}
export const SUPPORT_TIERS = [
  {id: '12h', label: '12 Hours', price: 29, hours: 12, note: 'A fleeting spark'},
  {id: '24h', label: '24 Hours', price: 49, days: 1, note: 'A quiet day in the spotlight'},
  {id: '3d', label: '3 Days', price: 89, days: 3, note: 'Keep it close for the weekend'},
  {id: '7d', label: '7 Days', price: 149, days: 7, note: 'A full week gently remembered'},
];
export function expirationForTier(start, tier) {
  if (!tier) return new Date(start);
  if (tier.hours) return new Date(start.getTime() + tier.hours * 3600000);
  if (tier.days) return new Date(start.getTime() + tier.days * 86400000);
  const end = new Date(start), day = end.getUTCDate();
  end.setUTCDate(1);
  end.setUTCMonth(end.getUTCMonth() + (tier.months || 0));
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  end.setUTCDate(Math.min(day, lastDay));
  return end;
}
const redirectToCheckout = url => { window.location.href = url; };
export default function PinLetterDialog({onClose, redirect = redirectToCheckout, letters = [], activePins: passedActivePins}) {
  const activePins = useMemo(() => {
    if (Array.isArray(passedActivePins)) return passedActivePins;
    const now = new Date();
    return (letters || [])
      .filter(letter => letter?.approve && letter?.is_pinned && letter?.pin_expires_at && new Date(letter.pin_expires_at) > now)
      .sort((a, b) => new Date(a.pin_expires_at) - new Date(b.pin_expires_at));
  }, [letters, passedActivePins]);

  const isFull = activePins.length >= 7;
  const earliestExpiry = isFull && activePins[0] ? new Date(activePins[0].pin_expires_at) : null;

  const [tierId, setTierId] = useState('12h');
  const [previewTime, setPreviewTime] = useState(() => new Date());
  const [closing, setClosing] = useState(false);
  const tier = SUPPORT_TIERS.find(option => option.id === tierId) || SUPPORT_TIERS[0];
  const expiration = expirationForTier(previewTime, tier);
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const emailInput = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const dialog = useRef(null);
  const headline = useRef(null);
  useLayoutEffect(() => {
    const element = headline.current;
    let active = true;
    const fit = () => {
      if (!active || !element) return;
      element.style.fontSize = '';
      const style = window.getComputedStyle(element);
      const baseSize = parseFloat(style.fontSize) || 25;
      const available = element.clientWidth - (parseFloat(style.paddingRight) || 0) - (parseFloat(style.paddingLeft) || 0);
      const textWidth = element.firstElementChild?.getBoundingClientRect().width || 0;
      if (available > 0 && textWidth > available) {
        element.style.fontSize = `${Math.floor(baseSize * available / textWidth * 100) / 100}px`;
      }
    };
    fit();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit);
    observer?.observe(element);
    window.addEventListener('resize', fit);
    document.fonts?.ready.then(fit);
    return () => { active = false; observer?.disconnect(); window.removeEventListener('resize', fit); };
  }, [isFull, confirmation]);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    dialog.current?.querySelector('button')?.focus();
    const timer = setInterval(() => setPreviewTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!closing) return undefined;
    const timer = setTimeout(onClose, 180);
    return () => clearTimeout(timer);
  }, [closing, onClose]);
  const close = () => { if (!busy.current) setClosing(true); };
  const onKeyDown = event => {
    if (event.key === 'Escape') { event.stopPropagation(); close(); }
    if (event.key === 'Tab') {
      const controls = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled)')];
      if (!controls.length) { event.preventDefault(); return; }
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  };
  useEffect(() => {
    headline.current?.focus();
  }, [confirmation]);
  const preview = async event => {
    event.preventDefault();
    if (busy.current || closing) return;
    const letterId = letterIdFromUrl(url);
    if (!letterId) { setError('Paste a valid Letters to Casper letter link.'); return; }
    const notificationEmail = email.trim();
    if (notificationEmail && (notificationEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail) || emailInput.current?.validity.typeMismatch)) {
      setError('Enter a valid email address or leave it blank.'); emailInput.current?.focus(); return;
    }
    busy.current = true; setLoading(true); setError('');
    try {
      const response = await fetch(new URL(`/api/messages/public/${letterId}`, render_url).href, {headers: {'x-api-key': api_key}});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'This letter is not available. Please check the link.');
      if (!data.message || data.message._id?.toLowerCase() !== letterId.toLowerCase() || typeof data.message.message !== 'string') throw new Error('Unable to load this letter. Please check the link.');
      const characters = Array.from(data.message.message);
      setConfirmation({letterId, tierId, notificationEmail, from: data.message.from, to: data.message.to,
        message: characters.slice(0, 80).join('') + (characters.length > 80 ? '...' : '')});
    } catch (err) { setError(err.message || 'Unable to load this letter. Please try again.'); }
    finally { busy.current = false; setLoading(false); }
  };
  const pay = async event => {
    event.preventDefault();
    if (busy.current || closing || !confirmation) return;
    const {letterId, tierId, notificationEmail} = confirmation;
    busy.current = true; setLoading(true); setError('');
    try {
      const endpoint = new URL('/api/create-pin-payment', render_url).href;
      const response = await fetch(endpoint, {
        method: 'POST', headers: {'Content-Type': 'application/json', 'x-api-key': api_key},
        body: JSON.stringify({letterId, tierId, ...(notificationEmail ? {customer_email: notificationEmail} : {})}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to start payment. Please try again.');
      if (!data.checkoutUrl || new URL(data.checkoutUrl).protocol !== 'https:') throw new Error('Invalid checkout link. Please try again.');
      redirect(data.checkoutUrl);
    } catch (err) {
      setError(err.message || 'Unable to start payment. Please try again.');
      busy.current = false; setLoading(false);
    }
  };
  return createPortal(
    <div
      className={`pin-letter-overlay${closing ? " is-closing" : ""}`}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        ref={dialog}
        className="pin-letter-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-letter-title"
        aria-describedby="pin-letter-subtext"
        aria-busy={loading}
      >
        <button
          type="button"
          className="pin-letter-close"
          aria-label="Close pin dialog"
          disabled={loading || closing}
          onClick={close}
        >
          ×
        </button>
        <h2 id="pin-letter-title" ref={headline} tabIndex={-1}>
          <span>
            {confirmation ? "Confirm your letter" : isFull ? (
              "All Pinned Slots Occupied (7/7)"
            ) : (
              <>
                Pin a Letter
                <AiOutlinePushpin
                  className="pin-letter-title-icon"
                  aria-hidden="true"
                />
              </>
            )}
          </span>
        </h2>
        <p id="pin-letter-subtext">
          {confirmation ? "Is this the letter you’d like to pin?" : isFull
            ? "To keep the quiet feed balanced and give every featured letter its moment, we only allow 7 pinned letters at a time. Please check back soon once a current pin expires to pin your own or another letter."
            : "Pin your own letter, or lift up someone else’s words that touched your heart. Every pin helps keep this quiet space running."}
        </p>
        {confirmation ? (
          <form onSubmit={pay} noValidate>
            <dl className="pin-letter-confirmation">
              <dt>From</dt><dd>{confirmation.from || 'Anonymous'}</dd>
              <dt>To</dt><dd>{confirmation.to || 'Anonymous'}</dd>
              <dt>Message</dt><dd className="pin-letter-message-preview">{confirmation.message}</dd>
            </dl>
            <p className="pin-letter-note">{tier.label} · ₱{tier.price}</p>
            {confirmation.notificationEmail && <p className="pin-letter-note">We’ll email {confirmation.notificationEmail} once your payment is confirmed.</p>}
            {error && <p id="pin-letter-error" role="alert">{error}</p>}
            <div className="pin-letter-actions">
              <button type="button" disabled={loading || closing} onClick={() => {setConfirmation(null); setError('');}}>Cancel</button>
              <button className="pin-letter-primary" type="submit" disabled={loading || closing}>
                {loading ? 'Opening checkout…' : 'Proceed to Payment'}
              </button>
            </div>
            {loading && <p role="status" className="pin-letter-note">Opening your secure checkout…</p>}
          </form>
        ) : isFull ? (
          <>
            {earliestExpiry && (
              <p className="pin-letter-expiration">
                Next available slot opens around:
                <br />
                <time dateTime={earliestExpiry.toISOString()}>
                  {earliestExpiry.toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: "short",
                  })}
                </time>
              </p>
            )}
            <div className="pin-letter-actions">
              <button
                className="pin-letter-primary"
                type="button"
                onClick={close}
              >
                Understood
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={preview} noValidate>
            <fieldset className="pin-letter-tiers" disabled={loading || closing}>
              {SUPPORT_TIERS.map((option) => (
                <label
                  key={option.id}
                  className={`pin-letter-tier${tierId === option.id ? " is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="pin-tier"
                    value={option.id}
                    checked={tierId === option.id}
                    onChange={() => {
                      setTierId(option.id);
                      setPreviewTime(new Date());
                    }}
                  />
                  <span className="pin-letter-tier-heading">
                    <strong>{option.label}</strong>
                    <b>₱{option.price}</b>
                  </span>
                  <span className="pin-letter-tier-note">{option.note}</span>
                </label>
              ))}
            </fieldset>
            <p className="pin-letter-expiration">
              If pinned now, visible until:
              <br />
              <time dateTime={expiration.toISOString()}>
                {expiration.toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZoneName: "short",
                })}
              </time>
            </p>
            <p className="pin-letter-note">
              Time begins when payment is confirmed.
            </p>
            <label className="pin-letter-url-label" htmlFor="pin-letter-url">
              Which letter would you like to pin?
            </label>
            <input
              id="pin-letter-url"
              type="url"
              value={url}
              disabled={loading || closing}
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
              }}
              placeholder="https://letterstocasper.com/letters/…"
              aria-invalid={!!error}
              aria-describedby={
                error ? "pin-letter-error pin-letter-guide" : "pin-letter-guide"
              }
            />
            <p id="pin-letter-guide" className="pin-letter-note">
              Open an approved letter, copy its link, and paste it here.
            </p>
            <label className="pin-letter-url-label" htmlFor="pin-letter-email">Email (optional)</label>
            <input
              ref={emailInput}
              id="pin-letter-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={254}
              value={email}
              disabled={loading || closing}
              onChange={event => {setEmail(event.target.value); setError('');}}
              placeholder="you@example.com"
              aria-describedby="pin-letter-email-note"
            />
            <p id="pin-letter-email-note" className="pin-letter-note">Enter your email only if you’d like a confirmation receipt and time-left details.</p>
            {error && (
              <p id="pin-letter-error" role="alert">
                {error}
              </p>
            )}
            <div className="pin-letter-actions">
              <button type="button" disabled={loading || closing} onClick={close}>
                Maybe later
              </button>
              <button
                className="pin-letter-primary"
                type="submit"
                disabled={loading || closing}
              >
                {loading ? "Loading letter…" : `Pin for ₱${tier.price}`}
              </button>
            </div>
            {loading && (
              <p role="status" className="text-xs text-muted-foreground">
                Loading your letter preview…
              </p>
            )}
          </form>
        )}
      </section>
    </div>,
    document.body,
  );
}
