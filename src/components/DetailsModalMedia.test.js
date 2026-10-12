import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DetailsModal, { extractMediaLinks } from './DetailsModal';
import ErrorBoundary from './ErrorBoundary';

jest.mock('react-lottie-player', () => () => null);
jest.mock('./AdComponent', () => () => null);
jest.mock('./AdsterraNativeBanner', () => () => null);
jest.mock('../data/keys', () => ({
  render_url: 'https://example.test/api/messages',
  api_key: 'test',
}));

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
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

describe('extractMediaLinks helper', () => {
  test('extracts Spotify track IDs from various URL formats', () => {
    const urls = [
      'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
      'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=abc123xyz',
      'https://open.spotify.com/intl-pt/track/4cOdK2wGLETKBW3PvgPWqT',
      'https://open.spotify.com/intl-es/track/4cOdK2wGLETKBW3PvgPWqT?si=context987',
      'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT',
    ];

    urls.forEach((url) => {
      const result = extractMediaLinks(`Check out this song\n\n${url}`);
      expect(result.spotifyLink).not.toBeNull();
      expect(result.spotifyLink.id).toBe('4cOdK2wGLETKBW3PvgPWqT');
      expect(result.youtubeLink).toBeNull();
      expect(result.newMessage).toBe('Check out this song');
    });
  });

  test('extracts YouTube video IDs from various URL formats', () => {
    const urls = [
      'https://youtu.be/dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ?si=abcdef12345',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ];

    urls.forEach((url) => {
      const result = extractMediaLinks(`Listen to this\n\n${url}`);
      expect(result.youtubeLink).not.toBeNull();
      expect(result.youtubeLink.id).toBe('dQw4w9WgXcQ');
      expect(result.spotifyLink).toBeNull();
      expect(result.newMessage).toBe('Listen to this');
    });
  });

  test('returns null media links when no URL is present', () => {
    const result = extractMediaLinks('Just a lovely letter without any songs or videos.');
    expect(result.spotifyLink).toBeNull();
    expect(result.youtubeLink).toBeNull();
    expect(result.newMessage).toBe('Just a lovely letter without any songs or videos.');
  });

  test('handles null, undefined, or empty messages gracefully', () => {
    expect(extractMediaLinks(null)).toEqual({
      spotifyLink: null,
      youtubeLink: null,
      newMessage: '',
    });
    expect(extractMediaLinks(undefined)).toEqual({
      spotifyLink: null,
      youtubeLink: null,
      newMessage: '',
    });
    expect(extractMediaLinks('')).toEqual({
      spotifyLink: null,
      youtubeLink: null,
      newMessage: '',
    });
  });

  test('enforces mutual exclusivity if both links are present', () => {
    const message = 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT and also https://youtu.be/dQw4w9WgXcQ';
    const result = extractMediaLinks(message);
    expect(result.spotifyLink).not.toBeNull();
    expect(result.youtubeLink).toBeNull();
  });
});

