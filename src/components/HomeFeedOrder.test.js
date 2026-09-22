import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { adminId } from '../data/target_letters';

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

describe('Home Feed Letter Ordering and Deduplication', () => {
  test('unpinned admin letter from offset=0 is not injected at the bottom of the feed', async () => {
    const now = Date.now();
    const futureDate = new Date(now + 86400000).toISOString();

    const pinnedLetter = {
      _id: 'pinned-letter-1',
      from: 'Pinned Sender',
      to: 'Pinned Recipient',
      message: 'Pinned Message',
      timestamp: new Date(now - 10000).toISOString(),
      pinned_at: new Date(now - 5000).toISOString(),
      pin_expires_at: futureDate,
      is_pinned: true,
      approve: true,
      reads: 0,
      echoes: {},
    };

    // Legacy admin letter from 2023 that backend injects at offset 0
    const adminLetter = {
      _id: adminId,
      from: 'Admin Sender',
      to: 'Admin Recipient',
      message: 'Admin Message',
      timestamp: '2023-06-21T07:17:34.745Z',
      approve: true,
      reads: 0,
      echoes: {},
    };

    const regularNewerLetter = {
      _id: 'newer-letter',
      from: 'Newer Sender',
      to: 'Newer Recipient',
      message: 'Newer Message',
      timestamp: new Date(now - 1000).toISOString(),
      approve: true,
      reads: 0,
      echoes: {},
    };

    const mockMessages = [adminLetter, pinnedLetter, regularNewerLetter];

    global.fetch = jest.fn(async (url) => {
      if (typeof url === 'string' && url.includes('/featured')) {
        return {
          ok: true,
          json: async () => [],
        };
      }
      return {
        ok: true,
        json: async () => ({
          messages: mockMessages,
          counts: { approved: mockMessages.length, unapproved: 0 },
          featured: null,
        }),
      };
    });

    render(
      <MemoryRouter>
        <Home readModeEnabled={false} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pinned Message')).toBeInTheDocument();
    });

    expect(screen.getByText('Newer Message')).toBeInTheDocument();
    // The unpinned admin letter must NOT appear at the top or at the bottom
    expect(screen.queryByText('Admin Message')).not.toBeInTheDocument();

    const letterCards = document.querySelectorAll('.letter-card:not(.letter-card--featured)');
    expect(letterCards.length).toBe(2);
    expect(letterCards[0]).toHaveTextContent('Pinned Message');
    expect(letterCards[1]).toHaveTextContent('Newer Message');
  });

  test('pinned admin letter is displayed in top pinned letters', async () => {
    const now = Date.now();
    const futureDate = new Date(now + 86400000).toISOString();

    const pinnedAdminLetter = {
      _id: adminId,
      from: 'Admin Sender',
      to: 'Admin Recipient',
      message: 'Pinned Admin Message',
      timestamp: '2023-06-21T07:17:34.745Z',
      pinned_at: new Date(now - 1000).toISOString(),
      pin_expires_at: futureDate,
      is_pinned: true,
      approve: true,
      reads: 0,
      echoes: {},
    };

    const regularLetter = {
      _id: 'regular-letter',
      from: 'Regular Sender',
      to: 'Regular Recipient',
      message: 'Regular Message',
      timestamp: new Date(now - 2000).toISOString(),
      approve: true,
      reads: 0,
      echoes: {},
    };

    const mockMessages = [pinnedAdminLetter, regularLetter];

    global.fetch = jest.fn(async (url) => {
      if (typeof url === 'string' && url.includes('/featured')) {
        return {
          ok: true,
          json: async () => [],
        };
      }
      return {
        ok: true,
        json: async () => ({
          messages: mockMessages,
          counts: { approved: mockMessages.length, unapproved: 0 },
          featured: null,
        }),
      };
    });

    render(
      <MemoryRouter>
        <Home readModeEnabled={false} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pinned Admin Message')).toBeInTheDocument();
    });

    expect(screen.getByText('Regular Message')).toBeInTheDocument();
    const letterCards = document.querySelectorAll('.letter-card:not(.letter-card--featured)');
    expect(letterCards.length).toBe(2);
    expect(letterCards[0]).toHaveTextContent('Pinned Admin Message');
    expect(letterCards[1]).toHaveTextContent('Regular Message');
  });

  test('duplicate letters are filtered out and not rendered identically', async () => {
    const now = Date.now();
    const duplicateLetter1 = {
      _id: 'dup-letter-1',
      from: 'Sender 1',
      to: 'Recipient 1',
      message: 'Unique Message 1',
      timestamp: new Date(now - 1000).toISOString(),
      approve: true,
      reads: 0,
      echoes: {},
    };
    const duplicateLetter2 = {
      _id: 'dup-letter-1', // same ID
      from: 'Sender 1',
      to: 'Recipient 1',
      message: 'Unique Message 1',
      timestamp: new Date(now - 1000).toISOString(),
      approve: true,
      reads: 0,
      echoes: {},
    };

    const mockMessages = [duplicateLetter1, duplicateLetter2];

    global.fetch = jest.fn(async (url) => {
      if (typeof url === 'string' && url.includes('/featured')) {
        return {
          ok: true,
          json: async () => [],
        };
      }
      return {
        ok: true,
        json: async () => ({
          messages: mockMessages,
          counts: { approved: mockMessages.length, unapproved: 0 },
          featured: null,
        }),
      };
    });

    render(
      <MemoryRouter>
        <Home readModeEnabled={false} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Unique Message 1')).toBeInTheDocument();
    });

    const letterCards = document.querySelectorAll('.letter-card:not(.letter-card--featured)');
    expect(letterCards.length).toBe(1);
  });
});
