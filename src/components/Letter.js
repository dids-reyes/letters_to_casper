import React from "react";
import { useNavigate } from "react-router-dom";

const clip = (str, max) => {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
};

const timeAgo = (timestamp) => {
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
};

function Letter({ letter, toggleDetailsModal, setSelectedLetter }) {
  const navigate = useNavigate();

  const handleClick = () => {
    setSelectedLetter(letter);
    toggleDetailsModal();
    navigate(`/letters/${letter._id}`);
  };

  if (!letter.approve) {
    return null; // If not approved, don't render the letter
  }

  return (
    <div className="letter-card" onClick={handleClick}>
      <div className="letter-card__top">
        <div className="letter-card__from">
          <span className="letter-card__label">From</span>
          <span className="letter-card__name">{clip(letter.from, 22)}</span>
        </div>
        <span className="letter-card__time">{timeAgo(letter.timestamp)}</span>
      </div>
      <div className="letter-card__to">
        <span className="letter-card__label">To</span>
        <span className="letter-card__to-name">{clip(letter.to, 24)}</span>
      </div>
      <hr className="letter-card__rule" />
      <p className="letter-card__preview">{letter.message}</p>
    </div>
  );
}

export default Letter;
