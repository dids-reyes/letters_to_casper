// Letter.js
import React from 'react';
import {LiaUserSecretSolid} from 'react-icons/lia';
import {TbGhost2} from 'react-icons/tb';
import Lottie from 'react-lottie';
import animationData from '../lotties/ghost.json';

const truncateMessage = (message, maxLength) => {
  const secondSpaceIndex = message.indexOf(' ', message.indexOf(' ') + 1);
  if (secondSpaceIndex !== -1 && secondSpaceIndex <= maxLength) {
    return `${message.substring(0, secondSpaceIndex)}...`;
  } else {
    return message;
  }
};

function Letter({letter, toggleDetailsModal, setSelectedLetter}) {
  const truncatedMessage = truncateMessage(letter.message, 50);
  const handleClick = () => {
    setSelectedLetter(letter);
    toggleDetailsModal();
  };

  if (letter == null) {
    return (
      <div>
        <Lottie
          options={{
            animationData: animationData,
            loop: true,
            autoplay: true,
          }}
          height={200}
          width={200}
        />
      </div>
    );
  }

  return (
    <div className="letter-card" onClick={handleClick}>
      <div className="card">
        <div className="card-body">
          <h3>
            <LiaUserSecretSolid />
            &nbsp;
            {letter.from}
          </h3>
          <h4>
            <TbGhost2 />
            &nbsp;
            {letter.to}
          </h4>
          <p className="card-preview">{truncatedMessage}</p>
        </div>
      </div>
    </div>
  );
}

export default Letter;
