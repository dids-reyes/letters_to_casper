import React, {useEffect, useRef} from "react";
import {IoCloseOutline, IoReloadOutline} from "react-icons/io5";
import {RiAdvertisementLine} from "react-icons/ri";

function AdBlockSupportDialog({open, onClose, onRetry}) {
  const retryRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    retryRef.current?.focus();
    const handleKeyDown = event => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="adblock-support-overlay" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="adblock-support-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adblock-support-title"
        aria-describedby="adblock-support-description"
      >
        <button
          type="button"
          className="adblock-support-close"
          onClick={onClose}
          aria-label="Close ad blocker notice"
        >
          <IoCloseOutline aria-hidden="true" />
        </button>
        <div className="adblock-support-heading">
          <RiAdvertisementLine className="adblock-support-icon" aria-hidden="true" />
          <h2 id="adblock-support-title">Support Us</h2>
        </div>
        <p id="adblock-support-description">
          Ads help keep Letters to Casper free and available. Please allow ads on this site, then check again. Thank you for supporting this space.
        </p>
        <div className="adblock-support-actions">
          <button type="button" className="adblock-support-cancel" onClick={onClose}>Close</button>
          <button type="button" className="adblock-support-retry" onClick={onRetry} ref={retryRef}>
            <IoReloadOutline aria-hidden="true" />
            I’ve Disabled AdBlock
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdBlockSupportDialog;
