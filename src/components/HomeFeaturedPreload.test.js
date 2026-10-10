import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

jest.mock('react-lottie-player', () => () => null);
jest.mock('./AdComponent', () => () => null);
jest.mock('./AdsterraNativeBanner', () => () => null);
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

const originalFetch = global.fetch;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('ltc-ui-update-announcement-v1', 'true');
  sessionStorage.clear();
  document.body.style.overflow = '';
  window.scrollTo = jest.fn();
  HTMLElement.prototype.scrollTo = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('Featured Letter Preload on Site Load', () => {
  const regularLetter = {
    _id: 'regular-letter-1',
    from: 'Regular Alice',
    to: 'Regular Bob',
    message: 'Hello from the normal feed',
    timestamp: new Date().toISOString(),
    approve: true,
    reads: 0,
    echoes: {},
  };

  const featuredLetter = {
    _id: 'featured-letter-1',
    from: 'Featured Casper',
    to: 'Featured Friend',
    message: 'Special featured love letter',
    timestamp: new Date().toISOString(),
    approve: true,
    reads: 10,
    echoes: { love: 5 },
    isFeatured: true,
  };

  test('calls /featured immediately when the site loads and switches instantly on click', async () => {
    let featuredFetchCount = 0;

    global.fetch = jest.fn(async (url) => {
      if (typeof url === 'string' && url.includes('/featured')) {
        featuredFetchCount++;
        return {
          ok: true,
          json: async () => ({
            messages: [featuredLetter],
            counts: { approved: 1, unapproved: 0 },
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          messages: [regularLetter],
          counts: { approved: 1, unapproved: 0 },
        }),
      };
    });

    render(
      <MemoryRouter>
        <Home readModeEnabled={false} />
      </MemoryRouter>
    );

    // Initial regular letter is loaded
    await waitFor(() => {
      expect(screen.getByText('Hello from the normal feed')).toBeInTheDocument();
    });

    // Verify /featured was called on site load
    expect(featuredFetchCount).toBe(1);

    // Find the Featured card in the feed
    const featuredCard = document.querySelector('.letter-card--featured');
    expect(featuredCard).toBeInTheDocument();

    // Click the featured card
    fireEvent.click(featuredCard);

    // The featured letter should now be visible in the feed
    await waitFor(() => {
      expect(screen.getByText('Special featured love letter')).toBeInTheDocument();
    });

    // Ensure NO additional /featured request was made on click because it used the preloaded cache
    expect(featuredFetchCount).toBe(1);

    // Click again to toggle back
    fireEvent.click(featuredCard);

    // Regular letter should be restored
    await waitFor(() => {
      expect(screen.getByText('Hello from the normal feed')).toBeInTheDocument();
    });
  });

  test('waits for in-flight preload if clicked immediately before initial request finishes', async () => {
    let resolveFeaturedPromise;
    let featuredFetchCount = 0;

    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && url.includes('/featured')) {
        featuredFetchCount++;
        return new Promise((resolve) => {
          resolveFeaturedPromise = resolve;
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          messages: [regularLetter],
          counts: { approved: 1, unapproved: 0 },
        }),
      });
    });

    render(
      <MemoryRouter>
        <Home readModeEnabled={false} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hello from the normal feed')).toBeInTheDocument();
    });

    expect(featuredFetchCount).toBe(1);

    const featuredCard = document.querySelector('.letter-card--featured');
    expect(featuredCard).toBeInTheDocument();

    // User clicks while preload is still pending
    fireEvent.click(featuredCard);

    // Now resolve the in-flight preload
    resolveFeaturedPromise({
      ok: true,
      json: async () => ({
        messages: [featuredLetter],
        counts: { approved: 1, unapproved: 0 },
      }),
    });

    // The featured letter becomes visible
    await waitFor(() => {
      expect(screen.getByText('Special featured love letter')).toBeInTheDocument();
    });

    // No redundant second fetch was made
    expect(featuredFetchCount).toBe(1);
  });
});

