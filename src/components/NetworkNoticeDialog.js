import React, { useEffect } from "react";
import PropTypes from "prop-types";
import pldtLogo from "../assets/pldt_logo.png";

function NetworkNoticeDialog({ isOpen, onDismiss }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="ui-announcement-overlay pldt-notice-overlay"
      onClick={onDismiss}
    >
      <section
        className="ui-announcement-dialog pldt-notice-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pldt-notice-title"
        aria-describedby="pldt-notice-message"
        onClick={(event) => event.stopPropagation()}
      >
        <span
          className="ui-announcement-icon ui-announcement-logo pldt-notice-logo-wrapper"
          aria-hidden="true"
        >
          <img src={pldtLogo} alt="PLDT" className="pldt-notice-logo" />
        </span>
        <span className="ui-announcement-eyebrow pldt-notice-eyebrow">
          Network Advisory
        </span>
        <h2 id="pldt-notice-title">Network Notice</h2>
        <p id="pldt-notice-message">
          If you are currently using PLDT and experiencing issues loading the
          mailbox, please try switching to another network provider or changing
          your DNS. PLDT is currently experiencing ongoing DNS issues affecting
          access to our servers.
        </p>
        <button
          type="button"
          className="ui-announcement-action pldt-notice-action"
          onClick={onDismiss}
          autoFocus
        >
          Understood
        </button>
      </section>
    </div>
  );
}

NetworkNoticeDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default NetworkNoticeDialog;