describe('DetailsModal media preview rendering & isolation', () => {
  let handleYoutubeStateChange;

  beforeEach(() => {
    handleYoutubeStateChange = null;
    window.YT = {
      PlayerState: {PLAYING: 1},
      Player: jest.fn((iframe, options) => {
        handleYoutubeStateChange = options.events.onStateChange;
        return {destroy: jest.fn()};
      }),
    };
  });

  const spotifyLetter = {
    _id: 'letter-spotify',
    from: 'Alice',
    to: 'Bob',
    message: 'A letter with Spotify\n\nhttps://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    timestamp: '2024-01-01T12:00:00.000Z',
    approve: true,
    reads: 1,
    echoes: { love: 1, sad: 0 },
  };

  const youtubeLetter = {
    _id: 'letter-youtube',
    from: 'Bob',
    to: 'Alice',
    message: 'A letter with YouTube\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timestamp: '2024-01-01T12:00:00.000Z',
    approve: true,
    reads: 2,
    echoes: { love: 2, sad: 0 },
  };

  const plainLetter = {
    _id: 'letter-plain',
    from: 'Casper',
    to: 'Friend',
    message: 'Just a plain letter with no attachments.',
    timestamp: '2024-01-01T12:00:00.000Z',
    approve: true,
    reads: 3,
    echoes: { love: 0, sad: 1 },
  };

  test('renders ONLY Spotify player when only Spotify link is added', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={spotifyLetter}
          readMode={true}
          initialOpened={true}
          letters={[spotifyLetter]}
        />
      </MemoryRouter>
    );

    const spotifyIframe = container.querySelector('iframe[title="spotify-preview"]');
    const youtubeIframe = container.querySelector('iframe[title="YouTube video player"]');

    expect(spotifyIframe).not.toBeNull();
    expect(spotifyIframe.src).toContain('https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT');
    expect(youtubeIframe).toBeNull();
  });

  test('renders ONLY YouTube player when only YouTube link is added', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={youtubeLetter}
          readMode={true}
          initialOpened={true}
          letters={[youtubeLetter]}
        />
      </MemoryRouter>
    );

    const spotifyIframe = container.querySelector('iframe[title="spotify-preview"]');
    const youtubeIframe = container.querySelector('iframe[title="YouTube video player"]');

    expect(youtubeIframe).not.toBeNull();
    expect(youtubeIframe.src).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(spotifyIframe).toBeNull();
  });

  test('adds the letter glow only while the YouTube player is playing', async () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={youtubeLetter}
          readMode={true}
          initialOpened={true}
          letters={[youtubeLetter]}
        />
      </MemoryRouter>
    );

    const iframe = container.querySelector('iframe[title="YouTube video player"]');
    const modal = container.querySelector('.letter-modal');
    expect(iframe.src).toContain('enablejsapi=1');
    expect(modal).not.toHaveClass('is-youtube-playing');

    await waitFor(() => expect(handleYoutubeStateChange).toEqual(expect.any(Function)));
    act(() => {
      handleYoutubeStateChange({data: 1});
    });
    expect(modal).toHaveClass('is-youtube-playing');
    expect(container.querySelector('.music-visualizer')).not.toBeNull();

    act(() => {
      handleYoutubeStateChange({data: 2});
    });
    expect(modal).not.toHaveClass('is-youtube-playing');
    expect(container.querySelector('.music-visualizer')).toBeNull();
  });

  test('renders NO media player when letter has no song links', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={plainLetter}
          readMode={true}
          initialOpened={true}
          letters={[plainLetter]}
        />
      </MemoryRouter>
    );

    expect(container.querySelector('iframe[title="spotify-preview"]')).toBeNull();
    expect(container.querySelector('iframe[title="YouTube video player"]')).toBeNull();
  });

  test('cleanly switches media when scrolling/navigating from Spotify letter to YouTube letter', () => {
    const letters = [spotifyLetter, youtubeLetter, plainLetter];

    const { container, rerender } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={spotifyLetter}
          readMode={true}
          initialOpened={true}
          letters={letters}
        />
      </MemoryRouter>
    );

    // Initial state: Spotify only
    expect(container.querySelector('iframe[title="spotify-preview"]')).not.toBeNull();
    expect(container.querySelector('iframe[title="YouTube video player"]')).toBeNull();

    // Navigate to YouTube letter
    rerender(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={youtubeLetter}
          readMode={true}
          initialOpened={true}
          letters={letters}
        />
      </MemoryRouter>
    );

    // After navigate: YouTube only, Spotify completely removed
    expect(container.querySelector('iframe[title="spotify-preview"]')).toBeNull();
    const ytIframe = container.querySelector('iframe[title="YouTube video player"]');
    expect(ytIframe).not.toBeNull();
    expect(ytIframe.src).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');

    // Navigate to plain letter
    rerender(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={plainLetter}
          readMode={true}
          letters={letters}
        />
      </MemoryRouter>
    );

    // After navigate: both iframes removed
    expect(container.querySelector('iframe[title="spotify-preview"]')).toBeNull();
    expect(container.querySelector('iframe[title="YouTube video player"]')).toBeNull();
  });
});

