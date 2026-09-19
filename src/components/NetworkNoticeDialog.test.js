import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NetworkNoticeDialog from "./NetworkNoticeDialog";
import Home, { PLDT_NOTICE_KEY, SHOW_PLDT_NOTICE } from "./Home";

jest.mock("react-lottie-player", () => () => null);
jest.mock("./AdComponent", () => () => null);
jest.mock("./AdsterraNativeBanner", () => () => null);
jest.mock("../data/keys", () => ({
  render_url: "https://example.test/api/messages",
  api_key: "test",
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
      };
    };
  window.scrollTo = jest.fn();
});

describe("NetworkNoticeDialog Component", () => {
  const defaultProps = {
    isOpen: true,
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render when isOpen is false", () => {
    render(<NetworkNoticeDialog isOpen={false} onDismiss={jest.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders all dialog elements when isOpen is true", () => {
    render(<NetworkNoticeDialog {...defaultProps} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "pldt-notice-title");
    expect(dialog).toHaveAttribute("aria-describedby", "pldt-notice-message");

    // PLDT Logo
    const logo = screen.getByAltText("PLDT");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass("pldt-notice-logo");

    // Eyebrow and Heading
    expect(screen.getByText("Network Advisory")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Network Notice" })
    ).toBeInTheDocument();

    // Body content
    expect(
      screen.getByText(
        /If you are currently using PLDT and experiencing issues loading the mailbox/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /PLDT is currently experiencing ongoing DNS issues affecting access to our servers/i
      )
    ).toBeInTheDocument();

    // Action button
    const actionBtn = screen.getByRole("button", { name: "Understood" });
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn).toHaveClass("pldt-notice-action");
  });

  test("calls onDismiss when clicking 'Understood' button", () => {
    const onDismiss = jest.fn();
    render(<NetworkNoticeDialog isOpen={true} onDismiss={onDismiss} />);

    const actionBtn = screen.getByRole("button", { name: "Understood" });
    fireEvent.click(actionBtn);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("calls onDismiss when clicking on overlay backdrop", () => {
    const onDismiss = jest.fn();
    const { container } = render(
      <NetworkNoticeDialog isOpen={true} onDismiss={onDismiss} />
    );

    const overlay = container.querySelector(".pldt-notice-overlay");
    fireEvent.click(overlay);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("does not call onDismiss when clicking inside the dialog card", () => {
    const onDismiss = jest.fn();
    render(<NetworkNoticeDialog isOpen={true} onDismiss={onDismiss} />);

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  test("calls onDismiss when pressing Escape key while open", () => {
    const onDismiss = jest.fn();
    render(<NetworkNoticeDialog isOpen={true} onDismiss={onDismiss} />);

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("does not call onDismiss on Escape when dialog is closed", () => {
    const onDismiss = jest.fn();
    render(<NetworkNoticeDialog isOpen={false} onDismiss={onDismiss} />);

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe("Sequential Modal Flow in Home", () => {
  const UI_ANNOUNCEMENT_KEY = "ltc-ui-update-announcement-v1";

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            messages: [],
            counts: { approved: 0, unapproved: 0 },
          }),
      })
    );
  });

  test("first-time visitor sees Dialog 1 ('New Chapter'), then clicking 'Move on' triggers Dialog 2 ('Network Notice')", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Home readModeEnabled={false} />
        </MemoryRouter>
      );
    });

    // Dialog 1 is present
    expect(screen.getByText("A new chapter")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Some letters stay. Some help us let go.",
      })
    ).toBeInTheDocument();

    // Dialog 2 is not yet present
    expect(screen.queryByText("Network Advisory")).not.toBeInTheDocument();
    expect(screen.queryByText("Network Notice")).not.toBeInTheDocument();

    // User dismisses Dialog 1
    const moveOnBtn = screen.getByRole("button", { name: "Move on" });
    await act(async () => {
      fireEvent.click(moveOnBtn);
    });

    // Dialog 1 is dismissed and saved to localStorage
    expect(
      screen.queryByRole("heading", {
        name: "Some letters stay. Some help us let go.",
      })
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(UI_ANNOUNCEMENT_KEY)).toBe("seen");

    // Dialog 2 now appears immediately
    expect(screen.getByText("Network Advisory")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Network Notice" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /If you are currently using PLDT and experiencing issues loading the mailbox/i
      )
    ).toBeInTheDocument();

    // User dismisses Dialog 2
    const understoodBtn = screen.getByRole("button", { name: "Understood" });
    await act(async () => {
      fireEvent.click(understoodBtn);
    });

    // Dialog 2 is dismissed and saved to localStorage
    expect(screen.queryByText("Network Notice")).not.toBeInTheDocument();
    expect(localStorage.getItem(PLDT_NOTICE_KEY)).toBe("seen");
  });

  test("user who already saw Dialog 1 sees Dialog 2 directly on page arrival", async () => {
    localStorage.setItem(UI_ANNOUNCEMENT_KEY, "seen");

    await act(async () => {
      render(
        <MemoryRouter>
          <Home readModeEnabled={false} />
        </MemoryRouter>
      );
    });

    // Dialog 1 does not show
    expect(screen.queryByText("A new chapter")).not.toBeInTheDocument();

    // Dialog 2 shows immediately
    expect(screen.getByText("Network Advisory")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Network Notice" })
    ).toBeInTheDocument();

    // Dismiss Dialog 2
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Understood" }));
    });
    expect(screen.queryByText("Network Notice")).not.toBeInTheDocument();
    expect(localStorage.getItem(PLDT_NOTICE_KEY)).toBe("seen");
  });

  test("user who has already seen both dialogs sees neither on page refresh", async () => {
    localStorage.setItem(UI_ANNOUNCEMENT_KEY, "seen");
    localStorage.setItem(PLDT_NOTICE_KEY, "seen");

    await act(async () => {
      render(
        <MemoryRouter>
          <Home readModeEnabled={false} />
        </MemoryRouter>
      );
    });

    expect(screen.queryByText("A new chapter")).not.toBeInTheDocument();
    expect(screen.queryByText("Network Advisory")).not.toBeInTheDocument();
    expect(screen.queryByText("Network Notice")).not.toBeInTheDocument();
  });

  test("SHOW_PLDT_NOTICE is exported as true by default so notice is active until toggled off", () => {
    expect(SHOW_PLDT_NOTICE).toBe(true);
  });
});
