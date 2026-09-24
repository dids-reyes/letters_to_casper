import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
  IoInformationCircleOutline,
  IoLockClosedOutline,
} from 'react-icons/io5';
import {createPortal} from 'react-dom';
import {render_url, api_key} from '../data/keys';
import qrphLogo from '../assets/qrph_logo.png';
import gcashLogo from '../assets/gcash-logo-vector.svg';
import mayaLogo from '../assets/maya-seeklogo.svg';
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
  {
    id: 'delivery',
    label: 'Send to Inbox',
    price: 9,
    originalPrice: 19,
    badge: 'Direct',
    description: 'Deliver this letter anonymously straight to their email inbox.',
    delivers: true,
  },
  {
    id: 'pin-24h',
    label: 'Pin to Feed',
    price: 9,
    originalPrice: 19,
    badge: 'Visibility',
    description: 'Pin at the top of the public feed for 24 hours.',
    hours: 24,
  },
  {
    id: 'keepsake-48h',
    label: 'The Keepsake (Both)',
    price: 29,
    originalPrice: 49,
    badge: 'Most Meaningful',
    description: 'Inbox delivery + 48 hours pinned to the top of the feed.',
    hours: 48,
    delivers: true,
  },
];
export function expirationForTier(start, tier) {
  if (!tier.hours && !tier.days) return null;
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

function PaymentMethods() {
  return (
    <div className="pin-payment-methods" aria-label="Secure payment via GCash, Maya, or QRPH">
      <IoLockClosedOutline aria-hidden="true" />
      <span>Secure payment via</span>
      <span className="pin-payment-brand pin-payment-brand--gcash">
        <img src={gcashLogo} alt="GCash" />
      </span>
      <span className="pin-payment-brand pin-payment-brand--maya">
        <img src={mayaLogo} alt="Maya" />
      </span>
      <span>or</span>
      <span className="pin-payment-brand pin-payment-brand--qrph">
        <img src={qrphLogo} alt="QRPH" />
      </span>
    </div>
  );
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
  const [tierId, setTierId] = useState('delivery');
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
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showDeliveryGuide, setShowDeliveryGuide] = useState(false);
  const [showFeaturedGuide, setShowFeaturedGuide] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const emailInput = useRef(null);
  const recipientEmailInput = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const requiresRecipientEmail = Boolean(tier.delivers);
  const normalizedRecipientEmail = recipientEmail.trim();
  const recipientEmailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRecipientEmail)
    && normalizedRecipientEmail.length <= 254;
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
    const recipient_email = requiresRecipientEmail ? recipientEmail.trim() : '';
    if (requiresRecipientEmail && !recipient_email) {
      setError('Enter the recipient email address to deliver this letter anonymously.');
      recipientEmailInput.current?.focus();
      return;
    }
    if (requiresRecipientEmail && (recipient_email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient_email))) {
      setError('Enter a valid recipient email address.');
      recipientEmailInput.current?.focus();
      return;
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
      setConfirmation({letterId, tierId, notificationEmail, recipient_email, from: data.message.from, to: data.message.to,
        message: data.message.message});
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
          <span>{confirmation ? "Confirm Your Letter" : "Make Sure Your Words Are Felt"}</span>
        </h2>
        <p id="pin-letter-subtext">
          {confirmation
            ? "Review the letter and delivery details before opening checkout."
            : "Because some things are too heavy to keep to yourself."}
        </p>
        {confirmation ? (
          <form onSubmit={pay} noValidate>
            <dl className="pin-letter-confirmation">
              <div className="pin-letter-confirmation-row">
                <dt>From:</dt><dd>{confirmation.from || 'Anonymous'}</dd>
              </div>
              <div className="pin-letter-confirmation-row">
                <dt>To:</dt><dd>{confirmation.to || 'Anonymous'}</dd>
              </div>
              <div className="pin-letter-confirmation-row pin-letter-message-row">
                <dt>Message:</dt><dd className="pin-letter-message-preview">{confirmation.message}</dd>
              </div>
            </dl>
            <dl className="pin-upgrade-summary">
              <div><dt>Selected</dt><dd>{tier.label}</dd></div>
              {confirmation.recipient_email && <div><dt>Recipient</dt><dd>{confirmation.recipient_email}</dd></div>}
              {tier.hours && <div><dt>Pin duration</dt><dd>{tier.hours} hours</dd></div>}
              <div><dt>Total</dt><dd>₱{tier.price.toFixed(2)}</dd></div>
            </dl>
            {confirmation.notificationEmail && <p className="pin-letter-note">We’ll email {confirmation.notificationEmail} once your payment is confirmed.</p>}
            {error && <p id="pin-letter-error" role="alert">{error}</p>}
            <div className="pin-letter-actions">
              <button type="button" disabled={loading || closing} onClick={() => {setConfirmation(null); setError('');}}>Back</button>
              <button className="pin-letter-primary" type="submit" disabled={loading || closing}>
                {loading ? 'Opening checkout…' : 'Confirm & Pay'}
              </button>
            </div>
            {loading && <p role="status" className="pin-letter-note">Opening your secure checkout…</p>}
            <PaymentMethods />
          </form>
        ) : (
          <form onSubmit={preview} noValidate>
            <fieldset className="pin-letter-tiers" disabled={loading || closing} aria-label="Choose an upgrade">
              {SUPPORT_TIERS.map((option) => (
                <div
                  key={option.id}
                  className={`pin-letter-tier${tierId === option.id ? " is-selected" : ""}${isFull && option.hours ? " is-unavailable" : ""}`}
                >
                  <label className="pin-letter-tier-option">
                    <input
                      type="radio"
                      name="pin-tier"
                      value={option.id}
                      checked={tierId === option.id}
                      disabled={isFull && Boolean(option.hours)}
                      onChange={() => {
                        setTierId(option.id);
                        setPreviewTime(new Date());
                      }}
                    />
                    <span className="pin-letter-tier-heading">
                      <span className="pin-letter-radio" aria-hidden="true" />
                      <strong>{option.label}</strong>
                      <span className="pin-letter-tier-price"><del aria-label={`Previously ₱${option.originalPrice}`}>₱{option.originalPrice}</del><b aria-label={`Now ₱${option.price}`}>₱{option.price}</b></span>
                    </span>
                    <span className="pin-letter-tier-badge">{option.badge}</span>
                    <span className="pin-letter-tier-note">{option.description}</span>
                    {isFull && option.hours && <span className="pin-letter-tier-capacity">Pinned slots are currently full.</span>}
                  </label>
                  {tierId === option.id && option.delivers && (
                    <div className="pin-tier-email-field">
                      <div className="pin-recipient-label-row">
                        <label className="pin-letter-url-label" htmlFor="pin-recipient-email">Recipient&apos;s Email Address</label>
                        <button
                          type="button"
                          className="pin-recipient-guide-button"
                          aria-label="Preview the recipient email"
                          aria-haspopup="dialog"
                          onClick={() => setShowDeliveryGuide(true)}
                        >
                          <IoInformationCircleOutline aria-hidden="true" />
                        </button>
                      </div>
                      <input
                        ref={recipientEmailInput}
                        id="pin-recipient-email"
                        name="recipient_email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={recipientEmail}
                        required
                        maxLength={254}
                        disabled={loading || closing}
                        placeholder="name@example.com"
                        onChange={event => { setRecipientEmail(event.target.value); setError(''); }}
                        aria-invalid={Boolean(recipientEmail) && !recipientEmailIsValid}
                      />
                    </div>
                  )}
                </div>
              ))}
            </fieldset>
            {expiration && <p className="pin-letter-expiration">Pinned until <time dateTime={expiration.toISOString()}>{expiration.toLocaleString()}</time>. Time begins after payment.</p>}
            {!hideUrlInput && (
              <>
                <label className="pin-letter-url-label" htmlFor="pin-letter-url">
                  Which letter would you like to upgrade?
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
                disabled={loading || closing || (requiresRecipientEmail && !recipientEmailIsValid)}
              >
                {loading
                  ? "Loading letter…"
                  : `Continue • ₱${tier.price}`}
              </button>
            </div>
            <PaymentMethods />
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
            <h3 id="pin-delivery-guide-title">What will they receive?</h3>
            <p className="pin-delivery-guide-intro">
              Their inbox will show a private notification from Letters to Casper, similar to this:
            </p>
            <div className="pin-recipient-email-preview" aria-label="Example recipient inbox message">
              <img src="/ltc_favicon.png" alt="" />
              <div className="pin-recipient-email-preview__content">
                <div className="pin-recipient-email-preview__sender">
                  <strong>Letters to Casper</strong>
                  <time>2:40 PM</time>
                </div>
                <b>Recipient, someone wrote a letter for you</b>
                <span>Someone wrote to you. Open the letter when you’re ready…</span>
              </div>
            </div>
            <div className="pin-recipient-guide-note">
              <IoLockClosedOutline aria-hidden="true" />
              <div>
                <strong>Your identity stays private.</strong>
                <p>The email includes the To and From names written on the letter, a short preview, and a link to read it. Your payment and receipt details are never shared.</p>
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
