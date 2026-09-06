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

const getWarmthScore = letter => {
  const reads = Math.max(0, Number(letter?.reads) || 0);
  const reactions = ["love", "sad"].reduce(
    (total, key) => total + Math.max(0, Number(letter?.echoes?.[key]) || 0),
    0,
  );
  return Math.log2(reads + 1) + reactions * 3;
};

function Letter({ letter, toggleDetailsModal, setSelectedLetter, maxWarmthScore = 0 }) {
  const navigate = useNavigate();
  const warmthScore = getWarmthScore(letter);
  const relativeWarmth = maxWarmthScore > 0 ? warmthScore / maxWarmthScore : 0;
  const absoluteWarmth = Math.min(warmthScore / 12, 1);
  const warmth = warmthScore > 0
    ? Math.min(0.86, 0.1 + Math.sqrt(relativeWarmth) * 0.38 + absoluteWarmth * 0.34)
    : 0.08;
  const warmthLevel = warmth < 0.3
    ? "quiet"
    : warmth < 0.5
      ? "noticed"
      : warmth < 0.7
        ? "resonating"
        : "deeply-felt";
  const warmthLabel = {
    quiet: "Quietly noticed",
    noticed: "Noticed",
    resonating: "Resonating",
    "deeply-felt": "Deeply felt",
  }[warmthLevel];
  const loveCount = Math.max(0, Number(letter?.echoes?.love) || 0);
  const sadCount = Math.max(0, Number(letter?.echoes?.sad) || 0);
  const reactionMood = loveCount > sadCount
    ? "love"
    : sadCount > loveCount
      ? "sad"
      : "neutral";

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
      className={`letter-card letter-card--warmth-${warmthLevel} letter-card--mood-${reactionMood}`}
      style={{"--letter-warmth": warmth.toFixed(3)}}
      data-warmth={warmthLabel}
      aria-label={`Letter from ${letter.from} to ${letter.to}. ${warmthLabel}.`}
      onClick={handleClick}
    >
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
      <p className="letter-card__preview">{letter.message}</p>
    </div>
  );
}

export default Letter;
