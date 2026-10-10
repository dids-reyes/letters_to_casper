import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsReply } from "react-icons/bs";
import { IoArrowForwardOutline } from "react-icons/io5";
import SensitiveMessage from "./SensitiveMessage";
import { LetterStamp, RedPushpin, WashiTape, getPaperClassForLetter } from "./LetterStamp";

// Remove music/video URLs only from the card copy; retain the original letter.
const previewMessage = (message = "") =>
  message
    .replace(
      /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)*(?:youtube\.com|youtu\.be|spotify\.com|spotify\.link)\/[^\s<>]*/gi,
      ""
    )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

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

// Format date into vintage postal style: "Nov 10, 2024"
const formatLetterDate = (timestamp) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const m = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const y = d.getFullYear();
  return `${m}\u00A0${day},\u00A0${y}`;
};

const clip = (str, max) => {
  if (!str) return "";
  const chars = Array.from(str);
  return chars.length > max ? `${chars.slice(0, max - 1).join("")}…` : str;
};

// Skeuomorphic stationery configuration
// Varies paper type, deckle edge cut, and whether a letter is a stamped postcard,
// clipped note, taped sheet, or pure aged letter
const getCardStyle = (letter, isPinned) => {
  const idStr = String(letter?._id || letter?.timestamp || "");
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  if (isPinned) {
    return {
      variant: 1, // Ivory
      isFeatured: false,
      isPostcard: true,
      hasTape: false,
      clipIndex: 3,
      posHash,
    };
  }

  // 8 distinct realistic chipped & torn edge contours (so all letters have unique chips in different places)
  const clipIndex = (posHash >> 2) % 8;

  // 2 distinct paper colors: Parchment (0) and Read-View Ivory/Cream (1) - dark brown kraft removed
  const variant = posHash % 2;

  const letterCity =
    letter?.loc?.city ||
    letter?.location?.city ||
    letter?.city ||
    "";
  const letterRegion =
    letter?.loc?.region ||
    letter?.location?.region ||
    letter?.region ||
    "";
  const letterCountry =
    letter?.loc?.country ||
    letter?.location?.country ||
    letter?.country ||
    "";
  const roll = posHash % 100;
  // If letter has a location, show stamp. Otherwise 55% roll.
  const hasLocation = Boolean(letterCity || letterCountry || letterRegion);
  const isPostcard = hasLocation || roll < 55;

  return {
    variant,
    isFeatured: false,
    isPostcard,
    hasTape: false,
    clipIndex,
    posHash,
  };
};

const getWarmthScore = (letter) => {
  const reads = Math.max(0, Number(letter?.reads) || 0);
  const reactions = ["love", "sad"].reduce(
    (total, key) =>
      total +
      Math.max(
        0,
        Number(letter?.echoes?.[key] ?? letter?.reactions?.[key]) || 0
      ),
    0
  );
  return Math.log2(reads + 1) + reactions * 3;
};

