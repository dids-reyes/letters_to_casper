import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { io } from 'socket.io-client';
import Sky, { daylightAt } from './Sky';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));
let handlers;
let socket;
beforeEach(() => {
  jest.useFakeTimers();
  process.env.REACT_APP_SKY_SOCKET_URL = 'https://sky.example';
  handlers = {};
  socket = {
    connected: true, on: jest.fn((name, fn) => { handlers[name] = fn; }),
    connect: jest.fn(), disconnect: jest.fn(), removeAllListeners: jest.fn(),
    timeout: jest.fn().mockReturnThis(), emit: jest.fn(),
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
  act(() => handlers.sky_state({ selfId: 'a', participants: [{ id: 'a', x: .2, y: .3 }, { id: 'b', x: .8, y: .7 }] }));
}
test('local time blends through dawn and dusk', () => {
  const at = h => daylightAt(new Date(2026, 8, 15, h));
  expect(at(0)).toBe(0);
  expect(at(6)).toBe(.5);
  expect(at(12)).toBe(1);
  expect(at(18)).toBe(.5);
  expect(at(22)).toBe(0);
});
test('presence count, pulse cooldown, reconnect and route cleanup', () => {
  document.title = 'Letters';
  const { unmount } = render(<Sky />);
  const button = screen.getByRole('button', { name: "Pulse" });
  expect(document.title).toBe('Sky');
  expect(document.documentElement).toHaveClass('sky-active');
  expect(button).toBeDisabled();
  expect(screen.getByAltText('Letters to Casper')).toHaveAttribute('src', '/ltc-preview.webp');
  enter();
  expect(screen.getByText('1 quiet soul is looking at the sky with you right now.')).toBeInTheDocument();
  fireEvent.click(button);
  fireEvent.click(screen.getByRole('button', { name: 'Send Pulse' }));
  expect(socket.emit).toHaveBeenCalledTimes(1);
  expect(socket.emit.mock.calls[0][0]).toBe('send_pulse');
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(socket.emit).toHaveBeenCalledTimes(1);
  act(() => jest.advanceTimersByTime(12000));
  expect(button).toBeEnabled();
  act(() => handlers.disconnect());
  expect(button).toBeDisabled();
  expect(screen.getByText('Reconnecting to the shared sky…')).toBeInTheDocument();
  enter();
  expect(button).toBeEnabled();
  unmount();
  expect(socket.removeAllListeners).toHaveBeenCalled();
  expect(socket.disconnect).toHaveBeenCalled();
  expect(document.title).toBe('Letters');
  expect(document.documentElement).not.toHaveClass('sky-active');
  expect(jest.getTimerCount()).toBe(0);
});
test('missing production endpoint does not connect to the frontend by accident', () => {
  delete process.env.REACT_APP_SKY_SOCKET_URL;
  io.mockClear();
  render(<Sky />);
  expect(io).not.toHaveBeenCalled();
  expect(screen.getByText('The shared sky is resting for a moment.')).toBeInTheDocument();
});
test('reduced motion rests between events and canvas pauses while hidden', () => {
  const ctx = { clearRect: jest.fn(), beginPath: jest.fn(), arc: jest.fn(), fill: jest.fn(), stroke: jest.fn(), setTransform: jest.fn(), fillRect: jest.fn(), drawImage: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })), createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })) };
  HTMLCanvasElement.prototype.getContext.mockReturnValue(ctx);
  const media = { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  window.matchMedia.mockReturnValue(media);
  let nextFrame;
  const request = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(fn => { nextFrame = fn; return 42; });
  const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const { unmount } = render(<Sky />);
  act(() => nextFrame(20));
  expect(ctx.clearRect).toHaveBeenCalledTimes(1);
  expect(ctx.lineTo).not.toHaveBeenCalled();
  request.mockClear();
  enter();
  expect(request).toHaveBeenCalledTimes(1);
  act(() => nextFrame(40));
  expect(request).toHaveBeenCalledTimes(1);
  media.matches = false;
  act(() => media.addEventListener.mock.calls[0][1]());
  act(() => nextFrame(60));
  expect(request.mock.calls.length).toBeGreaterThan(1);
  jest.setSystemTime(Date.now() + 30000);
  act(() => nextFrame(80));
  jest.setSystemTime(Date.now() + 500);
  act(() => nextFrame(100));
  expect(ctx.lineTo).toHaveBeenCalled();
  expect(ctx.arc).not.toHaveBeenCalled();
  hidden.mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(cancel).toHaveBeenCalledWith(42);
  request.mockClear();
  act(() => handlers.presence_joined({ id: 'c', x: .4, y: .4 }));
  expect(request).not.toHaveBeenCalled();
  hidden.mockReturnValue(false);
  fireEvent(document, new Event('visibilitychange'));
  expect(request).toHaveBeenCalledTimes(1);
  unmount();
  expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  request.mockRestore();
  cancel.mockRestore();
  hidden.mockRestore();
});
test('notes can be edited, read one at a time, and disappear on departure', () => {
  render(<Sky />);
  enter();
  fireEvent.click(screen.getByRole('button', { name: 'Leave a little note' }));
  fireEvent.change(screen.getByLabelText('A little note for the sky'), { target: { value: 'You are not alone.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  const call = socket.emit.mock.calls.find(([name]) => name === 'set_note');
  expect(call[1]).toBe('You are not alone.');
  act(() => call[2](null, { ok: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  act(() => handlers.note_updated({ id: 'b', note: '<b>Keep going</b>' }));
  fireEvent.click(screen.getByRole('button', { name: 'Quiet soul 2, read note' }));
  expect(screen.getByText('<b>Keep going</b>')).toBeInTheDocument();
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByRole('dialog')).toHaveClass('sky-note-card--anchored');
  expect(screen.getByRole('dialog')).toHaveAttribute('data-star-id', 'b');
  act(() => handlers.presence_left('b'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('browser header color restores after Sky closes', () => {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = '#ffffff';
  document.head.appendChild(meta);
  const { unmount } = render(<Sky />);
  expect(meta.content).not.toBe('#ffffff');
  unmount();
  expect(meta.content).toBe('#ffffff');
  meta.remove();
});


test('opening the editor after a star note discards the anchored position', () => {
  render(<Sky />);
  enter();
  fireEvent.click(screen.getByRole('button', { name: 'Quiet soul 2, no note yet' }));
  const tooltip = screen.getByRole('dialog', { name: 'A quiet note' });
  expect(tooltip.style.left).not.toBe('');
  expect(tooltip.style.top).not.toBe('');
  fireEvent.click(screen.getByRole('button', { name: 'Leave a little note' }));
  const editor = screen.getByRole('dialog', { name: 'Your sky note' });
  expect(editor).not.toBe(tooltip);
  expect(editor.style.left).toBe('');
  expect(editor.style.top).toBe('');
  expect(editor.style.getPropertyValue('--note-pointer-x')).toBe('');
  expect(editor).not.toHaveClass('sky-note-card--anchored');
  expect(screen.getByLabelText('A little note for the sky')).toHaveFocus();
});

test('reopening an existing note offers one-click clearing', () => {
  render(<Sky />);
  enter();
  act(() => handlers.note_updated({ id: 'a', note: 'A small hello' }));
  fireEvent.click(screen.getByRole('button', { name: 'Leave a little note' }));
  expect(screen.getByLabelText('A little note for the sky')).toHaveValue('A small hello');
  fireEvent.click(screen.getByRole('button', { name: 'Clear note' }));
  const call = socket.emit.mock.calls.find(([name]) => name === 'set_note');
  expect(call[1]).toBe('');
  act(() => {
    handlers.note_updated({ id: 'a', note: '' });
    call[2](null, { ok: true });
  });
  fireEvent.click(screen.getByRole('button', { name: 'Leave a little note' }));
  expect(screen.getByLabelText('A little note for the sky')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Save note' })).toBeInTheDocument();
});

test('departed note stars remain faded until expiry and activity stays compact', () => {
  render(<Sky />);
  act(() => handlers.sky_state({
    selfId: 'a', activeCount: 1,
    participants: [{ id: 'a', x: .2, y: .3, active: true }, { id: 'b', x: .8, y: .7, active: false, note: 'Still a little light' }],
    activity: [{ id: 'event', soul: 'soul123', action: 'left a note', at: Date.now() }],
  }));
  expect(screen.getByText('0 quiet souls are looking at the sky with you right now.')).toBeInTheDocument();
  const star = screen.getByRole('button', { name: 'Quiet soul 2, read note' });
  expect(star).toHaveClass('sky-star--resting');
  fireEvent.click(star);
  expect(screen.getByText('Still a little light')).toBeInTheDocument();
  expect(screen.getByText(/soul123 left a note/)).toBeInTheDocument();
  act(() => handlers.presence_left('b'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Pulse' }).closest('.sky-bottom')).not.toBeNull();
  expect(screen.getByText('You don’t have to say a word. Leave a little light.')).toBeInTheDocument();
});

test('own-star introduction is anchored and disappears after three seconds', () => {
  render(<Sky />);
  enter();
  const intro = screen.getByText('This is you');
  expect(intro).toHaveAttribute('data-star-id', 'a');
  expect(intro).toHaveClass('sky-note-card--anchored');
  act(() => jest.advanceTimersByTime(2999));
  expect(screen.getByText('This is you')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(1));
  expect(screen.queryByText('This is you')).not.toBeInTheDocument();
});

test('own star keeps its mood picker in the anchored tooltip', () => {
  render(<Sky />);
  enter();
  fireEvent.click(screen.getByRole('button', { name: 'Your star, no note yet' }));
  const card = screen.getByRole('dialog', { name: 'Your sky note' });
  expect(screen.getAllByLabelText('Feeling')[1]).toHaveValue('');
  expect(card).toHaveClass('sky-note-card--anchored');
  expect(card).toHaveAttribute('data-star-id', 'a');
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByText('This is you')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Request Chat' })).not.toBeInTheDocument();
  fireEvent.change(screen.getAllByLabelText('Feeling')[1], { target: { value: 'lonely' } });
  expect(socket.emit).toHaveBeenCalledWith('set_mood', 'lonely', expect.any(Function));
  act(() => handlers.presence_updated({ id: 'a', soul: 'soul123', mood: 'lonely', x: .2, y: .3 }));
  expect(screen.getAllByLabelText('Feeling')[1]).toHaveValue('lonely');
  expect(screen.getByRole('dialog')).toBe(card);
});

test('header banner fades after fifteen seconds', () => {
  render(<Sky />); enter();
  const banner = screen.getByText('Tap a cross-lit star to read a note').parentElement;
  expect(banner.closest('header')).not.toBeNull();
  expect(banner).toHaveStyle({ opacity: '1' });
  act(() => jest.advanceTimersByTime(15000));
  expect(banner).toHaveStyle({ opacity: '0', pointerEvents: 'none' });
});

test('global chat expires while idle and private chat has a separate conversation', () => {
  render(<Sky />); enter();
  act(() => handlers.chat_message({ id: 'm', soul: 'soul123', text: 'A hello', createdAt: Date.now() }));
  expect(screen.getByText('A hello', { exact: false })).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(30 * 60 * 1000));
  expect(screen.queryByText('A hello', { exact: false })).not.toBeInTheDocument();
  act(() => handlers.chat_request({ id: 'r', soul: 'soul123' }));
  fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
  expect(socket.emit).toHaveBeenCalledWith('respond_chat', { id: 'r', accept: true }, expect.any(Function));
  act(() => handlers.chat_started({ sessionId: 'private', peer: { soul: 'soul123' } }));
  fireEvent.change(screen.getByLabelText('Private message'), { target: { value: 'Just us' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(socket.emit).toHaveBeenCalledWith('send_chat', { sessionId: 'private', text: 'Just us' }, expect.any(Function));
  act(() => handlers.disconnect());
  expect(screen.queryByLabelText('Private message')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Global message')).toBeDisabled();
});


test('own tooltip points to the rendered star rather than the viewport center', () => {
  const rect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    if (this.classList.contains('sky-star')) return { left: 178, top: 278, width: 44, height: 44 };
    if (this.classList.contains('sky-page')) return { left: 0, top: 0, width: 800, height: 700 };
    return { left: 0, top: 0, bottom: 0, width: 0, height: 0 };
  });
  const width = jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(180);
  const height = jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(90);
  try {
    render(<Sky />); enter();
    fireEvent.click(screen.getByRole('button', { name: 'Your star, no note yet' }));
    const card = screen.getByRole('dialog');
    expect(card.style.left).toBe('110px');
    expect(card.style.top).toBe('186px');
    expect(card.style.transform).toBe('none');
    expect(card.style.getPropertyValue('--note-pointer-x')).toBe('90px');
    expect(card).toHaveAttribute('data-below', 'false');
  } finally { rect.mockRestore(); width.mockRestore(); height.mockRestore(); }
});

test('dock positions 3 action buttons above Global Chat at the bottom', () => {
  const { container } = render(<Sky />);
  enter();

  const dock = container.querySelector('.sky-bottom');
  expect(dock).toBeInTheDocument();

  const footer = dock.querySelector('.sky-footer');
  expect(footer).toBeInTheDocument();

  const noteBtn = screen.getByRole('button', { name: 'Leave a little note' });
  const pulseBtn = screen.getByRole('button', { name: 'Pulse' });
  const moodBtn = footer.querySelector('.sky-mood-btn');
  expect(noteBtn.closest('.sky-footer')).toBe(footer);
  expect(pulseBtn.closest('.sky-footer')).toBe(footer);
  expect(moodBtn.closest('.sky-footer')).toBe(footer);

  const globalChat = dock.querySelector('.sky-chat');
  expect(globalChat).toBeInTheDocument();

  // SkyFooter occurs before SkyChat in DOM order inside .sky-bottom
  expect(footer.compareDocumentPosition(globalChat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
