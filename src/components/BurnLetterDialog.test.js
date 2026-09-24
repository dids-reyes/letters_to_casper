import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import BurnLetterDialog from "./BurnLetterDialog";
import { displayDirectLinkAds } from "../data/direct_link";

jest.mock("../data/direct_link", () => ({
  displayDirectLinkAds: jest.fn(),
}));

jest.mock("../data/keys", () => ({
  render_url: "https://test-api.example/api/messages",
  api_key: "test-api-key",
}));

jest.mock("react-toastify", () => ({
  toast: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("html2canvas", () =>
  jest.fn(() =>
    Promise.resolve({
      width: 580,
      height: 440,
      getContext: jest.fn(() => null),
    })
  )
);

const mockLetter = {
  _id: "6aa565cba4c257dd565b83c5",
  to: "Casper",
  from: "Friend",
  message: "Remembering our gentle walks under the quiet night sky.",
  timestamp: "2026-09-17T12:00:00.000Z",
};

const validBurnKey = "LTC-A1B2-C3D4-E5F6-7890-ABCD-EF01";

describe("BurnLetterDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
  });

  test("renders key input form when open", () => {
    render(
      <BurnLetterDialog isOpen={true} onClose={jest.fn()} onBurnSuccess={jest.fn()} />
    );

    expect(screen.getByText("Burn a letter you wrote")).toBeInTheDocument();
    expect(screen.getByLabelText("Secret burn key")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Burn My Letter/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Burning removes the letter you wrote.")
    ).toBeInTheDocument();
  });

  test("validates empty or invalid burn key before requesting preview", async () => {
    render(
      <BurnLetterDialog isOpen={true} onClose={jest.fn()} onBurnSuccess={jest.fn()} />
    );

    const submitButton = screen.getByRole("button", { name: /Burn My Letter/i });

    // 1. Blank submit
    fireEvent.click(submitButton);
    expect(
      screen.getByText("Enter the private burn key for your letter.")
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    // 2. Invalid format
    const input = screen.getByLabelText("Secret burn key");
    fireEvent.change(input, { target: { value: "invalid-key" } });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("Enter a valid burn key format (LTC-••••-••••-••••-••••).")
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("retrieves and displays full letter immediately with confirmation dialog", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ letter: mockLetter }),
    });

    render(
      <BurnLetterDialog
        isOpen={true}
        onClose={jest.fn()}
        onBurnSuccess={jest.fn()}
      />
    );

    const input = screen.getByLabelText("Secret burn key");
    fireEvent.change(input, { target: { value: validBurnKey } });
    fireEvent.click(screen.getByRole("button", { name: /Burn My Letter/i }));

    // Verify preview endpoint was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://test-api.example/api/messages/burn/preview",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ burnKey: validBurnKey }),
        })
      );
    });

    // 1. Immediately displays full letter in main view (no typewriter delays)
    await waitFor(() => {
      expect(screen.getByText(mockLetter.message)).toBeInTheDocument();
    });
    expect(screen.getByText(mockLetter.to)).toBeInTheDocument();
    expect(screen.getByText(mockLetter.from)).toBeInTheDocument();

    // 2. Confirmation dialog is centered in front of the letter
    expect(
      screen.getByText("Are you sure you want to burn your letter?")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proceed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  test("closes the entire burn flow on Cancel without leaving the letter behind", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ letter: mockLetter }),
    });

    const BurnFlowHarness = () => {
      const [isOpen, setIsOpen] = React.useState(true);
      return (
        <BurnLetterDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onBurnSuccess={jest.fn()}
        />
      );
    };

    render(<BurnFlowHarness />);

    fireEvent.change(screen.getByLabelText("Secret burn key"), {
      target: { value: validBurnKey },
    });
    fireEvent.click(screen.getByRole("button", { name: /Burn My Letter/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Are you sure you want to burn your letter?")
      ).toBeInTheDocument();
    });

    // Click Cancel
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // The confirmation and its underlying letter preview both close.
    expect(
      screen.queryByText("Are you sure you want to burn your letter?")
    ).not.toBeInTheDocument();

    expect(screen.queryByText(mockLetter.message)).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("proceeds to center-out paper burn animation, commits burn, and shows completion state", async () => {
    jest.useFakeTimers();

    // 1. Mock preview response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ letter: mockLetter }),
    });

    // 2. Mock burn execution response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        message: "Letter burned successfully",
        letterId: mockLetter._id,
      }),
    });

    const onBurnSuccessMock = jest.fn();
    const onCloseMock = jest.fn();

    render(
      <BurnLetterDialog
        isOpen={true}
        onClose={onCloseMock}
        onBurnSuccess={onBurnSuccessMock}
      />
    );

    fireEvent.change(screen.getByLabelText("Secret burn key"), {
      target: { value: validBurnKey },
    });
    fireEvent.click(screen.getByRole("button", { name: /Burn My Letter/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Are you sure you want to burn your letter?")
      ).toBeInTheDocument();
    });

    // Click Proceed
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Proceed" }));
    });

    // 1. Confirmation dialog fades out immediately
    expect(
      screen.queryByText("Are you sure you want to burn your letter?")
    ).not.toBeInTheDocument();

    // 2. The intact letter remains visible for one second against a dim backdrop.
    const letterCard = screen.getByText(mockLetter.message).closest(".letter-paper");
    expect(letterCard).not.toHaveClass("is-center-burning");
    expect(document.querySelector(".burn-dialog-overlay")).toHaveClass("is-burn-stage");
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(999);
    });
    expect(letterCard).not.toHaveClass("is-center-burning");

    // 3. The existing burn animation begins after the full delay.
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(letterCard).toHaveClass("is-center-burning");
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // 4. The burn animation finishes on its original duration.
    await act(async () => {
      jest.advanceTimersByTime(3400);
      await Promise.resolve();
    });

    // 5. Verification that onBurnSuccess was called with the letter ID
    await waitFor(() => {
      expect(onBurnSuccessMock).toHaveBeenCalledWith(mockLetter._id);
      expect(screen.getByText("Your Letter is Gone...")).toBeInTheDocument();
    });

    // 6. Post-burn completion state displayed: "Your Letter is Gone..."
    expect(
      screen.getByText(/The letter has turned to ashes/i)
    ).toBeInTheDocument();

    // 7. Old animation icons and text are gone, letter container cleared
    expect(screen.queryByText(mockLetter.message)).not.toBeInTheDocument();

    // 8. Clicking Move Forward dismisses the dialog
    fireEvent.click(screen.getByRole("button", { name: "Move Forward" }));
    expect(displayDirectLinkAds).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
