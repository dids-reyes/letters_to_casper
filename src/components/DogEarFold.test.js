import React from "react";
import { render } from "@testing-library/react";
import DogEarFold from "./DogEarFold";

describe("DogEarFold component", () => {
  test("renders SVG with letter-fold-corner class and default attributes", () => {
    const { container } = render(<DogEarFold />);
    const svg = container.querySelector("svg.letter-fold-corner");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 48 48");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  test("appends custom className when provided", () => {
    const { container } = render(<DogEarFold className="custom-test-corner" />);
    const svg = container.querySelector("svg.letter-fold-corner");
    expect(svg).toHaveClass("letter-fold-corner");
    expect(svg).toHaveClass("custom-test-corner");
  });

  test("contains damask lining pattern, flap body, and lace border trim", () => {
    const { container } = render(<DogEarFold />);
    
    // Exposed damask lining polygon & pattern definition
    expect(container.querySelector("#dogear-damask-lining")).toBeInTheDocument();
    expect(container.querySelector(".dogear-lining")).toBeInTheDocument();
    expect(container.querySelector(".dogear-lining-base")).toBeInTheDocument();
    expect(container.querySelector(".dogear-damask-filigree")).toBeInTheDocument();

    // Folded paper flap body
    expect(container.querySelector(".dogear-flap-body")).toBeInTheDocument();
    expect(container.querySelector(".dogear-specks")).toBeInTheDocument();

    // Scalloped lace trim
    expect(container.querySelector(".dogear-lace-trim")).toBeInTheDocument();
  });
});

