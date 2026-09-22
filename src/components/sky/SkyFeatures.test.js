import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { io } from 'socket.io-client';
import Sky from './Sky';
import SkyMoon from './SkyMoon';
import { getMoonPhase } from './lunar';
import { STAR_TINTS } from './tints';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));

describe('Sky Lunar calculations & SkyMoon component', () => {
  test('accurately calculates new moon and full moon phases', () => {
    // Reference New Moon: Jan 11, 2024 11:57 UTC
    const newMoonDate = new Date(Date.UTC(2024, 0, 11, 11, 57, 0));
    const newMoon = getMoonPhase(newMoonDate);
    expect(newMoon.name).toBe('New Moon');
    expect(newMoon.illumination).toBeLessThanOrEqual(5);

    // Full Moon approximately 14.76 days later (~Jan 25, 2024)
    const fullMoonDate = new Date(Date.UTC(2024, 0, 26, 0, 0, 0));
    const fullMoon = getMoonPhase(fullMoonDate);
    expect(fullMoon.name).toBe('Full Moon');
    expect(fullMoon.illumination).toBeGreaterThanOrEqual(95);
  });

  test('SkyMoon renders accessible button and displays full details card on click', () => {
    const testDate = new Date(Date.UTC(2024, 0, 26, 0, 0, 0));
    render(<SkyMoon date={testDate} />);
    const moonButton = screen.getByRole('button', { name: /Moon phase: Full Moon/i });
    expect(moonButton).toBeInTheDocument();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(moonButton);
    expect(screen.getByRole('dialog', { name: /Moon details: Full Moon/i })).toBeInTheDocument();
    expect(screen.getByText('Full Moon')).toBeInTheDocument();
    expect(screen.getByText(/Sky Position:/i)).toBeInTheDocument();
    expect(screen.getByText(/Accurate based on the sky today/i)).toBeInTheDocument();
    expect(screen.getByText(/Look up at the moon tonight/i)).toBeInTheDocument();

    // Close with close button
    const closeBtn = screen.getByRole('button', { name: 'Close moon details' });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Sky Interactive Features Integration', () => {
  let handlers;
  let socket;

  beforeEach(() => {
    jest.useFakeTimers();
    process.env.REACT_APP_SKY_SOCKET_URL = 'https://sky.example';
    handlers = {};
    socket = {
      connected: true,
      on: jest.fn((name, fn) => { handlers[name] = fn; }),
      connect: jest.fn(),
      disconnect: jest.fn(),
      removeAllListeners: jest.fn(),
      timeout: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    socket.volatile = socket;
    io.mockReturnValue(socket);
    HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
    window.matchMedia = jest.fn(() => ({ matches: true }));
  });

  afterEach(() => {
    jest.useRealTimers();
    delete process.env.REACT_APP_SKY_SOCKET_URL;
    localStorage.clear();
  });

  function enter() {
    act(() => handlers.sky_state({
      selfId: 'me',
      participants: [
        { id: 'me', x: 0.3, y: 0.4 },
        { id: 'other', x: 0.7, y: 0.6, note: 'Walking under the same stars' }
      ]
    }));
  }

  test('renders centered moon in the sky', () => {
    render(<Sky forceCelestialBody="moon" />);
    const moonButton = screen.getByRole('button', { name: /Moon phase:/i });
    expect(moonButton).toBeInTheDocument();
    expect(moonButton.closest('.sky-center-celestial')).toBeInTheDocument();
  });

  test('renders active sun projection in the sky during daylight', () => {
    render(<Sky forceCelestialBody="sun" />);
    const sunButton = screen.getByRole('button', { name: /Sun:/i });
    expect(sunButton).toBeInTheDocument();
    expect(sunButton.closest('.sky-center-celestial')).toBeInTheDocument();
  });

  test('header logo placement remains authentic and links home', () => {
    render(<Sky />);
    const logo = screen.getByAltText('Letters to Casper');
    expect(logo).toHaveAttribute('src', '/ltc-preview.webp');
    expect(logo.closest('.sky-heading')).toBeInTheDocument();
  });

  test('supports selecting custom starlight hue in note editor and persists to storage', () => {
    render(<Sky />);
    enter();

    fireEvent.click(screen.getByRole('button', { name: 'Leave a little note' }));
    expect(screen.getByRole('radiogroup', { name: 'Choose your starlight hue' })).toBeInTheDocument();

    const dawnOption = screen.getByRole('radio', { name: 'Dawn' });
    fireEvent.click(dawnOption);
    expect(dawnOption).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('sky_star_tint')).toBe('dawn');
    expect(socket.emit).toHaveBeenCalledWith('set_tint', 'dawn', expect.any(Function));
    act(() => handlers.presence_updated({ id: 'other', x: .7, y: .6, tint: 'dawn', note: 'Walking under the same stars' }));
    expect(screen.getByRole('button', { name: 'Quiet soul 2, read note' })).toHaveClass('sky-star--tint-dawn');
    const auth = jest.fn();
    io.mock.calls[io.mock.calls.length - 1][1].auth(auth);
    expect(auth).toHaveBeenCalledWith({ tint: 'dawn' });

    const auroraOption = screen.getByRole('radio', { name: 'Aurora' });
    fireEvent.click(auroraOption);
    expect(auroraOption).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('sky_star_tint')).toBe('aurora');
  });

  test('sending a shooting star uses realtime and reports acknowledgement', () => {
    render(<Sky />);
    enter();

    const otherStar = screen.getByRole('button', { name: 'Quiet soul 2, read note' });
    fireEvent.click(otherStar);

    const warmthBtn = screen.getByRole('button', { name: /Send a shooting star/i });
    expect(warmthBtn).toBeInTheDocument();

    fireEvent.click(warmthBtn);
    const call = socket.emit.mock.calls.find(([name]) => name === 'send_shooting_star');
    expect(call[1]).toBe('other');
    act(() => call[2](null, { ok: true }));
    expect(screen.getByText('Your shooting star is on its way.')).toBeInTheDocument();
    act(() => handlers.receive_shooting_star({ from: 'other', to: 'me' }));
    expect(screen.getByText(/sent you a shooting star/)).toBeInTheDocument();
  });

  test('clicking sky during active meteor releases a wish and stardust', () => {
    const { container } = render(<Sky />);
    enter();

    const canvas = container.querySelector('canvas.sky-canvas');
    expect(canvas).toBeInTheDocument();

    // Clicking canvas without active meteor does not show wish toast
    fireEvent.click(canvas);
    expect(screen.queryByText(/A quiet wish was released/i)).not.toBeInTheDocument();
  });

  test('first-time pulse click opens confirmation dialog and cancel leaves state intact', () => {
    render(<Sky />);
    enter();

    const pulseButton = screen.getByRole('button', { name: 'Pulse' });
    fireEvent.click(pulseButton);

    const dialog = screen.getByRole('dialog', { name: 'Send a Pulse' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Send a pulse just to let them know you're here.")).toBeInTheDocument();
    expect(socket.emit).not.toHaveBeenCalledWith('send_pulse', expect.any(Function));

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('dialog', { name: 'Send a Pulse' })).not.toBeInTheDocument();
    expect(localStorage.getItem('sky_pulse_confirmed')).toBeNull();
    expect(socket.emit).not.toHaveBeenCalledWith('send_pulse', expect.any(Function));
  });

  test('escape key and backdrop click dismiss pulse confirmation dialog', () => {
    const { container } = render(<Sky />);
    enter();

    const pulseButton = screen.getByRole('button', { name: 'Pulse' });
    fireEvent.click(pulseButton);
    expect(screen.getByRole('dialog', { name: 'Send a Pulse' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Send a Pulse' })).not.toBeInTheDocument();

    // Reopen and test backdrop click
    fireEvent.click(pulseButton);
    const backdrop = container.querySelector('.sky-pulse-backdrop');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop);
    expect(screen.queryByRole('dialog', { name: 'Send a Pulse' })).not.toBeInTheDocument();
  });

  test('confirming pulse sets storage, emits pulse, and subsequent clicks bypass dialog', () => {
    render(<Sky />);
    enter();

    const pulseButton = screen.getByRole('button', { name: 'Pulse' });
    fireEvent.click(pulseButton);

    const confirmBtn = screen.getByRole('button', { name: 'Send Pulse' });
    fireEvent.click(confirmBtn);

    expect(localStorage.getItem('sky_pulse_confirmed')).toBe('true');
    expect(screen.queryByRole('dialog', { name: 'Send a Pulse' })).not.toBeInTheDocument();
    expect(socket.emit).toHaveBeenCalledWith('send_pulse', expect.any(Function));

    // Advance cooldown timer
    act(() => jest.advanceTimersByTime(12000));
    expect(pulseButton).toBeEnabled();

    // Subsequent click directly sends pulse without dialog
    socket.emit.mockClear();
    fireEvent.click(pulseButton);
    expect(screen.queryByRole('dialog', { name: 'Send a Pulse' })).not.toBeInTheDocument();
    expect(socket.emit).toHaveBeenCalledWith('send_pulse', expect.any(Function));
  });
});

