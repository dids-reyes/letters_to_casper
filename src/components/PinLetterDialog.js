import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
  IoEyeOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPaperPlaneOutline,
} from 'react-icons/io5';
import {AiOutlinePushpin} from 'react-icons/ai';
import {createPortal} from 'react-dom';
import {render_url, api_key} from '../data/keys';
import paymongoLogo from '../assets/paymongo_logo.png';
import qrphLogo from '../assets/qrph_logo.png';
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
  {id: '12h', label: '12 Hours', price: 19, originalPrice: 29, hours: 12, note: 'A fleeting spark'},
  {id: '24h', label: '24 Hours', price: 39, originalPrice: 49, days: 1, note: 'A quiet day in the spotlight'},
  {id: '3d', label: '3 Days', price: 79, originalPrice: 89, days: 3, note: 'Keep it close for the weekend'},
  {id: '7d', label: '7 Days', price: 129, originalPrice: 149, days: 7, note: 'Seven days in spotlight'},
];
export function expirationForTier(start, tier) {
  const date = new Date(start);
  if (tier.hours) {
    date.setTime(date.getTime() + tier.hours * 3600000);
  } else if (tier.days) {
    date.setTime(date.getTime() + tier.days * 86400000);
  }
  return date;
}
export function redirectToCheckout(url) {
  window.location.assign(url);
}
export default function PinLetterDialog({
  onClose,
  redirect = redirectToCheckout,
  letters = [],
  activePins: passedActivePins,
  defaultUrl = '',
  initialUrl = '',
  hideUrlInput = false,
}) {
  const activePins = useMemo(() => {
    const rawPins = Array.isArray(passedActivePins)
      ? passedActivePins
      : (letters || []).filter((letter) => {
          if (!letter || !letter.is_pinned || !letter.pin_expires_at) return false;
          return new Date(letter.pin_expires_at) > new Date();
        });
    return [...rawPins].sort(
      (a, b) => new Date(a.pin_expires_at) - new Date(b.pin_expires_at)
    );
  }, [letters, passedActivePins]);

  const isFull = activePins.length >= 7;
  const earliestExpiry = isFull && activePins[0] ? new Date(activePins[0].pin_expires_at) : null;

  const [tierId, setTierId] = useState('12h');
  const [previewTime, setPreviewTime] = useState(() => new Date());
  const [closing, setClosing] = useState(false);
  const tier = SUPPORT_TIERS.find(option => option.id === tierId) || SUPPORT_TIERS[0];
  const expiration = expirationForTier(previewTime, tier);
  const [url, setUrl] = useState(() => defaultUrl || initialUrl || '');

  useEffect(() => {
    if (defaultUrl || initialUrl) {
      setUrl(defaultUrl || initialUrl);
    }
  }, [defaultUrl, initialUrl]);
  const [email, setEmail] = useState('');
  const [deliverEmail, setDeliverEmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showDeliveryGuide, setShowDeliveryGuide] = useState(false);
  const [showFeaturedGuide, setShowFeaturedGuide] = useState(false);
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
    if (event.key === 'Escape') {
      if (showFeaturedGuide) {
        event.stopPropagation();
        setShowFeaturedGuide(false);
        return;
      }
      if (showDeliveryGuide) {
        event.stopPropagation();
        setShowDeliveryGuide(false);
        return;
      }
      event.stopPropagation();
      close();
    }
    if (event.key === 'Tab') {
      if (showDeliveryGuide || showFeaturedGuide) {
        const guide = document.querySelector(showFeaturedGuide ? '.pin-featured-guide' : '.pin-delivery-guide');
        if (guide) {
          const controls = [...guide.querySelectorAll('button:not(:disabled)')];
          if (!controls.length) { event.preventDefault(); return; }
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          return;
        }
      }
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
    const recipient_email = deliverEmail ? recipientEmail.trim() : '';
    if (deliverEmail && recipient_email && (recipient_email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient_email))) {
      setError('Enter a valid recipient email address or leave it blank.'); return;
    }
    const notificationEmail = email.trim();
    if (notificationEmail && (notificationEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail) || emailInput.current?.validity.typeMismatch)) {
      setError('Enter a valid email address or leave it blank.'); return;
    }
    busy.current = true; setLoading(true); setError('');
    try {
      const response = await fetch(new URL(`/api/messages/public/${letterId}`, render_url).href, {headers: {'x-api-key': api_key}});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'This letter is not available. Please check the link.');
      if (!data.message || data.message._id?.toLowerCase() !== letterId.toLowerCase() || typeof data.message.message !== 'string') throw new Error('Unable to load this letter. Please check the link.');
      const characters = Array.from(data.message.message);
      setConfirmation({letterId, tierId, notificationEmail, recipient_email, from: data.message.from, to: data.message.to,
        message: characters.slice(0, 80).join('') + (characters.length > 80 ? '...' : '')});
    } catch (err) { setError(err.message || 'Unable to load this letter. Please try again.'); }
    finally { busy.current = false; setLoading(false); }
  };
  const pay = async event => {
    event.preventDefault();
    if (busy.current || closing || !confirmation) return;
    const {letterId, tierId, notificationEmail, recipient_email} = confirmation;
    busy.current = true; setLoading(true); setError('');
    try {
      const endpoint = new URL('/api/create-pin-payment', render_url).href;
      const response = await fetch(endpoint, {
        method: 'POST', headers: {'Content-Type': 'application/json', 'x-api-key': api_key},
        body: JSON.stringify({letterId, tierId, ...(notificationEmail ? {customer_email: notificationEmail} : {}), ...(recipient_email ? {recipient_email} : {})}),
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
    <>
      <div
        className={`pin-letter-overlay${closing ? " is-closing" : ""}`}
        onKeyDown={onKeyDown}
        onClick={(event) => {
          event.stopPropagation();
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
          onClick={(event) => event.stopPropagation()}
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
                Pin & Deliver
                <AiOutlinePushpin
                  className="pin-letter-title-icon"
                  aria-hidden="true"
                />
                <IoMailOutline
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
            : <>Keep these words at the top of the feed, and optionally deliver them anonymously via email. <button type="button" className="pin-featured-guide-btn" onClick={() => setShowFeaturedGuide(true)}>Featured Letters.</button></>}
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
            <p className="pin-checkout-trust">
              <IoLockClosedOutline aria-hidden="true" />
              <span>Secure checkout using</span>
              <img src={qrphLogo} alt="QRPH" className="pin-qrph-logo" />
              <span>by</span>
              <img src={paymongoLogo} alt="PayMongo" className="pin-paymongo-logo" />
            </p>
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
                    <span className="pin-letter-tier-price"><del aria-label={`Previously ₱${option.originalPrice}`}>₱{option.originalPrice}</del><b aria-label={`Now ₱${option.price}`}>₱{option.price}</b></span>
                  </span>
                  <span className="pin-letter-tier-note" title={option.note}>{option.note}</span>
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
            {!hideUrlInput && (
              <>
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
              </>
            )}
            <div className="pin-delivery-card">
              <label className="pin-delivery-toggle-label" htmlFor="pin-deliver-toggle">
                <input
                  id="pin-deliver-toggle"
                  type="checkbox"
                  className="pin-delivery-checkbox-input"
                  checked={deliverEmail}
                  disabled={loading || closing}
                  onChange={event => {
                    setDeliverEmail(event.target.checked);
                    setError('');
                  }}
                />
                <span className="pin-delivery-checkbox-box" aria-hidden="true">
                  <span className="pin-delivery-checkmark">✓</span>
                </span>
                <span className="pin-delivery-toggle-text">
                  <span className="pin-delivery-toggle-title">
                    Deliver an anonymous copy via email
                  </span>
                  <span className="pin-deliver-badge">Included</span>
                </span>
              </label>

              {deliverEmail && (
                <div className="pin-delivery-fields">
                  <div className="pin-recipient-label-row">
                    <label className="pin-letter-url-label" htmlFor="pin-recipient-email">
                      Recipient's Email
                    </label>
                    <button
                      type="button"
                      className="pin-recipient-guide-btn"
                      onClick={() => setShowDeliveryGuide(true)}
                      aria-label="What’s this? Learn more about delivering your letter"
                    >
                      <IoInformationCircleOutline aria-hidden="true" />
                      <span>What’s this?</span>
                    </button>
                  </div>
                  <input
                    id="pin-recipient-email"
                    name="recipient_email"
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    value={recipientEmail}
                    maxLength={254}
                    disabled={loading || closing}
                    placeholder="recipient@example.com"
                    onChange={event => { setRecipientEmail(event.target.value); setError(''); }}
                    aria-describedby="pin-recipient-note"
                  />
                  <p id="pin-recipient-note" className="pin-letter-note pin-sender-note">
                    Sender name: Sent anonymously via Letters to Casper
                  </p>
                </div>
              )}
            </div>

            <div className="pin-receipt-section">
              <label className="pin-letter-url-label" htmlFor="pin-letter-email">
                Your Email (for receipt only)
              </label>
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
                onChange={event => { setEmail(event.target.value); setError(''); }}
                placeholder="you@example.com"
                aria-describedby="pin-letter-email-note"
              />
              <p id="pin-letter-email-note" className="pin-letter-note">
                Enter your email only if you’d like a payment receipt and time-left details.
              </p>
            </div>

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
                {loading
                  ? "Loading letter…"
                  : (deliverEmail && recipientEmail.trim())
                    ? `Pin and Deliver for ₱${tier.price}`
                    : `Pin for ₱${tier.price}`}
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
    </div>
    {showDeliveryGuide && (
        <div
          className="pin-delivery-guide-overlay"
          onClick={(event) => {
            event.stopPropagation();
            setShowDeliveryGuide(false);
          }}
          onKeyDown={onKeyDown}
        >
          <section
            className="pin-delivery-guide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-delivery-guide-title"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className="pin-letter-close"
              aria-label="Close delivery guide"
              onClick={() => setShowDeliveryGuide(false)}
            >
              ×
            </button>
            <h3 id="pin-delivery-guide-title">Delivering Your Letter</h3>
            <p className="pin-delivery-guide-intro">
              If you know the email address of the person you wrote this for, you can add it in the field. Once your transaction is confirmed, we’ll send them a notification letting them know someone wrote a letter for them, along with a link to read it on the site.
            </p>
            <div className="pin-delivery-guide-list">
              <div className="pin-delivery-guide-item">
                <IoEyeOutline aria-hidden="true" />
                <div>
                  <strong>What they will see:</strong>
                  <p>Only the names you entered in the To and From fields, plus a short preview snippet of your letter.</p>
                </div>
              </div>
              <div className="pin-delivery-guide-item">
                <IoLockClosedOutline aria-hidden="true" />
                <div>
                  <strong>Your receipt email stays private:</strong>
                  <p>The email address you use for payment confirmation is never shown or shared with the recipient.</p>
                </div>
              </div>
              <div className="pin-delivery-guide-item">
                <IoPaperPlaneOutline aria-hidden="true" />
                <div>
                  <strong>One-time dispatch:</strong>
                  <p>This is a single, quiet delivery notification—never a mailing list or promotional email.</p>
                </div>
              </div>
            </div>
            <div className="pin-delivery-guide-actions">
              <button
                type="button"
                className="pin-delivery-guide-dismiss"
                onClick={() => setShowDeliveryGuide(false)}
              >
                Got it
              </button>
            </div>
          </section>
        </div>
      )}
    {showFeaturedGuide && (
      <div
        className="pin-delivery-guide-overlay"
        onClick={(event) => {
          event.stopPropagation();
          setShowFeaturedGuide(false);
        }}
        onKeyDown={onKeyDown}
      >
        <section
          className="pin-delivery-guide pin-featured-guide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-featured-guide-title"
          onClick={event => event.stopPropagation()}
        >
          <button
            type="button"
            className="pin-letter-close"
            aria-label="Close featured letters guide"
            onClick={() => setShowFeaturedGuide(false)}
          >
            ×
          </button>
          <h3 id="pin-featured-guide-title">About Featured Letters</h3>
          <p className="pin-delivery-guide-intro">
            Pinning guarantees your letter stays highlighted at the top of the community. While featured status is 100% free and chosen based on content, pinned letters are brought straight to our moderators&apos; &amp; admin attention, giving your piece the best possible shot at being selected.
          </p>
          <p className="pin-featured-criteria-label">Criterias are:</p>
          <ul className="pin-featured-criteria">
            <li><strong>Genuine and vulnerable:</strong> Honest words written from the heart, not generic quotes.</li>
            <li><strong>Leaves a mark:</strong> Stirs real emotion, whether it is comfort, ache, or closure.</li>
            <li><strong>Meaningful, not filler:</strong> Every line has purpose and a clear thought behind it.</li>
            <li><strong>Intentional length:</strong> If it is short, make it punchy. If it is long, take the reader on a journey without rambling.</li>
          </ul>
          <div className="pin-delivery-guide-actions">
            <button
              type="button"
              className="pin-delivery-guide-dismiss"
              onClick={() => setShowFeaturedGuide(false)}
            >
              Got it
            </button>
          </div>
        </section>
      </div>
    )}
    </>,
    document.body,
  );
}
