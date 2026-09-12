import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DetailsModal, { extractMediaLinks } from './DetailsModal';

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

  test('renders NO media player when letter has no song links', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailsModal
          showDetailsModal={true}
          toggleDetailsModal={jest.fn()}
          selectedLetter={plainLetter}
          readMode={true}
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
