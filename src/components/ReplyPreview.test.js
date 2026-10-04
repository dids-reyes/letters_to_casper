import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DetailsModal from "./DetailsModal";

describe("Reply Preview and Swipe Navigation Flow", () => {
  const originalResizeObserver = global.ResizeObserver;

  beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  afterAll(() => {
    global.ResizeObserver = originalResizeObserver;
  });

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ replies: [] }),
        blob: () => Promise.resolve(new Blob()),
      })
    );
  });

  const sampleParentLetter = {
    _id: "parent-letter-123",
    from: "Casper",
    to: "Anonymous",
    message: "This is the original letter written by Casper.",
    timestamp: "2026-09-28T12:00:00.000Z",
    reads: 10,
    echoes: { love: 1, sad: 0 },
  };

  test("full flow: composing reply, clicking preview shows background parent letter with swipe tip, sliding shows reply in identical paper, and exit returns to composer", async () => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleParentLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    // 1. Open action chooser
    const pinActionBtn = screen.getByRole("button", { name: /pin this letter, or open delivery and reply options/i });
    fireEvent.click(pinActionBtn);

    // 2. Click "Reply to the letter"
    const replyActionBtn = screen.getByRole("button", { name: /Reply to the letter/i });
    fireEvent.click(replyActionBtn);
    fireEvent.click(screen.getByRole("button", { name: /Write a reply/i }));

    // 3. Compose modal is now visible
    expect(screen.getByRole("heading", { name: /Write your reply/i })).toBeInTheDocument();
    const messageInput = screen.getByLabelText(/Message:/i);
    fireEvent.change(messageInput, { target: { value: "I am writing this heartfelt reply to you." } });
    const fromInput = screen.getByLabelText(/From:/i);
    fireEvent.change(fromInput, { target: { value: "FriendlyGhost" } });

    // 4. Click Preview button
    const previewBtn = screen.getByRole("button", { name: /Preview/i });
    fireEvent.click(previewBtn);

    // 5. Composer is hidden (not unmounted), parent letter remains loaded in the back
    const composeHeading = screen.queryByRole("heading", { name: /Write your reply/i, hidden: true });
    expect(composeHeading).toBeInTheDocument();
    expect(composeHeading.closest(".reply-composer-hidden")).toBeInTheDocument();
    expect(composeHeading.closest(".reply-composer-hidden")).toHaveStyle({ display: "none" });

    // The parent letter is visible in the background
    expect(screen.getByText(/Monday, September 28, 2026/i)).toBeInTheDocument();

    // Top banner is shown with 'Back to Editing' and no 'Letter being replied to'
    expect(screen.getByText(/Back to Editing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Letter being replied to/i)).toBeNull();
    const bannerEl = document.querySelector(".reply-preview-banner");
    expect(bannerEl).toBeInTheDocument();
    expect(bannerEl.querySelector("svg")).toBeNull();

    // The swipe tooltip is shown pointing right with short wording and NO X / close button
    const swipeTip = screen.getByRole("status", { id: "reply-preview-replies-cue" });
    expect(swipeTip).toBeInTheDocument();
    expect(swipeTip).toHaveTextContent("Swipe to Read Reply");
    expect(swipeTip.querySelector(".reply-navigation-arrow--right")).toBeInTheDocument();
    expect(swipeTip.querySelector(".read-mode-tip__close")).toBeNull();

    // 6. Tap the tooltip to slide to the reply preview
    fireEvent.click(swipeTip);

    // During / after slide:
    // Top banner continues to show 'Back to Editing'
    expect(screen.getByText(/Back to Editing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Letter being replied to/i)).toBeNull();

    // Reply is displayed in the exact same letter paper layout
    const activePaper = document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper");
    expect(activePaper).toHaveTextContent("FriendlyGhost");
    expect(activePaper).toHaveTextContent("I am writing this heartfelt reply to you.");
    expect(activePaper).not.toHaveTextContent("Reply to Casper");
    expect(activePaper.querySelector(".letter-paper__pin")).toBeInTheDocument();

    // Tooltip points back to the original letter with a clear swipe instruction and no X / close button
    const backSwipeTip = screen.getByRole("status", { id: "reply-preview-replies-cue" });
    expect(backSwipeTip.querySelector(".reply-navigation-arrow--left")).toBeInTheDocument();
    expect(backSwipeTip).toHaveTextContent("Swipe to View Original Letter");
    expect(backSwipeTip.querySelector(".read-mode-tip__close")).toBeNull();

    // 7. Tap tooltip to slide back to the original parent letter
    fireEvent.click(backSwipeTip);
    expect(screen.getByText(/Back to Editing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Letter being replied to/i)).toBeNull();
    const returnSwipeTip = screen.getByRole("status", { id: "reply-preview-replies-cue" });
    expect(returnSwipeTip).toHaveTextContent("Swipe to Read Reply");

    // 8. Exit preview via "Back to Editing" button
    const backToEditingBtn = document.querySelector(".reply-preview-banner");
    fireEvent.click(backToEditingBtn);

    // Compose modal is now visible again with draft preserved
    expect(screen.getByRole("heading", { name: /Write your reply/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Message:/i)).toHaveValue("I am writing this heartfelt reply to you.");
    expect(screen.getByLabelText(/From:/i)).toHaveValue("FriendlyGhost");
  });

  test("touch swiping left and right slides between parent letter and reply preview", async () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleParentLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    // Open reply composer
    fireEvent.click(screen.getByRole("button", { name: /pin this letter, or open delivery and reply options/i }));
    fireEvent.click(screen.getByRole("button", { name: /Reply to the letter/i }));
    fireEvent.click(screen.getByRole("button", { name: /Write a reply/i }));

    fireEvent.change(screen.getByLabelText(/Message:/i), { target: { value: "Swiping test reply." } });
    fireEvent.click(screen.getByRole("button", { name: /Preview/i }));

    const overlay = container.querySelector(".letter-modal-overlay");

    // Swipe left (clientX starts at 300, ends at 100 -> deltaX = -200)
    fireEvent.touchStart(overlay, { touches: [{ clientX: 300, clientY: 200 }] });
    fireEvent.touchEnd(overlay, { changedTouches: [{ clientX: 100, clientY: 200 }] });

    // Slides to reply preview
    const activePaperAfterLeftSwipe = document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper");
    expect(activePaperAfterLeftSwipe).toHaveTextContent("Swiping test reply.");
    // Back-to-parent tooltip includes a clear swipe instruction
    const backTip = screen.getByRole("status", { id: "reply-preview-replies-cue" });
    expect(backTip.querySelector(".reply-navigation-arrow--left")).toBeInTheDocument();
    expect(backTip).toHaveTextContent("Swipe to View Original Letter");

    // Swipe right (clientX starts at 100, ends at 300 -> deltaX = +200)
    fireEvent.touchStart(overlay, { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchEnd(overlay, { changedTouches: [{ clientX: 300, clientY: 200 }] });

    // Slides back to parent letter
    expect(screen.getByText(/Back to Editing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Letter being replied to/i)).toBeNull();
    expect(screen.getByText("Swipe to Read Reply")).toBeInTheDocument();
    const activePaperAfterRightSwipe = document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper");
    expect(activePaperAfterRightSwipe).toHaveTextContent("This is the original letter written by Casper.");
  });

  test("read mode swipes cannot change letters while the reply composer is open", () => {
    const nextLetter = {
      ...sampleParentLetter,
      _id: "next-letter-456",
      from: "Someone Else",
      message: "A different letter that must not become the reply target.",
    };
    const setSelectedLetter = jest.fn();
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleParentLetter}
          readMode={true}
          initialOpened={true}
          letters={[sampleParentLetter, nextLetter]}
          setSelectedLetter={setSelectedLetter}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /pin this letter, or open delivery and reply options/i }));
    fireEvent.click(screen.getByRole("button", { name: /Reply to the letter/i }));
    fireEvent.click(screen.getByRole("button", { name: /Write a reply/i }));
    expect(screen.getByRole("heading", { name: /Write your reply/i })).toBeInTheDocument();

    const overlay = container.querySelector(".letter-modal-overlay");
    fireEvent.touchStart(overlay, { touches: [{ clientX: 120, clientY: 300 }] });
    fireEvent.touchMove(overlay, { touches: [{ clientX: 120, clientY: 100 }] });
    fireEvent.touchEnd(overlay, { changedTouches: [{ clientX: 120, clientY: 100 }] });
    fireEvent.touchStart(overlay, { touches: [{ clientX: 120, clientY: 100 }] });
    fireEvent.touchMove(overlay, { touches: [{ clientX: 120, clientY: 300 }] });
    fireEvent.touchEnd(overlay, { changedTouches: [{ clientX: 120, clientY: 300 }] });

    expect(setSelectedLetter).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: /Write your reply/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/To:/i)).toHaveValue("Casper");
  });

  test("a reply opened from the feed can slide left to its parent letter and return", () => {
    jest.useFakeTimers();
    const feedReply = {
      _id: "feed-reply-123",
      from: "FriendlyGhost",
      to: "Casper",
      message: "A reply shown as its own feed letter.",
      timestamp: "2026-09-29T12:00:00.000Z",
      reads: 1,
      is_reply: true,
      type: "reply",
      parent_letter_id: sampleParentLetter._id,
      parent_letter: sampleParentLetter,
      published: true,
      payment_status: "paid",
    };
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={feedReply}
          readMode={true}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    const parentButton = screen.getByRole("status", { name: /View the letter this replies to/i });
    expect(parentButton.querySelector(".reply-navigation-arrow--left")).toBeInTheDocument();
    fireEvent.click(parentButton);
    expect(document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper"))
      .toHaveTextContent(sampleParentLetter.message);

    const returnButton = screen.getByRole("status", { name: /Return to reply/i });
    expect(returnButton.querySelector(".reply-navigation-arrow--right")).toBeInTheDocument();
    fireEvent.click(returnButton);
    expect(document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper"))
      .toHaveTextContent(feedReply.message);

    act(() => jest.advanceTimersByTime(3499));
    expect(screen.getByRole("status", { name: /View the letter this replies to/i })).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.queryByRole("status", { name: /View the letter this replies to/i })).toBeNull();
    jest.useRealTimers();
  });

  test("reopening the same feed reply starts on the clicked reply, not its previously viewed parent", () => {
    const feedReply = {
      _id: "reopen-reply-123",
      from: "Reply Writer",
      to: "Casper",
      message: "The clicked reply must open first.",
      timestamp: "2026-09-29T12:00:00.000Z",
      reads: 3,
      is_reply: true,
      type: "reply",
      parent_letter_id: sampleParentLetter._id,
      parent_letter: sampleParentLetter,
      published: true,
    };
    const renderModal = show => (
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={show}
          toggleDetailsModal={jest.fn()}
          selectedLetter={feedReply}
          readMode={true}
          initialOpened={true}
        />
      </MemoryRouter>
    );
    const { rerender } = render(renderModal(true));

    fireEvent.click(screen.getByRole("status", { name: /View the letter this replies to/i }));
    expect(document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper"))
      .toHaveTextContent(sampleParentLetter.message);

    rerender(renderModal(false));
    rerender(renderModal(true));

    expect(document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper"))
      .toHaveTextContent(feedReply.message);
  });

  test("a feed reply swipes through its chronological thread and announces both boundaries", async () => {
    const threadParent = {...sampleParentLetter, timestamp: "2024-09-28T12:00:00.000Z"};
    const replyMe = {
      _id: "reply-me",
      from: "Me",
      to: "Casper",
      message: "The reply opened from the feed.",
      timestamp: "2024-09-29T12:00:00.000Z",
      is_reply: true,
      type: "reply",
      parent_letter_id: threadParent._id,
    };
    const laterReply = {
      ...replyMe,
      _id: "later-reply",
      from: "Casper",
      to: "Me",
      message: "The newest reply in the thread.",
      timestamp: "2024-09-30T12:00:00.000Z",
      parent_letter_id: replyMe._id,
    };
    global.fetch = jest.fn(url => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(String(url).endsWith("/reply-me/thread")
        ? {letters: [threadParent, replyMe, laterReply], active_index: 1}
        : {message: threadParent, replies: []}),
    }));

    const {container} = render(
      <MemoryRouter>
        <DetailsModal showDetailsModal selectedLetter={replyMe} readMode initialOpened toggleDetailsModal={jest.fn()} />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByRole("button", {name: /(view previous letter in reply thread|view reply on the left)/i}).querySelector(".reply-navigation-arrow--left")).toBeInTheDocument());
    expect(screen.getByRole("button", {name: /view next letter in reply thread/i}).querySelector(".reply-navigation-arrow--right")).toBeInTheDocument();

    const overlay = container.querySelector(".letter-modal-overlay");
    fireEvent.touchStart(overlay, {touches: [{clientX: 300, clientY: 200}]});
    fireEvent.touchEnd(overlay, {changedTouches: [{clientX: 100, clientY: 200}]});
    expect(document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper")).toHaveTextContent(laterReply.message);
    expect(screen.queryByRole("button", {name: /(letter in reply thread|view reply on the left)/i})).not.toBeInTheDocument();

    fireEvent.touchStart(overlay, {touches: [{clientX: 300, clientY: 200}]});
    fireEvent.touchEnd(overlay, {changedTouches: [{clientX: 100, clientY: 200}]});
    expect(screen.getByRole("status", {name: /reply thread boundary/i})).toHaveTextContent("Latest reply");
    expect(screen.getByRole("status", {name: /reply thread boundary/i})).toHaveClass("reply-swipe-tip--to-reply");

    fireEvent.touchStart(overlay, {touches: [{clientX: 100, clientY: 200}]});
    fireEvent.touchEnd(overlay, {changedTouches: [{clientX: 300, clientY: 200}]});
    fireEvent.touchStart(overlay, {touches: [{clientX: 100, clientY: 200}]});
    fireEvent.touchEnd(overlay, {changedTouches: [{clientX: 300, clientY: 200}]});
    fireEvent.touchStart(overlay, {touches: [{clientX: 100, clientY: 200}]});
    fireEvent.touchEnd(overlay, {changedTouches: [{clientX: 300, clientY: 200}]});
    expect(screen.getByRole("status", {name: /reply thread boundary/i})).toHaveTextContent("Start of thread");
    expect(screen.getByRole("status", {name: /reply thread boundary/i})).toHaveClass("reply-swipe-tip--to-parent");
  });

  test("a feed reply shows its parent's own From and To fields in normal mode", async () => {
    const feedReply = {
      _id: "normal-mode-reply-123",
      from: "Reply Writer",
      to: "Casper",
      message: "A normal-mode reply.",
      timestamp: "2026-09-29T12:00:00.000Z",
      reads: 1,
      is_reply: true,
      type: "reply",
      parent_letter_id: sampleParentLetter._id,
      parent_letter: sampleParentLetter,
      published: true,
      payment_status: "paid",
    };

    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={feedReply}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("status", { name: /View the letter this replies to/i }));

    const activePaper = document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper");
    await waitFor(() => expect(activePaper).toHaveTextContent("From: Casper"), { timeout: 2000 });
    await waitFor(() => expect(activePaper).toHaveTextContent("To: Anonymous"), { timeout: 2000 });
    expect(activePaper).not.toHaveTextContent("From: Reply Writer");
  });

  test("returning from a parent restarts the reply message without waiting for the parent typing", async () => {
    const feedReply = {
      _id: "typing-return-reply-123",
      from: "Reply Writer",
      to: "Casper",
      message: "Reply typing restarts immediately.",
      timestamp: "2026-09-29T12:00:00.000Z",
      reads: 1,
      is_reply: true,
      type: "reply",
      parent_letter_id: sampleParentLetter._id,
      parent_letter: sampleParentLetter,
      published: true,
    };

    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={feedReply}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      const body = document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper__body");
      expect(body).toHaveTextContent(feedReply.message);
    }, { timeout: 2500 });

    fireEvent.click(screen.getByRole("status", { name: /View the letter this replies to/i }));
    fireEvent.click(screen.getByRole("status", { name: /Return to reply/i }));

    const returnedBody = document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper__body");
    expect(returnedBody).not.toHaveTextContent(feedReply.message);
    await waitFor(() => expect(returnedBody).toHaveTextContent(feedReply.message), { timeout: 2500 });
  });

  test("copy link shares the parent letter while the parent is displayed", async () => {
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const feedReply = {
      _id: "share-reply-123",
      from: "Reply Writer",
      to: "Casper",
      message: "Share target reply.",
      timestamp: "2026-09-29T12:00:00.000Z",
      reads: 1,
      is_reply: true,
      type: "reply",
      parent_letter_id: sampleParentLetter._id,
      parent_letter: sampleParentLetter,
      published: true,
    };

    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={feedReply}
          readMode={true}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("status", { name: /View the letter this replies to/i }));
    fireEvent.click(screen.getByRole("button", { name: /Share this letter/i }));
    fireEvent.click(screen.getByRole("button", { name: /Share as QR/i }));
    expect(decodeURIComponent(screen.getByAltText("QR code for this letter").src)).toContain(
      `/letters/${sampleParentLetter._id}`
    );
    fireEvent.click(screen.getByRole("button", { name: /Copy link/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`/letters/${sampleParentLetter._id}$`))
    ));

    if (clipboardDescriptor) Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
    else delete navigator.clipboard;
  });

  test("a directly opened reply uses its own stored location", () => {
    const parentWithLocation = {
      ...sampleParentLetter,
      loc: { city: "Makati", region: "Metro Manila", country: "PH" },
    };
    const feedReply = {
      _id: "located-parent-reply-123",
      from: "Reply Writer",
      to: "Casper",
      message: "The reply has its own location.",
      timestamp: "2026-09-29T12:00:00.000Z",
      reads: 1,
      loc: { city: "Quezon City", region: "Metro Manila", country: "PH" },
      is_reply: true,
      type: "reply",
      parent_letter_id: parentWithLocation._id,
      parent_letter: parentWithLocation,
      published: true,
    };

    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={feedReply}
          readMode={true}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /Locate/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("status", { name: /View the letter this replies to/i }));
    expect(screen.getByRole("button", { name: /Locate/i })).toBeInTheDocument();
  });

  test("MacBook-style horizontal trackpad gestures navigate reply context without leaving the letter", () => {
    const originalPointerEvent = window.PointerEvent;
    window.PointerEvent = MouseEvent;
    const feedReply = {
      _id: "trackpad-reply-123",
      from: "Reply Writer",
      to: "Casper",
      message: "Trackpad reply content.",
      timestamp: "2026-09-29T12:00:00.000Z",
      reads: 1,
      is_reply: true,
      type: "reply",
      parent_letter_id: sampleParentLetter._id,
      parent_letter: sampleParentLetter,
      published: true,
    };
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={feedReply}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    fireEvent.wheel(window, { deltaX: -90, deltaY: 4 });
    expect(screen.getByRole("status", { name: /Return to reply/i })).toBeInTheDocument();

    const paper = document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper");
    fireEvent.pointerDown(paper, { pointerType: "mouse", pointerId: 1, button: 0, clientX: 320, clientY: 220 });
    fireEvent.pointerMove(paper, { pointerType: "mouse", pointerId: 1, clientX: 190, clientY: 224 });
    fireEvent.pointerUp(paper, { pointerType: "mouse", pointerId: 1, clientX: 190, clientY: 224 });
    expect(screen.getByRole("status", { name: /View the letter this replies to/i })).toBeInTheDocument();
    window.PointerEvent = originalPointerEvent;
  });

  test("pressing Escape while in reply preview returns to the reply composer", async () => {
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleParentLetter}
          readMode={false}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /pin this letter, or open delivery and reply options/i }));
    fireEvent.click(screen.getByRole("button", { name: /Reply to the letter/i }));
    fireEvent.click(screen.getByRole("button", { name: /Write a reply/i }));

    fireEvent.change(screen.getByLabelText(/Message:/i), { target: { value: "Escape key test draft." } });
    fireEvent.click(screen.getByRole("button", { name: /Preview/i }));

    expect(screen.getByText(/Back to Editing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Letter being replied to/i)).toBeNull();

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });

    // Returns to composer
    expect(screen.getByRole("heading", { name: /Write your reply/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Message:/i)).toHaveValue("Escape key test draft.");
  });

  test("a parent letter uses the same full thread navigation and shows its arrow hint only once", async () => {
    const parent = {
      ...sampleParentLetter,
      timestamp: "2024-09-28T12:00:00.000Z",
      replies: [],
      reply_count: 2,
      has_replies: true,
    };
    const firstReply = { _id: "reply-published-1", from: "FirstResponder", to: "Casper", message: "First reply.", timestamp: "2024-09-28T14:00:00.000Z", reads: 7, is_reply: true, type: "reply", parent_letter_id: parent._id };
    const latestReply = { _id: "reply-published-2", from: "SecondResponder", to: "FirstResponder", message: "Latest reply.", timestamp: "2024-09-28T15:00:00.000Z", reads: 3, is_reply: true, type: "reply", parent_letter_id: firstReply._id };
    global.fetch = jest.fn(url => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(String(url).endsWith(`/${parent._id}/thread`)
        ? {letters: [parent, firstReply, latestReply], active_index: 0}
        : {replies: []}),
    }));

    const {container} = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={parent}
          readMode={true}
          initialOpened={true}
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole("button", {name: /view next letter in reply thread/i})).toBeInTheDocument());
    const overlay = container.querySelector(".letter-modal-overlay");
    for (const expectedMessage of [firstReply.message, latestReply.message]) {
      fireEvent.touchStart(overlay, {touches: [{clientX: 300, clientY: 200}]});
      fireEvent.touchEnd(overlay, {changedTouches: [{clientX: 100, clientY: 200}]});
      expect(document.querySelector(".read-mode-card-wrapper:not([class*='is-exiting']) .letter-paper")).toHaveTextContent(expectedMessage);
      expect(screen.queryByRole("button", {name: /letter in reply thread/i})).not.toBeInTheDocument();
    }
  });
});
