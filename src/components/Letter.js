import React from "react";
import { useNavigate } from "react-router-dom";

const truncateMessage = (message, maxLength) => {
  return message.length > maxLength
    ? `${message.substring(0, maxLength - 3)}...`
    : message;
};

function Letter({ letter, toggleDetailsModal, setSelectedLetter }) {
  const navigate = useNavigate();
  const truncatedMessage = truncateMessage(letter.message, 28);
  const truncatedFrom = truncateMessage(letter.from, 14);
  const truncatedTo = truncateMessage(letter.to, 14);
  const handleClick = () => {
    setSelectedLetter(letter);
    toggleDetailsModal();
    navigate(`/letters/${letter._id}`);
  };

  if (!letter.approve) {
    return null; // If not approved, don't render the letter
  }

  return (
    <div
      className="letter-card"
      onClick={handleClick}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex="0"
      aria-label={`Open letter from ${letter.from} to ${letter.to}`}
    >
      <div className="card">
        <p className="card-text">
          <span className="letter-field-label">From: </span>
          <span className="letter-field-value">{truncatedFrom}</span>
        </p>
        <p className="card-text">
          <span className="letter-field-label">To: </span>
          <span className="letter-field-value">{truncatedTo}</span>
        </p>
        <p className="card-preview">
          <span>{truncatedMessage}</span>
        </p>
      </div>
    </div>
  );
}

export default Letter;
