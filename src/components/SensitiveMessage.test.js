import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import SensitiveMessage from "./SensitiveMessage";

test("renders ordinary message content without a warning", () => {
  render(<SensitiveMessage>ordinary message</SensitiveMessage>);
  expect(screen.getByText("ordinary message")).toBeInTheDocument();
  expect(screen.queryByText("Sensitive content")).not.toBeInTheDocument();
});

test("keeps sensitive message content unmounted until revealed", () => {
  const reveal = jest.fn();
  const {rerender} = render(
    <SensitiveMessage sensitive onReveal={reveal}>private message</SensitiveMessage>,
  );

  expect(screen.getByText("Sensitive")).toBeInTheDocument();
  expect(screen.getByText("Content")).toBeInTheDocument();
  expect(screen.queryByText("private message")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", {name: "Show message"}));
  expect(reveal).toHaveBeenCalledTimes(1);

  rerender(
    <SensitiveMessage sensitive revealed>private message</SensitiveMessage>,
  );
  expect(screen.getByText("private message")).toBeInTheDocument();
  expect(screen.queryByRole("button", {name: /hide/i})).not.toBeInTheDocument();
});

test("renders a compact warning without exposing feed preview text", () => {
  render(<SensitiveMessage sensitive compact>private preview</SensitiveMessage>);
  expect(screen.getByText("Sensitive")).toBeInTheDocument();
  expect(screen.getByText("Content")).toBeInTheDocument();
  expect(screen.queryByText("private preview")).not.toBeInTheDocument();
});
