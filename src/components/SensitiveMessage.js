import React from "react";
import {IoEyeOffOutline, IoEyeOutline} from "react-icons/io5";

function SensitiveMessage({
  sensitive = false,
  revealed = false,
  compact = false,
  interactive = true,
  onReveal,
  children,
}) {
  if (!sensitive) return children;

  if (compact) {
    return (
      <span className="sensitive-message sensitive-message--compact" role="note">
        <IoEyeOffOutline aria-hidden="true" />
        <strong className="sensitive-message__label">
          <span>Sensitive</span>
          <span>Content</span>
        </strong>
      </span>
    );
  }

  if (!revealed) {
    return (
      <div className="sensitive-message sensitive-message--covered" role="note">
        <IoEyeOffOutline className="sensitive-message__icon" aria-hidden="true" />
        <strong className="sensitive-message__label">
          <span>Sensitive</span>
          <span>Content</span>
        </strong>
        <span>This letter may contain discussion of suicide, self-harm, or severe distress.</span>
        {interactive && (
          <button type="button" onClick={onReveal} aria-expanded="false">
            <IoEyeOutline aria-hidden="true" />
            Show message
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="sensitive-message sensitive-message--revealed">
      <div className="sensitive-message__content">{children}</div>
    </div>
  );
}

export default SensitiveMessage;
