import React from "react";

const truncateMessage = (message, maxLength) => {
  return message.length > maxLength
    ? `${message.substring(0, maxLength - 3)}...`
    : message;
};

function Letter({ letter, toggleDetailsModal, setSelectedLetter }) {
  const truncatedMessage = truncateMessage(letter.message, 13);
  const truncatedFrom = truncateMessage(letter.from, 9);
  const truncatedTo = truncateMessage(letter.to, 9);
  const handleClick = () => {
    setSelectedLetter(letter);
    toggleDetailsModal();
  };

  if (!letter.approve) {
    return null; // If not approved, don't render the letter
  }

  return (
    <div className="letter-card" onClick={handleClick}>
      <div className="card">
        <p className="card-text">
          <strong>Fr:</strong> {truncatedFrom}
        </p>
        <p className="card-text">
          <strong>To:</strong> {truncatedTo}
        </p>
        <p className="card-preview">{truncatedMessage}</p>
      </div>
    </div>
  );
}

export default Letter;