describe('Stamp tooltip placement', () => {
  const sampleLetter = {
    _id: 'sample-stamp-1',
    to: 'Casper',
    message: 'Hello Casper',
    timestamp: '2026-03-20T10:00:00Z',
    reads: 5,
  };

  test('places stamp tooltip on the left side in desktop view and on bottom in mobile view', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query.includes('min-width: 769px'),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    let container;
    let rerender;
    act(() => {
      const res = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={sampleLetter}
            initialOpened={true}
          />
        </MemoryRouter>
      );
      container = res.container;
      rerender = res.rerender;
    });

    const stampBtnDesktop = container.querySelector('.letter-paper__stamp-btn');
    expect(stampBtnDesktop).not.toBeNull();
    expect(stampBtnDesktop.getAttribute('data-tooltip-place')).toBe('left');

    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    window.innerWidth = 500;

    act(() => {
      rerender(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={sampleLetter}
            initialOpened={true}
          />
        </MemoryRouter>
      );
      window.dispatchEvent(new Event('resize'));
    });

    const stampBtnMobile = container.querySelector('.letter-paper__stamp-btn');
    expect(stampBtnMobile.getAttribute('data-tooltip-place')).toBe('bottom');
  });
});

describe('Read Mode media stability, crash prevention, and YouTube scroll fixes', () => {
  const youtubeLetter1 = {
    _id: 'yt-1',
    from: 'Sender 1',
    to: 'Recipient 1',
    message: 'First YouTube letter\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timestamp: '2024-01-01T12:00:00.000Z',
    approve: true,
    reads: 1,
    echoes: { love: 1, sad: 0 },
  };

  const youtubeLetter2 = {
    _id: 'yt-2',
    from: 'Sender 2',
    to: 'Recipient 2',
    message: 'Second YouTube letter\n\nhttps://www.youtube.com/watch?v=jNQXAC9IVRw',
    timestamp: '2024-01-01T13:00:00.000Z',
    approve: true,
    reads: 2,
    echoes: { love: 2, sad: 0 },
  };

  test('renders YouTube thumbnail background and eager loading on active YouTube container to prevent black frame', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={youtubeLetter1}
          readMode={true}
          initialOpened={true}
          letters={[youtubeLetter1]}
        />
      </MemoryRouter>
    );

    const mediaWrapper = container.querySelector('.letter-paper__media--youtube');
    const ytIframe = container.querySelector('iframe[title="YouTube video player"]');
    expect(mediaWrapper).not.toBeNull();
    expect(mediaWrapper.style.backgroundImage).toContain('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(ytIframe).not.toBeNull();
    expect(ytIframe.getAttribute('loading')).toBe('eager');
  });

  test('recovers cleanly without DOM removeChild crash if YT.Player.destroy() detaches the iframe node', () => {
    window.YT = {
      PlayerState: { PLAYING: 1 },
      Player: jest.fn((iframe) => ({
        destroy: jest.fn(() => {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }),
      })),
    };

    const { container, rerender } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={youtubeLetter1}
          readMode={true}
          initialOpened={true}
          letters={[youtubeLetter1, youtubeLetter2]}
        />
      </MemoryRouter>
    );

    expect(container.querySelector('iframe[title="YouTube video player"]')).not.toBeNull();

    // Switching letters unmounts the first YouTube iframe after YT.Player.destroy() ran
    expect(() => {
      rerender(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={youtubeLetter2}
            readMode={true}
            initialOpened={true}
            letters={[youtubeLetter1, youtubeLetter2]}
          />
        </MemoryRouter>
      );
    }).not.toThrow();

    const nextIframe = container.querySelector('iframe[title="YouTube video player"]');
    expect(nextIframe).not.toBeNull();
    expect(nextIframe.src).toContain('jNQXAC9IVRw');
  });

  test('does not mount duplicate outgoing iframes or background prerender iframes during the 520ms slide animation', () => {
    jest.useFakeTimers();
    try {
      const setSelectedLetter = jest.fn();
      const { container, rerender } = render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={youtubeLetter1}
            readMode={true}
            initialOpened={true}
            letters={[youtubeLetter1, youtubeLetter2]}
            setSelectedLetter={setSelectedLetter}
          />
        </MemoryRouter>
      );

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(setSelectedLetter).toHaveBeenCalledWith(youtubeLetter2);

      rerender(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={youtubeLetter2}
            readMode={true}
            initialOpened={true}
            letters={[youtubeLetter1, youtubeLetter2]}
            setSelectedLetter={setSelectedLetter}
          />
        </MemoryRouter>
      );

      // While slide animation is active:
      expect(container.querySelector('.read-mode-card-wrapper.is-exiting-next')).not.toBeNull();
      expect(container.querySelector('iframe[title="YouTube video player outgoing"]')).toBeNull();
      expect(container.querySelector('iframe[title="spotify-preview-outgoing"]')).toBeNull();
      expect(container.querySelector('.read-mode-prerender-wrapper')).toBeNull();

      // Active incoming YouTube iframe is the ONLY iframe mounted during slide
      const allIframes = container.querySelectorAll('iframe');
      expect(allIframes).toHaveLength(1);
      expect(allIframes[0].src).toContain('jNQXAC9IVRw');

      act(() => {
        jest.advanceTimersByTime(550);
      });

      expect(container.querySelector('.read-mode-card-wrapper.is-exiting-next')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  test('wheel scrolling inside a letter whose outer .letter-paper overflows due to YouTube attachment scrolls the card before jumping to next letter', () => {
    const setSelectedLetter = jest.fn();
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={youtubeLetter1}
          readMode={true}
          initialOpened={true}
          letters={[youtubeLetter1, youtubeLetter2]}
          setSelectedLetter={setSelectedLetter}
        />
      </MemoryRouter>
    );

    const paperEl = container.querySelector('.letter-paper');
    expect(paperEl).not.toBeNull();

    // Simulate outer .letter-paper overflowing because of the 16:9 YouTube player at the bottom
    Object.defineProperty(paperEl, 'scrollHeight', { value: 780, configurable: true });
    Object.defineProperty(paperEl, 'clientHeight', { value: 520, configurable: true });
    Object.defineProperty(paperEl, 'scrollTop', { value: 40, writable: true, configurable: true });

    // Scrolling down over the letter should allow native scroll inside .letter-paper instead of jumping to next letter
    fireEvent.wheel(paperEl, { deltaY: 90 });
    expect(setSelectedLetter).not.toHaveBeenCalled();

    // Once scrolled to the bottom of .letter-paper, scrolling down advances to the next letter
    paperEl.scrollTop = 260;
    fireEvent.wheel(paperEl, { deltaY: 90 });
    expect(setSelectedLetter).toHaveBeenCalledWith(youtubeLetter2);
  });

  test('does not crash when a letter has a future or skewed timestamp in Read Mode', () => {
    const futureLetter = {
      ...youtubeLetter1,
      _id: 'future-1',
      timestamp: new Date(Date.now() + 120000).toISOString(),
    };

    expect(() => {
      render(
        <MemoryRouter>
          <DetailsModal
            showDetailsModal={true}
            toggleDetailsModal={jest.fn()}
            selectedLetter={futureLetter}
            readMode={true}
            initialOpened={true}
            letters={[futureLetter]}
          />
        </MemoryRouter>
      );
    }).not.toThrow();
  });

  test('ErrorBoundary respects fallback={null} and resets when resetKey changes', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const Thrower = ({ shouldThrow }) => {
      if (shouldThrow) throw new Error('Transient modal error');
      return <div data-testid="recovered-child">Healthy modal</div>;
    };

    const { container, rerender, getByTestId } = render(
      <ErrorBoundary fallback={null} resetKey="key-1">
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.innerHTML).toBe('');

    rerender(
      <ErrorBoundary fallback={null} resetKey="key-2">
        <Thrower shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByTestId('recovered-child')).toBeInTheDocument();
    spy.mockRestore();
  });
});


