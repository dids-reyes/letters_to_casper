import {
  LEAVE_LETTER_RESUME_KEY,
  LEAVE_LETTER_RESUME_TTL,
  clearLeaveLetterIntent,
  hasFreshLeaveLetterIntent,
  saveLeaveLetterIntent,
} from "./adBlockGate";

beforeEach(() => sessionStorage.clear());

test("stores and clears a pending leave-letter intent", () => {
  saveLeaveLetterIntent(sessionStorage, 1000);
  expect(sessionStorage.getItem(LEAVE_LETTER_RESUME_KEY)).toBe("1000");
  expect(hasFreshLeaveLetterIntent(sessionStorage, 2000)).toBe(true);
  clearLeaveLetterIntent(sessionStorage);
  expect(hasFreshLeaveLetterIntent(sessionStorage, 2000)).toBe(false);
});

test("expires stale pending intents", () => {
  saveLeaveLetterIntent(sessionStorage, 1000);
  expect(hasFreshLeaveLetterIntent(sessionStorage, 1000 + LEAVE_LETTER_RESUME_TTL + 1)).toBe(false);
  expect(sessionStorage.getItem(LEAVE_LETTER_RESUME_KEY)).toBeNull();
});
