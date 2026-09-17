import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {IoShareSocialOutline} from 'react-icons/io5';
import '../styles/App.css';

export default function PinThankYouDialog({pinned, onClose}) {
  const dialog = useRef(null);
  const [shareStatus, setShareStatus] = useState('');
  useEffect(() => {
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    return () => { document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, []);
  const shareWebsite = async () => {
    const data = {title: 'Letters to Casper', text: 'A quiet place for words we carry. Read a letter or leave one of your own.', url: window.location.origin};
    try {
      if (navigator.share) {
        await navigator.share(data);
        setShareStatus('Thanks for sharing the warmth.');
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data.url);
        setShareStatus('Website link copied. Share it with someone who may need it.');
      } else {
        const field = document.createElement('textarea');
        field.value = data.url;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        try { field.select(); if (!document.execCommand('copy')) throw new Error('Copy failed'); }
        finally { field.remove(); dialog.current?.querySelector('button')?.focus(); }
        setShareStatus('Website link copied. Share it with someone who may need it.');
      }
    } catch (error) { if (error?.name !== 'AbortError') setShareStatus('Sharing is unavailable right now.'); }
  };
  const onKeyDown = event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') {
      const controls = dialog.current.querySelectorAll('button');
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  };
  return createPortal(
    <div className="submit-confirm-overlay share-celebration-overlay" onKeyDown={onKeyDown} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialog} className="share-celebration-dialog" role="dialog" aria-modal="true" aria-labelledby="pin-thank-you-title" aria-describedby="pin-thank-you-message">
        <div className="share-celebration-achievement" aria-hidden="true"><img src={`${process.env.PUBLIC_URL}/android-chrome-512x512.png`} alt="" /></div>
        <span className="submission-notice-eyebrow">PINNED SUCCESSFULLY</span>
        <h2 id="pin-thank-you-title">{pinned ? 'A little more time to shine.' : 'Your support made it here.'}</h2>
        <p id="pin-thank-you-message">{pinned ? 'Thank you for supporting Letters to Casper and keeping this quiet space alive.' : 'Your contribution helps keep this quiet space running for everyone. This letter is no longer actively pinned, but your support still means so much.'}</p>
        <button type="button" className="share-celebration-primary" onClick={shareWebsite}><IoShareSocialOutline /> Share Letters to Casper</button>
        {shareStatus && <span className="share-celebration-status" role="status">{shareStatus}</span>}
        <button type="button" className="share-celebration-finish" onClick={onClose}>Close</button>
      </section>
    </div>, document.body,
  );
}
