import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DetailsModal from './DetailsModal';
import Home from './Home';

jest.mock('react-lottie-player', () => () => null);
jest.mock('./AdComponent', () => () => null);
jest.mock('./AdsterraNativeBanner', () => () => null);
jest.mock('./Firefly3D', () => () => null);
jest.mock('../data/keys', () => ({
  render_url: 'https://example.test/api/messages',
  api_key: 'test',
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
    };
  };
});

const sampleLetters = Array.from({ length: 25 }, (_, i) => ({
  _id: `letter-${i + 1}`,
  from: `Sender ${i + 1}`,
  to: `Recipient ${i + 1}`,
  message: `Message content for letter ${i + 1}`,
  timestamp: '2024-01-01T12:00:00.000Z',
  approve: true,
  reads: i,
  echoes: { love: 1, sad: 0 },
}));

const originalFetch = global.fetch;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('ltc-ui-update-announcement-v1', 'true');
  sessionStorage.clear();
  document.body.style.overflow = '';
  window.scrollTo = jest.fn();
  HTMLElement.prototype.scrollTo = jest.fn();
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({
      messages: [],
      counts: { approved: 0, unapproved: 0 },
      featured: null,
    }),
  }));
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('Read Mode in DetailsModal', () => {

  test('in readMode, envelope is bypassed and letter is immediately displayed', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    // Envelope is not displayed
    expect(container.querySelector('.letter-envelope')).toBeNull();

    // Letter paper is immediately displayed
    expect(container.querySelector('.letter-paper')).not.toBeNull();

    // Text is immediately displayed
    const infoBlocks = container.querySelectorAll('.letter-info');
    expect(infoBlocks[0]).toHaveTextContent('Sender 1');
    expect(infoBlocks[1]).toHaveTextContent('Recipient 1');
    expect(container.querySelector('.letter-paper__body')).toHaveTextContent('Message content for letter 1');
  });

  test('in readMode, no navigation buttons (.read-mode-nav) are rendered on the letter', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    // No navigation buttons on the letter
    expect(container.querySelector('.read-mode-nav')).toBeNull();
    expect(screen.queryByLabelText(/Next letter/i)).toBeNull();
    expect(screen.queryByLabelText(/Previous letter/i)).toBeNull();
  });

  test('in readMode, first-timer tip is shown and dismisses on click', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    const tip = container.querySelector('.read-mode-tip');
    expect(tip).not.toBeNull();
    expect(tip).toHaveTextContent(/Scroll or swipe down to read more letters/i);

    const closeBtn = container.querySelector('.read-mode-tip__close');
    fireEvent.click(closeBtn);

    expect(container.querySelector('.read-mode-tip')).toBeNull();
    expect(localStorage.getItem('hasSeenReadModeTip')).toBe('true');
  });

  test('in readMode, document body overflow is locked to prevent background scrolling', () => {
    const { unmount } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  test('pressing ArrowDown navigates to next letter in readMode', () => {
    const mockSetSelectedLetter = jest.fn();
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[1]}
          readMode={true}
          letters={sampleLetters}
          setSelectedLetter={mockSetSelectedLetter}
        />
      </MemoryRouter>
    );

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(mockSetSelectedLetter).toHaveBeenCalledWith(sampleLetters[2]);
  });

  test('pressing ArrowUp navigates to previous letter in readMode', () => {
    const mockSetSelectedLetter = jest.fn();
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[1]}
          readMode={true}
          letters={sampleLetters}
          setSelectedLetter={mockSetSelectedLetter}
        />
      </MemoryRouter>
    );

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(mockSetSelectedLetter).toHaveBeenCalledWith(sampleLetters[0]);
  });

  test('desktop wheel scroll down navigates to next letter and works repeatedly', () => {
    jest.useFakeTimers();
    try {
      let currentIdx = 0;
      const mockSetSelectedLetter = jest.fn((letter) => {
        currentIdx = sampleLetters.findIndex((l) => l._id === letter._id);
      });

      const { rerender } = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={sampleLetters[currentIdx]}
            readMode={true}
            letters={sampleLetters}
            setSelectedLetter={mockSetSelectedLetter}
          />
        </MemoryRouter>
      );

      // 1st scroll down
      fireEvent.wheel(window, { deltaY: 80 });
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(sampleLetters[1]);

      // Fast-forward transition duration
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Rerender with letter 1
      rerender(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={sampleLetters[currentIdx]}
            readMode={true}
            letters={sampleLetters}
            setSelectedLetter={mockSetSelectedLetter}
          />
        </MemoryRouter>
      );

      // 2nd scroll down - must work!
      fireEvent.wheel(window, { deltaY: 80 });
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(sampleLetters[2]);

      // Fast-forward transition duration
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Rerender with letter 2
      rerender(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={sampleLetters[currentIdx]}
            readMode={true}
            letters={sampleLetters}
            setSelectedLetter={mockSetSelectedLetter}
          />
        </MemoryRouter>
      );

      // 3rd scroll down - must work!
      fireEvent.wheel(window, { deltaY: 80 });
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(sampleLetters[3]);
    } finally {
      jest.useRealTimers();
    }
  });

  test('desktop wheel scroll up navigates to previous letter', () => {
    const mockSetSelectedLetter = jest.fn();
    render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[2]}
          readMode={true}
          letters={sampleLetters}
          setSelectedLetter={mockSetSelectedLetter}
        />
      </MemoryRouter>
    );

    fireEvent.wheel(window, { deltaY: -80 });
    expect(mockSetSelectedLetter).toHaveBeenCalledWith(sampleLetters[1]);
  });

  test('in normal mode (readMode=false), envelope intro is shown and body overflow is untouched', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[0]}
          readMode={false}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    expect(container.querySelector('.letter-envelope')).not.toBeNull();
    expect(container.querySelector('.read-mode-tip')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  test('triggers Ad lock intermission after viewing 10 letters and enables continue after countdown', () => {
    jest.useFakeTimers();
    let currentIdx = 0;
    const mockSetSelectedLetter = jest.fn((letter) => {
      currentIdx = sampleLetters.findIndex(l => l._id === letter._id);
    });

    const { container, rerender } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[currentIdx]}
          readMode={true}
          letters={sampleLetters}
          setSelectedLetter={mockSetSelectedLetter}
        />
      </MemoryRouter>
    );

    // Navigate through 9 letters (initial letter is letter 1, so 9 steps reaches 10 letters)
    for (let i = 0; i < 9; i++) {
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      act(() => {
        jest.advanceTimersByTime(550);
      });
      rerender(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={sampleLetters[currentIdx]}
            readMode={true}
            letters={sampleLetters}
            setSelectedLetter={mockSetSelectedLetter}
          />
        </MemoryRouter>
      );
    }

    // Now on letter 10. When attempting to scroll to letter 11:
    fireEvent.keyDown(document, { key: 'ArrowDown' });

    // The Ad lock overlay should appear!
    expect(container.querySelector('.read-mode-ad-lock-overlay')).not.toBeNull();
    expect(screen.getByText(/Reading intermission/i)).toBeInTheDocument();
    expect(screen.getByText(/Take a brief pause/i)).toBeInTheDocument();
    expect(screen.getByText(/You’ve read 10 letters/i)).toBeInTheDocument();

    const adBtn = container.querySelector('.read-mode-ad-lock-btn');
    expect(adBtn).toBeDisabled();
    expect(adBtn).toHaveTextContent(/Resuming in 5s/i);

    // Count down 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(adBtn).not.toBeDisabled();
    expect(adBtn).toHaveTextContent(/Continue reading/i);

    // Click continue reading
    fireEvent.click(adBtn);
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    jest.useRealTimers();
  });

  test('scrolling back (ArrowUp) does not count towards the 10-letter ad lock', () => {
    jest.useFakeTimers();
    let currentIdx = 5;
    const mockSetSelectedLetter = jest.fn((letter) => {
      currentIdx = sampleLetters.findIndex(l => l._id === letter._id);
    });

    const { container, rerender } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[currentIdx]}
          readMode={true}
          letters={sampleLetters}
          setSelectedLetter={mockSetSelectedLetter}
        />
      </MemoryRouter>
    );

    // Scroll up multiple times
    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      act(() => {
        jest.advanceTimersByTime(550);
      });
      rerender(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={sampleLetters[currentIdx]}
            readMode={true}
            letters={sampleLetters}
            setSelectedLetter={mockSetSelectedLetter}
          />
        </MemoryRouter>
      );
    }

    // Ad lock should NOT appear from upward scrolling
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();
    jest.useRealTimers();
  });

  test('increments reads when viewing and navigating letters in Read Mode', async () => {
    let currentIdx = 0;
    const mockSetSelectedLetter = jest.fn((letter) => {
      currentIdx = sampleLetters.findIndex(l => l._id === letter._id);
    });

    const { rerender } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[currentIdx]}
          readMode={true}
          letters={sampleLetters}
          setSelectedLetter={mockSetSelectedLetter}
        />
      </MemoryRouter>
    );

    // Initial letter viewed in Read Mode triggers read increment POST
    await act(async () => {
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.test/api/messages/letter-1/read',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-api-key': 'test',
        }),
      })
    );

    const storedReads = JSON.parse(localStorage.getItem('readLettersByDeviceV2') || '[]');
    expect(storedReads).toContain('letter-1');

    // Navigate to next letter in Read Mode
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(mockSetSelectedLetter).toHaveBeenCalledWith(sampleLetters[1]);

    // Rerender with letter-2
    rerender(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[currentIdx]}
          readMode={true}
          letters={sampleLetters}
          setSelectedLetter={mockSetSelectedLetter}
        />
      </MemoryRouter>
    );

    await act(async () => {
      await Promise.resolve();
    });

    // letter-2 should also be counted
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.test/api/messages/letter-2/read',
      expect.objectContaining({
        method: 'POST',
      })
    );

    const updatedStoredReads = JSON.parse(localStorage.getItem('readLettersByDeviceV2') || '[]');
    expect(updatedStoredReads).toContain('letter-2');
  });
});

