export const LEAVE_LETTER_RESUME_KEY = "ltc-leave-letter-after-adblock";
export const LEAVE_LETTER_RESUME_TTL = 10 * 60 * 1000;

export function getSessionStorage() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch (error) {
    return null;
  }
}

export function saveLeaveLetterIntent(storage, now = Date.now()) {
  try {
    storage?.setItem(LEAVE_LETTER_RESUME_KEY, String(now));
  } catch (error) {
    // Storage can be unavailable in strict privacy modes; the dialog still works.
  }
}

export function hasFreshLeaveLetterIntent(storage, now = Date.now()) {
  try {
    const createdAt = Number(storage?.getItem(LEAVE_LETTER_RESUME_KEY));
    if (!Number.isFinite(createdAt) || createdAt <= 0 || now - createdAt > LEAVE_LETTER_RESUME_TTL) {
      storage?.removeItem(LEAVE_LETTER_RESUME_KEY);
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

export function clearLeaveLetterIntent(storage) {
  try {
    storage?.removeItem(LEAVE_LETTER_RESUME_KEY);
  } catch (error) {
    // Nothing else is required when storage is unavailable.
  }
}
