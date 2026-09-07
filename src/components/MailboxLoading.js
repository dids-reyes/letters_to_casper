import React, {useEffect, useState} from 'react';
import Lottie from 'react-lottie-player';
import {IoMailOutline} from 'react-icons/io5';
import ghost from '../lotties/ghost1.json';
import '../styles/MailboxLoading.css';

const notes = [
  'Some words are worth waiting for.',
  'A little courage can fit inside a letter.',
  'Somewhere, someone has felt this too.',
  'There is room here for what you never got to say.',
  'Take a breath. Stay a little while.',
];

export default function MailboxLoading() {
  const [elapsed, setElapsed] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(preference.matches);
    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () => {
      window.clearInterval(timer);
      preference.removeEventListener('change', updateMotion);
    };
  }, []);

  const extended = elapsed >= 8;
  const noteIndex = Math.floor(Math.max(0, elapsed - 8) / 10) % notes.length;
  return (
    <section className={`mailbox-loading${extended ? ' is-waking' : ''}`} aria-label="Loading letters">
      <div className="mailbox-loading__ghost" aria-hidden="true">
        <Lottie animationData={ghost} loop play={!reducedMotion} style={{width: '100%', height: '100%'}} />
      </div>
      <div className="mailbox-loading__status" role="status" aria-live="polite">
        <h2>{extended ? 'A sleepy mailbox. A little patience.' : 'Opening the mailbox…'}</h2>
        <p>{elapsed >= 60
          ? 'This is taking longer than usual. We’re still waiting for the mailbox to respond.'
          : extended
            ? 'The mailbox sometimes needs about a minute to wake up. You can stay right here.'
            : 'Making room for a few words from the heart.'}</p>
      </div>
      {extended && (
        <div className="mailbox-loading__waiting">
          <div className="mailbox-loading__delivery" aria-hidden="true">
            <span className="mailbox-loading__trail" />
            {[0, 1, 2].map(index => <span key={index} className="mailbox-loading__letter" style={{'--delivery-delay': `${index * -2.4}s`}}><IoMailOutline /></span>)}
            <span className="mailbox-loading__mailbox">
              <svg viewBox="0 0 64 64" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                {/* The open front faces the incoming letters; its door folds down. */}
                <path d="M23 14h22c8 0 13 7 13 16v17H35V30c0-9-4-16-12-16Z" fill="var(--mailbox-body)" />
                <path d="M11 47V30c0-9 5-16 12-16s12 7 12 16v17Z" fill="var(--mailbox-opening)" />
                <path d="M11 47 3 57h24l8-10Z" fill="var(--mailbox-body)" />
                <path d="M39 47v13m7-13v13M47 30V9h10v9H47" />
              </svg>
            </span>
          </div>
          <p key={noteIndex} className="mailbox-loading__note">{notes[noteIndex]}</p>
          <span className="mailbox-loading__hint">Letters will appear as soon as they’re ready.</span>
        </div>
      )}
    </section>
  );
}
