import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DetailsModal from "./DetailsModal";

describe("View letter footer timestamp and reads formatting", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-29T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const sampleLetterWithReads = {
    _id: "letter-footer-1",
    from: "Alice",
    to: "Casper",
    message: "A heartfelt message for Casper",
    timestamp: "2026-09-28T12:00:00.000Z", // 1 day ago
    reads: 42,
    echoes: { love: 0, sad: 0 },
  };

  const sampleLetterSingleRead = {
    _id: "letter-footer-2",
    from: "Bob",
    to: "Casper",
    message: "Another message",
    timestamp: "2026-09-29T10:00:00.000Z", // 2 hours ago
    reads: 1,
    echoes: { love: 0, sad: 0 },
  };

  test("displays 'ago' on the timestamp next to the Email/Deliver icon and 'reads' on the read count", () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetterWithReads}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const meta = container.querySelector(".letter-paper__meta");
    expect(meta).toBeInTheDocument();

    // Email/Deliver icon button
    const emailDeliverIcon = meta.querySelector(".letter-paper__pin");
    expect(emailDeliverIcon).toBeInTheDocument();

    // Timestamp next to the Email/Deliver icon has 'ago'
    const ageElement = meta.querySelector(".letter-paper__age");
    expect(ageElement).toBeInTheDocument();
    expect(ageElement).toHaveTextContent("1d ago");
    expect(ageElement).toHaveAttribute("title", "1 day ago");

    // Reads count has 'reads' word next to the number count
    const readsElement = meta.querySelector(".letter-paper__reads");
    expect(readsElement).toBeInTheDocument();
    expect(readsElement).toHaveTextContent("42 reads");
  });

  test("displays singular 'read' when the read count is 1", () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetterSingleRead}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const meta = container.querySelector(".letter-paper__meta");
    const ageElement = meta.querySelector(".letter-paper__age");
    expect(ageElement).toHaveTextContent("2h ago");

    const readsElement = meta.querySelector(".letter-paper__reads");
    expect(readsElement).toHaveTextContent("1 read");
  });

  test("Reply action explains linked letters before opening the reply composer", () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetterWithReads}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const emailDeliverBtn = screen.getByRole("button", { name: /Open delivery and reply options/i });
    fireEvent.click(emailDeliverBtn);

    expect(screen.getByRole("heading", { name: "Choose an action" })).toBeInTheDocument();
    expect(screen.getByText("Email or Pin")).toBeInTheDocument();
    expect(screen.queryByText("Email or Deliver")).not.toBeInTheDocument();
    expect(screen.getByText("Write and send a reply")).toBeInTheDocument();
    expect(screen.queryByText(/paid reply/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {name: /Reply to the letter/i}));
    expect(screen.getByRole("heading", {name: "How replies work"})).toBeInTheDocument();
    expect(screen.getByText(/Replies stay linked to the letter they answer/i)).toBeInTheDocument();
    expect(screen.getByText(/paid to keep replies genuine and spam-free/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {name: /Write a reply/i}));
    expect(screen.getByText("Write your reply")).toBeInTheDocument();
  });

  test.each([
    ["Reply to the letter", "How replies work"],
    ["Email or Pin", "Make Sure Your Words Are Felt"],
  ])("Read Mode opens %s on the first touch", (actionName, expectedText) => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetterWithReads}
          readMode={true}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", {name: /Open delivery and reply options/i}));
    const action = screen.getByRole("button", {name: new RegExp(actionName, "i")});
    fireEvent.touchStart(action, {touches: [{clientX: 120, clientY: 220}]});
    fireEvent.touchEnd(action, {changedTouches: [{clientX: 120, clientY: 220}]});
    fireEvent.click(action);

    expect(screen.getByText(expectedText, {exact: false})).toBeInTheDocument();
    expect(screen.queryByRole("status", {name: /Close letter hint/i})).toBeNull();
  });
});
