import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import './BugReportModal.css';
import {render_url, api_key} from '../data/keys';

export default function BugReportModal({ onClose }) {
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [viewportTop, setViewportTop] = useState(0);
  const dialog = useRef(null);
  const overlayRef = useRef(null);
  const busy = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const textarea = dialog.current?.querySelector('textarea');
    if (textarea) {
      try {
        textarea.focus({ preventScroll: true });
      } catch {
        textarea.focus();
      }
    }
    return () => {
      mounted.current = false;
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return undefined;
    const vv = window.visualViewport;

    const updateViewport = () => {
      if (!mounted.current) return;
      const offset = Math.max(0, window.innerHeight - vv.height);
      const activeKeyboardOffset = offset > 60 ? offset : 0;
      setKeyboardOffset(activeKeyboardOffset);
      setViewportTop(vv.offsetTop || 0);

      if (overlayRef.current) {
        overlayRef.current.style.setProperty('--keyboard-offset', `${activeKeyboardOffset}px`);
        overlayRef.current.style.setProperty('--viewport-top', `${vv.offsetTop || 0}px`);
      }
    };

    vv.addEventListener('resize', updateViewport);
    vv.addEventListener('scroll', updateViewport);
    updateViewport();

    return () => {
      vv.removeEventListener('resize', updateViewport);
      vv.removeEventListener('scroll', updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!closing) return undefined;
    const timeout = setTimeout(onClose, 180);
    return () => clearTimeout(timeout);
  }, [closing, onClose]);

  const close = () => setClosing(true);
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') { event.stopPropagation(); close(); }
    if (event.key === 'Tab') {
      const controls = [...dialog.current.querySelectorAll('button:not(:disabled), textarea:not(:disabled)')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy.current || !description.trim()) return;
    busy.current = true;
    setSending(true);
    setError('');
    try {
      const response = await fetch(`${render_url}/report-bug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': api_key },
        body: JSON.stringify({ description: description.trim(), metadata: {
          url: window.location.href,
          viewport: `${window.innerWidth} × ${window.innerHeight}`,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        } }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission failed');
      toast.success('Successfully sent report');
      if (mounted.current) { setDescription(''); onClose(); }
    } catch {
      if (mounted.current) setError('Failed to send report. Please try again.');
    } finally {
      busy.current = false;
      if (mounted.current) setSending(false);
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={`letter-share-dialog-overlay bug-report-overlay${closing ? ' is-closing' : ''}${keyboardOffset > 0 ? ' keyboard-active' : ''}`}
      style={{
        '--keyboard-offset': `${keyboardOffset}px`,
        '--viewport-top': `${viewportTop}px`,
      }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      onKeyDown={handleKeyDown}
    >
      <section ref={dialog} className="letter-share-dialog bug-report-dialog" role="dialog" aria-modal="true" aria-labelledby="bug-report-title">
        <button type="button" className="letter-share-dialog__close" aria-label="Close bug report" onClick={close}>×</button>
        <h2 id="bug-report-title">Bug Report</h2>
        <form onSubmit={submit} aria-busy={sending}>
          <label htmlFor="bug-report-description">Description</label>
          <textarea id="bug-report-description" value={description} onChange={(event) => setDescription(event.target.value)}
            required maxLength={5000} rows={6} readOnly={sending} aria-describedby={error ? 'bug-report-error' : undefined}
            placeholder="Describe what went wrong or what isn't working as expected (e.g., steps to reproduce, what you saw)..." />
          {error && <p id="bug-report-error" className="bug-report-error" role="alert">{error}</p>}
          <button className="letter-share-dialog__download" type="submit" disabled={sending || !description.trim() || closing}>
            {sending && <span className="bug-report-spinner" aria-hidden="true" />} {sending ? 'Sending…' : 'Send Report'}
          </button>
        </form>
      </section>
    </div>, document.body,
  );
}
