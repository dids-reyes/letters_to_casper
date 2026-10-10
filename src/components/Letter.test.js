import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Letter from "./Letter";

describe("Letter component card header and addressee values", () => {
  const mockLetter = {
    _id: "test12345",
    from: "Casper",
    to: "Someone Special",
    message: "This is a lovely message from the heart.",
    timestamp: "2024-11-10T14:30:00.000Z",
    loc: { city: "Baguio" },
    approve: true,
  };

  test("renders Date, From value, and To value cleanly", () => {
    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={mockLetter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    // Date is rendered
    expect(screen.getByTitle(/Nov\s+10,\s+2024/i)).toBeInTheDocument();

    // From label and From value are rendered
    expect(screen.getByText("From:")).toBeInTheDocument();
    expect(screen.getByText("Casper")).toBeInTheDocument();

    // To label and To value are rendered
    expect(screen.getByText("To:")).toBeInTheDocument();
    expect(screen.getByText("Someone Special")).toBeInTheDocument();

    // Stamp is rendered without top/bottom text labels
    expect(container.querySelector(".letter-card__main-stamp--city")).toBeInTheDocument();
    expect(screen.queryByText("BAGUIO")).not.toBeInTheDocument();
    expect(screen.queryByText(/SUMMER CAPITAL/i)).not.toBeInTheDocument();
  });

  test("renders Anonymous fallback when from is omitted", () => {
    const letterWithoutFrom = {
      ...mockLetter,
      from: "",
      alias: "",
    };

    render(
      <MemoryRouter>
        <Letter
          letter={letterWithoutFrom}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Anonymous")).toBeInTheDocument();
  });

  test("renders global international stamp for international letter with city and region, never Kalesa", () => {
    const internationalLetter = {
      ...mockLetter,
      _id: "intl-letter-1",
      loc: { city: "Melbourne", region: "Victoria" },
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={internationalLetter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    // Should render the global international stamp
    expect(container.querySelector(".letter-card__main-stamp--international")).toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--international")).toHaveAttribute(
      "data-motif",
      "global_international"
    );
    // MUST NOT render Kalesa (variant-2) or any domestic archetype
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-2")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-1")).not.toBeInTheDocument();
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-0")).not.toBeInTheDocument();
  });

  test("renders Indonesia country stamp for Indonesian letter without specific city stamp, never Kalesa", () => {
    const indonesianLetter = {
      ...mockLetter,
      _id: "indo-letter-1",
      loc: { city: "Ambon", region: "Maluku" },
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={indonesianLetter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    // Should render the Indonesia country stamp
    expect(container.querySelector(".letter-card__main-stamp--country-indonesia")).toBeInTheDocument();
    expect(container.querySelector(".letter-card__main-stamp--country-indonesia")).toHaveAttribute(
      "data-motif",
      "indonesia_national"
    );
    expect(container.querySelector(".letter-card__stamp-wrapper--variant-2")).not.toBeInTheDocument();
  });

  test("renders generic Philippine island group map stamps (Luzon, Visayas, Mindanao) in Letter cards", () => {
    // 1. Luzon location (San Ildefonso, Central Luzon)
    const luzonLetter = {
      ...mockLetter,
      _id: "luzon-letter-1",
      loc: { city: "San Ildefonso", region: "Central Luzon" },
    };
    const { container: luzonContainer } = render(
      <MemoryRouter>
        <Letter
          letter={luzonLetter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );
    expect(luzonContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-motif",
      "ph_luzon_map"
    );
    expect(luzonContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-island-group",
      "luzon"
    );

    // 2. Visayas location (Panglao, Central Visayas)
    const visayasLetter = {
      ...mockLetter,
      _id: "visayas-letter-1",
      loc: { city: "Panglao", region: "Central Visayas" },
    };
    const { container: visayasContainer } = render(
      <MemoryRouter>
        <Letter
          letter={visayasLetter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );
    expect(visayasContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-motif",
      "ph_visayas_map"
    );
    expect(visayasContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-island-group",
      "visayas"
    );

    // 3. Mindanao location (Magpet, Soccsksargen)
    const mindanaoLetter = {
      ...mockLetter,
      _id: "mindanao-letter-1",
      loc: { city: "Magpet", region: "Soccsksargen" },
    };
    const { container: mindanaoContainer } = render(
      <MemoryRouter>
        <Letter
          letter={mindanaoLetter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );
    expect(mindanaoContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-motif",
      "ph_mindanao_map"
    );
    expect(mindanaoContainer.querySelector(".letter-card__main-stamp--ph-island")).toHaveAttribute(
      "data-island-group",
      "mindanao"
    );
  });

  test("renders tactile RedPushpin at the top of the letter card when pinned without altering date text", () => {
    const pinnedLetter = {
      ...mockLetter,
      _id: "pinned-letter-1",
      is_pinned: true,
      pin_expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={pinnedLetter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    // Red pushpin is rendered
    const redPin = container.querySelector(".letter-card__red-pin");
    expect(redPin).toBeInTheDocument();
    expect(redPin).toHaveAttribute("aria-label", "Pinned letter");

    // Date text is preserved cleanly without collision
    expect(screen.getByTitle(/Nov\s+10,\s+2024/i)).toBeInTheDocument();
    expect(container.querySelector(".letter-pin-indicator")).not.toBeInTheDocument();
  });

  test("does not render RedPushpin when letter is unpinned", () => {
    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={mockLetter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    expect(container.querySelector(".letter-card__red-pin")).not.toBeInTheDocument();
  });
});

describe("Letter glowing outerline border loop reactions", () => {
  const baseLetter = {
    _id: "glow-test-1",
    from: "Sender",
    to: "Recipient",
    message: "A testing letter message.",
    approve: true,
  };

  test("never shows glow or mood when reactions < 10 and reads < 50", () => {
    const letter = {
      ...baseLetter,
      echoes: { love: 9, sad: 9 },
      reads: 49,
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={letter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    const card = container.querySelector(".letter-card");
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveClass("letter-card--has-glow");
    expect(card).not.toHaveClass("letter-card--mood-love");
    expect(card).not.toHaveClass("letter-card--mood-sad");
    expect(card).not.toHaveClass("letter-card--mood-amber");
    expect(card.querySelector(".letter-card__glow")).not.toBeInTheDocument();
  });

  test("shows amber glow by default when reads reach 50+ and reactions are under 10", () => {
    const letter = {
      ...baseLetter,
      echoes: { love: 2, sad: 1 },
      reads: 60,
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={letter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    const card = container.querySelector(".letter-card");
    expect(card).toHaveClass("letter-card--has-glow");
    expect(card).toHaveClass("letter-card--mood-amber");
    expect(card).not.toHaveClass("letter-card--mood-love");
    expect(card).not.toHaveClass("letter-card--mood-sad");
    expect(card.querySelector(".letter-card__glow")).toBeInTheDocument();
  });

  test("shows red love glow when love reactions reach 10+", () => {
    const letter = {
      ...baseLetter,
      echoes: { love: 10, sad: 2 },
      reads: 5,
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={letter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    const card = container.querySelector(".letter-card");
    expect(card).toHaveClass("letter-card--has-glow");
    expect(card).toHaveClass("letter-card--mood-love");
  });

  test("shows blue sad glow when sad reactions reach 10+", () => {
    const letter = {
      ...baseLetter,
      echoes: { love: 3, sad: 12 },
      reads: 10,
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={letter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    const card = container.querySelector(".letter-card");
    expect(card).toHaveClass("letter-card--has-glow");
    expect(card).toHaveClass("letter-card--mood-sad");
  });

  test("resolves dominance between love and sad reactions", () => {
    // When sad > love and both >= 10
    const sadDominant = {
      ...baseLetter,
      echoes: { love: 10, sad: 14 },
    };
    const { container: sadContainer } = render(
      <MemoryRouter>
        <Letter
          letter={sadDominant}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );
    expect(sadContainer.querySelector(".letter-card")).toHaveClass("letter-card--mood-sad");

    // When love >= sad and both >= 10
    const loveDominant = {
      ...baseLetter,
      echoes: { love: 15, sad: 11 },
    };
    const { container: loveContainer } = render(
      <MemoryRouter>
        <Letter
          letter={loveDominant}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );
    expect(loveContainer.querySelector(".letter-card")).toHaveClass("letter-card--mood-love");
  });

  test("shows amber glow when reads reach 50+ without reaction", () => {
    const letter = {
      ...baseLetter,
      echoes: { love: 0, sad: 0 },
      reads: 50,
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={letter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    const card = container.querySelector(".letter-card");
    expect(card).toHaveClass("letter-card--has-glow");
    expect(card).toHaveClass("letter-card--mood-amber");
  });

  test("love reaction (10+) takes precedence over 50+ reads", () => {
    const letter = {
      ...baseLetter,
      echoes: { love: 12, sad: 1 },
      reads: 150,
    };

    const { container } = render(
      <MemoryRouter>
        <Letter
          letter={letter}
          toggleDetailsModal={() => {}}
          setSelectedLetter={() => {}}
        />
      </MemoryRouter>
    );

    const card = container.querySelector(".letter-card");
    expect(card).toHaveClass("letter-card--has-glow");
    expect(card).toHaveClass("letter-card--mood-love");
    expect(card).not.toHaveClass("letter-card--mood-amber");
  });
});

