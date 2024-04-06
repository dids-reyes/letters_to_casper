// Letter.js
import React from 'react';

function Letter({letter, toggleDetailsModal, setSelectedLetter}) {
  const handleClick = () => {
    setSelectedLetter(letter);
    toggleDetailsModal();
  };

  return (
    <div className="letter-card" onClick={handleClick}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{letter.from}</h5>
          <p className="card-preview">
            {letter.message.length > 50
              ? `${letter.message.substring(0, 50)}...`
              : letter.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Letter;