function Letter({
  letter,
  toggleDetailsModal,
  setSelectedLetter,
  maxWarmthScore = 0,
}) {
  const navigate = useNavigate();
  const [, refreshPin] = useState(0);

  const pinExpiry = letter?.pin_expires_at ? new Date(letter.pin_expires_at).getTime() : 0;
  const isPinned = Boolean(letter?.is_pinned && pinExpiry > Date.now());

  useEffect(() => {
    if (!letter?.is_pinned || !Number.isFinite(pinExpiry) || pinExpiry <= 0) return undefined;
    let timer;
    const checkExpiry = () => {
      clearTimeout(timer);
      refreshPin((value) => value + 1);
      const remaining = pinExpiry - Date.now();
      if (remaining > 0)
        timer = setTimeout(checkExpiry, Math.min(remaining, 2147483647));
    };
    checkExpiry();
    document.addEventListener("visibilitychange", checkExpiry);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", checkExpiry);
    };
  }, [letter.is_pinned, pinExpiry]);

  const warmthScore = getWarmthScore(letter);
  const relativeWarmth =
    maxWarmthScore > 0 ? warmthScore / maxWarmthScore : 0;
  const absoluteWarmth = Math.min(warmthScore / 12, 1);
  const warmth =
    warmthScore > 0
      ? Math.min(
          0.86,
          0.1 + Math.sqrt(relativeWarmth) * 0.38 + absoluteWarmth * 0.34
        )
      : 0.08;
  const warmthLevel =
    warmth < 0.3
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

  const displayFrom = letter?.from || letter?.alias || "Anonymous";
  const displayTo =
    letter?.to ||
    letter?.parent_letter?.to ||
    letter?.parentLetter?.to ||
    "a letter";

  const handleClick = () => {
    if (!letter) return;
    const isReply = Boolean(
      letter.is_reply ||
        letter.type === "reply" ||
        letter.parent_letter_id ||
        letter.parentLetterId
    );
    setSelectedLetter(letter);
    toggleDetailsModal();
    navigate(`/letters/${letter._id || ""}${isReply ? "?reply_context=1" : ""}`);
  };

  const isReplyResult = Boolean(
    letter?.is_reply ||
      letter?.type === "reply" ||
      letter?.parent_letter_id ||
      letter?.parentLetterId
  );

  const hasReply = Boolean(
    isReplyResult ||
      letter?.has_reply ||
      (typeof letter?.reply_count === "number" && letter.reply_count > 0) ||
      (Array.isArray(letter?.replies) && letter.replies.length > 0)
  );

  if (!letter?.approve && !isReplyResult) {
    return null; // If not approved, don't render the letter
  }

  const {
    variant,
    isFeatured,
    isPostcard,
    hasTape,
    clipIndex,
  } = getCardStyle(letter, isPinned);

  const paperClass = getPaperClassForLetter(letter);

  const letterTimestamp =
    letter?.timestamp || letter?.created_at || letter?.createdAt || letter?.date;
  const relTime = timeAgo(letterTimestamp);
  const formattedDate = formatLetterDate(letterTimestamp);

  const letterCity =
    letter?.loc?.city ||
    letter?.location?.city ||
    letter?.city ||
    "";

  const letterRegion =
    letter?.loc?.region ||
    letter?.location?.region ||
    letter?.region ||
    "";

  const letterCountry =
    letter?.loc?.country ||
    letter?.location?.country ||
    letter?.country ||
    "";

  // Use appropriate stamp variant if it is a postcard (strictly 0, 1, or 2 - never featured)
  const stampVariant = clipIndex % 3;

  const loveCount = Math.max(
    0,
    Number(letter?.echoes?.love ?? letter?.reactions?.love) || 0
  );
  const sadCount = Math.max(
    0,
    Number(letter?.echoes?.sad ?? letter?.reactions?.sad) || 0
  );
  const readCount = Math.max(0, Number(letter?.reads) || 0);

  let reactionMood = null;
  if (loveCount >= 10 && loveCount >= sadCount) {
    reactionMood = "love";
  } else if (sadCount >= 10 && sadCount > loveCount) {
    reactionMood = "sad";
  } else if (readCount >= 50) {
    reactionMood = "amber";
  }

  const cleanMessage = previewMessage(letter.message);
  const isSensitive = letter.sensitiveContent === true;

  return (
    <div
      className={`letter-card ${paperClass} letter-card--deckle-${clipIndex} letter-card--variant-${variant} letter-card--warmth-${warmthLevel}${
        reactionMood ? ` letter-card--has-glow letter-card--mood-${reactionMood}` : ""
      }${
        isPostcard ? " letter-card--is-postcard" : " letter-card--is-plain-letter"
      }${isSensitive ? " letter-card--is-sensitive" : ""}`}
      style={{ "--letter-warmth": warmth.toFixed(3) }}
      data-warmth={warmthLabel}
      aria-label={`${
        isReplyResult ? "Reply" : "Letter"
      } from ${displayFrom} to ${displayTo}. ${warmthLabel}.`}
      title={`To: ${displayTo} • From: ${displayFrom}`}
      onClick={handleClick}
    >
      {/* Main authentic crinkled deckle paper sheet */}
      <div className="letter-card__paper" aria-hidden="true" />

      {/* Tactile stationery accents hanging over edges */}
      {hasTape && <WashiTape />}
      {isPinned && <RedPushpin />}

      {/* Postage stamp & postmark cancellation waves (rendered on postcards, strictly non-featured) */}
      {isPostcard && (
        <LetterStamp
          variant={stampVariant}
          city={letterCity}
          region={letterRegion}
          country={letterCountry}
          isFeatured={false}
        />
      )}

      {/* Main card inner content */}
      <div className="letter-card__inner">
        {/* Top Header */}
        <div
          className={`letter-card__header${
            isFeatured ? " letter-card__header--featured" : ""
          }`}
        >
          <div className="letter-card__meta">
            {isFeatured && (
              <span className="letter-card__featured-badge">★ Featured</span>
            )}
            <div className="letter-card__addressee">
              <div className="letter-card__from">
                <span className="letter-card__label">From:</span>
                <span className="letter-card__name" title={displayFrom}>
                  {clip(displayFrom, isFeatured ? 8 : isPostcard ? 24 : 26)}
                </span>
              </div>
              <div className="letter-card__to">
                <span className="letter-card__label">To:</span>
                <span className="letter-card__to-name" title={displayTo}>
                  {clip(displayTo, isFeatured ? 8 : isPostcard ? 24 : 26)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center message excerpt */}
        <div
          className={`letter-card__preview${
            letter.sensitiveContent === true ? " is-sensitive" : ""
          }`}
        >
          <SensitiveMessage
            sensitive={letter.sensitiveContent === true}
            compact
          >
            {cleanMessage}
          </SensitiveMessage>
        </div>

        {/* Bottom footer: only show navigation arrow on featured cards if applicable */}
        {isFeatured && (
          <div className="letter-card__footer letter-card__footer--featured">
            <span className="letter-card__arrow" aria-hidden="true">
              <IoArrowForwardOutline />
            </span>
          </div>
        )}

        {/* Relative time indicator placed at the bottom left corner */}
        {relTime && !isFeatured && (
          <span
            className="letter-card__time"
            title={formattedDate}
          >
            {relTime}
          </span>
        )}

        {/* Reply indicator placed at the bottom right corner */}
        {hasReply && !isFeatured && (
          <span
            className="letter-reply-indicator"
            title={isReplyResult ? "Reply to a letter" : "Letter has replies"}
          >
            <BsReply aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}

export default React.memo(Letter);
