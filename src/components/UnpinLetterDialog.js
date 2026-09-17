import React, {useEffect, useRef} from 'react';
import {IoPinOutline} from 'react-icons/io5';

export default function UnpinLetterDialog({letter, loading, error, onClose, onConfirm}) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    return () => {document.body.style.overflow = overflow; previous?.focus();};
  }, []);
  const onKeyDown = event => {
    if (event.key === 'Escape') {event.stopPropagation(); if (!loading) onClose();}
    if (event.key === 'Tab') {
      const buttons = [...dialog.current.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (!first) {event.preventDefault(); return;}
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    }
  };
  return <div className="admin-delete-overlay" onKeyDown={onKeyDown} onClick={event => {if (event.target === event.currentTarget && !loading) onClose();}}>
    <section ref={dialog} className="admin-delete-dialog managed-unpin-dialog" role="alertdialog" aria-modal="true" aria-labelledby="managed-unpin-title" aria-describedby="managed-unpin-description" aria-busy={loading}>
      <span className="admin-delete-dialog__icon" aria-hidden="true"><IoPinOutline /></span>
      <span className="admin-delete-dialog__eyebrow">Pinned letter</span>
      <h2 id="managed-unpin-title">Unpin this letter?</h2>
      <p id="managed-unpin-description">This ends its current pin immediately. The letter will remain available in the regular feed.</p>
      <div className="featured-remove-dialog__letter"><span>From <strong>{letter.from}</strong></span><span>To <strong>{letter.to}</strong></span></div>
      {error && <p className="admin-delete-dialog__error" role="alert">{error}</p>}
      <div className="admin-delete-dialog__actions">
        <button type="button" className="admin-delete-dialog__cancel" disabled={loading} onClick={onClose}>Keep pinned</button>
        <button type="button" className="featured-add-dialog__confirm" disabled={loading} onClick={onConfirm}><IoPinOutline />{loading ? 'Unpinning…' : 'Unpin letter'}</button>
      </div>
    </section>
  </div>;
}
