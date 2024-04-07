// Letter.js
import React from 'react';
import {PiUserRectangleDuotone} from 'react-icons/pi';
import {PiUserRectangleLight} from 'react-icons/pi';

const truncateMessage = (message, maxLength) => {
  return message.length > maxLength
    ? `${message.substring(0, maxLength - 3)}...`
    : message;
};

function Letter({letter, toggleDetailsModal, setSelectedLetter}) {
  const truncatedMessage = truncateMessage(letter.message, 13);
  const truncatedFrom = truncateMessage(letter.from, 9);
  const truncatedTo = truncateMessage(letter.to, 9);
  const handleClick = () => {
    setSelectedLetter(letter);
    toggleDetailsModal();
  };

  return (
    <div className="letter-card" onClick={handleClick}>
      <div className="card">
        <div>
          <h3>
            <PiUserRectangleDuotone />
            &nbsp;
            {truncatedFrom}
          </h3>
          <h4>
            <PiUserRectangleLight />
            &nbsp;
            {truncatedTo}
          </h4>
          <p className="card-preview">{truncatedMessage}</p>
        </div>
      </div>
    </div>
  );
}

export default Letter;
