import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import AdBlockSupportDialog from "./AdBlockSupportDialog";

test("renders only when open and exposes retry and close actions", () => {
  const close = jest.fn();
  const retry = jest.fn();
  const {rerender} = render(<AdBlockSupportDialog open={false} onClose={close} onRetry={retry} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  rerender(<AdBlockSupportDialog open onClose={close} onRetry={retry} />);
  expect(screen.getByRole("dialog", {name: "Support Us"})).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", {name: "I’ve Disabled AdBlock"}));
  expect(retry).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", {name: "Close"}));
  expect(close).toHaveBeenCalledTimes(1);
});

test("escape closes the dialog", () => {
  const close = jest.fn();
  render(<AdBlockSupportDialog open onClose={close} onRetry={jest.fn()} />);
  fireEvent.keyDown(document, {key: "Escape"});
  expect(close).toHaveBeenCalledTimes(1);
});
