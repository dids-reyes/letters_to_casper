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
  const button = screen.getByRole('button', { name: "I'm here" });
  expect(document.title).toBe('Sky');
  expect(button).toBeDisabled();
  enter();
  expect(screen.getByText('1 quiet soul is looking at the sky with you right now.')).toBeInTheDocument();
  fireEvent.click(button);
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
  const ctx = { clearRect: jest.fn(), beginPath: jest.fn(), arc: jest.fn(), fill: jest.fn(), stroke: jest.fn(), setTransform: jest.fn() };
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
  request.mockClear();
  enter();
  expect(request).toHaveBeenCalledTimes(1);
  act(() => nextFrame(40));
  expect(request).toHaveBeenCalledTimes(1);
  media.matches = false;
  act(() => media.addEventListener.mock.calls[0][1]());
  act(() => nextFrame(60));
  expect(request.mock.calls.length).toBeGreaterThan(1);
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
