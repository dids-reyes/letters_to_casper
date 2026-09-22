import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DetailsModal, { formatPinTimeRemaining } from "./DetailsModal";

describe("formatPinTimeRemaining helper", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-16T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("returns Pinned for null, undefined, or empty values", () => {
    expect(formatPinTimeRemaining(null)).toBe("Pinned");
    expect(formatPinTimeRemaining(undefined)).toBe("Pinned");
    expect(formatPinTimeRemaining("")).toBe("Pinned");
  });

  test("returns Pinned · Expired if expiration is in the past or invalid", () => {
    expect(formatPinTimeRemaining("invalid-date")).toBe("Pinned · Expired");
    expect(formatPinTimeRemaining("2026-09-16T11:00:00.000Z")).toBe("Pinned · Expired");
  });

  test("formats days and remaining hours", () => {
    // 2 days and 5 hours
    const exp = new Date("2026-09-18T17:00:00.000Z");
    expect(formatPinTimeRemaining(exp)).toBe("Pinned · 2 days, 5 hours left");

    // Exactly 1 day, 1 hour
    const expOne = new Date("2026-09-17T13:00:00.000Z");
    expect(formatPinTimeRemaining(expOne)).toBe("Pinned · 1 day, 1 hour left");

    // Exactly 3 days (0 remaining hours)
    const expExactDays = new Date("2026-09-19T12:00:00.000Z");
    expect(formatPinTimeRemaining(expExactDays)).toBe("Pinned · 3 days left");
  });

  test("formats months and remaining days when >= 30 days", () => {
    // 2 months (60 days) and 5 days
    const exp = new Date("2026-11-20T12:00:00.000Z");
    const diffDays = Math.floor((exp.getTime() - new Date("2026-09-16T12:00:00.000Z").getTime()) / (24 * 60 * 60 * 1000));
    const months = Math.floor(diffDays / 30);
    const remDays = diffDays % 30;
    expect(formatPinTimeRemaining(exp)).toBe(`Pinned · ${months} months, ${remDays} days left`);
  });

  test("formats hours and remaining minutes", () => {
    // 5 hours and 30 minutes
    const exp = new Date("2026-09-16T17:30:00.000Z");
    expect(formatPinTimeRemaining(exp)).toBe("Pinned · 5 hours, 30 mins left");

    // 1 hour and 1 minute
    const expOne = new Date("2026-09-16T13:01:00.000Z");
    expect(formatPinTimeRemaining(expOne)).toBe("Pinned · 1 hour, 1 min left");

    // Exactly 4 hours
    const expExactHours = new Date("2026-09-16T16:00:00.000Z");
    expect(formatPinTimeRemaining(expExactHours)).toBe("Pinned · 4 hours left");
  });

  test("formats minutes and less than a minute", () => {
    // 45 minutes
    const expMins = new Date("2026-09-16T12:45:00.000Z");
    expect(formatPinTimeRemaining(expMins)).toBe("Pinned · 45 mins left");

    // 1 minute
    const expOneMin = new Date("2026-09-16T12:01:00.000Z");
    expect(formatPinTimeRemaining(expOneMin)).toBe("Pinned · 1 min left");

    // 30 seconds
    const expSecs = new Date("2026-09-16T12:00:30.000Z");
    expect(formatPinTimeRemaining(expSecs)).toBe("Pinned · Less than a minute left");
  });
});