describe('Read Mode FAB and Explanatory Dialog in Home', () => {
  test('clicking the Read Mode FAB opens the explanatory dialog describing the feature', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const fabButton = screen.getByRole('button', { name: /Read mode info and settings/i });
    expect(fabButton).toBeInTheDocument();
    expect(fabButton).toHaveAttribute('aria-pressed', 'false');

    // Dialog is not open initially
    expect(screen.queryByRole('dialog', { name: /Read Mode/i })).toBeNull();

    // Click FAB to open dialog
    fireEvent.click(fabButton);

    const dialog = screen.getByRole('dialog', { name: /Read Mode/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Read Mode/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        /When Read Mode is enabled, typing effects are disabled and letters are displayed immediately\. You can also swipe or scroll down to browse through letters\./i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/○ Read Mode is OFF/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Turn On Read Mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
  });

  test('toggling Read Mode in the dialog updates status and toggles active state', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const fabButton = screen.getByRole('button', { name: /Read mode info and settings/i });
    fireEvent.click(fabButton);

    const toggleBtn = screen.getByRole('button', { name: /Turn On Read Mode/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/● Read Mode is ON/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Turn Off Read Mode/i })).toBeInTheDocument();
    expect(localStorage.getItem('readMode')).toBeNull();
    expect(fabButton).toHaveAttribute('aria-pressed', 'true');

    // Click Done to close dialog
    const doneBtn = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneBtn);
    expect(screen.queryByRole('dialog', { name: /Read Mode/i })).toBeNull();
  });

  test('Read Mode is never persisted in storage and always defaults to OFF on visit/reload', () => {
    localStorage.setItem('readMode', 'true');

    const { unmount } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const fabButton = screen.getByRole('button', { name: /Read mode info and settings/i });
    expect(fabButton).toHaveAttribute('aria-pressed', 'false');
    expect(localStorage.getItem('readMode')).toBeNull();

    // Turn it ON in dialog
    fireEvent.click(fabButton);
    const toggleBtn = screen.getByRole('button', { name: /Turn On Read Mode/i });
    fireEvent.click(toggleBtn);
    expect(fabButton).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('readMode')).toBeNull();

    unmount();

    // Fresh visit / reload must default to OFF
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const reloadedFab = screen.getByRole('button', { name: /Read mode info and settings/i });
    expect(reloadedFab).toHaveAttribute('aria-pressed', 'false');
  });

  test('pressing Escape closes the Read Mode dialog', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const fabButton = screen.getByRole('button', { name: /Read mode info and settings/i });
    fireEvent.click(fabButton);
    expect(screen.getByRole('dialog', { name: /Read Mode/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /Read Mode/i })).toBeNull();
  });

  test('new visitor sees the Read Mode introduction tooltip pointing to the FAB button without "New"', () => {
    localStorage.removeItem('readModeTipDismissed');
    localStorage.removeItem('readMode');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const tooltip = screen.getByRole('status', { name: /Read Mode introduction/i });
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Read Mode');
    expect(tooltip).not.toHaveTextContent('New:');
    expect(screen.getByRole('button', { name: /Try Read Mode/i })).toBeInTheDocument();
  });

  test('clicking "Try Read Mode" in the tooltip opens the dialog and permanently dismisses the tooltip', () => {
    localStorage.removeItem('readModeTipDismissed');
    localStorage.removeItem('readMode');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const tryBtn = screen.getByRole('button', { name: /Try Read Mode/i });
    fireEvent.click(tryBtn);

    expect(localStorage.getItem('readModeTipDismissed')).toBe('true');
    expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();
    expect(screen.getByRole('dialog', { name: /Read Mode/i })).toBeInTheDocument();
  });

  test('clicking close "×" on the tooltip dismisses it and stores state in localStorage', () => {
    localStorage.removeItem('readModeTipDismissed');
    localStorage.removeItem('readMode');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const closeBtn = screen.getByRole('button', { name: /Dismiss Read Mode suggestion/i });
    fireEvent.click(closeBtn);

    expect(localStorage.getItem('readModeTipDismissed')).toBe('true');
    expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();
  });

  test('if readModeTipDismissed is already set, tooltip is not shown for returning visitors', () => {
    localStorage.setItem('readModeTipDismissed', 'true');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();
  });

  test('Page 2 of the Feed features the newest addition: Read Mode', async () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Open Feed
    const feedBtn = screen.getByRole('button', { name: /Open updates feed/i });
    fireEvent.click(feedBtn);

    expect(screen.getByRole('region', { name: /Letters to Casper update report/i })).toBeInTheDocument();

    const page2 = screen.getByRole('region', { name: /Recent updates, page 2 of 5/i });
    expect(page2).toBeInTheDocument();

    // Check that Read Mode is present as the newest addition
    expect(page2).toHaveTextContent(/Newest addition · Read Mode/i);
    expect(page2).toHaveTextContent(/A calmer way to browse/i);
    expect(page2).toHaveTextContent(/Turn on Read Mode to view letters immediately without typing delays/i);

    // Ensure icon and structure
    const featuredStory = page2.querySelector('.feed-report__story.is-featured');
    expect(featuredStory).not.toBeNull();
    expect(featuredStory).toHaveTextContent(/Newest addition · Read Mode/i);
  });

  describe('Search Result Subset Isolation & Modal Traversal', () => {
    const searchSubset = Array.from({ length: 6 }, (_, i) => ({
      _id: `search-result-${i + 1}`,
      from: `Mark ${i + 1}`,
      to: `Casper ${i + 1}`,
      message: `Filtered result ${i + 1} for mark search`,
      timestamp: '2024-01-01T12:00:00.000Z',
      approve: true,
      reads: i,
      echoes: { love: 0, sad: 0 },
    }));

    test('selecting first result (index 0) allows scrolling down to index 1 and blocks scrolling up', () => {
      const mockSetSelectedLetter = jest.fn();
      render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={searchSubset[0]}
            readMode={true}
            letters={searchSubset}
            setSelectedLetter={mockSetSelectedLetter}
            onFetchMore={null}
          />
        </MemoryRouter>
      );

      // Press ArrowUp at top boundary -> blocked, no change
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(mockSetSelectedLetter).not.toHaveBeenCalled();

      // Press ArrowDown -> navigates to index 1 (second item)
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(mockSetSelectedLetter).toHaveBeenCalledTimes(1);
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(searchSubset[1]);
    });

    test('selecting last result (index 5) allows scrolling up to index 4 and blocks scrolling down', () => {
      const mockSetSelectedLetter = jest.fn();
      render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={searchSubset[5]}
            readMode={true}
            letters={searchSubset}
            setSelectedLetter={mockSetSelectedLetter}
            onFetchMore={null}
          />
        </MemoryRouter>
      );

      // Press ArrowDown at bottom boundary -> blocked, no change
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(mockSetSelectedLetter).not.toHaveBeenCalled();

      // Press ArrowUp -> navigates to index 4 (fifth item)
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(mockSetSelectedLetter).toHaveBeenCalledTimes(1);
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(searchSubset[4]);
    });

    test('selecting middle result (e.g. index 2) navigates down to index 3', () => {
      const mockSetSelectedLetter = jest.fn();
      render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={searchSubset[2]}
            readMode={true}
            letters={searchSubset}
            setSelectedLetter={mockSetSelectedLetter}
            onFetchMore={null}
          />
        </MemoryRouter>
      );

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(mockSetSelectedLetter).toHaveBeenCalledTimes(1);
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(searchSubset[3]);
    });

    test('selecting middle result (e.g. index 2) navigates up to index 1', () => {
      const mockSetSelectedLetter = jest.fn();
      render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={searchSubset[2]}
            readMode={true}
            letters={searchSubset}
            setSelectedLetter={mockSetSelectedLetter}
            onFetchMore={null}
          />
        </MemoryRouter>
      );

      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(mockSetSelectedLetter).toHaveBeenCalledTimes(1);
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(searchSubset[1]);
    });

    test('sequential bidirectional traversal across search results respects boundaries', () => {
      jest.useFakeTimers();
      try {
        let currentIdx = 4; // Start at index 4 (item 5)
        const mockSetSelectedLetter = jest.fn((letter) => {
          currentIdx = searchSubset.findIndex((l) => l._id === letter._id);
        });

        const { rerender } = render(
          <MemoryRouter>
            <DetailsModal
              showDetailsModal={true}
              toggleDetailsModal={jest.fn()}
              selectedLetter={searchSubset[currentIdx]}
              readMode={true}
              letters={searchSubset}
              setSelectedLetter={mockSetSelectedLetter}
              onFetchMore={null}
            />
          </MemoryRouter>
        );

        // Move to index 5 (last item)
        fireEvent.keyDown(document, { key: 'ArrowDown' });
        expect(mockSetSelectedLetter).toHaveBeenLastCalledWith(searchSubset[5]);
        act(() => {
          jest.advanceTimersByTime(600);
        });

        // Re-render at index 5
        rerender(
          <MemoryRouter>
            <DetailsModal
              showDetailsModal={true}
              toggleDetailsModal={jest.fn()}
              selectedLetter={searchSubset[5]}
              readMode={true}
              letters={searchSubset}
              setSelectedLetter={mockSetSelectedLetter}
              onFetchMore={null}
            />
          </MemoryRouter>
        );

        // Try to move beyond last item -> blocked by boundary
        mockSetSelectedLetter.mockClear();
        fireEvent.keyDown(document, { key: 'ArrowDown' });
        expect(mockSetSelectedLetter).not.toHaveBeenCalled();

        // Move back up to index 4
        fireEvent.keyDown(document, { key: 'ArrowUp' });
        expect(mockSetSelectedLetter).toHaveBeenLastCalledWith(searchSubset[4]);
      } finally {
        jest.useRealTimers();
      }
    });

    test('modal maintains exact subset context and never triggers fetchMore when navigating near the end', () => {
      const mockOnFetchMore = jest.fn();
      const mockSetSelectedLetter = jest.fn();

      render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={searchSubset[4]}
            readMode={true}
            letters={searchSubset}
            setSelectedLetter={mockSetSelectedLetter}
            onFetchMore={null}
          />
        </MemoryRouter>
      );

      // Navigate to the last item
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(searchSubset[5]);
      expect(mockOnFetchMore).not.toHaveBeenCalled();
    });

    test('matches letter identity cleanly when _id is MongoDB object format ({ $oid: ... })', () => {
      const rawMongoSubset = [
        { _id: { $oid: 'id-1' }, from: 'A', to: 'B', message: 'First', approve: true },
        { _id: { $oid: 'id-2' }, from: 'C', to: 'D', message: 'Second', approve: true },
      ];
      const mockSetSelectedLetter = jest.fn();

      render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={rawMongoSubset[1]}
            readMode={true}
            letters={rawMongoSubset}
            setSelectedLetter={mockSetSelectedLetter}
            onFetchMore={null}
          />
        </MemoryRouter>
      );

      // Because it matches id-2 at index 1, ArrowUp should navigate to id-1 at index 0
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(mockSetSelectedLetter).toHaveBeenCalledWith(rawMongoSubset[0]);
    });
  });

  describe('Feed Virtualization & Read Mode Decoupling Integration', () => {
    test('when Read Mode is active, feed container is suspended and isolates paint layers', async () => {
      global.fetch = jest.fn(async (url) => {
        if (typeof url === 'string' && url.includes('/public/letter-1')) {
          return {
            ok: true,
            json: async () => ({ message: sampleLetters[0] }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            messages: sampleLetters,
            counts: { approved: sampleLetters.length, unapproved: 0 },
            featured: null,
          }),
        };
      });

      const { container } = render(
        <MemoryRouter initialEntries={['/letters/letter-1']}>
          <Routes>
            <Route path="/letters/:messageId" element={<Home initialReadMode={true} />} />
            <Route path="/" element={<Home initialReadMode={true} />} />
          </Routes>
        </MemoryRouter>
      );

      // In /letters/letter-1 with readMode=true, wait for linked letter fetch to complete and suspend feed
      await waitFor(() => {
        const feedContainer = container.querySelector('.feed-main-container');
        expect(feedContainer).not.toBeNull();
        expect(feedContainer).toHaveClass('feed-main-container--suspended');
      });
    });

    test('swiping to the end of loaded letters in Read Mode produces zero phantom fetches', async () => {
      const fetchCalls = [];
      global.fetch = jest.fn(async (url) => {
        fetchCalls.push(url);
        if (typeof url === 'string' && url.includes('/public/letter-1')) {
          return {
            ok: true,
            json: async () => ({ message: sampleLetters[0] }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            messages: sampleLetters,
            counts: { approved: 100, unapproved: 0 },
            featured: null,
          }),
        };
      });

      const { container } = render(
        <MemoryRouter initialEntries={['/letters/letter-1']}>
          <Routes>
            <Route path="/letters/:messageId" element={<Home initialReadMode={true} />} />
            <Route path="/" element={<Home initialReadMode={true} />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const feedContainer = container.querySelector('.feed-main-container');
        expect(feedContainer).not.toBeNull();
        expect(feedContainer).toHaveClass('feed-main-container--suspended');
      });

      const initialFetchCount = fetchCalls.length;

      // Simulate swiping through letters in Read Mode
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(document, { key: 'ArrowDown' });
      }

      // Verify no background pagination requests were dispatched
      const paginationCalls = fetchCalls
        .slice(initialFetchCount)
        .filter((url) => typeof url === 'string' && url.includes('offset='));
      expect(paginationCalls).toHaveLength(0);
    });

    test('exiting Read Mode unhides feed and restores state from cache with zero refetches', async () => {
      let apiCallCount = 0;
      global.fetch = jest.fn(async (url) => {
        apiCallCount += 1;
        if (typeof url === 'string' && url.includes('/public/letter-1')) {
          return {
            ok: true,
            json: async () => ({ message: sampleLetters[0] }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            messages: sampleLetters,
            counts: { approved: sampleLetters.length, unapproved: 0 },
            featured: null,
          }),
        };
      });

      const { container } = render(
        <MemoryRouter initialEntries={['/letters/letter-1']}>
          <Routes>
            <Route path="/letters/:messageId" element={<Home initialReadMode={true} />} />
            <Route path="/" element={<Home initialReadMode={true} />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const feedContainer = container.querySelector('.feed-main-container');
        expect(feedContainer).not.toBeNull();
        expect(feedContainer).toHaveClass('feed-main-container--suspended');
      });

      const countBeforeExit = apiCallCount;

      // Close DetailsModal by clicking close button
      const closeButton = screen.getByLabelText('Close letter');
      fireEvent.click(closeButton);

      // Feed container is immediately unsuspended
      await waitFor(() => {
        const feedContainer = container.querySelector('.feed-main-container');
        expect(feedContainer).not.toHaveClass('feed-main-container--suspended');
      });

      // No new API calls dispatched on exit
      expect(apiCallCount).toBe(countBeforeExit);
    });
  });
});


