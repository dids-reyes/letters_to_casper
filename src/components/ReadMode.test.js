import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DetailsModal, { resetSessionViewedLetters, viewedLetterIds } from './DetailsModal';
import Home from './Home';
import { toast } from 'react-toastify';

const finishFold = element => {
  const event = new Event('animationend', {bubbles: true});
  Object.defineProperty(event, 'animationName', {value: 'letter-close-fade'});
  fireEvent(element, event);
};

jest.mock('react-lottie-player', () => () => null);
jest.mock('./AdComponent', () => () => null);
jest.mock('./AdsterraNativeBanner', () => () => null);
jest.mock('react-toastify', () => ({
  ToastContainer: () => null,
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}));
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

beforeEach(() => {
  jest.clearAllMocks();
  resetSessionViewedLetters();
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

  test('in readMode, envelope opening animation is shown when enabled or toggled', () => {
    jest.useFakeTimers();
    const { container, rerender } = render(
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

    // Envelope is initially displayed
    expect(container.querySelector('.letter-envelope')).not.toBeNull();
    expect(container.querySelector('.letter-paper')).toBeNull();

    // After animation completes, letter paper is displayed
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(container.querySelector('.letter-envelope')).toBeNull();
    expect(container.querySelector('.letter-paper')).not.toBeNull();

    // Text is immediately displayed
    const infoBlocks = container.querySelectorAll('.letter-info');
    expect(infoBlocks[0]).toHaveTextContent('Sender 1');
    expect(infoBlocks[1]).toHaveTextContent('Recipient 1');
    expect(container.querySelector('.letter-paper__body')).toHaveTextContent('Message content for letter 1');

    // Toggling readMode also shows opening animation
    rerender(
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
    jest.useRealTimers();
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

  test('in readMode, overlay has is-read-mode class to render focused warm dim theater backdrop', () => {
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

    const overlay = container.querySelector('.letter-modal-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveClass('is-read-mode');
  });

  test('in readMode, mobile status bar / theme-color adapts to dim color and restores on exit', () => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#ffffff');
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', '#ffffff');
    }

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

    expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#4e4c4a');

    unmount();

    expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#ffffff');
  });

  test('in readMode with night shift active, theme-color adapts to deep night dim color and restores', () => {
    document.documentElement.classList.add('night-shift');
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#14161a');
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', '#14161a');
    }

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

    expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#08090a');

    unmount();
    document.documentElement.classList.remove('night-shift');
  });

  test('in normal mode (readMode=false), mobile status bar adapts to dim color (#82807f) and restores on exit', () => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#ffffff');
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', '#ffffff');
    }

    const { unmount } = render(
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

    expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#82807f');

    unmount();

    expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#ffffff');
  });

  test('in normal mode with night shift active, theme-color adapts to dim night color (#060607) and restores', () => {
    document.documentElement.classList.add('night-shift');
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#14161a');
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', '#14161a');
    }

    const { unmount } = render(
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

    expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#060607');

    unmount();
    document.documentElement.classList.remove('night-shift');
  });

  test('in readMode, clicking/tapping background does not close modal, only close button closes it', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={handleClose}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          initialOpened={true}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    const overlay = container.querySelector('.letter-modal-overlay');
    fireEvent.click(overlay);
    expect(handleClose).not.toHaveBeenCalled();

    const closeButton = container.querySelector('.letter-modal__close');
    fireEvent.click(closeButton);
      finishFold(container.querySelector('.letter-modal-overlay'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('in normal mode (readMode=false), clicking background closes modal', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={handleClose}
          selectedLetter={sampleLetters[0]}
          readMode={false}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    const overlay = container.querySelector('.letter-modal-overlay');
    fireEvent.click(overlay);
    finishFold(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('in readMode, first-timer tip is shown and dismisses on click', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          initialOpened={true}
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

  test('in readMode, scroll tip appears after envelope opening animation completes', () => {
    jest.useFakeTimers();
    localStorage.removeItem('hasSeenReadModeTip');

    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          initialOpened={false}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    expect(container.querySelector('.read-mode-tip')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    const tip = container.querySelector('.read-mode-tip');
    expect(tip).not.toBeNull();
    expect(tip).toHaveTextContent(/Scroll or swipe down to read more letters/i);

    jest.useRealTimers();
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

  test('triggers Ad lock intermission after viewing 20 letters and enables continue after countdown', () => {
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

    // Navigate through 19 letters (initial letter is letter 1, so 19 steps reaches 20 letters)
    for (let i = 0; i < 19; i++) {
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

    // Now on letter 20. When attempting to scroll to letter 21:
    fireEvent.keyDown(document, { key: 'ArrowDown' });

    // The Ad lock overlay should appear!
    expect(container.querySelector('.read-mode-ad-lock-overlay')).not.toBeNull();
    expect(screen.getByText(/Reading intermission/i)).toBeInTheDocument();
    expect(screen.getByText(/Take a brief pause/i)).toBeInTheDocument();
    expect(screen.getByText(/You’ve read 20 letters/i)).toBeInTheDocument();

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

  test('net-new downward scroll tracking: scrolling back up and down over explored letters does not trigger ad early', () => {
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

    // Scroll down 18 letters (indices 0 to 18: 19 letters uncovered so far)
    for (let i = 0; i < 18; i++) {
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
    expect(currentIdx).toBe(18);
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    // Scroll back up 5 letters (indices 18 -> 17 -> 16 -> 15 -> 14 -> 13)
    for (let i = 0; i < 5; i++) {
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
    expect(currentIdx).toBe(13);
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    // Now re-scroll down 5 letters over the already explored range (indices 13 -> 14 -> 15 -> 16 -> 17 -> 18)
    for (let i = 0; i < 5; i++) {
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
    expect(currentIdx).toBe(18);
    // Crucial check: Ad lock MUST NOT appear because we did not uncover any net-new letters!
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    // Now scroll down 1 net-new letter to index 19 (now 20 letters uncovered: 0 through 19)
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
    expect(currentIdx).toBe(19);
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    // Now attempting to scroll to the 21st net-new letter (index 20): Ad MUST trigger!
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(container.querySelector('.read-mode-ad-lock-overlay')).not.toBeNull();
    expect(screen.getByText(/You’ve read 20 letters/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  test('session-unique upward traversal: navigating upward across 20 unseen letters triggers ad lock intermission', () => {
    jest.useFakeTimers();
    let currentIdx = 24;
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

    // Initial letter is sampleLetters[24] (1 unseen letter)
    // Navigate upward 19 times (indices 24 through 5)
    for (let i = 0; i < 19; i++) {
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
    expect(currentIdx).toBe(5);
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    // Now on letter 20 of this session (index 5). Attempting to navigate upward to index 4 (the 21st unseen letter):
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(container.querySelector('.read-mode-ad-lock-overlay')).not.toBeNull();
    expect(screen.getByText(/Reading intermission/i)).toBeInTheDocument();
    expect(screen.getByText(/Take a brief pause/i)).toBeInTheDocument();
    expect(screen.getByText(/You’ve read 20 letters/i)).toBeInTheDocument();

    const adBtn = container.querySelector('.read-mode-ad-lock-btn');
    expect(adBtn).toBeDisabled();

    // Advance 5s countdown
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(adBtn).not.toBeDisabled();
    expect(adBtn).toHaveTextContent(/Continue reading/i);

    // Click continue reading -> proceeds upward to index 4
    fireEvent.click(adBtn);
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
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();
    expect(currentIdx).toBe(4);

    jest.useRealTimers();
  });

  test('session-unique traversal: flinging/skipping to bottom leaves intermediate letters unrecorded until encountered', () => {
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

    // Initial letter viewed: sampleLetters[0] (count = 1)
    // User flings/jumps straight to the bottom letter: index 20 (skipping 1..19)
    currentIdx = 20;
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

    // Now 2 unique letters seen: index 0 and index 20. Intermediate letters 1..19 remain unseen.
    // User reads upward 18 times: indices 20 through 2
    for (let i = 0; i < 18; i++) {
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
    expect(currentIdx).toBe(2);
    // Total unseen letters encountered = 1 (index 0) + 1 (index 20) + 18 (indices 19..2) = 20 letters.
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    // Re-reading already seen letters downward (2 -> 3 -> 4) and back upward (4 -> 3 -> 2) does NOT trigger ad
    for (let i = 0; i < 2; i++) {
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
    expect(currentIdx).toBe(4);
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    for (let i = 0; i < 2; i++) {
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
    expect(currentIdx).toBe(2);
    expect(container.querySelector('.read-mode-ad-lock-overlay')).toBeNull();

    // Now navigating upward to index 1 (the 21st unseen letter): Ad MUST trigger!
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(container.querySelector('.read-mode-ad-lock-overlay')).not.toBeNull();
    expect(screen.getByText(/You’ve read 20 letters/i)).toBeInTheDocument();

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
          initialOpened={true}
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

describe('Read Mode FAB in Home', () => {
  test('when Read Mode is disabled (default in production), FAB, tooltip, dialog, and Feed Page 2 banner are completely hidden', () => {
    localStorage.removeItem('readModeTipDismissed');
    render(
      <MemoryRouter>
        <Home readModeEnabled={false} />
      </MemoryRouter>
    );

    // No FAB button
    expect(screen.queryByRole('button', { name: /Toggle Read Mode/i })).toBeNull();
    // No suggestion tooltip
    expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();
    // No dialog
    expect(screen.queryByRole('dialog', { name: /Read Mode/i })).toBeNull();

    // Open Feed to check Page 2
    const feedBtn = screen.getByRole('button', { name: /Open updates feed/i });
    fireEvent.click(feedBtn);
    const page2 = screen.getByRole('region', { name: /Recent updates, page 2 of 5/i });
    expect(page2).not.toHaveTextContent(/Newest addition · Read Mode/i);
  });

  test('clicking the Read Mode FAB enables it immediately and shows an info toast', () => {
    render(
      <MemoryRouter>
        <Home readModeEnabled={true} />
      </MemoryRouter>
    );

    const fabButton = screen.getByRole('button', { name: /Toggle Read Mode/i });
    expect(fabButton).toBeInTheDocument();
    expect(fabButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(fabButton);

    expect(fabButton).toHaveAttribute('aria-pressed', 'true');
    expect(toast.info).toHaveBeenCalledWith('Read Mode On', expect.objectContaining({
      position: 'top-center',
    }));
    expect(screen.queryByRole('dialog', { name: /Read Mode/i })).toBeNull();
  });

  test('clicking the FAB again turns Read Mode off without a dialog', () => {
    render(
      <MemoryRouter>
        <Home readModeEnabled={true} />
      </MemoryRouter>
    );

    const fabButton = screen.getByRole('button', { name: /Toggle Read Mode/i });
    fireEvent.click(fabButton);
    expect(fabButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(fabButton);
    expect(fabButton).toHaveAttribute('aria-pressed', 'false');
    expect(toast.info).toHaveBeenLastCalledWith('Read Mode Off', expect.objectContaining({
      position: 'top-center',
    }));
    expect(screen.queryByRole('dialog', { name: /Read Mode/i })).toBeNull();
    expect(localStorage.getItem('readMode')).toBeNull();
  });

  test('Read Mode is never persisted in storage and always defaults to OFF on visit/reload', () => {
    localStorage.setItem('readMode', 'true');

    const { unmount } = render(
      <MemoryRouter>
        <Home readModeEnabled={true} />
      </MemoryRouter>
    );

    const fabButton = screen.getByRole('button', { name: /Toggle Read Mode/i });
    expect(fabButton).toHaveAttribute('aria-pressed', 'false');
    expect(localStorage.getItem('readMode')).toBeNull();

    fireEvent.click(fabButton);
    expect(fabButton).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('readMode')).toBeNull();

    unmount();

    // Fresh visit / reload must default to OFF
    render(
      <MemoryRouter>
        <Home readModeEnabled={true} />
      </MemoryRouter>
    );
    const reloadedFab = screen.getByRole('button', { name: /Toggle Read Mode/i });
    expect(reloadedFab).toHaveAttribute('aria-pressed', 'false');
  });

  test('introductory tooltip for Read Mode is completely removed so visitors can explore the site on their own', () => {
    localStorage.removeItem('readModeTipDismissed');
    localStorage.removeItem('readMode');

    render(
      <MemoryRouter>
        <Home readModeEnabled={true} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Try Read Mode/i })).toBeNull();
  });

  describe('FAB Stack Ordering, Visibility, and Read Mode Onboarding Tooltip', () => {
    beforeEach(() => {
      localStorage.removeItem('hasSeenReadModeTooltip');
      localStorage.removeItem('readMode');
    });

    test('Speed Dial FAB menu renders, expands sub-actions, auto-collapses after 15s, and disables Scroll to Top at scrollY 0', () => {
      jest.useFakeTimers();
      const { container } = render(
        <MemoryRouter>
          <Home readModeEnabled={true} />
        </MemoryRouter>
      );

      const speedDialContainer = container.querySelector('.speed-dial-container');
      expect(speedDialContainer).toBeInTheDocument();
      expect(speedDialContainer).not.toHaveClass('is-open');

      const triggerBtn = screen.getByRole('button', { name: /Open quick actions menu/i });
      const scrollUpBtn = screen.getByRole('button', { name: /Back to top/i });
      const readModeBtn = screen.getByRole('button', { name: /Toggle Read Mode/i });
      const bugReportBtn = screen.getByRole('button', { name: /Report a bug/i });

      expect(triggerBtn).toBeInTheDocument();
      expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
      expect(scrollUpBtn).toBeInTheDocument();
      expect(readModeBtn).toBeInTheDocument();
      expect(bugReportBtn).toBeInTheDocument();

      // Scroll to Top is disabled when at top of page (scrollY === 0)
      expect(scrollUpBtn).toBeDisabled();
      expect(scrollUpBtn).toHaveAttribute('aria-disabled', 'true');
      expect(scrollUpBtn).toHaveClass('is-disabled');

      // Click trigger to expand Speed Dial
      act(() => {
        fireEvent.click(triggerBtn);
      });
      expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');
      expect(speedDialContainer).toHaveClass('is-open');

      // Auto-collapse after 15 seconds of inactivity
      act(() => {
        jest.advanceTimersByTime(15000);
      });
      expect(speedDialContainer).not.toHaveClass('is-open');
      expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');

      // Re-open and select a sub-action (Bug Report): closes speed dial and opens modal
      act(() => {
        fireEvent.click(triggerBtn);
      });
      expect(speedDialContainer).toHaveClass('is-open');

      act(() => {
        fireEvent.click(bugReportBtn);
      });
      expect(speedDialContainer).not.toHaveClass('is-open');
      expect(screen.getByRole('dialog', { name: /Bug Report/i })).toBeInTheDocument();

      jest.useRealTimers();
    });

    test('Read Mode onboarding tooltip triggers after closing a letter and auto-dismisses after 3 seconds', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
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
            <Route path="/letters/:messageId" element={<Home readModeEnabled={true} />} />
            <Route path="/" element={<Home readModeEnabled={true} />} />
          </Routes>
        </MemoryRouter>
      );

      // 1. Initially while letter is open, tooltip is NOT shown
      expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();

      // Wait for modal to open
      await waitFor(() => {
        expect(container.querySelector('.letter-modal-overlay')).toBeInTheDocument();
      });

      // Still not shown while letter is open
      expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();

      // Switch to fake timers to test the 3-second auto-dismiss
      jest.useFakeTimers();

      // 2. Close the letter by clicking the overlay backdrop
      const overlay = container.querySelector('.letter-modal-overlay');
      act(() => {
        fireEvent.click(overlay);
      });
      finishFold(overlay);

      // 3. Tooltip now triggers immediately upon letter closure anchored to main FAB
      const tooltip = screen.getByRole('status', { name: /Read Mode introduction/i });
      expect(tooltip).toBeInTheDocument();
      expect(container.querySelector('.speed-dial-trigger-wrapper .read-mode-onboarding-tooltip')).toBeInTheDocument();
      expect(screen.getByText(/Access Read Mode here/i)).toBeInTheDocument();
      expect(tooltip).not.toHaveTextContent('💡');
      expect(screen.getByText(/Disable typing effects and scroll down to browse through letters/i)).toBeInTheDocument();

      // 4. Advance time by 3 seconds: starts fade out
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(screen.getByRole('status', { name: /Read Mode introduction/i })).toHaveClass('is-fading-out');

      // Advance by remaining 400ms: tooltip unmounts
      act(() => {
        jest.advanceTimersByTime(400);
      });
      expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();

      mockFetch.mockRestore();
      jest.useRealTimers();
    });

    test('shows tooltip for every user and clicking Main FAB highlights Read Mode with glowing blue circle', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
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
            <Route path="/letters/:messageId" element={<Home readModeEnabled={true} />} />
            <Route path="/" element={<Home readModeEnabled={true} />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(container.querySelector('.letter-modal-overlay')).toBeInTheDocument();
      });

      const overlay = container.querySelector('.letter-modal-overlay');
      fireEvent.click(overlay);
      finishFold(overlay);

      // Tooltip appears for user
      const tooltip = screen.getByRole('status', { name: /Read Mode introduction/i });
      expect(tooltip).toBeInTheDocument();

      // Clicking Main FAB because of the tooltip opens speed dial and highlights Read Mode button
      const mainFab = container.querySelector('.speed-dial-trigger');
      fireEvent.click(mainFab);

      // Tooltip is dismissed
      expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();

      // Speed dial is open and Read Mode floating button has glowing circle highlight
      expect(container.querySelector('.speed-dial-container')).toHaveClass('is-open');
      const readModeBtn = container.querySelector('.read-mode-fab');
      expect(readModeBtn).toHaveClass('is-highlighted');

      // Clicking the highlighted Read Mode button dismisses the highlight and opens modal
      fireEvent.click(readModeBtn);
      expect(readModeBtn).not.toHaveClass('is-highlighted');
      expect(screen.getByRole('dialog', { name: /Read Mode/i })).toBeInTheDocument();

      // Close modal and verify regular speed dial click does NOT highlight when tooltip wasn't active
      fireEvent.click(screen.getByRole('button', { name: /Done/i }));
      fireEvent.click(mainFab);
      expect(readModeBtn).not.toHaveClass('is-highlighted');

      mockFetch.mockRestore();
    });

    test('does NOT show tooltip when user exits from a letter that was opened with Read Mode toggled on', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
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
            <Route path="/letters/:messageId" element={<Home readModeEnabled={true} initialReadMode={true} />} />
            <Route path="/" element={<Home readModeEnabled={true} />} />
          </Routes>
        </MemoryRouter>
      );

      // Letter opens in Read Mode
      await waitFor(() => {
        expect(container.querySelector('.letter-modal-overlay.is-read-mode')).toBeInTheDocument();
      });

      // Exit the letter via corner close
      const closeBtn = await screen.findByLabelText('Close letter', {}, { timeout: 3000 });
      fireEvent.click(closeBtn);
      finishFold(container.querySelector('.letter-modal-overlay'));

      // Tooltip should NOT show because user was already in Read Mode
      expect(screen.queryByRole('status', { name: /Read Mode introduction/i })).toBeNull();
      expect(container.querySelector('.read-mode-onboarding-tooltip')).toBeNull();

      mockFetch.mockRestore();
    });
  });

  test('Page 2 of the Feed features the newest addition: Read Mode', async () => {
    const { container } = render(
      <MemoryRouter>
        <Home readModeEnabled={true} />
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
            <Route path="/letters/:messageId" element={<Home initialReadMode={true} readModeEnabled={true} />} />
            <Route path="/" element={<Home initialReadMode={true} readModeEnabled={true} />} />
          </Routes>
        </MemoryRouter>
      );

      // In /letters/letter-1 with readMode=true, wait for linked letter fetch to complete and suspend feed
      await waitFor(() => {
        const feedContainer = container.querySelector('.feed-main-container');
        expect(feedContainer).not.toBeNull();
        expect(feedContainer).toHaveClass('feed-main-container--suspended');
        const app = container.querySelector('.app');
        expect(app).toHaveClass('is-read-mode-active');
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
            <Route path="/letters/:messageId" element={<Home initialReadMode={true} readModeEnabled={true} />} />
            <Route path="/" element={<Home initialReadMode={true} readModeEnabled={true} />} />
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
            <Route path="/letters/:messageId" element={<Home initialReadMode={true} readModeEnabled={true} />} />
            <Route path="/" element={<Home initialReadMode={true} readModeEnabled={true} />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const feedContainer = container.querySelector('.feed-main-container');
        expect(feedContainer).not.toBeNull();
        expect(feedContainer).toHaveClass('feed-main-container--suspended');
      });

      // Close DetailsModal by clicking close button
      const closeButton = await screen.findByLabelText('Close letter', {}, { timeout: 3000 });
      const countBeforeExit = apiCallCount;
      fireEvent.click(closeButton);
      finishFold(container.querySelector('.letter-modal-overlay'));

      // Feed container is unsuspended once folding finishes
      await waitFor(() => {
        const feedContainer = container.querySelector('.feed-main-container');
        expect(feedContainer).not.toHaveClass('feed-main-container--suspended');
      });

      // No new API calls dispatched on exit
      expect(apiCallCount).toBe(countBeforeExit);
    });
  });
});




describe('Letter folding dismissal', () => {
  test.each(['corner', 'Escape'])('%s waits for the exit and dismisses only once', trigger => {
    const close = jest.fn();
    const select = jest.fn();
    const {container} = render(
      <MemoryRouter><DetailsModal showDetailsModal={true} toggleDetailsModal={close}
        selectedLetter={sampleLetters[0]} readMode={true} initialOpened={true} letters={sampleLetters}
        setSelectedLetter={select} /></MemoryRouter>
    );
    if (trigger === 'corner') fireEvent.click(screen.getByLabelText('Close letter'));
    else fireEvent.keyDown(document, {key: 'Escape'});
    const overlay = container.querySelector('.letter-modal-overlay');
    expect(overlay).toHaveClass('is-folding-closed');
    expect(close).not.toHaveBeenCalled();
    fireEvent.keyDown(document, {key: 'ArrowDown'});
    expect(select).not.toHaveBeenCalled();
    fireEvent.animationEnd(container.querySelector('.letter-envelope--closing .letter-envelope__note'), {animationName: 'letter-env-note-close'});
    expect(container.querySelector('.letter-envelope--closing .letter-envelope__seal')).toBeNull();
    expect(close).not.toHaveBeenCalled();
    finishFold(overlay);
    finishFold(overlay);
    expect(close).toHaveBeenCalledTimes(1);
  });

  test('reduced motion completes with the short fade fallback', () => {
    jest.useFakeTimers();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn(query => ({matches: query.includes('prefers-reduced-motion')}));
    try {
      const close = jest.fn();
      render(<MemoryRouter><DetailsModal showDetailsModal={true} toggleDetailsModal={close}
        selectedLetter={sampleLetters[0]} readMode={true} initialOpened={true} /></MemoryRouter>);
      fireEvent.click(screen.getByLabelText('Close letter'));
      expect(close).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(120));
      expect(close).toHaveBeenCalledTimes(1);
    } finally {
      window.matchMedia = originalMatchMedia;
      jest.useRealTimers();
    }
  });
});

describe('Read Mode background tap fold tooltip', () => {
  test('tapping background in read mode shows tooltip for 2 seconds directing user to folded corner', () => {
    jest.useFakeTimers();
    const close = jest.fn();
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={close}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          initialOpened={true}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    // Initially tooltip is not present
    expect(screen.queryByRole('status', { name: /Close letter hint/i })).toBeNull();
    const overlay = container.querySelector('.letter-modal-overlay');

    // Tap/click the background
    fireEvent.click(overlay);

    // Modal does not close
    expect(close).not.toHaveBeenCalled();

    // Tooltip is shown and corner has hint animation
    const tip = screen.getByRole('status', { name: /Close letter hint/i });
    expect(tip).toBeInTheDocument();
    expect(tip).toHaveTextContent(/folded corner to close/i);
    expect(container.querySelector('.letter-modal__close')).toHaveClass('is-hinted');

    // Advance by 1s: still visible
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('status', { name: /Close letter hint/i })).toBeInTheDocument();

    // Tapping background again resets the 2-second timer
    fireEvent.click(overlay);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('status', { name: /Close letter hint/i })).toBeInTheDocument();

    // Advance another 1s (total 2s from last tap) -> fading out
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(tip).toHaveClass('is-fading-out');

    // Advance remaining 400ms fade transition -> unmounts
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(screen.queryByRole('status', { name: /Close letter hint/i })).toBeNull();
    expect(container.querySelector('.letter-modal__close')).not.toHaveClass('is-hinted');

    jest.useRealTimers();
  });

  test('tapping the fold tooltip itself triggers letter close', () => {
    const close = jest.fn();
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={close}
          selectedLetter={sampleLetters[0]}
          readMode={true}
          initialOpened={true}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    const overlay = container.querySelector('.letter-modal-overlay');
    fireEvent.click(overlay);

    const tip = screen.getByRole('status', { name: /Close letter hint/i });
    expect(tip).toBeInTheDocument();

    // Clicking tooltip closes the letter
    fireEvent.click(tip);
    expect(overlay).toHaveClass('is-folding-closed');
  });

  test('in normal mode (readMode=false), tapping background closes modal directly without showing fold tooltip', () => {
    const close = jest.fn();
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={close}
          selectedLetter={sampleLetters[0]}
          readMode={false}
          letters={sampleLetters}
        />
      </MemoryRouter>
    );

    const overlay = container.querySelector('.letter-modal-overlay');
    fireEvent.click(overlay);

    expect(screen.queryByRole('status', { name: /Close letter hint/i })).toBeNull();
    expect(overlay).toHaveClass('is-folding-closed');
  });

  describe('Background pre-rendering of next unread letter in Read Mode', () => {
    const lettersWithMedia = [
      {
        _id: 'letter-1',
        from: 'Alice',
        to: 'Bob',
        message: 'First letter',
        timestamp: '2024-01-01T12:00:00.000Z',
        approve: true,
        reads: 10,
        echoes: { love: 1, sad: 0 },
      },
      {
        _id: 'letter-2',
        from: 'Charlie',
        to: 'David',
        message: 'Second letter with Spotify\n\nhttps://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
        timestamp: '2024-01-01T13:00:00.000Z',
        approve: true,
        reads: 20,
        echoes: { love: 2, sad: 0 },
      },
      {
        _id: 'letter-3',
        from: 'Eve',
        to: 'Frank',
        message: 'Third letter with YouTube\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ',
        timestamp: '2024-01-01T14:00:00.000Z',
        approve: true,
        reads: 30,
        echoes: { love: 3, sad: 0 },
      },
    ];

    test('pre-renders the single next unread letter in the background with eager media in readMode', () => {
      const { container } = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={lettersWithMedia[0]}
            readMode={true}
            initialOpened={true}
            letters={lettersWithMedia}
          />
        </MemoryRouter>
      );

      const prerenderWrapper = container.querySelector('.read-mode-prerender-wrapper');
      expect(prerenderWrapper).not.toBeNull();
      expect(prerenderWrapper).toHaveAttribute('aria-hidden', 'true');
      expect(prerenderWrapper).toHaveAttribute('tabindex', '-1');

      // The pre-rendered letter is letter-2
      const prerenderBody = prerenderWrapper.querySelector('.letter-paper__body');
      expect(prerenderBody).toHaveTextContent('Second letter with Spotify');

      // Spotify preview is rendered eagerly
      const spotifyIframe = prerenderWrapper.querySelector('iframe[title="spotify-preview-prerender"]');
      expect(spotifyIframe).not.toBeNull();
      expect(spotifyIframe).toHaveAttribute('loading', 'eager');
      expect(spotifyIframe.src).toContain('https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT');

      // Exactly ONE prerender wrapper exists (only the single next letter)
      expect(container.querySelectorAll('.read-mode-prerender-wrapper')).toHaveLength(1);
    });

    test('does NOT pre-render next letter if it has already been viewed in the session', () => {
      // Mark letter-2 as already viewed in this session
      viewedLetterIds.add('letter-2');

      const { container } = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={lettersWithMedia[0]}
            readMode={true}
            initialOpened={true}
            letters={lettersWithMedia}
          />
        </MemoryRouter>
      );

      // Since letter-2 is already viewed and letter-1 has no prev letter, prerenderWrapper should be null
      const prerenderWrapper = container.querySelector('.read-mode-prerender-wrapper');
      expect(prerenderWrapper).toBeNull();
    });

    test('pre-renders previous unread letter when scrolling upward', () => {
      // User is on letter-2, letter-1 is unread
      const { container } = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={lettersWithMedia[1]}
            readMode={true}
            initialOpened={true}
            letters={lettersWithMedia}
          />
        </MemoryRouter>
      );

      // Simulate scrolling up (wheel with negative deltaY)
      act(() => {
        const wheelEvent = new Event('wheel', { bubbles: true, cancelable: true });
        Object.defineProperty(wheelEvent, 'deltaY', { value: -20 });
        window.dispatchEvent(wheelEvent);
      });

      const prerenderWrapper = container.querySelector('.read-mode-prerender-wrapper');
      expect(prerenderWrapper).not.toBeNull();
      // Should pre-render letter-1 (the upward unread letter)
      const prerenderBody = prerenderWrapper.querySelector('.letter-paper__body');
      expect(prerenderBody).toHaveTextContent('First letter');
    });

    test('never renders background pre-renderer when readMode is false', () => {
      const { container } = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={lettersWithMedia[0]}
            readMode={false}
            initialOpened={true}
            letters={lettersWithMedia}
          />
        </MemoryRouter>
      );

      expect(container.querySelector('.read-mode-prerender-wrapper')).toBeNull();
    });

    test('pre-rendered YouTube embed has mute=1 and autoplay=0', () => {
      const { container } = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={lettersWithMedia[1]}
            readMode={true}
            initialOpened={true}
            letters={lettersWithMedia}
          />
        </MemoryRouter>
      );

      const prerenderWrapper = container.querySelector('.read-mode-prerender-wrapper');
      expect(prerenderWrapper).not.toBeNull();

      const ytIframe = prerenderWrapper.querySelector('iframe[title="YouTube video player prerender"]');
      expect(ytIframe).not.toBeNull();
      expect(ytIframe.src).toContain('autoplay=0');
      expect(ytIframe.src).toContain('mute=1');
      expect(ytIframe).toHaveAttribute('loading', 'eager');
    });

    test('does not render any seal or heart element in the envelope opening animation', () => {
      const { container } = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={lettersWithMedia[0]}
            readMode={true}
            initialOpened={false}
            letters={lettersWithMedia}
          />
        </MemoryRouter>
      );

      expect(container.querySelector('.letter-envelope')).not.toBeNull();
      expect(container.querySelector('.letter-envelope__seal')).toBeNull();
      expect(container.textContent).not.toContain('♥');
    });
  });
});