describe("DetailsModal pinned letter indicator and separator", () => {
  beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-16T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const pinnedLetter = {
    _id: "letter-pinned-1",
    from: "Alice",
    to: "Bob",
    message: "This is a pinned memory",
    timestamp: "2026-09-15T12:00:00.000Z",
    reads: 42,
    is_pinned: true,
    pin_expires_at: "2026-09-19T17:00:00.000Z", // 3 days, 5 hours left
  };

  const unpinnedLetter = {
    _id: "letter-regular-2",
    from: "Charlie",
    to: "Diana",
    message: "A regular note",
    timestamp: "2026-09-15T12:00:00.000Z",
    reads: 10,
    is_pinned: false,
  };

  const expiredPinnedLetter = {
    _id: "letter-expired-3",
    from: "Eve",
    to: "Frank",
    message: "Expired pin note",
    timestamp: "2026-09-10T12:00:00.000Z",
    reads: 5,
    is_pinned: true,
    pin_expires_at: "2026-09-14T12:00:00.000Z",
  };

  test("renders pin button to the left of timestamp separated by a dot separator when letter is pinned", () => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={pinnedLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const pinButton = screen.getByRole("button", { name: /pinned letter remaining time/i });
    expect(pinButton).toBeInTheDocument();
    expect(pinButton).toHaveClass("letter-paper__pin");
    expect(pinButton).toHaveAttribute("data-tooltip-id", "pinned_letter_tooltip");
    expect(pinButton).toHaveAttribute("data-tooltip-place", "bottom");
    expect(pinButton).toHaveAttribute("data-tooltip-content", "Pinned · 3 days, 5 hours left");

    // Verify separator exists immediately adjacent/following the pin button
    const metaContainer = pinButton.closest(".letter-paper__meta");
    expect(metaContainer).toBeInTheDocument();

    const ageElement = metaContainer.querySelector(".letter-paper__age");
    expect(ageElement).toBeInTheDocument();
    expect(ageElement).toHaveTextContent(/1d ago/i);

    // The separator element between pin button and age
    const separators = metaContainer.querySelectorAll(".letter-meta-sep");
    expect(separators.length).toBeGreaterThanOrEqual(2); // pin · age · reads
  });

  test("does not render pin button or pin separator when letter is unpinned", () => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={unpinnedLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const pinButton = screen.queryByRole("button", { name: /pinned letter remaining time/i });
    expect(pinButton).not.toBeInTheDocument();
  });

  test("does not render pin button when pinned letter has expired", () => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={expiredPinnedLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const pinButton = screen.queryByRole("button", { name: /pinned letter remaining time/i });
    expect(pinButton).not.toBeInTheDocument();
  });

  test("renders pin button on unpinned letter and opens PinLetterDialog with detected letter URL", () => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={unpinnedLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const pinButton = screen.getByRole("button", { name: /pin this letter/i });
    expect(pinButton).toBeInTheDocument();
    expect(pinButton).toHaveClass("letter-paper__pin");

    // Click pin button on unpinned letter
    fireEvent.click(pinButton);

    // Should open PinLetterDialog with URL field automatically hidden
    expect(screen.getByRole("heading", { name: /Pin & Deliver/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Which letter would you like to pin\?/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pin for ₱19/i })).toBeInTheDocument();

    // Dismiss pin dialog
    fireEvent.click(screen.getByRole("button", { name: /close pin dialog/i }));
    act(() => jest.advanceTimersByTime(200));
    expect(screen.queryByRole("heading", { name: /Pin & Deliver/i })).not.toBeInTheDocument();
  });

  test("renders pin button on expired pinned letter allowing re-pinning with URL field hidden", () => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={expiredPinnedLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const pinButton = screen.getByRole("button", { name: /pin this letter/i });
    expect(pinButton).toBeInTheDocument();

    fireEvent.click(pinButton);
    expect(screen.getByRole("heading", { name: /Pin & Deliver/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Which letter would you like to pin\?/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pin for ₱19/i })).toBeInTheDocument();
  });

  test("clicking deliver email checkbox inside PinLetterDialog does not close DetailsModal or PinLetterDialog", () => {
    const toggleDetailsModal = jest.fn();
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={toggleDetailsModal}
          selectedLetter={unpinnedLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const pinButton = screen.getByRole("button", { name: /pin this letter/i });
    fireEvent.click(pinButton);

    const dialogHeading = screen.getByRole("heading", { name: /Pin & Deliver/i });
    expect(dialogHeading).toBeInTheDocument();

    const deliveryToggle = screen.getByLabelText(/Deliver an anonymous copy via email/i);
    expect(deliveryToggle.checked).toBe(false);

    // Clicking the delivery checkbox must not close DetailsModal or PinLetterDialog
    fireEvent.click(deliveryToggle);
    expect(deliveryToggle.checked).toBe(true);
    expect(screen.getByRole("heading", { name: /Pin & Deliver/i })).toBeInTheDocument();
    expect(toggleDetailsModal).not.toHaveBeenCalled();

    // Recipient email input appears and can receive input
    const recipientInput = screen.getByLabelText(/Recipient's Email/i);
    expect(recipientInput).toBeInTheDocument();
    fireEvent.change(recipientInput, { target: { value: "lovedone@example.com" } });
    expect(recipientInput.value).toBe("lovedone@example.com");

    // Submit button label updates to Pin and Deliver
    expect(screen.getByRole("button", { name: /Pin and Deliver for ₱19/i })).toBeInTheDocument();
    expect(toggleDetailsModal).not.toHaveBeenCalled();

    // Uncheck toggle without closing
    fireEvent.click(deliveryToggle);
    expect(deliveryToggle.checked).toBe(false);
    expect(screen.getByRole("heading", { name: /Pin & Deliver/i })).toBeInTheDocument();
    expect(toggleDetailsModal).not.toHaveBeenCalled();
  });

  test("pinned letter pin button only triggers time remaining tooltip and never opens PinLetterDialog", () => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={pinnedLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const pinButton = screen.getByRole("button", { name: /pinned letter remaining time/i });
    expect(pinButton).toBeInTheDocument();

    fireEvent.click(pinButton);
    expect(screen.queryByRole("heading", { name: /Pin & Deliver/i })).not.toBeInTheDocument();
  });
});
